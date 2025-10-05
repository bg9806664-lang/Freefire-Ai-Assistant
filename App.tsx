
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Message, Role, WebSource } from './types';
import { SYSTEM_INSTRUCTION, EXAMPLE_PROMPTS } from './constants';
import { LOGO_BASE64 } from './assets';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ExamplePrompts from './components/ExamplePrompts';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    const initChat = () => {
      try {
        if (!process.env.API_KEY) {
          throw new Error("API_KEY environment variable not set.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const newChat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ googleSearch: {} }],
          },
        });
        chatRef.current = newChat;
      } catch (e) {
        if (e instanceof Error) {
            setError(`Initialization failed: ${e.message}`);
        } else {
            setError('An unknown initialization error occurred.');
        }
        console.error(e);
      }
    };
    initChat();
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);


  const handleSendMessage = async (userInput: string) => {
    if (!userInput.trim() || isLoading || !chatRef.current) return;

    setIsLoading(true);
    setError(null);
    const userMessage: Message = { role: Role.USER, text: userInput };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Add a placeholder for the model's response
    setMessages((prevMessages) => [...prevMessages, { role: Role.MODEL, text: '' }]);

    try {
      const stream = await chatRef.current.sendMessageStream({ message: userInput });
      let fullText = '';
      
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullText += chunkText;
        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[newMessages.length - 1].text = fullText;
            return newMessages;
        });
      }

      // After stream is complete, get the full response to check for grounding metadata
      const history = await chatRef.current.getHistory();
      const lastResponse = history[history.length - 1];
      const groundingMetadata = lastResponse?.parts[0]?.groundingMetadata;

      const sources: WebSource[] = groundingMetadata?.groundingChunks
        ?.map((c: any) => c.web)
        .filter((source: any): source is WebSource => source && source.uri && source.title) ?? [];

      // Remove duplicates
      const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());
      
      if(uniqueSources.length > 0) {
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          newMessages[newMessages.length - 1].sources = uniqueSources;
          return newMessages;
        });
      }

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Error: ${errorMessage}`);
      setMessages((prevMessages) => prevMessages.slice(0, -1)); // Remove placeholder
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen flex flex-col max-h-screen">
      <header className="text-center py-4 border-b border-orange-600/30 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 flex justify-center items-center">
        <img src={LOGO_BASE64} alt="FREE FIRE Logo" className="h-10" />
      </header>

      <main ref={chatAreaRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 && !isLoading && <ExamplePrompts prompts={EXAMPLE_PROMPTS} onPromptClick={handlePromptClick} />}
        {messages.map((msg, index) => (
          <ChatMessage 
            key={index} 
            message={msg}
            isStreaming={isLoading && msg.role === Role.MODEL && index === messages.length - 1}
          />
        ))}
        {error && <div className="text-red-500 bg-red-900/30 p-3 rounded-lg text-center">{error}</div>}
      </main>

      <footer className="p-4 md:p-6 border-t border-orange-600/30 bg-gray-900">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        <div className="text-center text-xs text-gray-500 mt-4">
          <p>Developed by Bilal (GHOST PLAYS)</p>
          <p>
            <a href="https://www.youtube.com/@ghostplays143" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">YouTube: @ghostplays143</a>
            <span className="mx-2">|</span>
            <a href="https://www.tiktok.com/@ghostplays13" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">TikTok: @ghostplays13</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
