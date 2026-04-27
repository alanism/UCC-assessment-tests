
import React, { useState, useEffect, useRef } from 'react';
/* Fix: Removed COMPLEXITY_LADDER (defined in constants.tsx) and unused ComplexityLevel from types import */
import { AriaState, Problem, BrainPillars, ItemTelemetry } from './types';
import { generateProblem } from './constants';
import { AriaAvatar } from './components/AriaAvatar';
import { EmojiViz } from './components/EmojiViz';
import { BrainAnalytics } from './components/BrainAnalytics';
import { SwissClockTimer } from './components/SwissClockTimer';
import { AiSettingsPanel } from './components/AiSettingsPanel';

const App: React.FC = () => {
  const [sessionState, setSessionState] = useState<'testing' | 'review'>('testing');
  const [complexityLevel, setComplexityLevel] = useState<number>(0);
  const [maxLevelReached, setMaxLevelReached] = useState<number>(0);
  const [problemNumber, setProblemNumber] = useState<number>(1);
  const [currentProblem, setCurrentProblem] = useState<Problem>(generateProblem(0));
  
  const [activeTab, setActiveTab] = useState<'training' | 'analytics'>('training');
  const [ariaState, setAriaState] = useState<AriaState>(AriaState.Thinking);
  const [ariaMessage, setAriaMessage] = useState<string>("Analyze the key ideas. Measure your linguistic sustainment.");
  const [timer, setTimer] = useState<number>(45);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());

  const [pillars, setPillars] = useState<BrainPillars>({
    totalAnswers: 0,
    attempts: 0,
    itemLog: [],
    levelHistory: []
  });

  const handleSelection = (selectedIndex: number) => {
    if (sessionState === 'review') return;
    
    setIsTimerRunning(false);
    const isCorrect = selectedIndex === currentProblem.correctIndex;
    const timeTakenMs = Date.now() - startTimeRef.current;
    const timeUnderLimit = timer > 0;
    const timedOut = timer <= 0;

    let nextLevel = complexityLevel;
    if (isCorrect && timeUnderLimit) {
      nextLevel++;
      setAriaState(AriaState.Success);
      setAriaMessage("Complexity sustained. Increasing cognitive load.");
    } else {
      nextLevel--;
      setAriaState(AriaState.Error);
      setAriaMessage(timedOut ? "Time limit exceeded. Adjusting load." : "Heuristic error. Recalibrating complexity.");
    }

    nextLevel = Math.max(0, Math.min(nextLevel, 8));

    const telemetry: ItemTelemetry = {
      id: currentProblem.id,
      gradeMeta: currentProblem.gradeMeta,
      complexity: currentProblem.complexity,
      complexityLevel: complexityLevel,
      lens: currentProblem.lens,
      isCorrect,
      timeMs: timeTakenMs,
      chosenIndex: selectedIndex,
      correctIndex: currentProblem.correctIndex,
      timestamp: new Date().toISOString(),
      passage: currentProblem.passage,
      question: currentProblem.question
    };

    setComplexityLevel(nextLevel);
    setMaxLevelReached(prev => Math.max(prev, nextLevel));

    setPillars(prev => ({
      ...prev,
      totalAnswers: prev.totalAnswers + (isCorrect ? 1 : 0),
      attempts: prev.attempts + 1,
      itemLog: [...prev.itemLog, telemetry],
      levelHistory: [...prev.levelHistory, { level: complexityLevel, time: 45 - timer, accuracy: isCorrect ? 1 : 0 }]
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
      const nextProblem = generateProblem(complexityLevel);
      setCurrentProblem(nextProblem);
      setAriaState(AriaState.Thinking);
      setAriaMessage(`Current Load: Stage ${complexityLevel + 1}.`);
      setTimer(45);
      startTimeRef.current = Date.now();
      setIsTimerRunning(true);
    }
  }, [problemNumber]);

  const handleFinish = () => {
    setSessionState('review');
    setIsTimerRunning(false);
    setActiveTab('analytics');
    setAriaMessage("Measurement concluded. Five-axis linguistic profile ready.");
  };

  const accuracy = pillars.attempts > 0 ? (pillars.totalAnswers / pillars.attempts) : 0;
  
  // Weighted Scoring for Key Ideas & Details
  const inferenceAttempts = pillars.itemLog.filter(i => i.lens === 'INFERENCE');
  const inferenceAccuracy = inferenceAttempts.length > 0 
    ? (inferenceAttempts.filter(i => i.isCorrect).length / inferenceAttempts.length) 
    : 0;

  const mastery = (accuracy * 40) + ((complexityLevel / 8) * 30) + (inferenceAccuracy * 30);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 ucc-ui">
      
      <a href="/" className="mb-4 inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#4EABBC] transition-colors">← Back to Home Directory</a>
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="ucc-title text-3xl md:text-4xl lg:text-5xl text-[#111827] tracking-tighter uppercase">
            STAR Reading <span className="text-[#4EABBC]">×</span> Range & Complexity
          </h1>
          <p className="text-gray-500 text-xs mt-1 font-black uppercase tracking-[0.2em]">
            This instrument measures Lexical, Syntactic, Conceptual, and Discourse sustainment.
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
                      <h2 className="ucc-title text-xl text-[#111827]">Passage</h2>
                      <SwissClockTimer secondsRemaining={timer} totalSeconds={45} />
                    </div>
                    
                    <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 italic leading-relaxed text-gray-700 min-h-[6rem] max-h-48 overflow-y-auto">
                      "{currentProblem.passage}"
                    </div>

                    <p className="font-bold text-lg text-[#111827] pt-2 min-h-[3rem]">
                      {currentProblem.question}
                    </p>

                    <div className="grid grid-cols-1 gap-3 pt-2">
                      {currentProblem.choices.map((choice, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelection(idx)}
                          disabled={ariaState !== AriaState.Thinking}
                          className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-[#4EABBC] hover:bg-[#4EABBC]/5 transition-all font-medium text-gray-700 disabled:opacity-50"
                        >
                          {String.fromCharCode(65 + idx)}. {choice}
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
          brainPower={mastery} 
          maxLevelReached={maxLevelReached} 
          sessionFinished={sessionState === 'review'} 
        />
      )}
      
      <footer className="text-center text-gray-300 text-[10px] font-black uppercase tracking-[0.3em] py-12">
        Psychometric Reading Lab &copy; 2024
      </footer>
    </div>
  );
};

export default App;
