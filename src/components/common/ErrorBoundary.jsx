import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{ padding: '20px', textAlign: 'center', marginTop: '50px' }}>
                    <h1 style={{ color: '#E53E3E' }}>Something went wrong.</h1>
                    <p>アプリケーションでエラーが発生しました。</p>
                    <div style={{
                        background: '#FFF5F5',
                        border: '1px solid #FC8181',
                        padding: '15px',
                        borderRadius: '8px',
                        textAlign: 'left',
                        margin: '20px auto',
                        maxWidth: '600px',
                        overflow: 'auto'
                    }}>
                        <details style={{ whiteSpace: 'pre-wrap' }}>
                            <summary>Show Error Details</summary>
                            <br />
                            <strong>{this.state.error && this.state.error.toString()}</strong>
                            <br />
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </details>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            background: '#3182CE',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
