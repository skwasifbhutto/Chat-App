import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import MessageSkeleton from './skeletons/MessageSkeleton';
import { useAuthStore } from '../store/useAuthStore';
import { formatMessageTime } from '../lib/utils';

function ChatContainer() {
  const { messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessage, unsubscribeFromMessage } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null); // Ref to target the end of the messages list

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessage();

    return () => {
      unsubscribeFromMessage();
    };
  }, [selectedUser._id, getMessages, subscribeToMessage, unsubscribeFromMessage]);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className='flex-1 flex flex-col overflow-auto'>
      <ChatHeader />
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}>
            <div className='chat-image avatar'>
              <div className="w-10 h-10 rounded-full border">
                <img 
                  src={message.senderId === authUser._id 
                    ? authUser.profilePic || "/avatar.png" 
                    : selectedUser.profilePic || "/avatar.png"}
                  alt="avatar"
                />
              </div>
            </div>
            <div className='chat-header mb-1'>
              <time className='text-xs opacity-50 ml-1'>{formatMessageTime(message.createdAt)}</time>
            </div>
            <div className='chat-bubble flex flex-col'>
              {message.image && (
                <img 
                  src={message.image} 
                  alt='attachment' 
                  className='sm:max-w-[200px] rounded-md mb-2' 
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
        {/* Invisible div at the end of the message list for auto-scrolling */}
        <div ref={messagesEndRef}></div>
      </div>
      <MessageInput />
    </div>
  );
}

export default ChatContainer;
