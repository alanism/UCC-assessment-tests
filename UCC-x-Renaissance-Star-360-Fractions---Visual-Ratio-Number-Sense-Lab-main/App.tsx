import { AiSettingsPanel } from "./components/AiSettingsPanel";

import React, { useState, useEffect, useRef } from 'react';
import { Difficulty, AriaState, MathOperation, Problem, BrainPillars, ProblemAttempt } from './types';
import { generateProblem } from './constants';
import { AriaAvatar } from './components/AriaAvatar';
import { EmojiViz } from './components/EmojiViz';
import { BrainAnalytics } from './components/BrainAnalytics';
import { SwissClockTimer } from './components/SwissClockTimer';

const App: React.FC = () => {
  const [sessionState, setSessionState] = useState<'setup' | 'testing' | 'review'>('setup');
  const [studentName, setStudentName] = useState('');
  const [reportedGrade, setReportedGrade] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number>(600); // Default 10 mins

  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [maxDifficultyReached, setMaxDifficultyReached] = useState<Difficulty>(1);
  const [problemNumber, setProblemNumber] = useState<number>(1);
  const [currentProblem, setCurrentProblem] = useState<Problem>(generateProblem(1));
  
  const [activeTab, setActiveTab] = useState<'training' | 'analytics'>('training');
  const [userInput, setUserInput] = useState<string>('');
  const [ariaState, setAriaState] = useState<AriaState>(AriaState.Thinking);
  const [ariaMessage, setAriaMessage] = useState<string>("Ready to master fractions? Let's start the lab.");
  const [showFluidityCheck, setShowFluidityCheck] = useState<boolean>(false);
  const [hintIndex, setHintIndex] = useState<number>(-1);
  const [timer, setTimer] = useState<number>(30);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Session-level timer state
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(0);
  const sessionStartTimeRef = useRef<number>(0);

  // Pillars State
  const [pillars, setPillars] = useState<BrainPillars>({
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
    history: [],
    studentName: '',
    reportedGrade: '',
    sessionTimerSeconds: 0,
    sessionElapsedMs: 0,
    sessionTimeoutReached: false
  });

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.warn('Audio beep failed', e);
    }
  };

  const getDomainFromGrade = (grade: number): string => {
    if (grade === 3) return "Measurement & Part-Whole";
    if (grade === 4) return "Fractions & Number Sense";
    if (grade === 5) return "Word Problems (Operators)";
    if (grade === 6) return "Ratios & Scaling";
    return "Algebraic Fractions";
  };

  const handleAdaptiveAdvance = (isCorrect: boolean, studentAnswer: string) => {
    const timeTaken = 30 - timer;

    let nextDifficulty = difficulty;
    if (isCorrect) {
      nextDifficulty = Math.min(5, difficulty + 1) as Difficulty;
    } else {
      nextDifficulty = Math.max(1, difficulty - 1) as Difficulty;
    }

    const currentHintsUsed = hintIndex + 1;

    const attempt: ProblemAttempt = {
      domain: getDomainFromGrade(currentProblem.grade),
      schema: currentProblem.title,
      grade: currentProblem.grade,
      tableData: [...currentProblem.tableData],
      emoji: currentProblem.emoji,
      question: currentProblem.question,
      userAnswer: studentAnswer,
      correctAnswer: currentProblem.correctAnswer,
      expectedOp: currentProblem.expectedOp,
      isCorrect,
      timeMs: timeTaken * 1000,
      hintsUsed: currentHintsUsed,
      diffBefore: difficulty,
      diffAfter: nextDifficulty,
      timestamp: new Date().toISOString()
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
      history: [...prev.history, attempt],
      crystalMemory: {
        ...prev.crystalMemory,
        mastered: Array.from(new Set([...prev.crystalMemory.mastered, currentProblem.grade])),
        operationsUsed: [...prev.crystalMemory.operationsUsed, currentProblem.expectedOp]
      }
    }));
  };

  // Swiss Clock Timer
  useEffect(() => {
    let interval: any;
    if (sessionState === 'testing' && isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setAriaState(AriaState.Error);
      setAriaMessage(`Time's up! The missing value was ${currentProblem.correctAnswer}.`);
      
      setPillars(prev => ({ ...prev, attempts: prev.attempts + 1 }));
      handleAdaptiveAdvance(false, "TIMEOUT");
      
      setTimeout(() => {
        if (sessionState === 'testing') {
          setProblemNumber(prev => prev + 1);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer, sessionState, currentProblem, difficulty, hintIndex]);

  // Session Level Timer
  useEffect(() => {
    let interval: any;
    if (sessionState === 'testing' && sessionTimeRemaining > 0) {
      interval = setInterval(() => {
        setSessionTimeRemaining(prev => {
          if (prev <= 1) {
            playBeep();
            handleFinish(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionState, sessionTimeRemaining]);

  const startTest = () => {
    if (!studentName || !reportedGrade) return;
    setPillars(prev => ({
      ...prev,
      studentName,
      reportedGrade,
      sessionTimerSeconds: selectedDuration
    }));
    sessionStartTimeRef.current = Date.now();
    setSessionTimeRemaining(selectedDuration);
    setSessionState('testing');
    startNewProblem(1);
  };

  const startNewProblem = (newDiff: Difficulty) => {
    const nextProblem = generateProblem(newDiff);
    setCurrentProblem(nextProblem);
    setUserInput('');
    setHintIndex(-1);
    setAriaState(AriaState.Thinking);
    setAriaMessage(`Problem #${problemNumber}: Analyze the logic to find the missing "?" quantity.`);
    setTimer(30);
    setIsTimerRunning(true);
    setShowFluidityCheck(false);

    setPillars(prev => ({
      ...prev,
      crystalMemory: {
        ...prev.crystalMemory,
        tablesSeen: Array.from(new Set([...prev.crystalMemory.tablesSeen, nextProblem.title]))
      }
    }));
  };

  useEffect(() => {
    if (sessionState === 'testing' && problemNumber > 1) {
      startNewProblem(difficulty);
    }
  }, [problemNumber]);

  const handleHint = () => {
    const nextIdx = hintIndex + 1;
    if (nextIdx < currentProblem.hints.length) {
      setHintIndex(nextIdx);
      setAriaMessage(currentProblem.hints[nextIdx]);
      setPillars(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    } else {
      setAriaMessage("That's the last hint! Visualize the parts.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput || sessionState === 'review') return;

    const numericVal = parseInt(userInput);
    const isCorrect = numericVal === currentProblem.correctAnswer;
    
    setIsTimerRunning(false);
    setPillars(prev => ({ ...prev, attempts: prev.attempts + 1 }));

    if (isCorrect) {
      setAriaState(AriaState.Success);
      setAriaMessage("Correct! Your ratio sense is sharp.");
      handleAdaptiveAdvance(true, userInput);
    } else {
      setAriaState(AriaState.Error);
      setAriaMessage(`Not quite. The correct value was ${currentProblem.correctAnswer}.`);
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
    const elapsed = Date.now() - sessionStartTimeRef.current;
    setPillars(prev => ({
      ...prev,
      sessionElapsedMs: elapsed,
      sessionTimeoutReached: timeout
    }));
    setSessionState('review');
    setIsTimerRunning(false);
    setActiveTab('analytics');
    setAriaMessage("Ratio Lab Evaluation complete. Review your cognitive metrics.");
  };

  const formatSessionTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const accuracy = pillars.attempts > 0 ? (pillars.totalAnswers / pillars.attempts) : 0;
  const speedScore = pillars.totalAnswers > 0 ? (pillars.speedBonuses / pillars.totalAnswers) : 0;
  const frameScore = pillars.totalAnswers > 0 ? (pillars.frameCorrectness / pillars.totalAnswers) : 0;
  const hintPenalty = pillars.hintsUsed * 2;
  const brainPower = (accuracy * 40) + (speedScore * 30) + (frameScore * 20) - hintPenalty;

  if (sessionState === 'setup') {
    return (
      <div className="max-w-xl mx-auto p-8 mt-20 ucc-card space-y-8 text-center">
        <header>
          <p className="text-[#4EABBC] text-xs font-black uppercase tracking-[0.2em] mb-2">UnCommon Core powered</p>
          <h1 className="ucc-title text-5xl text-[#111827] mb-2">Math: Fractions</h1>
          <p className="text-gray-500 font-medium">This short test shows how your brain thinks when problems get tricky.</p>
        </header>
        <AiSettingsPanel purpose="Stores operator-selected provider and model locally for this origin." />

        <div className="space-y-4 text-left">
          <p className="text-xs font-black uppercase text-gray-400 tracking-widest text-center">Enter your name and grade to begin.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Student Name</label>
              <input 
                type="text" 
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Name" 
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#4EABBC] outline-none transition-all font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Reported Grade</label>
              <select 
                value={reportedGrade}
                onChange={(e) => setReportedGrade(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#4EABBC] outline-none transition-all font-bold"
              >
                <option value="">Select Grade</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
                <option value="5">Grade 5</option>
                <option value="6">Grade 6</option>
                <option value="7">Grade 7</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Select Session Duration</p>
          <div className="flex gap-2 justify-center">
            {[300, 600, 1500].map((d) => (
              <button 
                key={d}
                onClick={() => setSelectedDuration(d)}
                className={`px-6 py-2 rounded-xl font-bold border-2 transition-all ${selectedDuration === d ? 'border-[#4EABBC] bg-[#4EABBC]/5 text-[#4EABBC]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
              >
                {d / 60}m
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic">
            When the timer is on, your brain learns to think faster, stay calm, and spot patterns.
          </p>
        </div>

        <div className="pt-4">
          <p className="text-[11px] text-[#4EABBC] font-bold uppercase tracking-widest mb-4">
            When you finish, you will see a clear map of how your thinking is growing.
          </p>
          <button 
            disabled={!studentName || !reportedGrade}
            onClick={startTest}
            className="ucc-primary w-full py-4 text-xl font-black uppercase tracking-widest disabled:opacity-50 disabled:grayscale"
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 ucc-ui">
      
      <a href="/" className="mb-4 inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#4EABBC] transition-colors">← Back to Home Directory</a>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <p className="text-[#4EABBC] text-[10px] font-black uppercase tracking-[0.2em] mb-1">UnCommon Core powered</p>
          <h1 className="ucc-title text-4xl md:text-5xl text-[#111827] tracking-tighter uppercase leading-none">
            Math: Fractions
          </h1>
          <p className="text-gray-500 text-[10px] mt-1 font-black uppercase tracking-[0.1em]">
            STAR 360 meets DARPA-grade simulation and telemetry
          </p>
        </div>
        
        {sessionState === 'testing' && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Session Remaining</span>
            <div className={`px-4 py-2 rounded-xl font-mono text-2xl font-black border-2 transition-colors ${sessionTimeRemaining < 60 ? 'text-[#E9604F] border-[#E9604F]/20 animate-pulse' : 'text-[#111827] border-gray-100'}`}>
              {formatSessionTime(sessionTimeRemaining)}
            </div>
          </div>
        )}

        {sessionState === 'review' && (
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
        )}
      </header>

      {activeTab === 'training' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <div className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-[#4EABBC] font-bold shadow-sm">
               Puzzle #{problemNumber}
             </div>
             {sessionState === 'testing' && (
               <button 
                 onClick={() => handleFinish(false)}
                 className="px-6 py-2 rounded-xl bg-gray-50 hover:bg-[#E9604F] text-[#E9604F] hover:text-white border border-gray-200 transition-all text-xs font-bold uppercase tracking-wider shadow-sm"
               >
                 End Session
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
                          <th className="p-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Item Label</th>
                          <th className="p-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Quantity</th>
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

                  {!showFluidityCheck && (
                    <div className="space-y-4">
                       <form onSubmit={handleSubmit} className="flex gap-3">
                        <input
                          type="number"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder="Enter value..."
                          className="flex-1 bg-white border-2 border-gray-200 rounded-xl px-5 py-3.5 text-[#111827] font-bold text-lg focus:outline-none focus:border-[#4EABBC] transition-all placeholder:text-gray-300 shadow-inner"
                          disabled={sessionState === 'review'}
                          autoFocus
                        />
                        <button 
                          type="submit"
                          className="ucc-primary px-8 py-3.5 font-bold text-lg active:scale-95 disabled:opacity-50"
                          disabled={sessionState === 'review'}
                        >
                          Check
                        </button>
                      </form>
                      <button 
                        onClick={handleHint}
                        className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-[#4EABBC] transition-colors"
                      >
                        Get a Hint (Costs performance index.)
                      </button>
                    </div>
                  )}
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
        Fraction & Ratio Logic System &copy; 2024
      </footer>
    </div>
  );
};

export default App;
