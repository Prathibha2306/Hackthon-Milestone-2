// src/sections/WelfareSchemes.jsx
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import ApplicationForm from '../components/ApplicationForm';
import ApplicationStatus from '../components/ApplicationStatus';
import '../styles/WelfareSchemes.css'; // Import WelfareSchemes specific CSS

function WelfareSchemes() {
    const { user, setError, simulateNetworkDelay } = useAppContext();
    const [schemes, setSchemes] = useState([]); // Schemes now managed locally
    const [applications, setApplications] = useState([]); // Applications now managed locally
    const [selectedScheme, setSelectedScheme] = useState(null);
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [showApplicationStatus, setShowApplicationStatus] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchemesAndApplications = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch Schemes
                const schemesRes = await fetch('/api/schemes');
                if (!schemesRes.ok) throw new Error('Failed to fetch schemes.');
                const fetchedSchemes = await schemesRes.json();
                setSchemes(fetchedSchemes);

                // Fetch User's Applications
                // Note: In a real app, you'd send userId to backend to filter applications
                // For this in-memory backend, we'll fetch all and filter client-side.
                const applicationsRes = await fetch('/api/applications');
                if (!applicationsRes.ok) throw new Error('Failed to fetch applications.');
                const allApplications = await applicationsRes.json();
                setApplications(allApplications.filter(app => app.userId === user.email));

            } catch (err) {
                console.error("Error fetching data for Welfare Schemes:", err);
                setError(`Failed to load schemes or applications: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        if (user) { // Only fetch if user is logged in
            fetchSchemesAndApplications();
        }
    }, [user, setError]); // Re-fetch if user changes or error state changes

    const handleApplyClick = (scheme) => {
        setSelectedScheme(scheme);
        setShowApplicationForm(true);
        setShowApplicationStatus(false);
    };

    const handleViewStatusClick = () => {
        setShowApplicationStatus(true);
        setShowApplicationForm(false);
        setSelectedScheme(null);
    };

    // Function to add a new application (passed to ApplicationForm)
    const addNewApplication = async (newApplicationData) => {
        setLoading(true);
        setError('');
        try {
            await simulateNetworkDelay();
            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newApplicationData, userId: user.email }), // Ensure userId is passed
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to submit application.');

            setApplications(prev => [...prev, data.application]); // Add to local state
            alert('Application submitted successfully!');
            setShowApplicationForm(false); // Close form after submission
        } catch (err) {
            console.error("Error submitting application:", err);
            setError(`Failed to submit application: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return (
            <div className="welfare-schemes-container">
                <p className="no-schemes-message">Loading schemes and applications...</p>
            </div>
        );
    }

    return (
        <div className="welfare-schemes-container">
            <h2 className="welfare-schemes-title">Welfare Schemes</h2>

            <div className="scheme-action-buttons">
                <button
                    onClick={() => { setShowApplicationForm(false); setShowApplicationStatus(false); setSelectedScheme(null); }}
                    className="scheme-action-button view-catalog"
                >
                    View Scheme Catalog
                </button>
                <button
                    onClick={handleViewStatusClick}
                    className="scheme-action-button track-status"
                >
                    Track Application Status
                </button>
            </div>

            {showApplicationForm && selectedScheme && (
                <ApplicationForm scheme={selectedScheme} onClose={() => setShowApplicationForm(false)} onSubmitApplication={addNewApplication} />
            )}

            {showApplicationStatus && (
                <ApplicationStatus applications={applications} />
            )}

            {!showApplicationForm && !showApplicationStatus && (
                <div>
                    <h3 className="available-schemes-heading">Available Schemes</h3>
                    {schemes.length === 0 ? (
                        <p className="no-schemes-message">No welfare schemes available yet. Check back later!</p>
                    ) : (
                        <div className="schemes-grid">
                            {schemes.map(scheme => (
                                <div key={scheme.id} className="scheme-card">
                                    <h4 className="scheme-card-title">{scheme.name}</h4>
                                    <p className="scheme-card-description">{scheme.description}</p>
                                    <p className="scheme-card-eligibility">Eligibility: {scheme.eligibility}</p>
                                    <button
                                        onClick={() => handleApplyClick(scheme)}
                                        className="apply-button"
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default WelfareSchemes;