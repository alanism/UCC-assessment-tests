
import React, { useState, useEffect, useRef } from 'react';
import { Difficulty, AriaState, Problem, BrainPillars, ItemTelemetry } from './types';
import { generateProblem } from './constants';
import { AriaAvatar } from './components/AriaAvatar';
import { EmojiViz } from './components/EmojiViz';
import { BrainAnalytics } from './components/BrainAnalytics';
import { SwissClockTimer } from './components/SwissClockTimer';
import { AiSettingsPanel } from './components/AiSettingsPanel';

const App: React.FC = () => {
  const [sessionState, setSessionState] = useState<'testing' | 'review'>('testing');
  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [maxDifficultyReached, setMaxDifficultyReached] = useState<Difficulty>(1);
  const [problemNumber, setProblemNumber] = useState<number>(1);
  const [currentProblem, setCurrentProblem] = useState<Problem>(generateProblem(1));
  
  const [activeTab, setActiveTab] = useState<'training' | 'analytics'>('training');
  const [ariaState, setAriaState] = useState<AriaState>(AriaState.Thinking);
  const [ariaMessage, setAriaMessage] = useState<string>("Look for the evidence. Your brain maps the meaning.");
  const [timer, setTimer] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());

  const [pillars, setPillars] = useState<BrainPillars>({
    crystalMemory: { tablesSeen: [], operationsUsed: [], mistakes: [], mastered: [] },
    frameCorrectness: 0,
    totalAnswers: 0,
    hintsUsed: 0,
    speedBonuses: 0,
    totalTime: 0,
    attempts: 0,
    levelHistory: [],
    itemLog: []
  });

  const handleSelection = (selectedIndex: number) => {
    if (sessionState === 'review') return;
    
    setIsTimerRunning(false);
    const isCorrect = selectedIndex === currentProblem.correctIndex;
    const timeTakenMs = Date.now() - startTimeRef.current;

    let nextDifficulty = difficulty;
    if (isCorrect) {
      nextDifficulty = Math.min(5, difficulty + 1) as Difficulty;
      setAriaState(AriaState.Success);
      setAriaMessage("Accurate tracking. You've identified the core meaning.");
    } else {
      nextDifficulty = Math.max(1, difficulty - 1) as Difficulty;
      setAriaState(AriaState.Error);
      setAriaMessage("Logic gap. Check the details versus the distractors.");
    }

    const telemetry: ItemTelemetry = {
      id: currentProblem.id,
      grade: currentProblem.grade,
      passage: currentProblem.passage,
      question: currentProblem.question,
      options: currentProblem.options,
      correctIndex: currentProblem.correctIndex,
      selectedIndex,
      isCorrect,
      skill: currentProblem.skill,
      errorType: isCorrect ? "None" : currentProblem.distractorType,
      timeMs: timeTakenMs,
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
      speedBonuses: prev.speedBonuses + (isCorrect && timer > 30 ? 1 : 0),
      totalTime: prev.totalTime + (60 - timer),
      attempts: prev.attempts + 1,
      itemLog: [...prev.itemLog, telemetry],
      levelHistory: [...prev.levelHistory, { difficulty, time: 60 - timer, accuracy: isCorrect ? 1 : 0 }],
      crystalMemory: {
        ...prev.crystalMemory,
        mastered: isCorrect ? Array.from(new Set([...prev.crystalMemory.mastered, currentProblem.grade])) : prev.crystalMemory.mastered,
        operationsUsed: Array.from(new Set([...prev.crystalMemory.operationsUsed, currentProblem.skill])),
        mistakes: isCorrect ? prev.crystalMemory.mistakes : [...prev.crystalMemory.mistakes, currentProblem.id]
      }
    }));

    setTimeout(() => {
      if (sessionState === 'testing') {
        setProblemNumber(prev => prev + 1);
      }
    }, 1500);
  };

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0 && isTimerRunning) {
      handleSelection(-1); 
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  useEffect(() => {
    if (sessionState !== 'review') {
      const nextProblem = generateProblem(difficulty);
      setCurrentProblem(nextProblem);
      setAriaState(AriaState.Thinking);
      setAriaMessage("Construct the meaning. What is the evidence telling you?");
      setTimer(60);
      startTimeRef.current = Date.now();
      setIsTimerRunning(true);
    }
  }, [problemNumber]);

  const handleFinish = () => {
    setSessionState('review');
    setIsTimerRunning(false);
    setActiveTab('analytics');
    setAriaMessage("Meaning Evaluation complete. Review your evidence tracking metrics.");
  };

  const accuracy = pillars.attempts > 0 ? (pillars.totalAnswers / pillars.attempts) : 0;
  const speedScore = pillars.totalAnswers > 0 ? (pillars.speedBonuses / pillars.totalAnswers) : 0;
  const brainPower = (accuracy * 50) + (speedScore * 50);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 ucc-ui">
      
      <a href="/" className="mb-4 inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#4EABBC] transition-colors">← Back to Home Directory</a>
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="ucc-title text-3xl md:text-4xl lg:text-5xl text-[#111827] tracking-tighter uppercase">
            STAR Reading <span className="text-[#4EABBC]">×</span> Key Ideas & Details
          </h1>
          <p className="text-gray-500 text-xs mt-1 font-black uppercase tracking-[0.2em]">
            This instrument measures meaning construction, evidence tracking, and inference.
          </p>
        </div>
        
        {sessionState === 'review' && (
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button 
              onClick={() => setActiveTab('training')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'training' ? 'bg-white text-[#4EABBC] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Session Path
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-white text-[#E9604F] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Metrics
            </button>
          </div>
        )}
      </header>

      <AiSettingsPanel purpose="Stores provider choice and local keys for this app origin. No live provider call is wired into this instrument in v1." />

      {activeTab === 'training' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <div className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-[#4EABBC] font-bold shadow-sm">
               Evidence Unit #{problemNumber}
             </div>
             {sessionState === 'testing' && (
               <button 
                 onClick={handleFinish}
                 className="px-6 py-2 rounded-xl bg-gray-50 hover:bg-[#E9604F] text-[#E9604F] hover:text-white border border-gray-200 transition-all text-xs font-bold uppercase tracking-wider shadow-sm"
               >
                 Finish Session
               </button>
             )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="ucc-card p-8 flex flex-col justify-between space-y-6 border-t-[6px] border-[#4EABBC]">
              {sessionState === 'review' ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                   <h2 className="ucc-title text-2xl text-[#4EABBC]">Session Concluded</h2>
                   <p className="text-gray-500 font-medium">Please review metrics tab for results.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="ucc-title text-xl text-[#111827]">Informational Text</h2>
                      <SwissClockTimer secondsRemaining={timer} totalSeconds={60} />
                    </div>
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 italic leading-relaxed text-gray-800 max-h-60 overflow-y-auto">
                      {currentProblem.passage}
                    </div>
                    <p className="font-bold text-lg text-[#111827] pt-2">
                      {currentProblem.question}
                    </p>
                    <div className="grid grid-cols-1 gap-3 pt-2">
                      {currentProblem.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelection(idx)}
                          disabled={ariaState !== AriaState.Thinking}
                          className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-[#4EABBC] hover:bg-[#4EABBC]/5 transition-all font-medium text-gray-700 disabled:opacity-50"
                        >
                          {String.fromCharCode(65 + idx)}. {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-6">
              <EmojiViz emoji={currentProblem.emoji} data={currentProblem.tableData} />
              <AriaAvatar state={ariaState} message={ariaMessage} />
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
        Psychometric Meaning & Evidence Lab &copy; 2024
      </footer>
    </div>
  );
};

export default App;
