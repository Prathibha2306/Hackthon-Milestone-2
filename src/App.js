import React from 'react';
import { AppContextProvider, useAppContext } from './context/AppContext';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import './styles/global.css'; // Import global CSS utilities

function App() {
    const { currentPage, error, setError } = useAppContext();

    return (
        <div className="app-container">
            {error && (
                <div className="error-message-container">
                    <span className="error-message-text">{error}</span>
                    <span className="error-message-close" onClick={() => setError('')}>
                        <svg className="error-message-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697L11.819 10l3.029 2.651a1.2 1.2 0 0 1 0 1.698z"/></svg>
                    </span>
                </div>
            )}
            {currentPage === 'login' && <AuthPage type="login" />}
            {currentPage === 'register' && <AuthPage type="register" />}
            {currentPage === 'dashboard' && <Dashboard />}
        </div>
    );
}

// Wrap the App component with the AppContextProvider
// This ensures all child components have access to the context
export default function WrappedApp() {
    return (
        <AppContextProvider>
            <App />
        </AppContextProvider>
    );
}

