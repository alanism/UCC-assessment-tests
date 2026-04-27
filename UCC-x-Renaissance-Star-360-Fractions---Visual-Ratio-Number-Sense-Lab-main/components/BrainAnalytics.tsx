
import React, { useState } from 'react';
import { BrainPillars, Difficulty, GradeLevel, ProblemAttempt } from '../types';
import { GoogleGenAI } from "@google/genai";

interface BrainAnalyticsProps {
  pillars: BrainPillars;
  brainPower: number;
  maxDifficultyReached: Difficulty;
  sessionFinished: boolean;
}

export const BrainAnalytics: React.FC<BrainAnalyticsProps> = ({ pillars, brainPower, maxDifficultyReached, sessionFinished }) => {
  const [memo, setMemo] = useState<string | null>(null);
  const [isGeneratingMemo, setIsGeneratingMemo] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const getGrade = (d: Difficulty): GradeLevel => (d + 2) as GradeLevel;

  const generateCoachMemo = async () => {
    if (pillars.history.length === 0 || isGeneratingMemo) return;
    setIsGeneratingMemo(true);

    try {
      // Find a mistake to focus on, or the last problem
      const focusProblem = pillars.history.find(h => !h.isCorrect) || pillars.history[pillars.history.length - 1];
      
      const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
      const prompt = `
        You are a supportive math coach in the style of Poh-Shen Loh.
        Student Name: ${pillars.studentName}
        Current Problem Context: ${focusProblem.question}
        Student Answer: ${focusProblem.userAnswer}
        Correct Answer: ${focusProblem.correctAnswer}
        Logic Used (Frame): ${focusProblem.expectedOp}
        
        Write a Coach Memo (under 200 words) that:
        1. Disarm anxiety with curiosity.
        2. Reference this specific problem.
        3. Mention their actual answer ${focusProblem.userAnswer} vs the correct ${focusProblem.correctAnswer} but focus on the logic frame.
        4. Use "Yes, and..." energy.
        5. Use visual intuition before symbols.
        6. Ask the student to explain a specific visual pattern back to you.
        7. End with a "mission" to teach this specific insight to someone else.
        
        Rules:
        - Do NOT mention scores, grades, or AI.
        - Keep it encouraging and focused on the "insight leap".
        - Use student's name: ${pillars.studentName}.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setMemo(response.text || "Coach Memo could not be generated. Please try again.");
    } catch (error) {
      console.error("Memo generation failed", error);
      setMemo("Technical hiccup. The coach is currently helping another student.");
    } finally {
      setIsGeneratingMemo(false);
    }
  };

  const handleCopyMemo = () => {
    if (!memo) return;
    navigator.clipboard.writeText(memo).then(() => {
      setCopyStatus("Copied");
      setTimeout(() => setCopyStatus(null), 2000);
    });
  };

  const handleExportMemo = () => {
    if (!memo) return;
    const date = new Date().toISOString().split('T')[0];
    const isAlgebra = Number(pillars.reportedGrade) >= 7 || pillars.history.some(h => h.grade >= 7);
    const domainText = isAlgebra ? "Algebra Readiness" : "Fractions";

    const content = `--------------------------------
UCC x Renaissance STAR 360
Domain: ${domainText}
Student: ${pillars.studentName}
Date: ${date}

COACH MEMO
--------------------------------

${memo}

--------------------------------`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pillars.studentName.replace(/\s+/g, '_')}_CoachMemo_${date}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    const date = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString();
    const masteredGrades = pillars.crystalMemory.mastered.sort().join(', ');
    const schemaList = pillars.crystalMemory.tablesSeen.join(', ');
    
    let itemLog = "";
    pillars.history.forEach((item, index) => {
      itemLog += `=== ITEM ${index + 1} ===\n`;
      itemLog += `App: UCC x Rennaissance STAR 360: Fractions\n`;
      itemLog += `Domain: ${item.domain}\n`;
      itemLog += `Schema Name: ${item.schema}\n`;
      itemLog += `Grade Level (Hidden): ${item.grade}\n`;
      itemLog += `Table Data: ${JSON.stringify(item.tableData.map(row => ({ label: row.label, val: row.displayValue })))}\n`;
      itemLog += `Visual Evidence (Icon: ${item.emoji}): ${item.tableData.map(row => `${row.label}=${row.value}`).join(', ')}\n`;
      itemLog += `Question: ${item.question}\n`;
      itemLog += `Student Answer: ${item.userAnswer}\n`;
      itemLog += `Correct Answer: ${item.correctAnswer}\n`;
      itemLog += `Frame Selected (Logic): ${item.expectedOp}\n`;
      itemLog += `Was Correct: ${item.isCorrect}\n`;
      itemLog += `Time to Answer (ms): ${item.timeMs}\n`;
      itemLog += `Hints Used: ${item.hintsUsed}\n`;
      itemLog += `Difficulty Before: ${item.diffBefore}\n`;
      itemLog += `Difficulty After: ${item.diffAfter}\n`;
      itemLog += `Timestamp: ${item.timestamp}\n\n`;
    });

    const summarySection = `
=== SESSION SUMMARY ===
Student Name: ${pillars.studentName}
Reported Grade: ${pillars.reportedGrade}
Session Duration (Seconds): ${pillars.sessionTimerSeconds}
Session Elapsed (ms): ${pillars.sessionElapsedMs}
Session Timeout Reached: ${pillars.sessionTimeoutReached}
Max Difficulty Reached: Level ${maxDifficultyReached} (Grade ${getGrade(maxDifficultyReached)})
Accuracy: ${Math.round((pillars.totalAnswers / (pillars.attempts || 1)) * 100)}%
Average Time: ${(pillars.totalTime / (pillars.totalAnswers || 1)).toFixed(2)}s
Performance Index: ${Math.round(brainPower)}
Schemas Encountered: ${schemaList}
Fractions Mastered: ${masteredGrades}
`;

    const fullReport = `UCC x Rennaissance STAR 360: Fractions - TELEMETRY LOG v1\n` +
      `Date: ${date} ${timeStr}\n` +
      `--------------------------------------\n\n` +
      itemLog +
      `--------------------------------------\n` +
      summarySection +
      `--------------------------------------\n` +
      `Generated by UnCommon Core Learning Systems`;

    const blob = new Blob([fullReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Filename: <StudentName>_Math-Fractions_<YYYY-MM-DD>.txt
    link.download = `${pillars.studentName.replace(/\s+/g, '_')}_Math-Fractions_${date}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {sessionFinished ? (
        <div className="ucc-card p-10 border-2 border-[#4EABBC]/30 shadow-2xl relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#4EABBC]/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-10">
            <h2 className="ucc-title text-4xl text-[#111827] tracking-tight">🏆 Lab Summary</h2>
            <div className="flex gap-2">
              <button 
                onClick={generateCoachMemo}
                className="px-6 py-2.5 bg-[#4EABBC] text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:opacity-90 transition-all shadow-sm"
              >
                {isGeneratingMemo ? 'Drafting...' : 'Generate Coach Memo'}
              </button>
              <button 
                onClick={handleExport}
                className="px-6 py-2.5 bg-white border-2 border-[#4EABBC] text-[#4EABBC] font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#4EABBC] hover:text-white transition-all shadow-sm"
              >
                Export Learning Log (.txt)
              </button>
            </div>
          </div>

          {memo && (
            <div className="mb-10 p-8 rounded-3xl bg-[#4EABBC]/5 border-2 border-[#4EABBC]/20 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="ucc-title text-2xl text-[#4EABBC]">Coach Memo</h3>
                <div className="flex gap-3 items-center">
                  {copyStatus && <span className="text-[10px] font-bold text-[#4EABBC] uppercase tracking-widest animate-pulse">{copyStatus}</span>}
                  <button 
                    onClick={handleCopyMemo}
                    className="text-[10px] font-black uppercase text-[#4EABBC] tracking-widest hover:underline"
                  >
                    Copy Memo
                  </button>
                  <button 
                    onClick={handleExportMemo}
                    className="text-[10px] font-black uppercase text-[#4EABBC] tracking-widest hover:underline"
                  >
                    Export Memo (.txt)
                  </button>
                </div>
              </div>
              <div className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">
                {memo}
              </div>
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
            “Your brain climbed through fractions as parts, numbers, ratios, and algebra. Each level you reach makes future math easier.”
          </p>
        </div>
      ) : (
        <div className="ucc-card p-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl">🔒</div>
          <h2 className="ucc-title text-2xl text-gray-400">Testing in Progress</h2>
          <p className="text-gray-400 max-w-sm">Complete your test session to unlock the session summary metrics.</p>
        </div>
      )}

      {sessionFinished && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="ucc-card p-8 border-l-[6px] border-[#4EABBC] flex flex-col">
              <h4 className="ucc-title text-[#4EABBC] text-lg mb-1 tracking-wide">Cognitive Ladder</h4>
              <p className="text-[11px] text-gray-500 font-medium leading-tight mb-3">“How much math you can actually use.”</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Grade {getGrade(maxDifficultyReached)} Reached</p>
              <div className="space-y-3 mt-auto">
                <p className="text-[10px] text-[#4EABBC] font-black uppercase tracking-widest leading-relaxed">“Each level you reach means your brain can handle a bigger kind of fraction.”</p>
              </div>
            </div>

            <div className="ucc-card p-8 border-l-[6px] border-[#E9604F] flex flex-col">
              <h4 className="ucc-title text-[#E9604F] text-lg mb-1 tracking-wide">Frame Precision</h4>
              <p className="text-[11px] text-gray-500 font-medium leading-tight mb-3">“Did you use the right kind of thinking?”</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Precision Score: {pillars.totalAnswers > 0 ? Math.round((pillars.frameCorrectness / pillars.totalAnswers) * 100) : 0}%</p>
              <div className="flex flex-col pt-2 mt-auto">
                <p className="text-[10px] text-[#E9604F] font-black uppercase tracking-widest leading-relaxed">“Some problems need parts. Some need ratios. Some need algebra.”</p>
              </div>
            </div>

            <div className="ucc-card p-8 border-l-[6px] border-[#8b5cf6] flex flex-col">
              <h4 className="ucc-title text-[#8b5cf6] text-lg mb-1 tracking-wide">Strategic Support</h4>
              <p className="text-[11px] text-gray-500 font-medium leading-tight mb-3">“How much help you needed.”</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">{pillars.hintsUsed} Hints Used</p>
              <div className="space-y-3 mt-auto">
                <p className="text-[10px] text-[#8b5cf6] font-black uppercase tracking-widest leading-relaxed">“Fewer hints means your brain did the work.”</p>
              </div>
            </div>

            <div className="ucc-card p-8 border-l-[6px] border-rose-500 flex flex-col">
              <h4 className="ucc-title text-rose-500 text-lg mb-1 tracking-wide">Velocity</h4>
              <p className="text-[11px] text-gray-500 font-medium leading-tight mb-3">“How fast you think when the clock is on.”</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Speed Metrics</p>
              <div className="space-y-2 mt-auto">
                <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest leading-relaxed">“Real tests aren’t slow.”</p>
              </div>
            </div>
          </div>

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
        </>
      )}
    </div>
  );
};
