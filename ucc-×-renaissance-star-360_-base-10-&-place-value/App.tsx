
import React, { useState, useEffect, useRef } from 'react';
import { Difficulty, AriaState, MathOperation, Problem, BrainPillars, ItemTelemetry, SessionMetadata } from './types';
import { generateProblem } from './constants';
import { AriaAvatar } from './components/AriaAvatar';
import { EmojiViz } from './components/EmojiViz';
import { BrainAnalytics } from './components/BrainAnalytics';
import { SwissClockTimer } from './components/SwissClockTimer';
import { AiSettingsPanel } from './components/AiSettingsPanel';

const App: React.FC = () => {
  const [sessionState, setSessionState] = useState<'setup' | 'testing' | 'review'>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [maxDifficultyReached, setMaxDifficultyReached] = useState<Difficulty>(1);
  const [problemNumber, setProblemNumber] = useState<number>(1);
  const [currentProblem, setCurrentProblem] = useState<Problem>(generateProblem(1));
  
  const [activeTab, setActiveTab] = useState<'training' | 'analytics'>('training');
  const [userInput, setUserInput] = useState<string>('');
  const [ariaState, setAriaState] = useState<AriaState>(AriaState.Thinking);
  const [ariaMessage, setAriaMessage] = useState<string>("Look at the values. Your brain can see the hidden patterns in base-10.");
  const [showFluidityCheck, setShowFluidityCheck] = useState<boolean>(false);
  const [hintIndex, setHintIndex] = useState<number>(-1);
  const [itemTimer, setItemTimer] = useState<number>(30);
  const [isItemTimerRunning, setIsItemTimerRunning] = useState<boolean>(false);

  // Setup State
  const [studentName, setStudentName] = useState('');
  const [reportedGrade, setReportedGrade] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(300); // Default 5 mins

  // Session timer state
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionTimeoutReached, setSessionTimeoutReached] = useState(false);

  const startTimeRef = useRef<number>(Date.now());

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
    itemLog: []
  });

  // Handle Session Timeout
  useEffect(() => {
    let sessionInterval: any;
    if (sessionState === 'testing' && sessionTimeRemaining > 0) {
      sessionInterval = setInterval(() => {
        setSessionTimeRemaining(prev => {
          if (prev <= 1) {
            setSessionTimeoutReached(true);
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(sessionInterval);
  }, [sessionState, sessionTimeRemaining]);

  const handleStartTest = () => {
    if (!studentName || !reportedGrade) return;
    setSessionTimeRemaining(selectedDuration);
    setSessionStartTime(Date.now());
    setSessionState('testing');
    startNewProblem(difficulty);
  };

  const handleAdaptiveAdvance = (isCorrect: boolean, studentAnswer: string) => {
    const timeTaken = 30 - itemTimer;
    const timeTakenMs = Date.now() - startTimeRef.current;

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
    if (isItemTimerRunning && itemTimer > 0) {
      interval = setInterval(() => {
        setItemTimer(prev => prev - 1);
      }, 1000);
    } else if (itemTimer === 0 && isItemTimerRunning) {
      setIsItemTimerRunning(false);
      setAriaState(AriaState.Error);
      setAriaMessage(`Time's up! The correct answer was ${currentProblem.correctAnswer}.`);
      
      setPillars(prev => ({ ...prev, attempts: prev.attempts + 1 }));
      handleAdaptiveAdvance(false, userInput || "(timed out)");
      
      setTimeout(() => {
        if (sessionState === 'testing') {
          setProblemNumber(prev => prev + 1);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isItemTimerRunning, itemTimer, sessionState, currentProblem]);

  const startNewProblem = (newDiff: Difficulty) => {
    const nextProblem = generateProblem(newDiff);
    setCurrentProblem(nextProblem);
    setUserInput('');
    setHintIndex(-1);
    setAriaState(AriaState.Thinking);
    setAriaMessage(`Place-Value Puzzle #${problemNumber}: What does this pattern tell you?`);
    setItemTimer(30);
    startTimeRef.current = Date.now();
    setIsItemTimerRunning(true);
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
      setAriaMessage("The pattern holds the answer. Look closely at the place values.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput || sessionState !== 'testing') return;

    const processedInput = userInput.trim().toLowerCase();
    const processedCorrect = currentProblem.correctAnswer.toString().toLowerCase();
    const numInput = parseFloat(processedInput);
    const numCorrect = parseFloat(processedCorrect);
    
    let isCorrect = processedInput === processedCorrect;
    if (!isNaN(numInput) && !isNaN(numCorrect)) {
      isCorrect = Math.abs(numInput - numCorrect) < 0.0001;
    }
    
    setIsItemTimerRunning(false);
    setPillars(prev => ({ ...prev, attempts: prev.attempts + 1 }));

    if (isCorrect) {
      setAriaState(AriaState.Success);
      setAriaMessage("Correct! Your brain sees the Base-10 structure perfectly.");
      handleAdaptiveAdvance(true, userInput);
    } else {
      setAriaState(AriaState.Error);
      setAriaMessage(`Not quite. The correct answer was ${currentProblem.correctAnswer}.`);
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

  const handleFinish = () => {
    const elapsed = sessionStartTime ? Date.now() - sessionStartTime : 0;
    
    setPillars(prev => ({
      ...prev,
      metadata: {
        studentName,
        reportedGrade,
        sessionTimerSeconds: selectedDuration,
        sessionElapsedMs: elapsed,
        sessionTimeoutReached: sessionTimeRemaining <= 0
      }
    }));

    setSessionState('review');
    setIsItemTimerRunning(false);
    setActiveTab('analytics');
    setAriaMessage("Base-10 & Place-Value Evaluation complete. Review your cognitive metrics.");
  };

  const accuracy = pillars.attempts > 0 ? (pillars.totalAnswers / pillars.attempts) : 0;
  const speedScore = pillars.totalAnswers > 0 ? (pillars.speedBonuses / pillars.totalAnswers) : 0;
  const frameScore = pillars.totalAnswers > 0 ? (pillars.frameCorrectness / pillars.totalAnswers) : 0;
  const hintPenalty = pillars.hintsUsed * 2;
  const brainPower = (accuracy * 40) + (speedScore * 30) + (frameScore * 20) - hintPenalty;

  const formatSessionTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 ucc-ui">
      
      <a href="/" className="mb-4 inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#4EABBC] transition-colors">← Back to Home Directory</a>
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <p className="text-[#4EABBC] text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            UnCommon Core powered
          </p>
          <h1 className="ucc-title text-3xl md:text-4xl lg:text-5xl text-[#111827] tracking-tighter uppercase">
            Math: Base-10 & Place Value
          </h1>
          <p className="text-gray-500 text-xs mt-1 font-medium tracking-wide">
            Where Star 360 meets cognitive science.
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
      </header>

      <AiSettingsPanel purpose="Required for coach memo generation in this app. Saved locally for this deployment origin only." />

      {sessionState === 'setup' ? (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-4 mb-10">
            <p className="text-xl text-[#111827] font-medium leading-relaxed">
              This isn’t a math test. It’s a live map of how your brain sees numbers.
            </p>
            <p className="text-gray-400 font-medium leading-relaxed text-sm">
              You’ll solve problems fast, under a clock — just like real tests — while we track how your thinking adapts.
            </p>
          </div>

          <div className="ucc-card p-10 border-t-[6px] border-[#4EABBC]">
            <div className="space-y-6">
              <p className="text-sm font-bold text-[#111827]">Enter your name and grade to start your session.</p>
              
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Student Name</label>
                <input 
                  type="text" 
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter name..."
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-3.5 focus:border-[#4EABBC] focus:outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Reported Grade</label>
                <select 
                  value={reportedGrade}
                  onChange={(e) => setReportedGrade(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-3.5 focus:border-[#4EABBC] focus:outline-none font-bold appearance-none"
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
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Pick how long you want to train your brain today.</label>
                <div className="grid grid-cols-3 gap-3">
                  {[300, 600, 1500].map(seconds => (
                    <button
                      key={seconds}
                      onClick={() => setSelectedDuration(seconds)}
                      className={`py-3 rounded-xl border-2 font-bold transition-all ${selectedDuration === seconds ? 'bg-[#4EABBC] text-white border-[#4EABBC]' : 'bg-white text-gray-400 border-gray-100'}`}
                    >
                      {seconds / 60}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleStartTest}
                  disabled={!studentName || !reportedGrade}
                  className="w-full ucc-primary py-4 font-black uppercase tracking-widest text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Test
                </button>
                <p className="text-center text-[10px] text-gray-300 font-black uppercase tracking-[0.2em] mt-4">
                  No grades. No retries. Just real thinking.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'training' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <div className="flex gap-4">
               <div className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-[#4EABBC] font-bold shadow-sm">
                 Number Puzzle #{problemNumber}
               </div>
               {sessionState === 'testing' && (
                 <div className="px-4 py-2 rounded-xl bg-[#E9604F]/5 border border-[#E9604F]/20 text-[#E9604F] font-black shadow-sm flex items-center gap-2">
                   <span className="text-[10px] uppercase tracking-widest">Time Left</span>
                   <span className="font-mono">{formatSessionTime(sessionTimeRemaining)}</span>
                 </div>
               )}
             </div>
             {sessionState === 'testing' && (
               <button 
                 onClick={handleFinish}
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
                      <SwissClockTimer secondsRemaining={itemTimer} totalSeconds={30} />
                    </div>
                    
                    <table className="w-full text-left mb-6 overflow-hidden rounded-xl border border-gray-100">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Place Value Mapping</th>
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
                    <div className="space-y-4">
                       <form onSubmit={handleSubmit} className="flex gap-3">
                        <input
                          type="text"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder="Enter value or A/B..."
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
                        Get a Hint (Costs Performance Index.)
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
        Base-10 & Place-Value Logic System &copy; 2024
      </footer>
    </div>
  );
};

export default App;
