import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert } from './common';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Alert
                    type="error"
                    message={this.state.error?.message || '页面出错了，请刷新重试'}
                    closable
                    onClose={() => this.setState({ hasError: false, error: null })}
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 