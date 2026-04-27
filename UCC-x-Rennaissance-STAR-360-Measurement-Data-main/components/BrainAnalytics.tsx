
import React, { useState } from 'react';
import { BrainPillars, Difficulty, GradeLevel, ItemTelemetry } from '../types';
import { GoogleGenAI } from "@google/genai";

interface BrainAnalyticsProps {
  pillars: BrainPillars;
  brainPower: number;
  maxDifficultyReached: Difficulty;
  sessionFinished: boolean;
}

export const BrainAnalytics: React.FC<BrainAnalyticsProps> = ({ pillars, brainPower, maxDifficultyReached, sessionFinished }) => {
  const [memoText, setMemoText] = useState<string>('');
  const [isGeneratingMemo, setIsGeneratingMemo] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const getGrade = (d: Difficulty): GradeLevel => (d + 2) as GradeLevel;

  const generateCoachMemo = async () => {
    if (memoText || isGeneratingMemo) return;
    setIsGeneratingMemo(true);

    try {
      const successes = pillars.itemLog.filter(i => i.isCorrect);
      const mistakes = pillars.itemLog.filter(i => !i.isCorrect);

      const successItem = successes.length > 0 ? successes[Math.floor(Math.random() * successes.length)] : null;
      const mistakeItem = mistakes.length > 0 ? mistakes[Math.floor(Math.random() * mistakes.length)] : null;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const formatItem = (item: ItemTelemetry | null) => {
        if (!item) return "None";
        return `Schema: ${item.schema}, Question: "${item.question}", Student Answer: ${item.userInput}, Correct Answer: ${item.correctAnswer}, Operation/Frame: ${item.operation}`;
      };

      const prompt = `
        Create a PSL-grade Coach Memo for a student named ${pillars.studentName}.
        They just finished a Measurement & Data logic session.

        DATA ANCHORS (Use these specific numbers and schemas):
        - Success Example: ${formatItem(successItem)}
        - Mistake Example: ${formatItem(mistakeItem)}

        STRUCTURE (STRICT ADHERENCE REQUIRED):
        1. Disarm Anxiety: Curious, calm opening. No scores, no judgment.
        2. Name the Real Contrast: Explicitly contrast the patterns in the specific items above. (e.g., "You scaled minutes perfectly in the Flight Timer, but the 'gap' in the Height Comparison was the hurdle today.")
        3. Guess-First Prompt: Ask the student to guess why the logic shifted in the mistake example.
        4. "Yes, and...": Validate their likely thought process for the mistake, then pivot to intuition.
        5. Visual Intuition: Use specific visual imagery (rulers, containers, clock hands, road segments) to explain the logic.
        6. Explain-it-Back: Ask them to explain the difference in their own words.
        7. Teach-Someone-Else Mission: Give a concrete real-world teaching challenge based on these specific schemas.

        CONSTRAINTS:
        - Max 200 words.
        - NO generic phrases like "Sometimes measurement is tricky."
        - NO mentions of scores, percentages, grades, or "AI".
        - Focus entirely on the DATA ANCHORS provided.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setMemoText(response.text || "Coach Memo generation failed. Please try again.");
    } catch (e) {
      console.error(e);
      setMemoText("Unable to connect to the Coaching service right now.");
    } finally {
      setIsGeneratingMemo(false);
    }
  };

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(memoText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportMemo = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `${pillars.studentName.replace(/\s+/g, '_')}_CoachMemo_${dateStr}.txt`;
    const content = `UCC x Renaissance STAR 360\nDomain: Measurement & Data\nStudent: ${pillars.studentName}\nDate: ${dateStr}\n\nCOACH MEMO\n${memoText}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportTelemetry = () => {
    const date = new Date().toLocaleString();
    const dateSuffix = new Date().toISOString().split('T')[0];
    const appName = "UCC x Rennaissance STAR 360: Measurement & Data";
    const domain = "Measurement & Data";
    
    let telemetryContent = "";
    
    pillars.itemLog.forEach((item, index) => {
      const tableDataStr = item.tableData.map(row => `${row.label}: ${row.displayValue} (${row.value})`).join(", ");
      const visualCounts = item.tableData.map(row => `${row.label}: ${row.value}`).join(", ");
      
      telemetryContent += `
=== ITEM ${index + 1} ===
App Name: ${appName}
Domain: ${domain}
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
Timestamp: ${item.timestamp}
`;
    });

    const accuracy = Math.round((pillars.totalAnswers / (pillars.attempts || 1)) * 100);
    const avgTime = pillars.levelHistory.length > 0 
      ? (pillars.levelHistory.reduce((acc, curr) => acc + curr.time, 0) / pillars.levelHistory.length).toFixed(1)
      : "0";
    const schemasEncountered = Array.from(new Set(pillars.itemLog.map(i => i.schema))).join(", ");

    const text = `
${appName} - FULL LEARNING TELEMETRY LOG
--------------------------------------
Date: ${date}
Student Name: ${pillars.studentName}
Reported Grade: ${pillars.reportedGrade}
Session Timer (s): ${pillars.sessionTimerSeconds}
Session Elapsed (ms): ${pillars.sessionElapsedMs}
Session Timeout Reached: ${pillars.sessionTimeoutReached}
Session Outcome: ${sessionFinished ? 'SUCCESSFUL COMPLETION' : 'INCOMPLETE'}

${telemetryContent}

=== SESSION SUMMARY ===
App Name: ${appName}
Student Name: ${pillars.studentName}
Reported Grade: ${pillars.reportedGrade}
Session Timer (s): ${pillars.sessionTimerSeconds}
Session Elapsed (ms): ${pillars.sessionElapsedMs}
Session Timeout Reached: ${pillars.sessionTimeoutReached}
Max Difficulty Reached: ${maxDifficultyReached} (Grade ${getGrade(maxDifficultyReached)})
Accuracy: ${accuracy}%
Average Time (s): ${avgTime}
Performance Index: ${Math.round(brainPower)}
Schemas Encountered: ${schemasEncountered}
Total Problems: ${pillars.totalAnswers}
Total Attempts: ${pillars.attempts}
Frame Consistency: ${Math.round((pillars.frameCorrectness / (pillars.totalAnswers || 1)) * 100)}%

--------------------------------------
Generated by UnCommon Core Logic Systems
Telemetry Optimized for Educational Reconstruction
`.trim();

    const fileName = `${pillars.studentName.replace(/\s+/g, '_')}_Math-Measurement_${dateSuffix}.txt`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {sessionFinished ? (
        <div className="space-y-8">
          <div className="ucc-card p-10 border-2 border-[#4EABBC]/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#4EABBC]/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-10">
              <h2 className="ucc-title text-4xl text-[#111827] tracking-tight">🏆 Session Summary</h2>
              <button 
                onClick={handleExportTelemetry}
                className="px-6 py-2.5 bg-white border-2 border-[#4EABBC] text-[#4EABBC] font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#4EABBC] hover:text-white transition-all shadow-sm"
              >
                Export Session (.txt)
              </button>
            </div>

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
          </div>

          <div className="ucc-card p-10 border-t-[6px] border-[#8b5cf6]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="ucc-title text-2xl text-[#8b5cf6]">Coach Memo</h3>
              {!memoText && (
                <button 
                  onClick={generateCoachMemo}
                  disabled={isGeneratingMemo}
                  className="px-6 py-2 bg-[#8b5cf6] text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-sm hover:translate-y-[-1px] transition-all disabled:opacity-50"
                >
                  {isGeneratingMemo ? 'Generating...' : 'Generate Coach Memo'}
                </button>
              )}
            </div>

            {memoText ? (
              <div className="space-y-6">
                <div className="p-6 bg-[#8b5cf6]/5 rounded-2xl border border-[#8b5cf6]/20 italic text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                  {memoText}
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={handleCopyMemo}
                    className="px-4 py-2 bg-white border-2 border-[#8b5cf6] text-[#8b5cf6] font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#8b5cf6] hover:text-white transition-all shadow-sm flex items-center gap-2"
                  >
                    {copied ? 'Copied' : 'Copy Memo'}
                  </button>
                  <button 
                    onClick={exportMemo}
                    className="px-4 py-2 bg-white border-2 border-[#8b5cf6] text-[#8b5cf6] font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#8b5cf6] hover:text-white transition-all shadow-sm"
                  >
                    Export Memo (.txt)
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">Tap the button to generate a personalized insight memo based on this session's cognitive leaps.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="ucc-card p-8 border-l-[6px] border-[#4EABBC] flex flex-col">
              <h4 className="ucc-title text-[#4EABBC] text-lg mb-1 tracking-wide">Cognitive Ladder</h4>
              <p className="text-[11px] text-gray-500 font-medium leading-tight mb-3">“How much math you can actually use.”</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Grade {getGrade(maxDifficultyReached)} Reached</p>
              <div className="space-y-3 mt-auto">
                <p className="text-[10px] text-[#4EABBC] font-black uppercase tracking-widest leading-relaxed">“Each level you reach means your brain can handle a more complex world.”</p>
              </div>
            </div>

            <div className="ucc-card p-8 border-l-[6px] border-[#E9604F] flex flex-col">
              <h4 className="ucc-title text-[#E9604F] text-lg mb-1 tracking-wide">Frame Precision</h4>
              <p className="text-[11px] text-gray-500 font-medium leading-tight mb-3">“Did you use the right kind of thinking?”</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Precision Score: {pillars.totalAnswers > 0 ? Math.round((pillars.frameCorrectness / pillars.totalAnswers) * 100) : 0}%</p>
              <div className="flex flex-col pt-2 mt-auto">
                <p className="text-[10px] text-[#E9604F] font-black uppercase tracking-widest leading-relaxed">“Some problems need scale. Some need rates. Some need logic modeling.”</p>
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
                <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest leading-relaxed">“Real decisions aren’t slow.”</p>
              </div>
            </div>
          </div>

          <div className="ucc-card p-12 flex flex-col items-center justify-center text-center space-y-4 bg-white border border-gray-100 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4EABBC]/5 via-transparent to-[#E9604F]/5 pointer-events-none"></div>
            <h2 className="ucc-title text-4xl text-[#111827] mb-0">Coach's Performance Index</h2>
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
        </div>
      ) : (
        <div className="ucc-card p-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl">🔒</div>
          <h2 className="ucc-title text-2xl text-gray-400">Testing in Progress</h2>
          <p className="text-gray-400 max-w-sm">Complete your test session to unlock the cognitive pillars and see your Measurement Power evaluation.</p>
        </div>
      )}
    </div>
  );
};
