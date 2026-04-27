import React, { useState } from 'react';
import { BrainPillars, Difficulty, GradeLevel } from '../types';

interface BrainAnalyticsProps {
  pillars: BrainPillars;
  brainPower: number;
  maxDifficultyReached: Difficulty;
  sessionFinished: boolean;
}

export const BrainAnalytics: React.FC<BrainAnalyticsProps> = ({ pillars, brainPower, maxDifficultyReached, sessionFinished }) => {
  const [coachMemo, setCoachMemo] = useState<string | null>(null);
  const getGrade = (d: Difficulty): GradeLevel => (d + 2) as GradeLevel;

  const generateCoachMemo = () => {
    const success = pillars.itemLog.find(i => i.isCorrect);
    const struggle = pillars.itemLog.find(i => !i.isCorrect || i.timeTakenMs > 25000);
    
    if (!success && !struggle) {
      setCoachMemo("Not enough data to generate a complete coaching profile yet. Solve more puzzles to map your spatial logic.");
      return;
    }

    const name = pillars.student_name;
    const date = new Date().toLocaleDateString();

    // 1. Disarm anxiety
    let memo = `Geometry is about seeing, not just calculating. ${name}, many people feel tension when they see complex shapes, but you're learning that geometry is just a map of the physical world.\n\n`;
    
    // 2. Name contrast + Schema references + Real numbers
    if (success && struggle) {
      const successData = success.tableData.map(d => `${d.value} ${d.label}`).join(' by ');
      const struggleData = struggle.tableData[0] ? `${struggle.tableData[0].value} ${struggle.tableData[0].label}` : "the spatial constraints";

      memo += `You showed great spatial fluidity on the ${success.schema} puzzle. You saw how ${successData} created a total of ${success.correctAnswer} units using a ${success.operation} frame. However, the ${struggle.schema} with ${struggleData} created a momentary block in your mental model.\n\n`;
    } else if (success) {
      const successData = success.tableData.map(d => `${d.value} ${d.label}`).join(' by ');
      memo += `You have a strong instinct for spatial relationships. You nailed the ${success.schema} (${successData}), correctly identifying ${success.correctAnswer} total units using the ${success.operation} frame.\n\n`;
    }

    // 3. Guess-first prompt & 4. "Yes, and..." & 5. Visual intuition
    memo += `Next time you hit a wall, try a 'guess-first' approach. Don't look at the math yet. Yes, the numbers are important, AND your brain's visual intuition is even stronger. Look at the grid. Imagine the ${success?.emoji || 'shape'} filling the space before you even touch a key.\n\n`;

    // 6. Explain-it-back & 7. Mission
    memo += `To lock this in, explain-it-back to someone else. Show them how you saw the ${success?.schema || 'last puzzle'}. Your mission is to teach someone else how to 'see' the geometry in a simple box or room. You are mapping the world, one shape at a time.`;
    
    setCoachMemo(memo);
  };

  const handleExportMemo = () => {
    if (!coachMemo) return;
    const date = new Date().toISOString().split('T')[0];
    const text = `UCC x Renaissance STAR 360
Domain: Geometry & Spatial
Student: ${pillars.student_name}
Date: ${date}

COACH MEMO
${coachMemo}
`.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pillars.student_name.replace(/\s+/g, '_')}_CoachMemo_${date}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportTelemetry = () => {
    const date = new Date().toISOString().split('T')[0];
    const appName = "UCC × Renaissance STAR 360: Geometry & Spatial";
    
    let telemetryContent = "";
    pillars.itemLog.forEach((item, index) => {
      const tableDataStr = item.tableData.map(row => `${row.label}: ${row.displayValue} (${row.value})`).join(", ");
      const visualCounts = item.tableData.map(row => `${row.label}: ${row.value}`).join(", ");
      
      telemetryContent += `
=== ITEM ${index + 1} ===
App Name: ${appName}
Student Name: ${pillars.student_name}
Reported Grade: ${pillars.reported_grade}
Domain: Geometry
Schema: ${item.schema}
Hidden Grade Level: ${item.grade}
Table Data: ${tableDataStr}
Visual Evidence Counts: ${visualCounts}
Question: ${item.question}
Student Answer: ${item.userInput}
Correct Answer: ${item.correctAnswer}
Frame Selected: ${item.operation}
Was Correct: ${item.isCorrect}
Time to Answer (ms): ${item.timeTakenMs}
Hints Used: ${item.hintsUsed}
Difficulty Before: ${item.difficultyBefore}
Difficulty After: ${item.difficultyAfter}
Session Elapsed (ms): ${item.session_elapsed_ms}
Timestamp: ${item.timestamp}
`;
    });

    const text = `
${appName} - FULL LEARNING TELEMETRY LOG
--------------------------------------
Student: ${pillars.student_name}
Reported Grade: ${pillars.reported_grade}
Session Timer (sec): ${pillars.session_timer_seconds}
Session Elapsed (ms): ${pillars.session_elapsed_ms}
Session Timeout Reached: ${pillars.session_timeout_reached}
Date: ${new Date().toLocaleString()}
Session Outcome: ${sessionFinished ? 'SUCCESSFUL COMPLETION' : 'INCOMPLETE'}

${telemetryContent}

=== SESSION SUMMARY ===
Accuracy: ${Math.round((pillars.totalAnswers / (pillars.attempts || 1)) * 100)}%
Performance Index: ${Math.round(brainPower)}
Total Problems Solved: ${pillars.totalAnswers}
Total Attempts: ${pillars.attempts}
--------------------------------------
Generated by UnCommon Core Logic Systems
`.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pillars.student_name.replace(/\s+/g, '_')}_Geometry_${date}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {sessionFinished ? (
        <div className="ucc-card p-10 border-2 border-[#4EABBC]/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#4EABBC]/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-10">
            <h2 className="ucc-title text-4xl text-[#111827] tracking-tight">🏆 Session Summary</h2>
            <div className="flex gap-3">
              <button 
                onClick={generateCoachMemo}
                className="px-6 py-2.5 bg-[#4EABBC] text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#3d8c9a] transition-all shadow-sm"
              >
                Generate Coach Memo
              </button>
              <button 
                onClick={handleExportTelemetry}
                className="px-6 py-2.5 bg-white border-2 border-[#4EABBC] text-[#4EABBC] font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#4EABBC] hover:text-white transition-all shadow-sm"
              >
                Export Telemetry (.txt)
              </button>
            </div>
          </div>

          {coachMemo && (
            <div className="mb-10 p-8 bg-[#FFFFD5] border-2 border-[#E9604F]/20 rounded-3xl shadow-inner relative animate-fade-in">
              <div className="flex justify-between items-start mb-4">
                <h3 className="ucc-title text-xl text-[#E9604F]">Coach Memo</h3>
                <div className="flex gap-4">
                   <button 
                    onClick={() => {
                      navigator.clipboard.writeText(coachMemo || "");
                      const confirm = document.createElement('span');
                      confirm.innerText = "Copied!";
                      confirm.className = "text-[10px] text-green-600 font-bold ml-2 animate-pulse";
                      document.getElementById('memo-controls')?.appendChild(confirm);
                      setTimeout(() => confirm.remove(), 2000);
                    }}
                    className="text-[10px] font-bold text-gray-500 hover:text-[#E9604F] uppercase tracking-widest"
                   >
                     Copy Memo
                   </button>
                   <span className="text-gray-300">|</span>
                   <button 
                    onClick={handleExportMemo}
                    className="text-[10px] font-bold text-gray-500 hover:text-[#E9604F] uppercase tracking-widest"
                   >
                     Export Memo (.txt)
                   </button>
                   <div id="memo-controls"></div>
                </div>
              </div>
              <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">{coachMemo}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-5">
            {[1, 2, 3, 4, 5].map((d) => {
              const difficulty = d as Difficulty;
              const reached = maxDifficultyReached >= difficulty;
              const grade = getGrade(difficulty);
              return (
                <div key={d} className={`p-6 rounded-3xl text-center border-2 transition-all group ${reached ? 'border-[#4EABBC] bg-[#4EABBC]/5 shadow-lg' : 'border-gray-100 opacity-40 grayscale'}`}>
                  <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-2 group-hover:text-[#4EABBC] transition-colors">Level {d}</p>
                  <p className="ucc-title text-xl text-[#111827]">
                    Grade {grade}{grade === 7 ? ' 🚀' : ''}
                  </p>
                  <div className="mt-4 flex justify-center">
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm border ${reached ? 'bg-white border-[#4EABBC]/20 text-[#4EABBC]' : 'bg-gray-50 border-gray-100 text-gray-300'}`}>
                      {reached ? '✓' : '🔒'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-center text-gray-500 mt-10 italic font-medium max-w-lg mx-auto leading-relaxed">
            “Your brain climbed through spatial reasoning as perimeter, area, volume, and complex modeling. Each level you reach makes the geometric world easier to decode.”
          </p>
        </div>
      ) : (
        <div className="ucc-card p-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl">🔒</div>
          <h2 className="ucc-title text-2xl text-gray-400">Testing in Progress</h2>
          <p className="text-gray-400 max-w-sm">Complete your test session to unlock the cognitive pillars and see your Performance Index evaluation.</p>
        </div>
      )}

      {sessionFinished && (
        <div className="ucc-card p-12 flex flex-col items-center justify-center text-center space-y-4 bg-white border border-gray-100 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4EABBC]/5 via-transparent to-[#E9604F]/5 pointer-events-none"></div>
          <h2 className="ucc-title text-4xl text-[#111827] mb-0">Performance Index</h2>
          <div className="score-big drop-shadow-sm select-none">
            {Math.max(0, Math.round(brainPower))}
          </div>
          <p className="text-[13px] text-[#4EABBC] font-black uppercase tracking-[0.15em] mb-2">“How strong your brain performed today.”</p>
          <p className="text-gray-500 max-w-md font-medium leading-relaxed">
            “This blends how high you climbed, how cleanly you solved, how much help you used, and how fast you thought.”
          </p>
          <div className="w-full max-w-lg h-4 bg-gray-50 rounded-full border border-gray-100 p-0.5 relative">
            <div 
              className="h-full bg-gradient-to-r from-[#4EABBC] via-[#4EABBC] to-[#E9604F] rounded-full transition-all duration-[2000ms] shadow-[0_0_15px_rgba(78,171,188,0.3)]"
              style={{ width: `${Math.min(100, Math.max(0, brainPower))}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};
