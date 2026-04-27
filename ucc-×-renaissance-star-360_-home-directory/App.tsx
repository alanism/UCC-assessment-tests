import React from 'react';
import { AiSettingsPanel } from './components/AiSettingsPanel';

const App: React.FC = () => {
  const informationalPanels = [
    {
      title: "WHAT IS STAR 360",
      content: "Renaissance STAR 360 is not a test.\n\nIt is a psychometric instrument.\n\nIt uses adaptive difficulty and time pressure to estimate one hidden variable:\n\nHow strong a mind is — compared to millions of others.\n\nSchools use it to predict readiness, growth, and risk.\nGovernments use it to guide funding and policy.\nResearchers use it to model learning at scale.\n\nIt does not measure effort.\nIt measures cognition in motion."
    },
    {
      title: "WHAT UCC × STAR 360 DOES",
      content: "We rebuilt the STAR engine inside UnCommon Core.\n\nSame adaptive ladder.\nSame single-shot answers.\nSame time pressure.\nSame psychometric logic.\n\nPlus:\n\n• visual evidence\n• full telemetry\n• mistake-level exports\n• AI-ready learning loops\n\nIt behaves like STAR.\nIt explains what STAR sees."
    },
    {
      title: "DARPA-GRADE COGNITION",
      content: "Elite performance research does not study comfort.\nIt studies performance under load.\n\nDARPA tracks:\n\n• working memory\n• decision speed\n• frame switching\n• error patterns\n• collapse points\n\nWe applied those models to reading and math.\n\nThese instruments don’t test what a student knows.\nThey test how a brain holds up when difficulty rises."
    },
    {
      title: "WHY PRESSURE MATTERS",
      content: "Anyone can solve slowly with help.\n\nReal intelligence appears when:\n\n• the clock is running\n• the hints are gone\n• the difficulty is rising\n\nThat’s where fluency, memory, and reasoning either hold — or fail.\n\nWe measure that line."
    },
    {
      title: "HOW TO USE THESE INSTRUMENTS",
      content: "These are not drills.\nThey are diagnostic scans.\n\nUse them:\n\n• 1–2× per week\n• 10–15 minutes\n• after learning sessions\n\nThink of it like stepping on a scale after training.\n\nYou don’t train on the scale.\nYou measure so training gets smarter."
    },
    {
      title: "WHAT THIS BUILDS",
      content: "These instruments don’t just measure you.\n\nThey train you to think when it counts.\n\nEvery time you run an assessment, your brain is practicing:\n• holding more information\n• deciding faster\n• ignoring distractions\n• staying calm when problems get harder\n\nThat’s called cognition under pressure.\n\nIt’s the same skill fighter pilots, combat medics, and nuclear engineers train —\nand it’s what makes school, tests, and real life feel easier."
    }
  ];

  const readingDecks = [
    {
      title: "Informational — Craft & Structure",
      subtitle: "How is this article built?",
      link: "/UCC-cognition-under-pressure-assessment-test/reading-informational-craft-structure/"
    },
    {
      title: "Informational — Key Ideas & Details",
      subtitle: "What really matters in this text?",
      link: "/UCC-cognition-under-pressure-assessment-test/key-ideas-details/"
    },
    {
      title: "Informational — Range & Complexity",
      subtitle: "How much text can your brain actually hold?",
      link: "/UCC-cognition-under-pressure-assessment-test/range-complexity/"
    },
    {
      title: "Literature — Craft & Structure",
      subtitle: "How is this story constructed?",
      link: "/UCC-cognition-under-pressure-assessment-test/literature-craft-structure/"
    },
    {
      title: "Literature — Key Ideas & Details",
      subtitle: "What is this story really saying?",
      link: "/UCC-cognition-under-pressure-assessment-test/literature-key-ideas-details/"
    },
    {
      title: "Reading — Vocabulary",
      subtitle: "How well does your brain know words?",
      link: "/UCC-cognition-under-pressure-assessment-test/vocabulary/"
    }
  ];

  const mathDecks = [
    {
      title: "Geometry & Spatial Reasoning",
      subtitle: "How well do you see and measure space?",
      link: "/UCC-cognition-under-pressure-assessment-test/geometry-spatial/"
    },
    {
      title: "Measurement & Data",
      subtitle: "How well do you read the real world?",
      link: "/UCC-cognition-under-pressure-assessment-test/measurement-data/"
    },
    {
      title: "Base-10 & Place Value",
      subtitle: "How strong is your number sense?",
      link: "/UCC-cognition-under-pressure-assessment-test/base-10-place-value/"
    },
    {
      title: "Fractions & Ratios",
      subtitle: "How do you see parts inside wholes?",
      link: "/UCC-cognition-under-pressure-assessment-test/fractions-ratios/"
    },
    {
      title: "Algebra Readiness",
      subtitle: "How ready is your brain for symbols?",
      link: "/UCC-cognition-under-pressure-assessment-test/algebra-readiness/"
    },
    {
      title: "Psychometric Console",
      subtitle: "Instrument Analysis Console",
      link: "/UCC-cognition-under-pressure-assessment-test/test-assessment/",
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 ucc-ui">
      {/* 1. Header Section */}
      <header className="mb-12">
        <h1 className="ucc-title text-4xl md:text-5xl lg:text-6xl text-[#111827] tracking-tighter uppercase mb-2">
          UCC — Cognition Under Pressure
        </h1>
        <p className="text-gray-500 text-lg font-medium italic">
          Benchmarked against Renaissance STAR 360
        </p>
      </header>

      {/* 2. Reading Grid */}
      <section className="space-y-6">
        <div>
          <h2 className="ucc-title text-3xl text-[#4EABBC] uppercase tracking-tighter">READING</h2>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">
            Text, meaning, and narrative under cognitive load
          </p>
        </div>
        <AiSettingsPanel purpose="Stores operator-selected provider and model locally for this home directory origin." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {readingDecks.map((deck, idx) => (
            <a 
              key={idx} 
              href={deck.link} 
              className="ucc-card p-6 border-t-[4px] border-[#4EABBC] hover:scale-[1.02] transition-transform block group"
            >
              <h3 className="ucc-title text-xl text-[#111827] mb-2 group-hover:text-[#4EABBC] transition-colors">{deck.title}</h3>
              <p className="text-gray-500 text-sm font-medium">{deck.subtitle}</p>
            </a>
          ))}
        </div>
      </section>

      {/* 3. Math Grid */}
      <section className="space-y-6">
        <div>
          <h2 className="ucc-title text-3xl text-[#E9604F] uppercase tracking-tighter">MATH</h2>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">
            Numbers, space, and the real world under pressure
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mathDecks.map((deck, idx) => (
            deck.disabled ? (
              <div 
                key={idx} 
                className="ucc-card p-6 border-t-[4px] border-gray-300 opacity-50 cursor-not-allowed"
              >
                <h3 className="ucc-title text-xl text-gray-400 mb-2">{deck.title}</h3>
                <p className="text-gray-400 text-sm font-medium">{deck.subtitle}</p>
              </div>
            ) : (
              <a 
                key={idx} 
                href={deck.link} 
                className="ucc-card p-6 border-t-[4px] border-[#E9604F] hover:scale-[1.02] transition-transform block group"
              >
                <h3 className="ucc-title text-xl text-[#111827] mb-2 group-hover:text-[#E9604F] transition-colors">{deck.title}</h3>
                <p className="text-gray-500 text-sm font-medium">{deck.subtitle}</p>
              </a>
            )
          ))}
        </div>
      </section>

      {/* 4. Explainer Bento - Moved to bottom information tray */}
      <div id="explainer-bento">
        {informationalPanels.map((panel, idx) => (
          <div key={idx} className="ucc-card p-8 border-l-[4px] border-gray-200">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#111827] mb-6 opacity-40">
              {panel.title}
            </h3>
            <div className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap font-medium">
              {panel.content}
            </div>
          </div>
        ))}
      </div>

      <footer className="text-center py-16">
        <p className="text-gray-400 text-xs font-black uppercase tracking-[0.3em] leading-relaxed">
          These instruments do not teach.<br />
          They reveal what a brain can do when the clock is running.
        </p>
      </footer>
    </div>
  );
};

export default App;
