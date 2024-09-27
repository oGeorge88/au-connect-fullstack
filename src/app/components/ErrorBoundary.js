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

    // Optional: log errors to an external logging service
    // logErrorToMyService(error, errorInfo);
  }

  // Reset error state and retry rendering
  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry(); // Optional callback to reset app state if necessary
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI with improved styling using Tailwind CSS
      return (
        <div className="p-6 bg-red-100 text-red-800 rounded-md shadow-md max-w-md mx-auto mt-10">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          
          {/* Display error message if available */}
          {this.state.error && <p>{this.state.error.toString()}</p>}
          
          {/* Show detailed error info only in development */}
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <pre className="bg-gray-100 p-4 rounded-md text-sm mt-2 overflow-auto">
              {this.state.errorInfo.componentStack}
            </pre>
          )}
          
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
