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
  useMantineTheme,
  Code,
  Blockquote,
  List,
  Anchor
} from '@mantine/core';
import { IconSend, IconRobot, IconUser, IconQuote } from '@tabler/icons-react';
import { chatService } from '../../api/chatService';
import { getToolContainerStyle } from './ToolUtils';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * ChatTool component
 * An interactive AI chat interface for questions about the course content
 */
function ChatTool({ isOpen, courseId, chapterId }) {
  const { t } = useTranslation('chatTool');
  const theme = useMantineTheme();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      content: t('welcomeMessage'),
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
      console.log('Sending message with courseId:', courseId, 'chapterId:', chapterId);
      
      // Send the message to the API with streaming response
      await chatService.sendMessage(courseId, chapterId, userMessage.content, (data) => {
        // Handle the SSE data
        if (data.done) {
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
          return;
        }

        // Handle error message
        if (data.error) {
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const aiMessageIndex = updatedMessages.findIndex(msg => msg.id === aiMessageId);
            
            if (aiMessageIndex !== -1) {
              updatedMessages[aiMessageIndex] = {
                ...updatedMessages[aiMessageIndex],
                content: `Error: ${data.error}`,
                isStreaming: false,
                isError: true,
              };
            }
            
            return updatedMessages;
          });
          
          setIsLoading(false);
          return;
        }

        // Handle content update
        if (data.content) {
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const aiMessageIndex = updatedMessages.findIndex(msg => msg.id === aiMessageId);
            
            if (aiMessageIndex !== -1) {
              updatedMessages[aiMessageIndex] = {
                ...updatedMessages[aiMessageIndex],
                content: data.content,
              };
            }
            
            return updatedMessages;
          });
        }
      });
    } catch (error) {
      console.error('Failed to send message:', {
        error,
        status: error.status,
        data: error.data,
        rawResponse: error.rawResponse
      });
      
      // Create a user-friendly error message
      let errorMessage = t('genericErrorMessage');
      
      if (error.status === 422) {
        // Handle validation errors
        if (error.data?.detail) {
          if (Array.isArray(error.data.detail)) {
            errorMessage = error.data.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join('\n');
          } else if (typeof error.data.detail === 'string') {
            errorMessage = error.data.detail;
          }
        } else if (error.rawResponse) {
          errorMessage = `Validation error: ${error.rawResponse}`;
        }
      } else if (error.status === 401) {
        errorMessage = t('unauthorizedError', 'You need to be logged in to send messages');
      }
      
      // Update the AI message with the error
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        const aiMessageIndex = updatedMessages.findIndex(msg => msg.id === aiMessageId);
        
        if (aiMessageIndex !== -1) {
          updatedMessages[aiMessageIndex] = {
            ...updatedMessages[aiMessageIndex],
            content: errorMessage,
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
      <Title order={3} mb="md">{t('title')}</Title>
      <Text size="sm" color="dimmed" mb="md">
        {t('description')}
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
                  {message.sender === 'user' ? t('userSender') : t('aiSender')}
                </Text>
              </Group>
              
              <div style={{ fontSize: '0.875rem' }}>
                {message.sender === 'ai' ? (
                  <ReactMarkdown
                    components={{
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <Code {...props}>
                            {children}
                          </Code>
                        );
                      },
                      p: ({node, ...props}) => <p style={{ marginTop: 0, marginBottom: '0.5rem' }} {...props} />,
                      blockquote: ({node, ...props}) => (
                        <Blockquote
                          icon={<IconQuote size={18} />}
                          styles={(theme) => ({
                            root: { margin: '0.5rem 0', padding: '0.25rem 0 0.25rem 1rem' },
                            cite: { fontSize: '0.85em' }
                          })}
                          {...props}
                        />
                      ),
                      ul: ({node, ordered, ...props}) => {
                        const Component = ordered ? 'ol' : 'ul';
                        return (
                          <Component 
                            style={{
                              paddingLeft: '1.5em',
                              margin: '0.5em 0',
                              listStyleType: ordered ? 'decimal' : 'disc'
                            }}
                            {...props}
                          />
                        );
                      },
                      ol: ({node, ...props}) => (
                        <ol 
                          style={{
                            paddingLeft: '1.5em',
                            margin: '0.5em 0',
                            listStyleType: 'decimal'
                          }}
                          {...props} 
                        />
                      ),
                      li: ({node, ordered, ...props}) => (
                        <li 
                          style={{
                            marginBottom: '0.25em',
                            lineHeight: '1.5'
                          }}
                          {...props} 
                        />
                      ),
                      a: ({node, ...props}) => <Anchor target="_blank" rel="noopener noreferrer" {...props} />,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <Text size="sm" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Text>
                )}
                {message.isStreaming && (
                  <Loader size="xs" variant="dots" ml="xs" display="inline" />
                )}
              </div>
            </Paper>
          ))}
          <div ref={messageEndRef} />
        </Stack>
      </Box>

      <form onSubmit={handleSendMessage} style={{ width: '100%' }}>
        <Group spacing="xs" position="center" sx={{ width: '100%' }}>
          <TextInput
            placeholder={t('inputPlaceholder')}
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
            {t('sendButton')}
          </Button>
        </Group>
      </form>
    </div>
  );
}

export default ChatTool;
