import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error:', error);
        console.error('Error Info:', errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <h1>抱歉，出现了一些问题</h1>
                    <p>{this.state.error?.message}</p>
                    <button onClick={() => window.location.reload()}>
                        刷新页面
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 