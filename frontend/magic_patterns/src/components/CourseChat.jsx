import React, { useState } from 'react';
import { SendIcon, PaperclipIcon, SmileIcon, BotIcon, UserIcon } from 'lucide-react';
const initialMessages = [{
  id: 1,
  sender: 'ai',
  content: "Welcome to your personalized course! I'm your AI learning assistant. Feel free to ask questions about any topic in the course material.",
  timestamp: new Date().toISOString()
}];
const CourseChat = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };
    // Add AI response (in a real app, this would come from an API)
    const aiResponse = {
      id: messages.length + 2,
      sender: 'ai',
      content: "I'm analyzing your question and searching through the course materials to provide the most accurate answer. Let me explain this concept in detail...",
      timestamp: new Date().toISOString()
    };
    setMessages([...messages, userMessage, aiResponse]);
    setInputValue('');
  };
  return <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-xl font-semibold text-gray-800">
          AI Learning Assistant
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map(message => <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${message.sender === 'user' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <div className="mb-1 flex items-center">
                  {message.sender === 'ai' ? <BotIcon className="mr-1 h-3 w-3" /> : <UserIcon className="mr-1 h-3 w-3" />}
                  <span className="text-xs font-medium">
                    {message.sender === 'ai' ? 'AI Assistant' : 'You'}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>)}
        </div>
      </div>
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center rounded-md border border-gray-300 bg-white">
          <button className="px-2 text-gray-500 hover:text-gray-700">
            <PaperclipIcon className="h-5 w-5" />
          </button>
          <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => {
          if (e.key === 'Enter') handleSendMessage();
        }} className="flex-1 bg-transparent px-2 py-2 focus:outline-none" placeholder="Ask anything about the course..." />
          <button className="px-2 text-gray-500 hover:text-gray-700">
            <SmileIcon className="h-5 w-5" />
          </button>
          <button onClick={handleSendMessage} className="rounded-r-md bg-teal-500 px-4 py-2 text-white hover:bg-teal-600">
            <SendIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>;
};
export default CourseChat;