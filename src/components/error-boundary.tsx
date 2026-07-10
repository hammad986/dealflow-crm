import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(): void {
    // Intentionally silent in production — error details shown in UI
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="flex items-center justify-center min-h-screen bg-[#0a0a0f] p-6"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center" aria-hidden="true">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white">Something went wrong</h2>
            <p className="text-sm text-white/60">
              An unexpected error occurred. You can try again or refresh the page.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-[#6366f1] hover:bg-[#5558e0] text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366f1]/40 focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
              >
                Refresh Page
              </button>
            </div>
            <details className="text-left mt-4">
              <summary className="text-xs text-white/30 cursor-pointer hover:text-white/50 focus:outline-none focus:text-white/50">
                Error details
              </summary>
              <pre className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-red-400 overflow-auto max-h-48">
                {this.state.error?.message}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}