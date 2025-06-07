// src/sections/GrievanceRedressalSystem.jsx
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import '../styles/GrievanceRedressalSystem.css'; // Import GrievanceRedressalSystem specific CSS

function GrievanceRedressalSystem() {
    const { user, setError, simulateNetworkDelay } = useAppContext();
    const [grievances, setGrievances] = useState([]); // Grievances now managed locally
    const [subject, setSubject] = useState('');
    const [details, setDetails] = useState('');
    const [priority, setPriority] = useState('low');
    const [loading, setLoading] = useState(true); // Set to true initially for fetching

    useEffect(() => {
        const fetchGrievances = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch all grievances and filter client-side for non-admin
                // In a real app, backend would filter based on user role/ID
                const response = await fetch('/api/grievances');
                if (!response.ok) throw new Error('Failed to fetch grievances.');
                const allGrievances = await response.json();

                const filteredGrievances = user.role === 'admin'
                    ? allGrievances
                    : allGrievances.filter(g => g.userId === user.email);

                setGrievances(filteredGrievances.sort((a, b) => new Date(b.filedAt) - new Date(a.filedAt))); // Sort newest first
            } catch (err) {
                console.error("Error fetching grievances:", err);
                setError(`Failed to load grievances: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        if (user) { // Only fetch if user is logged in
            fetchGrievances();
        }
    }, [user, setError]); // Re-fetch if user changes or error state changes

    const handleFileGrievance = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await simulateNetworkDelay(); // Simulate network delay
            const response = await fetch('/api/grievances', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.email, subject, details, priority }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to file grievance.');

            // If non-admin, add to their local list. If admin, they'll re-fetch all.
            if (user.role !== 'admin') {
                setGrievances(prev => [...prev, data.grievance].sort((a, b) => new Date(b.filedAt) - new Date(a.filedAt)));
            } else {
                // Admins should re-fetch all to get the latest comprehensive list
                // For simplicity, we'll just add it to the local state for now
                setGrievances(prev => [...prev, data.grievance].sort((a, b) => new Date(b.filedAt) - new Date(a.filedAt)));
            }

            alert('Grievance filed successfully!');
            setSubject('');
            setDetails('');
            setPriority('low');
        } catch (err) {
            console.error("Error filing grievance:", err);
            setError(`Failed to file grievance: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // This function is for admins to update status, but we'll keep it here
    // as the AdminPanel will also call a similar function.
    const handleUpdateGrievanceStatus = async (grievanceId, newStatus) => {
        setLoading(true);
        setError('');
        try {
            await simulateNetworkDelay();
            const response = await fetch(`/api/grievances/${grievanceId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update grievance status.');

            setGrievances(prev => prev.map(g => g.id === grievanceId ? data.grievance : g));
            alert('Grievance status updated!');
        } catch (err) {
            console.error("Error updating grievance status:", err);
            setError(`Failed to update grievance status: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grievance-container">
                <p className="no-grievances-message">Loading grievances...</p>
            </div>
        );
    }

    return (
        <div className="grievance-container">
            <h2 className="grievance-title">Grievance Redressal System</h2>

            {user.role !== 'admin' && (
                <>
                    <h3 className="file-grievance-heading">File a New Grievance</h3>
                    <form onSubmit={handleFileGrievance} className="grievance-form">
                        <div className="grievance-form-group">
                            <label htmlFor="grievanceSubject">Subject</label>
                            <input
                                type="text"
                                id="grievanceSubject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grievance-form-group">
                            <label htmlFor="grievanceDetails">Details</label>
                            <textarea
                                id="grievanceDetails"
                                rows="4"
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                required
                            ></textarea>
                        </div>
                        <div className="grievance-form-group">
                            <label htmlFor="grievancePriority">Priority</label>
                            <select
                                id="grievancePriority"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                        <div className="grievance-form-actions">
                            <button
                                type="submit"
                                className="grievance-form-submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Filing...' : 'File Grievance'}
                            </button>
                        </div>
                    </form>
                </>
            )}

            <h3 className="grievances-list-heading">{user.role === 'admin' ? 'All Grievances' : 'Your Grievances'}</h3>
            {grievances.length === 0 ? (
                <p className="no-grievances-message">No grievances filed yet.</p>
            ) : (
                <div className="grievances-list">
                    {grievances.map(grievance => (
                        <div key={grievance.id} className="grievance-item">
                            <div className="grievance-item-header">
                                <div className="grievance-item-details">
                                    <p className="grievance-subject">{grievance.subject}</p>
                                    <p>Filed by: {grievance.userId === user.email ? 'You' : grievance.userId}</p>
                                    <p>Filed on: {new Date(grievance.filedAt).toLocaleDateString()}</p>
                                    <p>Priority: <span className={`priority-text priority-${grievance.priority}`}>{grievance.priority.toUpperCase()}</span></p>
                                </div>
                                <span className={`grievance-status-badge ${
                                    grievance.status === 'Open' ? 'status-open' :
                                    grievance.status === 'In Progress' ? 'status-in-progress' :
                                    'status-resolved'
                                }`}>
                                    {grievance.status}
                                </span>
                            </div>
                            {/* Admin specific actions are now ONLY in AdminPanel */}
                            {/* This section will just display grievances for non-admins */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default GrievanceRedressalSystem;