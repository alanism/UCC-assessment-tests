import { AiSettingsPanel } from "./components/AiSettingsPanel";
import React, { useState, useEffect, useRef } from 'react';
import { Difficulty, AriaState, MathOperation, Problem, BrainPillars, ItemTelemetry } from './types';
import { generateProblem } from './constants';
import { AriaAvatar } from './components/AriaAvatar';
import { EmojiViz } from './components/EmojiViz';
import { BrainAnalytics } from './components/BrainAnalytics';
import { SwissClockTimer } from './components/SwissClockTimer';

const App: React.FC = () => {
  const [sessionState, setSessionState] = useState<'setup' | 'testing' | 'review'>('setup');
  const [studentName, setStudentName] = useState('');
  const [reportedGrade, setReportedGrade] = useState('');
  const [sessionLength, setSessionLength] = useState(10); // Default 10 mins

  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [maxDifficultyReached, setMaxDifficultyReached] = useState<Difficulty>(1);
  const [problemNumber, setProblemNumber] = useState<number>(1);
  const [currentProblem, setCurrentProblem] = useState<Problem>(generateProblem(1));
  
  const [activeTab, setActiveTab] = useState<'training' | 'analytics'>('training');
  const [userInput, setUserInput] = useState<string>('');
  const [ariaState, setAriaState] = useState<AriaState>(AriaState.Thinking);
  const [ariaMessage, setAriaMessage] = useState<string>("Look at the space. Your brain can read the geometry.");
  const [hintIndex, setHintIndex] = useState<number>(-1);
  const [timer, setTimer] = useState<number>(30);
  const [globalTimer, setGlobalTimer] = useState<number>(600);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());

  // Pillars State
  const [pillars, setPillars] = useState<BrainPillars>({
    student_name: '',
    reported_grade: '',
    session_timer_seconds: 600,
    session_elapsed_ms: 0,
    session_timeout_reached: false,
    crystalMemory: {
      tablesSeen: [],
      operationsUsed: [],
      mistakes: [],
      mastered: []
    },
    frameCorrectness: 0,
    totalAnswers: 0,
    hintsUsed: 0,
    speedBonuses: 0,
    totalTime: 0,
    attempts: 0,
    levelHistory: [],
    itemLog: []
  });

  // Global Session Timer
  useEffect(() => {
    let interval: any;
    if (sessionState === 'testing' && globalTimer > 0) {
      interval = setInterval(() => {
        setGlobalTimer(prev => prev - 1);
      }, 1000);
    } else if (globalTimer === 0 && sessionState === 'testing') {
      handleFinish(true);
    }
    return () => clearInterval(interval);
  }, [globalTimer, sessionState]);

  const handleAdaptiveAdvance = (isCorrect: boolean, studentAnswer: string) => {
    const timeTaken = 30 - timer;
    const timeTakenMs = Date.now() - startTimeRef.current;

    let nextDifficulty = difficulty;
    if (isCorrect) {
      nextDifficulty = Math.min(5, difficulty + 1) as Difficulty;
    } else {
      nextDifficulty = Math.max(1, difficulty - 1) as Difficulty;
    }

    const telemetry: ItemTelemetry = {
      id: problemNumber,
      student_name: studentName,
      reported_grade: reportedGrade,
      session_timer_seconds: sessionLength * 60,
      session_elapsed_ms: Date.now() - sessionStartRef.current,
      session_timeout_reached: false,
      domain: "Geometry",
      schema: currentProblem.title,
      grade: currentProblem.grade,
      tableData: [...currentProblem.tableData],
      question: currentProblem.question,
      userInput: studentAnswer,
      correctAnswer: currentProblem.correctAnswer,
      operation: currentProblem.expectedOp,
      isCorrect,
      timeTakenMs,
      hintsUsed: hintIndex + 1,
      difficultyBefore: difficulty,
      difficultyAfter: nextDifficulty,
      timestamp: new Date().toISOString(),
      // Fix: include emoji in telemetry for analytics
      emoji: currentProblem.emoji
    };

    setDifficulty(nextDifficulty);
    setMaxDifficultyReached(prev => Math.max(prev, nextDifficulty) as Difficulty);

    setPillars(prev => ({
      ...prev,
      totalAnswers: prev.totalAnswers + (isCorrect ? 1 : 0),
      frameCorrectness: prev.frameCorrectness + (isCorrect ? 1 : 0),
      speedBonuses: prev.speedBonuses + (isCorrect && timer > 15 ? 1 : 0),
      totalTime: prev.totalTime + timeTaken,
      levelHistory: [...prev.levelHistory, { difficulty, time: timeTaken, accuracy: isCorrect ? 1 : 0 }],
      itemLog: [...prev.itemLog, telemetry],
      crystalMemory: {
        ...prev.crystalMemory,
        mastered: Array.from(new Set([...prev.crystalMemory.mastered, currentProblem.grade])),
        operationsUsed: [...prev.crystalMemory.operationsUsed, currentProblem.expectedOp]
      }
    }));
  };

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setAriaState(AriaState.Error);
      setAriaMessage(`Time's up! The space was ${currentProblem.correctAnswer} units.`);
      
      setPillars(prev => ({ ...prev, attempts: prev.attempts + 1 }));
      handleAdaptiveAdvance(false, userInput || "(timed out)");
      
      setTimeout(() => {
        if (sessionState === 'testing') {
          setProblemNumber(prev => prev + 1);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer, sessionState, currentProblem]);

  const startNewProblem = (newDiff: Difficulty) => {
    const nextProblem = generateProblem(newDiff);
    setCurrentProblem(nextProblem);
    setUserInput('');
    setHintIndex(-1);
    setAriaState(AriaState.Thinking);
    setAriaMessage(`Spatial Puzzle #${problemNumber}: What does this shape tell you?`);
    setTimer(30);
    startTimeRef.current = Date.now();
    setIsTimerRunning(true);

    setPillars(prev => ({
      ...prev,
      crystalMemory: {
        ...prev.crystalMemory,
        tablesSeen: Array.from(new Set([...prev.crystalMemory.tablesSeen, nextProblem.title]))
      }
    }));
  };

  useEffect(() => {
    if (sessionState === 'testing') {
      startNewProblem(difficulty);
    }
  }, [problemNumber, sessionState]);

  const handleStartTest = () => {
    if (!studentName || !reportedGrade) return;
    setGlobalTimer(sessionLength * 60);
    sessionStartRef.current = Date.now();
    setPillars(prev => ({
      ...prev,
      student_name: studentName,
      reported_grade: reportedGrade,
      session_timer_seconds: sessionLength * 60
    }));
    setSessionState('testing');
  };

  const handleHint = () => {
    const nextIdx = hintIndex + 1;
    if (nextIdx < currentProblem.hints.length) {
      setHintIndex(nextIdx);
      setAriaMessage(currentProblem.hints[nextIdx]);
      setPillars(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    } else {
      setAriaMessage("The shape holds the answer. Look closely at the parts.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput || sessionState !== 'testing') return;

    const numericVal = parseInt(userInput);
    const isCorrect = numericVal === currentProblem.correctAnswer;
    
    setIsTimerRunning(false);
    setPillars(prev => ({ ...prev, attempts: prev.attempts + 1 }));

    if (isCorrect) {
      setAriaState(AriaState.Success);
      setAriaMessage("Correct! Your brain read the geometry perfectly.");
      handleAdaptiveAdvance(true, userInput);
    } else {
      setAriaState(AriaState.Error);
      setAriaMessage(`Not quite. The missing part was ${currentProblem.correctAnswer}.`);
      setPillars(prev => ({
        ...prev,
        crystalMemory: {
          ...prev.crystalMemory,
          mistakes: [...prev.crystalMemory.mistakes, `${currentProblem.title} (You said: ${userInput}, Correct: ${currentProblem.correctAnswer})`]
        }
      }));
      handleAdaptiveAdvance(false, userInput);
    }

    setTimeout(() => {
      if (sessionState === 'testing') {
        setProblemNumber(prev => prev + 1);
      }
    }, 1500);
  };

  const handleFinish = (timeout = false) => {
    if (timeout) {
      try {
        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        audio.play().catch(() => {});
      } catch(e) {}
    }
    setSessionState('review');
    setIsTimerRunning(false);
    setActiveTab('analytics');
    setAriaMessage("Spatial Reasoning Evaluation complete. Review your cognitive metrics.");
    setPillars(prev => ({
      ...prev,
      session_elapsed_ms: Date.now() - sessionStartRef.current,
      session_timeout_reached: timeout
    }));
  };

  const accuracy = pillars.attempts > 0 ? (pillars.totalAnswers / pillars.attempts) : 0;
  const speedScore = pillars.totalAnswers > 0 ? (pillars.speedBonuses / pillars.totalAnswers) : 0;
  const frameScore = pillars.totalAnswers > 0 ? (pillars.frameCorrectness / pillars.totalAnswers) : 0;
  const hintPenalty = pillars.hintsUsed * 2;
  const brainPower = (accuracy * 40) + (speedScore * 30) + (frameScore * 20) - hintPenalty;

  if (sessionState === 'setup') {
    return (
      <div className="max-w-4xl mx-auto p-8 ucc-ui min-h-screen flex flex-col justify-center">
        <div className="ucc-card p-12 border-t-[8px] border-[#4EABBC]">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-2 font-sans">UnCommon Core powered</p>
          <h1 className="ucc-title text-5xl text-[#111827] mb-2">Math: Geometry & Spatial Reasoning</h1>
          <p className="text-xl text-[#4EABBC] mb-8 font-medium italic">Star 360 conditions. Built with cognitive science.</p>
          
          <div className="space-y-4 mb-10">
            <p className="text-gray-700 font-medium text-lg leading-relaxed">This isn’t a geometry test. It’s a live map of how your brain sees space.</p>
            <p className="text-gray-600 font-medium">You’ll solve quick spatial puzzles under a clock—then get a clear coach summary you can use to improve.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-4 col-span-full">
               <p className="text-sm font-black uppercase text-gray-400 tracking-wider">Enter your name and grade to start.</p>
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-black uppercase text-gray-400">Student Name</label>
              <input 
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl font-bold focus:border-[#4EABBC] focus:outline-none"
                placeholder="Full Name"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-black uppercase text-gray-400">Reported Grade</label>
              <select 
                value={reportedGrade}
                onChange={e => setReportedGrade(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl font-bold focus:border-[#4EABBC] focus:outline-none"
              >
                <option value="">Select Grade</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
                <option value="5">Grade 5</option>
                <option value="6">Grade 6</option>
                <option value="7">Grade 7</option>
              </select>
            </div>
            <div className="space-y-4 col-span-full">
              <label className="block text-xs font-black uppercase text-gray-400 tracking-wider">Pick your session length.</label>
              <div className="flex gap-4">
                {[5, 10, 25].map(len => (
                  <button 
                    key={len}
                    onClick={() => setSessionLength(len)}
                    className={`flex-1 py-4 rounded-xl font-bold border-2 transition-all ${sessionLength === len ? 'bg-[#4EABBC] border-[#4EABBC] text-white shadow-lg' : 'bg-white border-gray-200 text-gray-400 hover:border-[#4EABBC]'}`}
                  >
                    {len} Minutes
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={handleStartTest}
              disabled={!studentName || !reportedGrade}
              className="w-full ucc-primary py-5 text-xl font-bold uppercase tracking-widest disabled:opacity-50"
            >
              START TEST
            </button>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Once you start, these lock.</p>
          </div>
        </div>
      </div>
    );
  }

  const formatSessionTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 ucc-ui">
      
      <a href="/" className="mb-4 inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#4EABBC] transition-colors">← Back to Home Directory</a>
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="ucc-title text-3xl md:text-4xl lg:text-5xl text-[#111827] tracking-tighter uppercase">
            Math: Geometry & Spatial Reasoning
          </h1>
          <p className="text-gray-500 text-xs mt-1 font-black uppercase tracking-[0.2em]">
            This isn’t a math test. It’s how your brain maps the world.
          </p>
        </div>
        
        {sessionState === 'review' ? (
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button 
              onClick={() => setActiveTab('training')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'training' ? 'bg-white text-[#4EABBC] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              🎯 Session Path
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-white text-[#E9604F] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              🧠 Session Summary
            </button>
          </div>
        ) : (
          <div className="bg-[#111827] text-white px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl">
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Session Ends</span>
             <span className="text-2xl font-mono font-bold text-[#4EABBC]">{formatSessionTime(globalTimer)}</span>
          </div>
        )}
      </header>
        <AiSettingsPanel purpose="Stores operator-selected provider and model locally for this origin." />

      {activeTab === 'training' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <div className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-[#4EABBC] font-bold shadow-sm">
               Spatial Puzzle #{problemNumber}
             </div>
             {sessionState === 'testing' && (
               <button 
                 onClick={() => handleFinish(false)}
                 className="px-6 py-2 rounded-xl bg-gray-50 hover:bg-[#E9604F] text-[#E9604F] hover:text-white border border-gray-200 transition-all text-xs font-bold uppercase tracking-wider shadow-sm"
               >
                 End Evaluation
               </button>
             )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="ucc-card p-8 flex flex-col justify-between space-y-6 border-t-[6px] border-[#4EABBC]">
              {sessionState === 'review' && activeTab === 'training' ? (
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                   <h2 className="ucc-title text-2xl text-[#4EABBC]">Session Locked</h2>
                   <p className="text-gray-500 font-medium">Evaluation complete. Visit the Session Summary tab for your full report.</p>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="ucc-title text-2xl text-[#111827]">{currentProblem.title}</h2>
                      <SwissClockTimer secondsRemaining={timer} totalSeconds={30} />
                    </div>
                    
                    <table className="w-full text-left mb-6 overflow-hidden rounded-xl border border-gray-100">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Spatial Data</th>
                          <th className="p-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentProblem.tableData.map((row, idx) => (
                          <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                            <td className="p-4 text-sm font-medium text-gray-700">{row.label}</td>
                            <td className={`p-4 text-sm font-mono font-bold ${row.displayValue === '?' ? 'text-[#E9604F] animate-pulse scale-110' : 'text-[#4EABBC]'}`}>
                              {row.displayValue}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <p className="text-lg text-[#111827] font-semibold bg-[#4EABBC]/5 p-5 rounded-2xl border border-[#4EABBC]/10 shadow-sm leading-relaxed">
                      {currentProblem.question}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <form onSubmit={handleSubmit} className="flex gap-3">
                    <input
                      type="number"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Enter part..."
                      className="flex-1 bg-white border-2 border-gray-200 rounded-xl px-5 py-3.5 text-[#111827] font-bold text-lg focus:outline-none focus:border-[#4EABBC] transition-all placeholder:text-gray-300 shadow-inner"
                      disabled={sessionState !== 'testing'}
                      autoFocus
                    />
                    <button 
                      type="submit"
                      className="ucc-primary px-8 py-3.5 font-bold text-lg active:scale-95 disabled:opacity-50"
                      disabled={sessionState !== 'testing'}
                    >
                      Check
                    </button>
                    </form>
                    <button 
                    onClick={handleHint}
                    className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-[#4EABBC] transition-colors"
                    >
                    Get a Hint (Costs brain power.)
                    </button>
                  </div>
                </>
              )}
            </div>

            <EmojiViz emoji={currentProblem.emoji} data={currentProblem.tableData.map(row => ({ label: row.label, value: row.value || 0 }))} />
            <AriaAvatar state={ariaState} message={ariaMessage} />

            <div className={`ucc-card p-8 flex flex-col justify-between border-t-[6px] border-[#E9604F] transition-opacity duration-500 ${sessionState === 'testing' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div>
                <h3 className="ucc-title text-xl mb-6 text-[#E9604F]">Cognitive Pillars</h3>
                <div className="space-y-6">
                  {sessionState === 'review' && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Fluidity</p>
                        <p className="text-2xl font-black text-[#4EABBC]">{Math.round(accuracy * 100)}%</p>
                      </div>
                      <div className="text-center p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Solved</p>
                        <p className="text-2xl font-black text-[#E9604F]">{pillars.totalAnswers}</p>
                      </div>
                      <div className="text-center p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Grade</p>
                        <p className="text-2xl font-black text-green-500">{difficulty + 2}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {sessionState === 'review' && (
                <div className="mt-8 p-6 rounded-2xl bg-gray-50 border border-gray-100 shadow-inner">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Performance Index</span>
                    <span className="text-xl font-black text-[#111827]">{Math.max(0, Math.round(brainPower))}</span>
                  </div>
                  <div className="h-3 bg-white rounded-full overflow-hidden border border-gray-100 p-[1px]">
                    <div 
                      className="h-full bg-gradient-to-r from-[#4EABBC] to-[#E9604F] rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(78,171,188,0.3)]"
                      style={{ width: `${Math.min(100, Math.max(0, brainPower))}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <BrainAnalytics 
          pillars={pillars} 
          brainPower={brainPower} 
          maxDifficultyReached={maxDifficultyReached} 
          sessionFinished={sessionState === 'review'} 
        />
      )}
      
      <footer className="text-center text-gray-300 text-[10px] font-black uppercase tracking-[0.3em] py-12">
        Geometry & Spatial Logic System &copy; 2024
      </footer>
    </div>
  );
};

export default App;