import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import '../styles/AuthPage.css'; // Import AuthPage specific CSS

function AuthPage({ type }) {
    // We will no longer directly use dummyUsers for actual auth logic here.
    // simulateNetworkDelay might still be useful for UI testing, but not for backend interaction.
    const { setUser, setUserRole, setError, setCurrentPage, simulateNetworkDelay } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('family'); // Default role for registration
    const [loadingAuth, setLoadingAuth] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingAuth(true);
        setError('');

        try {
            // Optional: Still simulate network delay for UI responsiveness
            await simulateNetworkDelay(500); // Keep this if you want to see a loading state

            let endpoint = '';
            let method = 'POST';
            let requestBody = { email, password };

            if (type === 'login') {
                endpoint = '/api/login';
            } else { // Register
                endpoint = '/api/register';
                requestBody = { email, password, role }; // Include role for registration
            }

            // --- IMPORTANT CHANGE: Make a real fetch request to your backend ---
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json(); // Parse the JSON response from your backend

            if (response.ok) { // Check if the response status is 2xx (e.g., 200, 201)
                // Authentication successful (either login or register)
                const loggedInUser = { email: data.user?.email || email, role: data.user?.role || role }; // Use data.user if provided by backend
                setUser(loggedInUser);
                setUserRole(loggedInUser.role);
                localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser)); // Persist login state in localStorage
                setCurrentPage('dashboard');
                // Optional: Show a temporary success message
                console.log(`${type} successful:`, data.message);
                if (type === 'register') {
                    alert(`User ${email} registered. You can now log in.`);
                    setCurrentPage('login'); // Redirect to login after successful registration
                }
            } else {
                // Backend returned an error (e.g., 401 Unauthorized, 409 Conflict)
                throw new Error(data.message || `Failed to ${type}.`);
            }
        } catch (err) {
            // Catches network errors or errors thrown from the 'if (!response.ok)' block
            console.error(`${type} error:`, err);
            setError(`Failed to ${type}: ${err.message}.`);
        } finally {
            setLoadingAuth(false);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <h2 className="auth-title">
                    {type === 'login' ? 'Login' : 'Register'}
                </h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-form-group">
                        <label htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="your@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="auth-form-group">
                        <label htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {type === 'register' && (
                        <div className="auth-form-group">
                            <label htmlFor="role">
                                Role
                            </label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="family">Family Member</option>
                                <option value="officer">Officer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="auth-submit-button"
                        disabled={loadingAuth}
                    >
                        {loadingAuth ? (type === 'login' ? 'Logging in...' : 'Registering...') : (type === 'login' ? 'Login' : 'Register')}
                    </button>
                </form>
                <div className="auth-footer-text">
                    {type === 'login' ? (
                        <p>
                            Don't have an account?{' '}
                            <button
                                onClick={() => setCurrentPage('register')}
                                className="auth-footer-button"
                            >
                                Register here
                            </button>
                        </p>
                    ) : (
                        <p>
                            Already have an account?{' '}
                            <button
                                onClick={() => setCurrentPage('login')}
                                className="auth-footer-button"
                            >
                                Login here
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AuthPage;