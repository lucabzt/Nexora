import { useState, useEffect, useRef } from 'react';
import { 
  Text, 
  Textarea, 
  Avatar, 
  Group, 
  Box, 
  Stack,
  Loader, 
  useMantineTheme,
  Code,
  Blockquote,
  Anchor,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { IconSend, IconRobot, IconUser, IconQuote, IconPlus } from '@tabler/icons-react';
import { chatService } from '../../api/chatService';
import { getToolContainerStyle } from './ToolUtils';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';

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
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageEndRef.current && isOpen) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);



  const handleNewChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        content: t('welcomeMessage'),
        timestamp: new Date().toISOString()
      }
    ]);
  };

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
    <div style={{...getToolContainerStyle(isOpen, theme), display: 'flex', flexDirection: 'column', height: '100%', padding: 0, margin: 0, width: '100%' }}>
      <Group position="apart" sx={{ padding: '0.5rem 1rem', borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}` }}>
        <Text weight={500}>{t('title')}</Text>
        <Tooltip label={t('newChat')} withArrow>
          <ActionIcon onClick={handleNewChat} size="sm">
            <IconPlus size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
      
      <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: '1rem 1rem 1rem 0' }} ref={chatContainerRef}>
        <Stack spacing="lg">
          {messages.map((message) => (
            <Group key={message.id} noWrap spacing="xs" align="flex-start" sx={{ alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%' }}>
              {message.sender === 'ai' && (
                <Avatar 
                  src={'/ai-avatar.png'}
                  radius="xl"
                >
                  <IconRobot size={20} />
                </Avatar>
              )}
              <Box
                sx={theme => ({
                  padding: '0.5rem 1rem',
                  borderRadius: theme.radius.lg,
                  backgroundColor: message.sender === 'user' 
                    ? (theme.colorScheme === 'dark' ? theme.colors.blue[8] : theme.colors.blue[0])
                    : (theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1]),
                  color: message.isError ? theme.colors.red[5] : 'inherit',
                  border: message.isError ? `1px solid ${theme.colors.red[5]}` : 'none',
                })}
              >
                <div>
                  {message.sender === 'ai' ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex, rehypeRaw]}
                      components={{
                        code({inline, className, children, ...props}) {
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
                        p: (props) => <Text size="sm" as="p" {...props} />,
                        blockquote: (props) => (
                          <Blockquote
                            icon={<IconQuote size={18} />}
                            styles={{
                              root: { margin: '0.5rem 0', padding: '0.25rem 0 0.25rem 1rem' },
                              cite: { fontSize: '0.85em' }
                            }}
                            {...props}
                          />
                        ),
                        ul: ({ordered, ...props}) => {
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
                        ol: (props) => (
                          <ol 
                            style={{
                              paddingLeft: '1.5em',
                              margin: '0.5em 0',
                              listStyleType: 'decimal'
                            }}
                            {...props} 
                          />
                        ),
                        li: (props) => (
                          <li 
                            style={{
                              marginBottom: '0.25em',
                              lineHeight: '1.5'
                            }}
                            {...props} 
                          />
                        ),
                        a: (props) => <Anchor target="_blank" rel="noopener noreferrer" {...props} />,
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
              </Box>
              {message.sender === 'user' && (
                <Avatar 
                  radius="xl"
                  color={'blue'}
                >
                  <IconUser size={20} />
                </Avatar>
              )}
            </Group>
          ))}
          <div ref={messageEndRef} />
        </Stack>
      </Box>

      <form onSubmit={handleSendMessage} style={{ padding: '0.5rem 1rem', borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}` }}>
        <Group spacing="xs" align="flex-end">
          <Textarea
            ref={textareaRef}
            placeholder={t('inputPlaceholder')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            sx={{ flexGrow: 1 }}
            minRows={1}
            maxRows={3}
            autosize
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <ActionIcon 
            type="submit" 
            disabled={!inputValue.trim() || isLoading}
            loading={isLoading}
            variant="filled"
            color="blue"
            size="xl"
          >
            <IconSend size={18} />
          </ActionIcon>
        </Group>
      </form>
    </div>
  );
}

export default ChatTool;
