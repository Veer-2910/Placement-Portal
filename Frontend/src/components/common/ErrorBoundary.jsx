import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4" style={{ 
                    background: 'radial-gradient(circle at center, #f0f9ff 0%, #e0f2fe 100%)' 
                }}>
                    <div className="card border-0 shadow-lg text-center p-5 rounded-4" style={{ 
                        maxWidth: '500px',
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.5)'
                    }}>
                        <div className="bg-danger-subtle text-danger rounded-circle p-4 d-inline-flex mb-4">
                            <AlertCircle size={48} />
                        </div>
                        <h2 className="fw-bold text-dark mb-3">System Encountered a Glitch</h2>
                        <p className="text-secondary fs-5 mb-4">
                            We've encountered an unexpected error. Our team has been notified, and we're working to fix it.
                        </p>
                        <div className="d-flex gap-3 justify-content-center">
                            <button 
                                className="btn btn-primary btn-lg rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCcw size={20} /> Refresh Dashboard
                            </button>
                            <button 
                                className="btn btn-outline-secondary btn-lg rounded-pill px-4"
                                onClick={() => window.location.href = '/'}
                            >
                                Go Home
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-4 p-3 bg-dark text-start rounded-3 overflow-auto" style={{ maxHeight: '150px' }}>
                                <code className="text-danger small">{this.state.error?.toString()}</code>
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
