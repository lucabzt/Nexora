import { useState, useEffect, useRef } from 'react';
import { 
  Title, 
  Text, 
  TextInput, 
  Button, 
  Paper, 
  Avatar, 
  Group, 
  Box, 
  Stack,
  Loader, 
  useMantineTheme
} from '@mantine/core';
import { IconSend, IconRobot, IconUser } from '@tabler/icons-react';
import { chatService } from '../../api/chatService';
import { getToolContainerStyle } from './ToolUtils';
import { useTranslation } from 'react-i18next';

/**
 * ChatTool component
 * An interactive AI chat interface for questions about the course content
 */
function ChatTool({ isOpen, courseId, chapterId }) {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      content: t('chatTool.welcomeMessage'),
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageEndRef.current && isOpen) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Fetch chat history when component mounts or chapter changes
  useEffect(() => {
    // We could load history from API here if needed
    // const loadChatHistory = async () => {
    //   try {
    //     const history = await chatService.getChatHistory(courseId, chapterId);
    //     if (history?.length > 0) {
    //       setMessages([...messages, ...history]);
    //     }
    //   } catch (error) {
    //     console.error('Failed to load chat history:', error);
    //   }
    // };
    // loadChatHistory();
  }, [courseId, chapterId]);

  // Handle message form submission
  const handleSendMessage = async (event) => {
    event?.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };
    
    // Add the user message to the chat
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');

    // Create a placeholder for the AI response
    const aiMessageId = `ai-${Date.now()}`;
    const aiMessagePlaceholder = {
      id: aiMessageId,
      sender: 'ai',
      content: '',
      isStreaming: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, aiMessagePlaceholder]);
    setIsLoading(true);

    try {
      // Send the message to the API with streaming response
      await chatService.sendMessage(courseId, chapterId, userMessage.content, (data) => {
        if (data.type === 'chunk') {
          // Update the AI message with the incoming chunks
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const aiMessageIndex = updatedMessages.findIndex(msg => msg.id === aiMessageId);
            
            if (aiMessageIndex !== -1) {
              updatedMessages[aiMessageIndex] = {
                ...updatedMessages[aiMessageIndex],
                content: (updatedMessages[aiMessageIndex].content || '') + data.data.text,
              };
            }
            
            return updatedMessages;
          });
        } else if (data.type === 'end') {
          // Mark streaming as complete
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const aiMessageIndex = updatedMessages.findIndex(msg => msg.id === aiMessageId);
            
            if (aiMessageIndex !== -1) {
              updatedMessages[aiMessageIndex] = {
                ...updatedMessages[aiMessageIndex],
                isStreaming: false,
              };
            }
            
            return updatedMessages;
          });
          
          setIsLoading(false);
        } else if (data.type === 'error') {
          // Handle errors
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const aiMessageIndex = updatedMessages.findIndex(msg => msg.id === aiMessageId);
            
            if (aiMessageIndex !== -1) {
              updatedMessages[aiMessageIndex] = {
                ...updatedMessages[aiMessageIndex],
                content: `Error: ${data.data.message || 'Something went wrong. Please try again.'}`,
                isStreaming: false,
                isError: true,
              };
            }
            
            return updatedMessages;
          });
          
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Update the AI message with the error
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        const aiMessageIndex = updatedMessages.findIndex(msg => msg.id === aiMessageId);
        
        if (aiMessageIndex !== -1) {
          updatedMessages[aiMessageIndex] = {
            ...updatedMessages[aiMessageIndex],
            content: t('chatTool.errorMessage'),
            isStreaming: false,
            isError: true,
          };
        }
        
        return updatedMessages;
      });
      
      setIsLoading(false);
    }
  };
  return (
    <div style={getToolContainerStyle(isOpen)}>
      <Title order={3} mb="md">{t('chatTool.title')}</Title>
      <Text size="sm" color="dimmed" mb="md">
        {t('chatTool.description')}
      </Text>
      
      <Box 
        ref={chatContainerRef}
        sx={{ 
          flexGrow: 1,
          overflow: 'auto',
          marginBottom: '15px',
          border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
          borderRadius: theme.radius.sm,
          padding: theme.spacing.md,
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        }}
      >
        <Stack spacing="md">
          {messages.map((message) => (
            <Paper
              key={message.id}
              p="md"
              withBorder
              sx={{
                backgroundColor: theme.colorScheme === 'dark' 
                  ? (message.sender === 'user' ? theme.colors.dark[5] : theme.colors.dark[6])
                  : (message.sender === 'user' ? theme.colors.blue[0] : 'white'),
                maxWidth: '85%',
                alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                marginLeft: message.sender === 'user' ? 'auto' : 0,
                borderColor: message.isError 
                  ? theme.colors.red[5]
                  : theme.colorScheme === 'dark' 
                    ? theme.colors.dark[4] 
                    : theme.colors.gray[3]
              }}
            >
              <Group noWrap spacing="xs" mb="xs" align="center">
                <Avatar 
                  size="sm" 
                  color={message.sender === 'user' ? 'blue' : 'green'}
                  radius="xl"
                >
                  {message.sender === 'user' ? <IconUser size={18} /> : <IconRobot size={18} />}
                </Avatar>
                <Text weight={500} size="sm">
                  {message.sender === 'user' ? t('chatTool.userSender') : t('chatTool.aiSender')}
                </Text>
              </Group>
              
              <Text size="sm" sx={{ whiteSpace: 'pre-wrap' }}>
                {message.content}
                {message.isStreaming && (
                  <Loader size="xs" variant="dots" ml="xs" display="inline" />
                )}
              </Text>
            </Paper>
          ))}
          <div ref={messageEndRef} />
        </Stack>
      </Box>

      <form onSubmit={handleSendMessage} style={{ width: '100%' }}>
        <Group spacing="xs" position="center" sx={{ width: '100%' }}>
          <TextInput
            placeholder={t('chatTool.inputPlaceholder')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            sx={{ flexGrow: 1 }}
          />
          <Button 
            leftIcon={<IconSend size={16} />}
            type="submit" 
            disabled={!inputValue.trim() || isLoading}
            loading={isLoading}
          >
            {t('chatTool.sendButton')}
          </Button>
        </Group>
      </form>
    </div>
  );
}

export default ChatTool;
