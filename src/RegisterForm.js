import React, { useState } from 'react';

function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(''); // To display success or error messages

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior (page reload)
        setMessage(''); // Clear previous messages

        try {
            const response = await fetch('/api/register', { // POST request to your backend's register endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }), // Send email and password as JSON
            });

            const data = await response.json(); // Parse the JSON response from the backend

            if (response.ok) { // Check if the response status is 2xx (success)
                setMessage(`Registration successful: ${data.message}`);
                setEmail('');    // Clear form fields on success
                setPassword(''); // Clear form fields on success
            } else {
                // If response is not OK, it means there was a server-side error or validation issue
                setMessage(`Registration failed: ${data.message || 'Unknown error'}`);
                console.error('Registration failed:', data); // Log full data for debugging
            }
        } catch (error) {
            // This catches network errors (e.g., backend not running, no internet)
            setMessage(`Network error: ${error.message}. Is the backend running?`);
            console.error('Error during registration:', error);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="register-email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                    <input
                        type="email"
                        id="register-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="register-password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
                    <input
                        type="password"
                        id="register-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Register
                </button>
            </form>
            {message && <p style={{ marginTop: '15px', color: message.includes('failed') || message.includes('error') ? 'red' : 'green' }}>{message}</p>}
        </div>
    );
}

export default RegisterForm;