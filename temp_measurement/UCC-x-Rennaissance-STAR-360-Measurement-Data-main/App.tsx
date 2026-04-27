
import React, { useState, useEffect, useRef } from 'react';
import { Difficulty, AriaState, MathOperation, Problem, BrainPillars, ItemTelemetry } from './types';
import { generateProblem } from './constants';
import { AriaAvatar } from './components/AriaAvatar';
import { EmojiViz } from './components/EmojiViz';
import { BrainAnalytics } from './components/BrainAnalytics';
import { SwissClockTimer } from './components/SwissClockTimer';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'setup' | 'testing' | 'review'>('setup');
  const [studentName, setStudentName] = useState<string>('');
  const [reportedGrade, setReportedGrade] = useState<string>('');
  const [selectedSessionTime, setSelectedSessionTime] = useState<number>(300); // Default 5 mins (300s)

  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [maxDifficultyReached, setMaxDifficultyReached] = useState<Difficulty>(1);
  const [problemNumber, setProblemNumber] = useState<number>(1);
  const [currentProblem, setCurrentProblem] = useState<Problem>(generateProblem(1));
  
  const [activeTab, setActiveTab] = useState<'training' | 'analytics'>('training');
  const [userInput, setUserInput] = useState<string>('');
  const [ariaState, setAriaState] = useState<AriaState>(AriaState.Thinking);
  const [ariaMessage, setAriaMessage] = useState<string>("Ready to measure the world? Let's start the log.");
  const [hintIndex, setHintIndex] = useState<number>(-1);
  const [itemTimer, setItemTimer] = useState<number>(30);
  const [isItemTimerRunning, setIsItemTimerRunning] = useState<boolean>(false);

  // Session-level tracking
  const [sessionRemainingSeconds, setSessionRemainingSeconds] = useState<number>(300);
  const sessionStartTimeRef = useRef<number>(0);
  const itemStartTimeRef = useRef<number>(Date.now());

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
    itemLog: [],
    studentName: '',
    reportedGrade: '',
    sessionTimerSeconds: 0,
    sessionElapsedMs: 0,
    sessionTimeoutReached: false
  });

  const triggerSessionFinish = (timeout: boolean = false) => {
    setViewState('review');
    setIsItemTimerRunning(false);
    setActiveTab('analytics');
    setAriaMessage("Measurement Data Evaluation complete. Review your cognitive metrics.");
    
    setPillars(prev => ({
      ...prev,
      sessionElapsedMs: Date.now() - sessionStartTimeRef.current,
      sessionTimeoutReached: timeout
    }));

    if (timeout) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    }
  };

  const handleAdaptiveAdvance = (isCorrect: boolean, studentAnswer: string) => {
    const timeTaken = 30 - itemTimer;
    const timeTakenMs = Date.now() - itemStartTimeRef.current;

    let nextDifficulty = difficulty;
    if (isCorrect) {
      nextDifficulty = Math.min(5, difficulty + 1) as Difficulty;
    } else {
      nextDifficulty = Math.max(1, difficulty - 1) as Difficulty;
    }

    const telemetry: ItemTelemetry = {
      id: problemNumber,
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
      timestamp: new Date().toISOString()
    };

    setDifficulty(nextDifficulty);
    setMaxDifficultyReached(prev => Math.max(prev, nextDifficulty) as Difficulty);

    setPillars(prev => ({
      ...prev,
      totalAnswers: prev.totalAnswers + (isCorrect ? 1 : 0),
      frameCorrectness: prev.frameCorrectness + (isCorrect ? 1 : 0),
      speedBonuses: prev.speedBonuses + (isCorrect && itemTimer > 15 ? 1 : 0),
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
    if (viewState === 'testing' && sessionRemainingSeconds > 0) {
      interval = setInterval(() => {
        setSessionRemainingSeconds(prev => {
          if (prev <= 1) {
            triggerSessionFinish(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [viewState, sessionRemainingSeconds]);

  useEffect(() => {
    let interval: any;
    if (isItemTimerRunning && itemTimer > 0) {
      interval = setInterval(() => {
        setItemTimer(prev => prev - 1);
      }, 1000);
    } else if (itemTimer === 0 && isItemTimerRunning) {
      setIsItemTimerRunning(false);
      setAriaState(AriaState.Error);
      setAriaMessage(`Time's up! The missing value was ${currentProblem.correctAnswer}.`);
      
      setPillars(prev => ({ ...prev, attempts: prev.attempts + 1 }));
      handleAdaptiveAdvance(false, userInput || "(timed out)");
      
      setTimeout(() => {
        if (viewState === 'testing') {
          setProblemNumber(prev => prev + 1);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isItemTimerRunning, itemTimer, viewState, currentProblem]);

  const startNewProblem = (newDiff: Difficulty) => {
    const nextProblem = generateProblem(newDiff);
    setCurrentProblem(nextProblem);
    setUserInput('');
    setHintIndex(-1);
    setAriaState(AriaState.Thinking);
    setAriaMessage(`Problem #${problemNumber}: What really happened here?`);
    setItemTimer(30);
    itemStartTimeRef.current = Date.now();
    setIsItemTimerRunning(true);
  };

  useEffect(() => {
    if (viewState === 'testing') {
      startNewProblem(difficulty);
    }
  }, [problemNumber, viewState]);

  const handleHint = () => {
    const nextIdx = hintIndex + 1;
    if (nextIdx < currentProblem.hints.length) {
      setHintIndex(nextIdx);
      setAriaMessage(currentProblem.hints[nextIdx]);
      setPillars(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    } else {
      setAriaMessage("That's the last hint! Trust your mental model.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput || viewState === 'review') return;

    const numericVal = parseInt(userInput);
    const isCorrect = numericVal === currentProblem.correctAnswer;
    
    setIsItemTimerRunning(false);
    setPillars(prev => ({ ...prev, attempts: prev.attempts + 1 }));

    if (isCorrect) {
      setAriaState(AriaState.Success);
      setAriaMessage("Correct! Your reading of the world is precise.");
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
      if (viewState === 'testing') {
        setProblemNumber(prev => prev + 1);
      }
    }, 1500);
  };

  const handleStartTest = () => {
    if (!studentName || !reportedGrade) return;
    setViewState('testing');
    setSessionRemainingSeconds(selectedSessionTime);
    sessionStartTimeRef.current = Date.now();
    setPillars(prev => ({
      ...prev,
      studentName,
      reportedGrade,
      sessionTimerSeconds: selectedSessionTime
    }));
  };

  const accuracy = pillars.attempts > 0 ? (pillars.totalAnswers / pillars.attempts) : 0;
  const speedScore = pillars.totalAnswers > 0 ? (pillars.speedBonuses / pillars.totalAnswers) : 0;
  const frameScore = pillars.totalAnswers > 0 ? (pillars.frameCorrectness / pillars.totalAnswers) : 0;
  const hintPenalty = pillars.hintsUsed * 2;
  const brainPower = (accuracy * 40) + (speedScore * 30) + (frameScore * 20) - hintPenalty;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 ucc-ui">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <p className="text-[#4EABBC] text-[10px] font-black uppercase tracking-[0.3em] mb-1">
            UnCommon Core powered
          </p>
          <h1 className="ucc-title text-3xl md:text-4xl lg:text-5xl text-[#111827] tracking-tighter uppercase">
            Math: Measurement & Data
          </h1>
          <p className="text-gray-500 text-xs mt-1 font-black uppercase tracking-[0.2em]">
            STAR 360 meets real-world thinking under pressure
          </p>
        </div>
        
        {viewState === 'review' && (
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

        {viewState === 'testing' && (
          <div className="flex items-center gap-4 bg-gray-50 px-6 py-2 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Session Clock:</span>
            <span className={`font-mono font-bold text-lg ${sessionRemainingSeconds < 60 ? 'text-[#E9604F] animate-pulse' : 'text-[#111827]'}`}>
              {Math.floor(sessionRemainingSeconds / 60)}:{(sessionRemainingSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </header>

      {viewState === 'setup' ? (
        <div className="max-w-xl mx-auto ucc-card p-10 space-y-8 border-t-[6px] border-[#4EABBC]">
          <div className="text-center space-y-4">
            <h2 className="ucc-title text-2xl text-[#111827]">Enter your name and grade to begin.</h2>
            <div className="space-y-3 px-2">
              <p className="text-gray-600 font-medium text-lg leading-relaxed">
                This short test shows how your brain reads the real world when time is tight — things like distance, time, and how much fits in a space.
              </p>
              <p className="text-[#4EABBC] font-bold text-sm">
                It builds speed, focus, and calm thinking while it maps how you solve problems.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1.5 ml-1">Student Name</label>
              <input 
                type="text" 
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ex: Chloe Miller"
                className="w-full bg-white border-2 border-gray-100 rounded-xl px-5 py-3.5 focus:outline-none focus:border-[#4EABBC] font-bold text-[#111827] transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1.5 ml-1">Reported Grade</label>
              <select 
                value={reportedGrade}
                onChange={(e) => setReportedGrade(e.target.value)}
                className="w-full bg-white border-2 border-gray-100 rounded-xl px-5 py-3.5 focus:outline-none focus:border-[#4EABBC] font-bold text-[#111827] appearance-none"
              >
                <option value="">Select Grade...</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
                <option value="5">Grade 5</option>
                <option value="6">Grade 6</option>
                <option value="7">Grade 7</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1.5 ml-1">Session Duration</label>
              <div className="grid grid-cols-3 gap-3">
                {[300, 600, 1500].map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSessionTime(s)}
                    className={`py-3 px-2 rounded-xl font-bold text-sm transition-all border-2 ${selectedSessionTime === s ? 'border-[#4EABBC] bg-[#4EABBC]/5 text-[#4EABBC]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                  >
                    {s / 60} mins
                  </button>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-gray-500 font-medium text-center italic leading-relaxed">
                When the clock is on, your brain learns to think faster, stay calm, and spot patterns.
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
              When you finish, you’ll see a clear map of how your thinking is growing.
            </p>
            <button
              onClick={handleStartTest}
              disabled={!studentName || !reportedGrade}
              className="w-full ucc-primary py-4 font-black uppercase tracking-widest text-sm disabled:opacity-40"
            >
              Start Measurement Lab
            </button>
          </div>
        </div>
      ) : activeTab === 'training' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <div className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-[#4EABBC] font-bold shadow-sm">
               Entry #{problemNumber}
             </div>
             {viewState === 'testing' && (
               <button 
                 onClick={() => triggerSessionFinish()}
                 className="px-6 py-2 rounded-xl bg-gray-50 hover:bg-[#E9604F] text-[#E9604F] hover:text-white border border-gray-200 transition-all text-xs font-bold uppercase tracking-wider shadow-sm"
               >
                 End Evaluation
               </button>
             )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="ucc-card p-8 flex flex-col justify-between space-y-6 border-t-[6px] border-[#4EABBC]">
              {viewState === 'review' && activeTab === 'training' ? (
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                   <h2 className="ucc-title text-2xl text-[#4EABBC]">Session Locked</h2>
                   <p className="text-gray-500 font-medium">Evaluation complete. Visit the Session Summary tab for your full report.</p>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="ucc-title text-2xl text-[#111827]">{currentProblem.title}</h2>
                      <SwissClockTimer secondsRemaining={itemTimer} totalSeconds={30} />
                    </div>
                    
                    <table className="w-full text-left mb-6 overflow-hidden rounded-xl border border-gray-100">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Metric Label</th>
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
                        placeholder="Enter quantity..."
                        className="flex-1 bg-white border-2 border-gray-200 rounded-xl px-5 py-3.5 text-[#111827] font-bold text-lg focus:outline-none focus:border-[#4EABBC] transition-all placeholder:text-gray-300 shadow-inner"
                        disabled={viewState === 'review'}
                        autoFocus
                      />
                      <button 
                        type="submit"
                        className="ucc-primary px-8 py-3.5 font-bold text-lg active:scale-95 disabled:opacity-50"
                        disabled={viewState === 'review'}
                      >
                        Check
                      </button>
                    </form>
                    <button 
                      onClick={handleHint}
                      className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-[#4EABBC] transition-colors"
                    >
                      Get a Hint (Costs performance.)
                    </button>
                  </div>
                </>
              )}
            </div>

            <EmojiViz emoji={currentProblem.emoji} data={currentProblem.tableData.map(row => ({ label: row.label, value: row.value || 0 }))} />
            <AriaAvatar state={ariaState} message={ariaMessage} />

            <div className={`ucc-card p-8 flex flex-col justify-between border-t-[6px] border-[#E9604F] transition-opacity duration-500 ${viewState === 'testing' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div>
                <h3 className="ucc-title text-xl mb-6 text-[#E9604F]">Cognitive Pillars</h3>
                <div className="space-y-6">
                  {viewState === 'review' && (
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

              {viewState === 'review' && (
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
          sessionFinished={viewState === 'review'} 
        />
      )}
      
      <footer className="text-center text-gray-300 text-[10px] font-black uppercase tracking-[0.3em] py-12">
        Measurement & Data Logic System &copy; 2024
      </footer>
    </div>
  );
};

export default App;
