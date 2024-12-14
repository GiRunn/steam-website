// src/components/ErrorBoundary/index.jsx
// 错误边界组件 - 用于捕获和处理React组件树中的JavaScript错误

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // 更新 state，下次渲染时显示降级UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 可以在这里记录错误日志
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // 你可以渲染任何自定义的降级UI
      return (
        <div className="min-h-screen bg-[#0a0f16] text-white flex items-center justify-center">
          <div className="max-w-md w-full mx-4 p-6 rounded-lg bg-gray-800/50 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-red-400">
              抱歉，出现了一些问题
            </h2>
            <p className="text-gray-400 mb-4">
              页面加载过程中遇到错误，请尝试刷新页面或稍后再试。
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
              >
                刷新页面
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              >
                重试
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6">
                <details className="text-sm text-gray-500">
                  <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
                    错误详情（调试信息）
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-900 rounded overflow-x-auto">
                    {this.state.error.toString()}
                    {'\n'}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;