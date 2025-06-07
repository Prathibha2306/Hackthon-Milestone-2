import React, { useState } from 'react';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(''); // To display success or error messages

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setMessage(''); // Clear previous messages

        try {
            const response = await fetch('/api/login', { // POST request to your backend's login endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }), // Send email and password as JSON
            });

            const data = await response.json(); // Parse the JSON response from the backend

            if (response.ok) { // Check if the response status is 2xx (success)
                setMessage(`Login successful: ${data.message}. Welcome, ${data.user.email}!`);
                setEmail('');    // Clear form fields on success
                setPassword(''); // Clear form fields on success
                // In a real app, you would typically store the user token/info in localStorage or context
                // and redirect to a dashboard.
            } else {
                // If response is not OK, it means there was a server-side error or invalid credentials
                setMessage(`Login failed: ${data.message || 'Invalid email or password.'}`);
                console.error('Login failed:', data); // Log full data for debugging
            }
        } catch (error) {
            // This catches network errors (e.g., backend not running, no internet)
            setMessage(`Network error: ${error.message}. Is the backend running?`);
            console.error('Error during login:', error);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="login-email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                    <input
                        type="email"
                        id="login-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="login-password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
                    <input
                        type="password"
                        id="login-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Login
                </button>
            </form>
            {message && <p style={{ marginTop: '15px', color: message.includes('failed') || message.includes('error') ? 'red' : 'green' }}>{message}</p>}
        </div>
    );
}

export default LoginForm;