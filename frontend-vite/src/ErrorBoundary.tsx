import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #18181b, #000)',
          color: 'white',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '2rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ef4444' }}>
              Oops! Something went wrong
            </h1>
            <p style={{ marginBottom: '1rem', color: '#a1a1aa' }}>
              The app encountered an error. Details:
            </p>
            <pre style={{
              background: '#000',
              padding: '1rem',
              borderRadius: '0.25rem',
              overflow: 'auto',
              fontSize: '0.875rem',
              color: '#22c55e'
            }}>
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: '#22c55e',
                color: 'black',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
