import React, { useState, useRef } from 'react';
import { AriaAvatar } from './components/AriaAvatar';
import { AriaState } from './types';
import { AiSettingsPanel } from './components/AiSettingsPanel';
import { generateTextWithConfig, getActiveModelConfig } from './aiSettings';

const App: React.FC = () => {
  const [view, setView] = useState<'DIRECTORY' | 'ANALYSIS' | 'REPORT'>('DIRECTORY');
  const [activeTab, setActiveTab] = useState<'CORE' | 'COACH' | 'PARENT' | 'STUDENT'>('CORE');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; content: string }[]>([]);
  
  // Mandatory Forensic Context
  const [studentName, setStudentName] = useState('');
  const [schoolGrade, setSchoolGrade] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analysis Lock Logic
  const isScanDisabled = !studentName.trim() || !schoolGrade || uploadedFiles.length === 0;

  const runPsychometricAnalysis = async () => {
    if (isScanDisabled) return;
    setIsAnalyzing(true);
    setView('ANALYSIS');

    try {
      const activeConfig = await getActiveModelConfig();
      if (!activeConfig) {
        setAnalysisResult('Save a validated OpenAI, Gemini, or Claude key in Local AI Settings before running the psychometric scan.');
        setView('REPORT');
        return;
      }
      const telemetryContent = uploadedFiles.map(f => `FILE: ${f.name}\n${f.content}`).join('\n\n---\n\n');
      
      const systemInstruction = `You are a psychometric reporting engine. You behave like a clinical instrument.
You are NOT a tutor, teacher, or writing assistant.

INPUT CONTEXT:
- STUDENT_NAME: ${studentName}
- STUDENT_GRADE: ${schoolGrade}

FAILURE CONDITION:
If STUDENT_NAME or STUDENT_GRADE is missing, report: "MISSING REQUIRED INPUT — CANNOT PRODUCE PSYCHOMETRIC OUTPUT." and stop.

OUTPUT CONTRACT:
You MUST produce four distinct reports in this exact order, separated by headers.

1. [PSYCHOMETRIC CORE]
Audience: Researchers / diagnostic systems. Tone: Cold, technical, instrument-grade.
Contents: Performance ceiling, stability band, collapse points, pressure sensitivity, crystallized cognition, cognitive fluidity, cognition under pressure, error topology, domain asymmetry. No advice.

2. [LEARNING COACH MEMO]
Audience: Professional learning coach / clinician. Tone: Action-oriented, tactical.
Contents: What to train, what not to train, broken mental frames, underdeveloped cognitive muscles, specific needle-moving interventions.

3. [PARENT MEMO]
Audience: Parent. Tone: Clear, honest, no sugarcoating.
Contents: Real capabilities, gaps, risks if unaddressed, proper STAR interpretation, illusion vs real skill. No jargon.

4. [STUDENT MEMO]
Audience: The student. Tone: Respectful, non-patronizing, forensic.
Contents: Strengths, what breaks under pressure, specific thinking modes to practice. No fake praise.

ABSOLUTE PROHIBITIONS:
- Never use school language (lesson, learning, practice, teacher).
- Never give encouragement or motivational talk.
- Never soften findings.
- Never omit any of the four headers or sections.

MISSION: "How strong is this mind when the clock is running and difficulty increases?"`;

      const responseText = await generateTextWithConfig(activeConfig, {
        prompt: telemetryContent,
        systemInstruction,
        temperature: 0.1,
        maxOutputTokens: 2400,
      });

      setAnalysisResult(responseText || 'Analysis failed to generate.');
      setView('REPORT');
      setActiveTab('CORE');
    } catch (err) {
      console.error(err);
      setAnalysisResult('Internal Instrument Error. Verify telemetry integrity.');
      setView('REPORT');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSectionContent = (header: string) => {
    const regex = new RegExp(`\\[${header}\\]([\\s\\S]*?)(?=\\[|$)`, 'i');
    const match = analysisResult.match(regex);
    return match ? match[1].trim() : `Section [${header}] not found in output.`;
  };

  const downloadDiagnosticTxt = () => {
    const date = new Date().toLocaleString();
    const content = `
UCC × STAR 360 PSYCHOMETRIC DIAGNOSTIC
--------------------------------------
STUDENT: ${studentName.toUpperCase()}
GRADE: ${schoolGrade}
DATE: ${date}

[PSYCHOMETRIC CORE]
${getSectionContent('PSYCHOMETRIC CORE')}

[LEARNING COACH MEMO]
${getSectionContent('LEARNING COACH MEMO')}

[PARENT MEMO]
${getSectionContent('PARENT MEMO')}

[STUDENT MEMO]
${getSectionContent('STUDENT MEMO')}

--------------------------------------
CONFIDENTIAL // CLINICAL INSTRUMENT DATA
`.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aria_star_diagnostic.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderReport = () => {
    const tabs = [
      { id: 'CORE', label: 'Psychometric Core', header: 'PSYCHOMETRIC CORE', icon: '🔬' },
      { id: 'COACH', label: 'Coach Memo', header: 'LEARNING COACH MEMO', icon: '📋' },
      { id: 'PARENT', label: 'Parent Memo', header: 'PARENT MEMO', icon: '🏡' },
      { id: 'STUDENT', label: 'Student Memo', header: 'STUDENT MEMO', icon: '👤' },
    ] as const;

    const currentTab = tabs.find(t => t.id === activeTab)!;
    const content = getSectionContent(currentTab.header);

    return (
      <div className="space-y-8 animate-fade-in max-w-5xl mx-auto py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b-2 border-gray-100 pb-8">
          <div>
            <h2 className="ucc-title text-4xl text-[#111827] uppercase tracking-tighter">Diagnostic Reporting</h2>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <span className="bg-[#111827] text-white text-[10px] font-black px-3 py-1 rounded uppercase tracking-widest">
                SUBJECT: {studentName.toUpperCase()}
              </span>
              <span className="bg-[#4EABBC] text-white text-[10px] font-black px-3 py-1 rounded uppercase tracking-widest">
                GRADE: {schoolGrade}
              </span>
              <div className="h-4 w-[1px] bg-gray-200"></div>
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] italic">
                UCC-CLINICAL-V4
              </span>
            </div>
          </div>
          <button 
            onClick={() => { setView('DIRECTORY'); setUploadedFiles([]); setStudentName(''); setSchoolGrade(''); }}
            className="px-6 py-2 border-2 border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#E9604F] hover:border-[#E9604F] transition-all"
          >
            ← Close Instrument
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-b-4 flex items-center justify-center gap-2 ${
                activeTab === tab.id 
                  ? 'bg-[#111827] text-white border-black shadow-lg scale-[1.02]' 
                  : 'bg-white text-gray-400 border-gray-100 hover:border-[#4EABBC]'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="ucc-card bg-white shadow-2xl overflow-hidden min-h-[500px] border-t-[12px] border-[#111827] relative">
          <div className="p-10 md:p-16 relative z-10">
            <div className="flex items-center gap-4 mb-12 opacity-40">
              <div className="h-[1px] flex-1 bg-gray-400"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-gray-400">Clinical Diagnosis Segment</span>
              <div className="h-[1px] flex-1 bg-gray-400"></div>
            </div>

            <div className="prose prose-slate max-w-none animate-fade-in">
              <div className="font-mono text-[#111827] leading-relaxed whitespace-pre-wrap text-base md:text-lg">
                {content}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-6 pt-12">
           <button 
             onClick={downloadDiagnosticTxt}
             className="px-12 py-5 bg-[#4EABBC] text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:scale-105 transition-all shadow-2xl border-b-4 border-cyan-800/30"
           >
             Download Diagnostic (.txt)
           </button>
           <button 
             onClick={() => window.print()}
             className="px-12 py-5 bg-[#111827] text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:scale-105 transition-all shadow-2xl border-b-4 border-black/30"
           >
             Print Dossier
           </button>
        </div>
      </div>
    );
  };

  if (view === 'REPORT') return renderReport();

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-12 space-y-16 ucc-ui">
      {/* 1. Header Section */}
      <header className="flex flex-col gap-10">
        <a href="/" className="mb-4 inline-flex items-center text-xs font-bold uppercase tracking-widest text-[#4EABBC] hover:text-[#111827] transition-colors">← Back to Home Directory</a>
        <div>
          <h1 className="ucc-title text-5xl md:text-7xl text-[#111827] tracking-tighter uppercase mb-3">
            UCC Psychometric Console
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-400 text-xl font-medium italic">
              Measuring Cognition Under Pressure
            </p>
            <div className="h-6 w-[2px] bg-gray-200"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4EABBC]">Clinical Engine v4.0 // Forensic Mode</span>
          </div>
        </div>

        <AiSettingsPanel purpose="Required for psychometric report generation in this app. Saved locally for this deployment origin only." />

        {/* Console Inputs */}
        <div className="ucc-card p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-end bg-white border-gray-100 shadow-sm">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#111827] block ml-1">Student Identity</label>
            <input 
              type="text" 
              placeholder="Full Name" 
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#4EABBC] transition-all placeholder:opacity-30"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#111827] block ml-1">Academic Grade</label>
            <select 
              value={schoolGrade}
              onChange={(e) => setSchoolGrade(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-[#4EABBC] transition-all appearance-none"
            >
              <option value="">Select Grade</option>
              {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#111827] block ml-1">Telemetry Import</label>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 border-2 ${
                uploadedFiles.length > 0 
                ? 'bg-[#4EABBC] border-[#4EABBC] text-white' 
                : 'bg-white border-gray-100 text-[#111827] hover:border-[#4EABBC]'
              }`}
            >
              <span>{uploadedFiles.length > 0 ? `${uploadedFiles.length} DATASETS READY` : 'IMPORT .TXT'}</span>
            </button>
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef} 
              onChange={(e) => {
                const files = e.target.files;
                if (!files) return;
                const newFiles: { name: string; content: string }[] = [];
                const fileList = Array.from(files);
                fileList.forEach((file: File) => {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    newFiles.push({ name: file.name, content: event.target?.result as string });
                    if (newFiles.length === fileList.length) setUploadedFiles(prev => [...prev, ...newFiles]);
                  };
                  reader.readAsText(file);
                });
              }} 
              accept=".txt" 
            />
          </div>
          <div className="space-y-3">
            <button 
              disabled={isScanDisabled}
              onClick={runPsychometricAnalysis}
              className={`w-full px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border-b-4 ${
                isScanDisabled 
                ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' 
                : 'bg-[#111827] text-white border-black shadow-lg hover:scale-[1.02] active:translate-y-1'
              }`}
            >
              Execute Forensic Scan
            </button>
          </div>
        </div>
      </header>

      {view === 'ANALYSIS' && (
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-12 bg-white rounded-3xl p-16 border-2 border-dashed border-gray-100">
          <AriaAvatar 
            state={AriaState.Thinking} 
            message={`Ingesting telemetry for ${studentName.toUpperCase()}. Calibrating ceiling, stability, and collapse markers against clinical benchmarks.`} 
          />
          <div className="max-w-md text-center space-y-6">
            <div className="flex justify-center gap-3">
              <div className="w-2 h-2 bg-[#4EABBC] rounded-full animate-ping"></div>
              <div className="w-2 h-2 bg-[#4EABBC] rounded-full animate-ping delay-100"></div>
              <div className="w-2 h-2 bg-[#4EABBC] rounded-full animate-ping delay-200"></div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#4EABBC]">Cognitive Instrumentation In Progress</p>
          </div>
        </div>
      )}

      {view === 'DIRECTORY' && (
        <div className="animate-fade-in space-y-20">
          <section className="space-y-10">
            <div className="flex items-center gap-6">
              <div className="h-10 w-2 bg-[#4EABBC]"></div>
              <div>
                <h2 className="ucc-title text-4xl text-[#111827] uppercase tracking-tighter">Reading Instruments</h2>
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest mt-1">Linguistic Resilience under Load</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Informational — Structure", sub: "Architectural Analysis" },
                { title: "Informational — Ideas", sub: "Core Semantic Extraction" },
                { title: "Informational — Complexity", sub: "Load Mastery Scaling" },
                { title: "Literature — Craft", sub: "Narrative Forensic Scan" },
                { title: "Literature — Key Details", sub: "Precision Retrieval" },
                { title: "Vocabulary", sub: "Crystallized Lexical Depth" }
              ].map((deck, idx) => (
                <div key={idx} className="ucc-card p-8 border-t-[6px] border-[#4EABBC] hover:scale-[1.03] transition-all cursor-default group">
                  <h3 className="ucc-title text-xl text-[#111827] mb-2 group-hover:text-[#4EABBC] transition-colors">{deck.title}</h3>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{deck.sub}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-10">
            <div className="flex items-center gap-6">
              <div className="h-10 w-2 bg-[#E9604F]"></div>
              <div>
                <h2 className="ucc-title text-4xl text-[#111827] uppercase tracking-tighter">Math Instruments</h2>
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest mt-1">Numerical Fluidity under Pressure</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Geometry & Spatial", sub: "Relational Modeling" },
                { title: "Measurement & Data", sub: "Empirical Context Mapping" },
                { title: "Base-10 & Place Value", sub: "Fundamental Number Sense" },
                { title: "Fractions & Ratios", sub: "Proportional Logic" },
                { title: "Algebra Readiness", sub: "Symbolic Abstraction" },
                { title: "Word Problems", sub: "Semantic-to-Numeric Bridge" }
              ].map((deck, idx) => (
                <div key={idx} className="ucc-card p-8 border-t-[6px] border-[#E9604F] hover:scale-[1.03] transition-all cursor-default group">
                  <h3 className="ucc-title text-xl text-[#111827] mb-2 group-hover:text-[#E9604F] transition-colors">{deck.title}</h3>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{deck.sub}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Logic Bento */}
          <div id="explainer-bento" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="ucc-card p-10 bg-[#111827] text-white border-none shadow-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4EABBC] mb-6">Pressure Calibration</h3>
              <p className="text-sm leading-relaxed opacity-80 font-medium">
                Measuring the precise slope of cognitive collapse as difficulty rising meets time constraints. This reveals a mind's true stability band.
              </p>
            </div>
            <div className="ucc-card p-10 border-2 border-gray-100 bg-white">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E9604F] mb-6">Psychometric Validity</h3>
              <p className="text-sm leading-relaxed text-gray-600 font-medium">
                Analysis is normalized against STAR 360 benchmarks using UCC's high-resolution multi-axis telemetry.
              </p>
            </div>
            <div className="ucc-card p-10 bg-[#F9FAFB] border-none">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6">Diagnostic Disclaimer</h3>
              <p className="text-sm leading-relaxed text-gray-500 font-medium italic">
                "Not a report card. A clinical instrumentation output. Use for diagnostic decisioning and high-leverage intervention planning."
              </p>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center py-20">
        <div className="w-16 h-1.5 bg-gray-100 mx-auto mb-10"></div>
        <p className="text-gray-400 text-xs font-black uppercase tracking-[0.4em] leading-relaxed">
          UnCommon Core Forensic Logic Systems<br />
          <span className="opacity-40 text-[10px]">Proprietary Cognitive Instrumentation // v4.0.0</span>
        </p>
      </footer>
    </div>
  );
};

export default App;
