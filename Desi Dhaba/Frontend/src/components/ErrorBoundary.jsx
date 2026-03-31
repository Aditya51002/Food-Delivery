import { Component } from "react";
import { Link } from "react-router-dom";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-md w-full glass-card rounded-3xl shadow-2xl p-10 text-center border border-white/5 relative z-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-inner">
              <span className="text-4xl">💥</span>
            </div>

            <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
              Something went wrong
            </h1>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed font-medium">
              An unexpected error occurred. Try refreshing the page or go back home.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 text-left bg-red-500/10 border border-red-500/20 rounded-xl p-4 overflow-auto max-h-32">
                <p className="text-xs font-mono text-red-400 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="btn-primary px-6 py-2.5 text-sm"
              >
                Try Again
              </button>
              <Link
                to="/"
                onClick={this.handleReset}
                className="btn-secondary px-6 py-2.5 text-sm"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
