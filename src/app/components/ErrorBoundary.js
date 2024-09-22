import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // Capture any error from child components and update the state
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Log error details when an error is caught
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });

    // Optionally log errors to an external logging service
    // logErrorToMyService(error, errorInfo);
  }

  // Reset error state and retry rendering
  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI with improved styling using Tailwind CSS
      return (
        <div className="p-6 bg-red-100 text-red-800 rounded-md shadow-md max-w-md mx-auto mt-10">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <p>{this.state.error && this.state.error.toString()}</p>
          <pre className="bg-gray-100 p-4 rounded-md text-sm mt-2">
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button 
            onClick={this.handleRetry} 
            className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            aria-label="Try again after error"
          >
            Try Again
          </button>
        </div>
      );
    }

    // If no error, render the children components as normal
    return this.props.children;
  }
}

export default ErrorBoundary;
