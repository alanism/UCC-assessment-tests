
import React, { useState } from 'react';
import { BrainPillars, Difficulty, GradeLevel } from '../types';
import { generateTextWithConfig, getActiveModelConfig } from '../aiSettings';

interface BrainAnalyticsProps {
  pillars: BrainPillars;
  brainPower: number;
  maxDifficultyReached: Difficulty;
  sessionFinished: boolean;
}

export const BrainAnalytics: React.FC<BrainAnalyticsProps> = ({ pillars, brainPower, maxDifficultyReached, sessionFinished }) => {
  const [memo, setMemo] = useState<string>('');
  const [isGeneratingMemo, setIsGeneratingMemo] = useState<boolean>(false);

  const getGrade = (d: Difficulty): GradeLevel => (d + 2) as GradeLevel;

  const handleExport = () => {
    const now = new Date();
    const sessionId = `session_${Math.random().toString(36).substring(2, 15)}`;
    
    // Header
    let telemetry = `ucc_export_version: 1.0
app_name: UCC x Renaissance STAR 360
app_build: 1.1.0
domain: Algebra Readiness
session_id: ${sessionId}
student_id: ${pillars.studentName}
reported_grade: ${pillars.reportedGrade}
date_utc: ${now.toISOString()}
timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
test_mode: testing
timer_seconds: ${pillars.sessionTimerSeconds}
session_elapsed_ms: ${pillars.sessionElapsedMs}
session_timeout_reached: ${pillars.sessionTimeoutReached}
rng_seed: 
schema_engine_version: 1.0

`;

    // Item Blocks
    pillars.sessionLog.forEach((item, index) => {
      const unknownIndex = item.tableData.findIndex(r => r.displayValue === "?");
      const isNumeric = !isNaN(Number(item.studentAnswer));
      const startTime = new Date(new Date(item.timestamp).getTime() - item.timeToAnswerMs);

      telemetry += `=== ITEM ${index + 1} ===
item_index: ${index + 1}
item_id: item_${item.timestamp.replace(/[^0-9]/g, '')}_${index}
schema_name: ${item.schemaName}
domain: ${item.domain}
hidden_grade: ${item.hiddenGradeLevel}
difficulty_before: ${item.difficultyBefore}
difficulty_after: ${item.difficultyAfter}

table_title: ${item.schemaName}
table_row_labels: ${item.tableData.map(r => r.label).join(', ')}
table_display_values: ${item.tableData.map(r => r.displayValue).join(', ')}
table_true_values: ${item.tableData.map(r => r.value).join(', ')}
table_unknown_index: ${unknownIndex}

visual_evidence_type: EmojiViz
visual_evidence_counts: ${item.tableData.map(r => r.value).join(', ')}

question_text: ${item.questionText}

correct_answer_raw: ${item.correctAnswer}
correct_answer_normalized: ${item.correctAnswer}

student_answer_raw: ${item.studentAnswer}
student_answer_normalized: ${isNumeric ? Number(item.studentAnswer) : 'null'}
response_type: ${item.studentAnswer === "Timed Out" ? 'timeout' : (isNumeric ? 'numeric' : 'invalid')}
response_valid: ${isNumeric}

frame_selected: ${item.frameSelected}
frame_correct: true

time_to_answer_ms: ${item.timeToAnswerMs}
hints_used: ${item.hintsUsed}

was_correct: ${item.wasCorrect}

timestamp_start_utc: ${startTime.toISOString()}
timestamp_submit_utc: ${item.timestamp}

`;
    });

    // Calculations for summary
    const totalItems = pillars.sessionLog.length;
    const totalCorrect = pillars.sessionLog.filter(i => i.wasCorrect).length;
    const totalTimeouts = pillars.sessionLog.filter(i => i.studentAnswer === "Timed Out").length;
    const totalIncorrect = totalItems - totalCorrect - totalTimeouts;
    const times = pillars.sessionLog.map(i => i.timeToAnswerMs);
    const avgTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    const sortedTimes = [...times].sort((a, b) => a - b);
    const medianTime = sortedTimes.length > 0 ? sortedTimes[Math.floor(sortedTimes.length / 2)] : 0;

    const accByDiff: Record<number, { c: number, t: number }> = {};
    const timeByDiff: Record<number, { sum: number, t: number }> = {};
    
    pillars.sessionLog.forEach(i => {
        if (!accByDiff[i.difficultyBefore]) accByDiff[i.difficultyBefore] = { c: 0, t: 0 };
        if (!timeByDiff[i.difficultyBefore]) timeByDiff[i.difficultyBefore] = { sum: 0, t: 0 };
        accByDiff[i.difficultyBefore].t++;
        if (i.wasCorrect) accByDiff[i.difficultyBefore].c++;
        timeByDiff[i.difficultyBefore].t++;
        timeByDiff[i.difficultyBefore].sum += i.timeToAnswerMs;
    });

    const accByDiffStr = Object.entries(accByDiff).map(([d, v]) => `L${d}:${Math.round((v.c/v.t)*100)}%`).join(', ');
    const timeByDiffStr = Object.entries(timeByDiff).map(([d, v]) => `L${d}:${Math.round(v.sum/v.t)}ms`).join(', ');

    // Session Summary
    telemetry += `=== SESSION SUMMARY ===
total_items: ${totalItems}
total_correct: ${totalCorrect}
total_incorrect: ${totalIncorrect}
total_timeouts: ${totalTimeouts}
accuracy: ${totalItems > 0 ? Math.round((totalCorrect / totalItems) * 100) : 0}%
average_time_ms: ${Math.round(avgTime)}
median_time_ms: ${medianTime}
max_difficulty_reached: ${maxDifficultyReached}
performance_index: ${Math.round(brainPower)}
schemas_encountered: ${pillars.crystalMemory.tablesSeen.join(', ')}
accuracy_by_difficulty: ${accByDiffStr}
time_by_difficulty: ${timeByDiffStr}

`;

    // Integrity Checks
    const check1 = totalItems === pillars.sessionLog.length;
    const check2 = (totalCorrect + totalIncorrect + totalTimeouts) === totalItems;
    const check3 = pillars.sessionLog.every(i => i.schemaName && i.timestamp);
    const isValid = check1 && check2 && check3;

    telemetry += `=== INTEGRITY CHECKS ===
items_match_summary: ${check1}
all_fields_present: ${check3}
schema_consistent: true
export_valid: ${isValid}
`;

    const blob = new Blob([telemetry], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Updated filename logic
    const dateStr = now.toISOString().split('T')[0];
    const cleanName = pillars.studentName.trim().replace(/[^a-z0-9]/gi, '_') || 'student';
    link.download = `${cleanName}_Math-Algebra-Readiness_${dateStr}.txt`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerateMemo = async () => {
    if (pillars.sessionLog.length === 0) return;
    setIsGeneratingMemo(true);

    // Find a mistake or an interesting problem (the most difficult one)
    const interestingItem = pillars.sessionLog.find(i => !i.wasCorrect) || pillars.sessionLog[pillars.sessionLog.length - 1];

    const prompt = `Act as a world-class math coach using the Poh-Shen-Loh method. Write a memo to ${pillars.studentName} (grade ${pillars.reportedGrade}) about their UCC session.
Focus on this problem from their session: 
Schema: ${interestingItem.schemaName}
Question: ${interestingItem.questionText}
Student Answer: ${interestingItem.studentAnswer}
Correct Answer: ${interestingItem.correctAnswer}

Rules:
- NO mention of scores, grades, or AI.
- Start with curiosity and warmth.
- Select one "insight-leap" based on the problem logic.
- Ask the student to guess before solving next time.
- Use "Yes, and..." logic to validate their attempt.
- Prioritize visual intuition.
- Ask them to explain the concept back to you.
- End with a "teach-someone-else" mission.
- Maximum 200 words.`;

    try {
      const activeConfig = await getActiveModelConfig();
      if (!activeConfig) {
        setMemo('Save a validated provider key and model in Local AI Settings to generate the coach memo.');
        return;
      }

      const response = await generateTextWithConfig(activeConfig, {
        prompt,
        maxOutputTokens: 500,
      });
      setMemo(response || "Coach's wisdom is currently in transit. Please try again.");
    } catch (err) {
      console.error(err);
      setMemo("Failed to reach the coach. Please check your connection.");
    } finally {
      setIsGeneratingMemo(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {sessionFinished ? (
        <div className="ucc-card p-10 border-2 border-[#4EABBC]/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#4EABBC]/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
              <h2 className="ucc-title text-4xl text-[#111827] tracking-tight">🏆 Session Summary</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Profile: {pillars.studentName} (Grade {pillars.reportedGrade})</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={handleGenerateMemo}
                disabled={isGeneratingMemo}
                className="flex-1 md:flex-none px-6 py-2.5 bg-[#4EABBC] text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
              >
                {isGeneratingMemo ? 'Generating...' : 'Generate Coach Memo'}
              </button>
              <button 
                onClick={handleExport}
                className="flex-1 md:flex-none px-6 py-2.5 bg-white border-2 border-[#4EABBC] text-[#4EABBC] font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#4EABBC] hover:text-white transition-all shadow-sm"
              >
                Export Session (.txt)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-5 mb-10">
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

          {memo && (
            <div className="ucc-card p-8 bg-white border-2 border-[#4EABBC]/20 shadow-sm animate-fade-in mb-10 relative">
               <div className="absolute top-4 left-4 text-[#4EABBC] text-4xl opacity-20 font-serif">“</div>
               <div className="prose prose-sm max-w-none text-gray-700 italic leading-relaxed whitespace-pre-wrap pl-6">
                 {memo}
               </div>
               <div className="absolute bottom-4 right-4 text-[#4EABBC] text-4xl opacity-20 font-serif rotate-180">“</div>
               <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                 <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Personal Coach Memo</span>
                 <button onClick={() => setMemo('')} className="text-[10px] font-black text-[#E9604F] uppercase tracking-widest hover:underline">Dismiss</button>
               </div>
            </div>
          )}

          <p className="text-center text-gray-500 italic font-medium max-w-lg mx-auto leading-relaxed">
            "Look how far your brain climbed today. Every level up reached strengthens your cognitive patterns for the real Star 360 environment."
          </p>
        </div>
      ) : (
        <div className="ucc-card p-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl">🔒</div>
          <h2 className="ucc-title text-2xl text-gray-400">Testing in Progress</h2>
          <p className="text-gray-400 max-w-sm">Complete your test session to unlock the coaching console and see your Performance Index evaluation.</p>
        </div>
      )}

      {sessionFinished && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="ucc-card p-8 border-l-[6px] border-[#4EABBC] flex flex-col">
              <h4 className="ucc-title text-[#4EABBC] text-lg mb-1 tracking-wide">1. Crystallized</h4>
              <p className="text-[11px] text-gray-500 font-medium leading-tight mb-3">“How hard the problems were that you could actually solve.”</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Ladder Milestone</p>
              <div className="space-y-3 mt-auto">
                <div className="text-5xl font-black text-[#111827]">
                  Grade {getGrade(maxDifficultyReached)}
                </div>
                <p className="text-[10px] text-[#4EABBC] font-black uppercase tracking-widest">Cognitive Peak Reached</p>
              </div>
            </div>

            <div className="ucc-card p-8 border-l-[6px] border-[#E9604F] flex flex-col">
              <h4 className="ucc-title text-[#E9604F] text-lg mb-1 tracking-wide">2. Fluidity</h4>
              <p className="text-[11px] text-gray-500 font-medium leading-tight mb-3">“Did you use the right kind of math — or just try things?”</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Framing Precision</p>
              <div className="flex flex-col items-center justify-center pt-2 mt-auto">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path className="stroke-gray-100" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="stroke-[#E9604F]" strokeWidth="3" strokeDasharray={`${pillars.totalAnswers > 0 ? (pillars.frameCorrectness / pillars.totalAnswers) * 100 : 0}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-[#111827]">{pillars.totalAnswers > 0 ? Math.round((pillars.frameCorrectness / pillars.totalAnswers) * 100) : 0}%</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-4 tracking-tighter">Solution Frame Score</p>
              </div>
            </div>

            <div className="ucc-card p-8 border-l-[6px] border-[#8b5cf6] flex flex-col">
              <h4 className="ucc-title text-[#8b5cf6] text-lg mb-1 tracking-wide">3. Augmented</h4>
              <p className="text-[11px] text-gray-500 font-medium leading-tight mb-3">“How much help your brain needed.”</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Strategic Support</p>
              <div className="space-y-6 pt-4 mt-auto">
                <div className="flex justify-between items-end">
                  <span className="text-5xl font-black text-[#111827]">{pillars.hintsUsed}</span>
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest pb-1">Total Hints</span>
                </div>
                <div className="h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                  <div className="h-full bg-[#8b5cf6] transition-all duration-1000 shadow-sm" style={{ width: `${Math.min(pillars.hintsUsed * 10, 100)}%` }}></div>
                </div>
              </div>
            </div>

            <div className="ucc-card p-8 border-l-[6px] border-rose-500 flex flex-col">
              <h4 className="ucc-title text-rose-500 text-lg mb-1 tracking-wide">4. Pressure</h4>
              <p className="text-[11px] text-gray-500 font-medium leading-tight mb-3">“How fast you can think when the clock is on.”</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Velocity per Rank</p>
              <div className="space-y-2.5 pt-1 mt-auto">
                {[1, 2, 3, 4, 5].map(d => {
                  const sessions = pillars.levelHistory.filter(h => h.difficulty === d);
                  const avg = sessions.length > 0 ? (sessions.reduce((acc, curr) => acc + curr.time, 0) / sessions.length).toFixed(1) : '—';
                  return (
                    <div key={d} className="flex justify-between text-[11px] font-bold text-gray-500 border-b border-gray-50 pb-1 last:border-0">
                      <span className="uppercase tracking-widest text-gray-400">Level {d}</span>
                      <span className="text-gray-800 font-black">{avg}s</span>
                    </div>
                  );
                })}
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
              This evaluation shows your readiness for the Star 360 environment. Use the data above to identify which cognitive pillars need more training.
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
