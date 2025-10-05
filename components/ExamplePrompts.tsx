
import React from 'react';
import { GhostIcon } from './icons';

interface ExamplePromptsProps {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
}

const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ prompts, onPromptClick }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="bg-gray-800 p-6 rounded-full mb-6">
            <GhostIcon className="w-16 h-16 text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-300 mb-2">How can I help you, player?</h2>
        <p className="text-gray-400 mb-8">Select an example below or type your own question.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
            {prompts.map((prompt, index) => (
            <button
                key={index}
                onClick={() => onPromptClick(prompt)}
                className="bg-gray-800/80 text-gray-300 p-4 rounded-lg text-left hover:bg-gray-700/80 transition-colors duration-200"
            >
                {prompt}
            </button>
            ))}
        </div>
    </div>
  );
};

export default ExamplePrompts;
