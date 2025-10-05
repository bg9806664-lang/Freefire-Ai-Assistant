
import React from 'react';
import { Message, Role } from '../types';
import { GhostIcon, UserIcon } from './icons';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming = false }) => {
  const isUser = message.role === Role.USER;

  const Avatar = () => (
    <div
      className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
        isUser ? 'bg-orange-600' : 'bg-gray-700'
      }`}
    >
      {isUser ? <UserIcon /> : <GhostIcon />}
    </div>
  );

  const Sources = () => (
    message.sources && message.sources.length > 0 && (
      <div className="mt-4 pt-3 border-t border-gray-600">
          <h4 className="text-xs font-semibold text-gray-400 mb-2">SOURCES:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {message.sources.map((source, index) => (
                  <a
                      key={index}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-orange-400 bg-gray-700/50 hover:bg-gray-700 p-2 rounded-md truncate transition-colors"
                  >
                     <p className="font-medium truncate">{source.title}</p>
                     <p className="text-gray-500 truncate">{source.uri}</p>
                  </a>
              ))}
          </div>
      </div>
    )
  );

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar />
      <div
        className={`p-4 rounded-lg max-w-xl xl:max-w-2xl text-left ${
          isUser ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-200'
        }`}
      >
        <div className="prose prose-sm prose-invert max-w-none">
           <MarkdownRenderer content={message.text} />
           {isStreaming && message.text.length === 0 && <span className="inline-block w-0.5 h-5 bg-orange-400 ml-1 blinking-cursor" />}
        </div>
        {isStreaming && message.text.length > 0 && <span className="inline-block w-0.5 h-5 bg-orange-400 ml-1 blinking-cursor align-bottom" />}
        {!isUser && <Sources />}
      </div>
    </div>
  );
};

export default ChatMessage;