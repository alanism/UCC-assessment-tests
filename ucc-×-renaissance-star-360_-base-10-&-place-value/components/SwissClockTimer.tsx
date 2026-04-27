
import React from 'react';

interface SwissClockTimerProps {
  secondsRemaining: number;
  totalSeconds: number;
}

export const SwissClockTimer: React.FC<SwissClockTimerProps> = ({ secondsRemaining, totalSeconds }) => {
  // Calculate the rotation angle. 
  // At full time (30s), angle is 360. 
  // At zero time (0s), angle is 0.
  // This creates a counter-clockwise sweep toward zero.
  const angle = (secondsRemaining / totalSeconds) * 360;

  return (
    <div className="flex items-center justify-center p-2">
      <div className="relative w-20 h-20 md:w-24 md:h-24 bg-white rounded-full border-[3px] border-[#111827] shadow-sm flex items-center justify-center">
        {/* Clock Face Ticks */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          {/* Major Ticks (every 30 degrees / 5 units) */}
          {[...Array(12)].map((_, i) => (
            <line
              key={i}
              x1="50"
              y1="5"
              x2="50"
              y2="12"
              stroke="#111827"
              strokeWidth="4"
              transform={`rotate(${i * 30} 50 50)`}
            />
          ))}
          {/* Minor Ticks */}
          {[...Array(60)].map((_, i) => (
            i % 5 !== 0 && (
              <line
                key={i}
                x1="50"
                y1="5"
                x2="50"
                y2="8"
                stroke="#111827"
                strokeWidth="1.5"
                transform={`rotate(${i * 6} 50 50)`}
              />
            )
          ))}
        </svg>

        {/* The Red SBB Second Hand */}
        <div 
          className="absolute inset-0 flex items-center justify-center transition-transform duration-1000 ease-linear"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div className="relative h-full w-full flex flex-col items-center">
             {/* The hand stem */}
            <div className="w-[3px] h-[42%] bg-[#E10600] mt-[8%] rounded-full shadow-sm"></div>
            {/* The iconic circular tip */}
            <div className="w-4 h-4 rounded-full bg-[#E10600] -mt-1 shadow-sm"></div>
          </div>
        </div>

        {/* Center Pin */}
        <div className="absolute w-2 h-2 bg-[#111827] rounded-full z-10"></div>
      </div>
    </div>
  );
};
