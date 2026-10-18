import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  declare props: Readonly<Props>;
  declare state: Readonly<State>;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('StudyNaija ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      // Clear potentially corrupted transient session keys
      sessionStorage.clear();
      // Keep credentials intact if possible, or reload fresh
    } catch {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 font-['Outfit']">
                Something unexpected happened
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                StudyNaija caught a temporary interface glitch. Don't worry, your progress and saved exam data are safe.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-slate-100 rounded-xl text-left border border-slate-200 text-[11px] font-mono text-slate-700 max-h-24 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload App</span>
              </button>

              <button
                onClick={this.handleResetCache}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
