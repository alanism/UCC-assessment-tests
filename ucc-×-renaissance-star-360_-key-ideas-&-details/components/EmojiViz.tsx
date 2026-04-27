
import React from 'react';

interface EmojiVizProps {
  emoji: string;
  data: { label: string; value: number | string }[];
}

export const EmojiViz: React.FC<EmojiVizProps> = ({ emoji, data }) => {
  return (
    <div className="ucc-card p-8 h-full flex flex-col justify-center overflow-hidden border-t-[6px] border-[#E9604F]">
      <h3 className="ucc-title text-xl mb-6 text-[#E9604F]">Meaning Evidence</h3>
      <div className="space-y-6">
        {data.map((item, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span>{item.label}</span>
              <span className="text-gray-800">{item.displayValue}</span>
            </div>
            {typeof item.value === 'number' && item.value > 0 ? (
              <div className="flex flex-wrap gap-1 bg-gray-50 p-3 rounded-xl border border-gray-100 min-h-[3rem]">
                {Array.from({ length: Math.min(item.value, 40) }).map((_, i) => (
                  <span key={i} className="text-base transition-all hover:scale-150 cursor-default select-none" title={item.label}>
                    {emoji}
                  </span>
                ))}
                {item.value > 40 && (
                  <span className="text-[10px] text-[#4EABBC] font-black self-center ml-2 uppercase bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-sm">
                    + {item.value - 40}
                  </span>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 italic text-[10px] text-gray-400">
                Data captured: {item.displayValue}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
