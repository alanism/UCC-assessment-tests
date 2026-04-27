
import React from 'react';
import { AriaState } from '../types';

interface AriaAvatarProps {
  state: AriaState;
  message?: string;
}

export const AriaAvatar: React.FC<AriaAvatarProps> = ({ state, message }) => {
  const getAvatarColor = () => {
    switch (state) {
      case AriaState.Success: return 'bg-green-100 text-green-600 border-green-200';
      case AriaState.Error: return 'bg-[#E9604F]/10 text-[#E9604F] border-[#E9604F]/20';
      default: return 'bg-[#4EABBC]/10 text-[#4EABBC] border-[#4EABBC]/20';
    }
  };

  const getEmoji = () => {
    switch (state) {
      case AriaState.Success: return '🌟';
      case AriaState.Error: return '🤔';
      default: return '🧠';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 ucc-card h-full border-t-[6px] border-[#4EABBC]">
      <div className={`w-28 h-28 rounded-3xl border-2 ${getAvatarColor()} flex items-center justify-center text-5xl shadow-sm transition-all duration-300 transform hover:rotate-3 hover:scale-105`}>
        {getEmoji()}
      </div>
      <div className="text-center">
        <h3 className="ucc-title text-2xl text-[#4EABBC] mb-2">Coach</h3>
        <p className="text-sm text-gray-500 font-medium px-4 leading-relaxed italic">
          "{message || "Let's train your brain today!"}"
        </p>
      </div>
      {state === AriaState.Thinking && (
        <div className="flex space-x-2 pt-2">
          <div className="w-2.5 h-2.5 bg-[#4EABBC] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2.5 h-2.5 bg-[#4EABBC] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2.5 h-2.5 bg-[#4EABBC] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      )}
    </div>
  );
};
