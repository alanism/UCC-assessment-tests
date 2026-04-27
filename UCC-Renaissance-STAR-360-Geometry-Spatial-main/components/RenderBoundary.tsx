import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  retryCount: number;
}

/**
 * RenderBoundary (Error Boundary)
 * 
 * Captures React runtime crashes and provides a graceful fallback with auto-retry.
 */
export class RenderBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    retryCount: 0
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true, retryCount: 0 };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[RenderBoundary] Uncaught error:", error, errorInfo);
    
    // Auto-retry once if we haven't yet
    if (this.state.retryCount < 1) {
      setTimeout(() => {
        console.log("[RenderBoundary] Attempting deterministic retry...");
        this.setState({ hasError: false, retryCount: this.state.retryCount + 1 });
      }, 1000);
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8 text-center">
          <div className="max-w-md space-y-6">
            <div className="w-16 h-16 bg-[#E9604F]/10 rounded-full flex items-center justify-center mx-auto text-[#E9604F] text-2xl animate-pulse">
              ⚠️
            </div>
            <h1 className="text-2xl font-black text-[#111827] uppercase tracking-tighter">Content failed to load</h1>
            <p className="text-gray-500 font-medium">
              A rendering violation occurred. We are attempting to stabilize the environment...
            </p>
            <div className="flex justify-center gap-4">
               <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[#4EABBC] text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#3d8c9a] transition-all shadow-sm"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
