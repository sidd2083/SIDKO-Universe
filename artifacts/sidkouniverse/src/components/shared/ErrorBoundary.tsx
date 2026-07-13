import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Page crashed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center gap-3 px-6 py-16">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <p className="font-semibold">This page couldn't load.</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Something went wrong rendering this page. Try another page from the menu, or refresh.
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
