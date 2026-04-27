
import React, { useState, useEffect, useRef } from 'react';
import { Difficulty, AriaState, MathOperation, Problem, BrainPillars, SessionItem } from './types';
import { generateProblem } from './constants';
import { AriaAvatar } from './components/AriaAvatar';
import { EmojiViz } from './components/EmojiViz';
import { BrainAnalytics } from './components/BrainAnalytics';
import { SwissClockTimer } from './components/SwissClockTimer';
import { AiSettingsPanel } from './components/AiSettingsPanel';

const App: React.FC = () => {
  const [sessionState, setSessionState] = useState<'setup' | 'testing' | 'review'>('setup');
  const [studentName, setStudentName] = useState<string>('');
  const [reportedGrade, setReportedGrade] = useState<string>('');
  const [sessionDuration, setSessionDuration] = useState<number>(300); // Default 5 mins
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(300);

  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [maxDifficultyReached, setMaxDifficultyReached] = useState<Difficulty>(1);
  const [problemNumber, setProblemNumber] = useState<number>(1);
  const [currentProblem, setCurrentProblem] = useState<Problem>(generateProblem(1));
  
  const [activeTab, setActiveTab] = useState<'training' | 'analytics'>('training');
  const [userInput, setUserInput] = useState<string>('');
  const [ariaState, setAriaState] = useState<AriaState>(AriaState.Thinking);
  const [ariaMessage, setAriaMessage] = useState<string>("Ready to climb the ladder? Let's start Problem 1.");
  const [showFluidityCheck, setShowFluidityCheck] = useState<boolean>(false);
  const [hintIndex, setHintIndex] = useState<number>(-1);
  const [timer, setTimer] = useState<number>(30);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const sessionStartRef = useRef<number>(0);

  // Pillars State
  const [pillars, setPillars] = useState<BrainPillars>({
    studentName: '',
    reportedGrade: '',
    sessionTimerSeconds: 300,
    sessionElapsedMs: 0,
    sessionTimeoutReached: false,
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
    sessionLog: []
  });

  const playSoftBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("AudioContext failed", e);
    }
  };

  // Whole-Session Timer
  useEffect(() => {
    let interval: any;
    if (sessionState === 'testing' && sessionTimeRemaining > 0) {
      interval = setInterval(() => {
        setSessionTimeRemaining(prev => {
          if (prev <= 1) {
            handleFinish(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionState, sessionTimeRemaining]);

  const handleStartTest = () => {
    if (!studentName || !reportedGrade) return;
    setPillars(prev => ({
      ...prev,
      studentName,
      reportedGrade,
      sessionTimerSeconds: sessionDuration
    }));
    setSessionTimeRemaining(sessionDuration);
    sessionStartRef.current = Date.now();
    setSessionState('testing');
    startNewProblem(1);
  };

  const handleAdaptiveAdvance = (isCorrect: boolean, studentAnswer: string | number) => {
    const timeTaken = 30 - timer;

    let nextDifficulty = difficulty;
    if (isCorrect) {
      nextDifficulty = Math.min(5, difficulty + 1) as Difficulty;
    } else {
      nextDifficulty = Math.max(1, difficulty - 1) as Difficulty;
    }

    const logItem: SessionItem = {
      appName: "UCC x Renaissance STAR 360",
      domain: currentProblem.domain,
      schemaName: currentProblem.title,
      hiddenGradeLevel: currentProblem.grade,
      tableData: currentProblem.tableData,
      questionText: currentProblem.question,
      studentAnswer: studentAnswer,
      correctAnswer: currentProblem.correctAnswer,
      frameSelected: currentProblem.expectedOp,
      wasCorrect: isCorrect,
      timeToAnswerMs: timeTaken * 1000,
      hintsUsed: hintIndex + 1,
      difficultyBefore: difficulty,
      difficultyAfter: nextDifficulty,
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
      sessionLog: [...prev.sessionLog, logItem],
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
      setAriaMessage(`Time's up! The missing value was ${currentProblem.correctAnswer}.`);
      
      setPillars(prev => ({ ...prev, attempts: prev.attempts + 1 }));
      handleAdaptiveAdvance(false, "Timed Out");
      
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
    setAriaMessage(`Problem #${problemNumber}: Find the value for the missing "?" item.`);
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
    if (sessionState === 'testing') {
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
      setAriaMessage("That's the last hint! Trust your mental math.");
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
      setAriaMessage("Correct! The puzzle is complete.");
      handleAdaptiveAdvance(true, numericVal);
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
      handleAdaptiveAdvance(false, numericVal);
    }

    setTimeout(() => {
      if (sessionState === 'testing') {
        setProblemNumber(prev => prev + 1);
      }
    }, 1500);
  };

  const handleFinish = (isTimeout: boolean = false) => {
    if (isTimeout) playSoftBeep();
    const elapsed = Date.now() - sessionStartRef.current;
    setPillars(prev => ({
      ...prev,
      sessionElapsedMs: elapsed,
      sessionTimeoutReached: isTimeout
    }));
    setSessionState('review');
    setIsTimerRunning(false);
    setActiveTab('analytics');
    setAriaMessage("Evaluation mode unlocked. Analyze your Algebra Readiness scores.");
  };

  const accuracy = pillars.attempts > 0 ? (pillars.totalAnswers / pillars.attempts) : 0;
  const speedScore = pillars.totalAnswers > 0 ? (pillars.speedBonuses / pillars.totalAnswers) : 0;
  const frameScore = pillars.totalAnswers > 0 ? (pillars.frameCorrectness / pillars.totalAnswers) : 0;
  const hintPenalty = pillars.hintsUsed * 2;
  const brainPower = (accuracy * 40) + (speedScore * 30) + (frameScore * 20) - hintPenalty;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 ucc-ui">
      
      <a href="/" className="mb-4 inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#4EABBC] transition-colors">← Back to Home Directory</a>
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] leading-none mb-2">UnCommon Core powered</p>
          <h1 className="ucc-title text-4xl md:text-5xl text-[#111827] tracking-tighter uppercase leading-none">
            Math: Algebra Readiness
          </h1>
          <p className="text-gray-500 text-xs mt-2 font-black uppercase tracking-[0.2em]">
            STAR 360 meets DARPA-grade simulation and telemetry
          </p>
        </div>
        
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

        {sessionState === 'testing' && (
          <div className="px-6 py-3 rounded-2xl bg-[#E9604F]/10 border-2 border-[#E9604F]/30 flex flex-col items-center">
            <span className="text-[10px] text-[#E9604F] font-black uppercase tracking-widest mb-1">Session Timer</span>
            <span className="text-2xl font-black text-[#111827] font-mono">{formatTime(sessionTimeRemaining)}</span>
          </div>
        )}
      </header>

      <AiSettingsPanel purpose="Required for coach memo generation in this app. Saved locally for this deployment origin only." />

      {sessionState === 'setup' ? (
        <div className="max-w-md mx-auto ucc-card p-10 space-y-8 border-t-[6px] border-[#4EABBC]">
          <div className="text-center">
            <h2 className="ucc-title text-3xl text-[#111827]">Math: Algebra Readiness</h2>
            <p className="text-gray-500 text-sm mt-2">This short test shows how your brain thinks when problems get tricky.</p>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600 text-sm font-medium">Enter your name and grade to begin.</p>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Student Name</label>
              <input 
                type="text" 
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-5 py-3.5 text-[#111827] font-bold text-lg focus:outline-none focus:border-[#4EABBC] transition-all"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Reported Grade</label>
              <select 
                value={reportedGrade}
                onChange={(e) => setReportedGrade(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-5 py-3.5 text-[#111827] font-bold text-lg focus:outline-none focus:border-[#4EABBC] transition-all"
              >
                <option value="">Select Grade</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>                
                <option value="5">Grade 5</option>
                <option value="6">Grade 6</option>
                <option value="7">Grade 7</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Session Duration</label>
              <div className="grid grid-cols-3 gap-3">
                {[300, 600, 1500].map(d => (
                  <button 
                    key={d}
                    onClick={() => setSessionDuration(d)}
                    className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${sessionDuration === d ? 'border-[#4EABBC] bg-[#4EABBC]/5 text-[#4EABBC]' : 'border-gray-200 text-gray-400 hover:border-[#4EABBC]/50'}`}
                  >
                    {d / 60} Min
                  </button>
                ))}
              </div>
              <p className="text-gray-500 text-[11px] mt-4 italic">When the timer is on, your brain learns to think faster, stay calm, and spot patterns.</p>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-gray-500 text-sm font-medium text-center">When you finish, you will see a clear map of how your thinking is growing.</p>
            <button 
              onClick={handleStartTest}
              disabled={!studentName || !reportedGrade}
              className="w-full ucc-primary py-4 font-black text-lg uppercase tracking-widest disabled:opacity-30 disabled:grayscale"
            >
              Start Test
            </button>
          </div>
        </div>
      ) : activeTab === 'training' ? (
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
                 End Evaluation Early
               </button>
             )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="ucc-card p-8 flex flex-col justify-between space-y-6 border-t-[6px] border-[#4EABBC]">
              {sessionState === 'review' && activeTab === 'training' ? (
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                   <h2 className="ucc-title text-2xl text-[#4EABBC]">Session Locked</h2>
                   <p className="text-gray-500 font-medium">Test session concluded. Switch to Session Summary for full evaluation results.</p>
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

                  {!showFluidityCheck && (
                    <div className="flex flex-col space-y-3">
                      <form onSubmit={handleSubmit} className="flex gap-3">
                        <input
                          type="number"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder="Missing value..."
                          className="flex-1 bg-white border-2 border-gray-200 rounded-xl px-5 py-3.5 text-[#111827] font-bold text-lg focus:outline-none focus:border-[#4EABBC] transition-all placeholder:text-gray-300 shadow-inner"
                          disabled={sessionState === 'review'}
                          autoFocus
                        />
                        <button 
                          type="submit"
                          className="ucc-primary px-8 py-3.5 font-bold text-lg active:scale-95 disabled:opacity-50"
                          disabled={sessionState === 'review'}
                        >
                          Enter
                        </button>
                      </form>
                      <button 
                        onClick={handleHint}
                        className="text-xs font-black text-[#4EABBC] uppercase tracking-widest text-left pl-1 hover:opacity-70 transition-opacity"
                        disabled={sessionState === 'review'}
                      >
                        💡 Get a Hint
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <EmojiViz emoji={currentProblem.emoji} data={currentProblem.tableData} />
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
        Algebra Readiness Logic System &copy; 2024
      </footer>
    </div>
  );
};

export default App;
