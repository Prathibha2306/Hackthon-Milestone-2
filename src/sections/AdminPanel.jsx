// src/sections/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import '../styles/AdminPanel.css'; // Import AdminPanel specific CSS
import '../styles/WelfareSchemes.css'; // Reusing scheme card styles
import '../styles/GrievanceRedressalSystem.css'; // Reusing grievance styles
import '../styles/ResourceSharingMarketplace.css'; // Reusing marketplace styles

function AdminPanel() {
    const { setError, simulateNetworkDelay } = useAppContext();
    const [schemeName, setSchemeName] = useState('');
    const [schemeDescription, setSchemeDescription] = useState('');
    const [schemeEligibility, setSchemeEligibility] = useState('');
    const [schemeCategory, setSchemeCategory] = useState('Health'); // New: Category for schemes
    const [loading, setLoading] = useState(false);

    const [schemes, setSchemes] = useState([]);
    const [grievances, setGrievances] = useState([]);
    const [marketplaceListings, setMarketplaceListings] = useState([]);
    const [selectedGrievance, setSelectedGrievance] = useState(null); // For admin to view/update

    // --- Fetch Data for Admin Panel ---
    useEffect(() => {
        const fetchAdminData = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch Schemes
                const schemesRes = await fetch('/api/schemes');
                if (!schemesRes.ok) throw new Error('Failed to fetch schemes.');
                const fetchedSchemes = await schemesRes.json();
                setSchemes(fetchedSchemes);

                // Fetch Grievances
                const grievancesRes = await fetch('/api/grievances');
                if (!grievancesRes.ok) throw new Error('Failed to fetch grievances.');
                const fetchedGrievances = await grievancesRes.json();
                setGrievances(fetchedGrievances.sort((a, b) => new Date(b.filedAt) - new Date(a.filedAt))); // Sort newest first

                // Fetch Marketplace Listings
                const marketplaceRes = await fetch('/api/marketplace');
                if (!marketplaceRes.ok) throw new Error('Failed to fetch marketplace listings.');
                const fetchedMarketplace = await marketplaceRes.json();
                setMarketplaceListings(fetchedMarketplace);

            } catch (err) {
                console.error("Error fetching admin data:", err);
                setError(`Failed to load admin data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, [setError]); // Re-fetch if error state changes (e.g., cleared)


    // --- Scheme Management ---
    const handleAddScheme = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await simulateNetworkDelay();
            const response = await fetch('/api/schemes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: schemeName, description: schemeDescription, eligibility: schemeEligibility, category: schemeCategory }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to add scheme.');

            setSchemes(prev => [...prev, data.scheme]); // Add new scheme to local state
            alert('Scheme added successfully!');
            setSchemeName('');
            setSchemeDescription('');
            setSchemeEligibility('');
            setSchemeCategory('Health');
        } catch (err) {
            console.error("Error adding scheme:", err);
            setError(`Failed to add scheme: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteScheme = async (id) => {
        if (!window.confirm('Are you sure you want to delete this scheme?')) return;
        setLoading(true);
        setError('');
        try {
            await simulateNetworkDelay();
            const response = await fetch(`/api/schemes/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to delete scheme.');

            setSchemes(prev => prev.filter(scheme => scheme.id !== id)); // Remove from local state
            alert('Scheme deleted successfully!');
        } catch (err) {
            console.error("Error deleting scheme:", err);
            setError(`Failed to delete scheme: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // --- Grievance Management ---
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

            setGrievances(prev => prev.map(g => g.id === grievanceId ? data.grievance : g)); // Update local state
            alert('Grievance status updated!');
            setSelectedGrievance(null); // Close the detail view
        } catch (err) {
            console.error("Error updating grievance status:", err);
            setError(`Failed to update grievance status: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // --- Marketplace Management ---
    const handleDeleteMarketplaceItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this marketplace listing (mark as sold/remove)?')) return;
        setLoading(true);
        setError('');
        try {
            await simulateNetworkDelay();
            const response = await fetch(`/api/marketplace/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to delete marketplace listing.');

            setMarketplaceListings(prev => prev.filter(listing => listing.id !== id)); // Remove from local state
            alert('Marketplace listing deleted successfully!');
        } catch (err) {
            console.error("Error deleting marketplace listing:", err);
            setError(`Failed to delete marketplace listing: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-panel-container">
                <p className="admin-panel-info">Loading admin data...</p>
            </div>
        );
    }

    return (
        <div className="admin-panel-container">
            <h2 className="admin-panel-title">Admin Panel</h2>

            <h3 className="add-scheme-heading">Manage Welfare Schemes</h3>
            <form onSubmit={handleAddScheme} className="add-scheme-form">
                <div className="add-scheme-form-group">
                    <label htmlFor="schemeName">Scheme Name</label>
                    <input
                        type="text"
                        id="schemeName"
                        value={schemeName}
                        onChange={(e) => setSchemeName(e.target.value)}
                        required
                    />
                </div>
                <div className="add-scheme-form-group">
                    <label htmlFor="schemeDescription">Description</label>
                    <textarea
                        id="schemeDescription"
                        rows="3"
                        value={schemeDescription}
                        onChange={(e) => setSchemeDescription(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div className="add-scheme-form-group">
                    <label htmlFor="schemeEligibility">Eligibility</label>
                    <input
                        type="text"
                        id="schemeEligibility"
                        value={schemeEligibility}
                        onChange={(e) => setSchemeEligibility(e.target.value)}
                        required
                    />
                </div>
                <div className="add-scheme-form-group">
                    <label htmlFor="schemeCategory">Category</label>
                    <select
                        id="schemeCategory"
                        value={schemeCategory}
                        onChange={(e) => setSchemeCategory(e.target.value)}
                        required
                    >
                        <option value="Health">Health</option>
                        <option value="Financial Aid">Financial Aid</option>
                        <option value="Education">Education</option>
                        <option value="Resettlement">Resettlement</option>
                        <option value="Housing">Housing</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="add-scheme-form-actions">
                    <button
                        type="submit"
                        className="add-scheme-submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Adding...' : 'Add Scheme'}
                    </button>
                </div>
            </form>

            <h4 className="available-schemes-heading">Existing Schemes</h4>
            {schemes.length === 0 ? (
                <p className="no-schemes-message">No schemes added yet.</p>
            ) : (
                <div className="schemes-grid">
                    {schemes.map(scheme => (
                        <div key={scheme.id} className="scheme-card">
                            <h4 className="scheme-card-title">{scheme.name}</h4>
                            <p className="scheme-card-description">{scheme.description}</p>
                            <p className="scheme-card-eligibility">Eligibility: {scheme.eligibility}</p>
                            <p className="scheme-card-eligibility">Category: {scheme.category}</p>
                            <button
                                onClick={() => handleDeleteScheme(scheme.id)}
                                className="apply-button" // Reusing apply-button style for delete
                                style={{ backgroundColor: '#dc2626', hover: { backgroundColor: '#b91c1c' } }} // Override to red
                                disabled={loading}
                            >
                                Delete Scheme
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <h3 className="grievances-list-heading" style={{ marginTop: '2rem' }}>Manage Grievances</h3>
            {grievances.length === 0 ? (
                <p className="no-grievances-message">No grievances filed yet.</p>
            ) : (
                <div className="grievances-list">
                    {grievances.map(grievance => (
                        <div key={grievance.id} className="grievance-item">
                            <div className="grievance-item-header">
                                <div className="grievance-item-details">
                                    <p className="grievance-subject">{grievance.subject}</p>
                                    <p>Filed by: {grievance.userId}</p>
                                    <p>Filed on: {new Date(grievance.filedAt).toLocaleDateString()}</p>
                                    <p>Priority: <span className={`priority-text priority-${grievance.priority}`}>{grievance.priority.toUpperCase()}</span></p>
                                </div>
                                <span className={`grievance-status-badge ${
                                    grievance.status === 'Open' ? 'status-open' :
                                    grievance.status === 'In Progress' ? 'status-in-progress' :
                                    'status-resolved' // Resolved or Rejected will use green
                                }`}>
                                    {grievance.status}
                                </span>
                            </div>
                            <div className="grievance-item-actions">
                                <button
                                    onClick={() => setSelectedGrievance(grievance)}
                                    className="grievance-item-button"
                                    disabled={loading}
                                >
                                    View/Update Status
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedGrievance && (
                <div className="grievance-detail-modal-overlay">
                    <div className="grievance-detail-modal-content">
                        <h3 className="grievance-detail-modal-title">Grievance Details</h3>
                        <p className="grievance-subject">Subject: {selectedGrievance.subject}</p>
                        <p className="grievance-details">Details: {selectedGrievance.details}</p>
                        <p>Filed by: {selectedGrievance.userId}</p>
                        <p>Priority: {selectedGrievance.priority}</p>
                        <p>Status: {selectedGrievance.status}</p>

                        <div className="grievance-detail-modal-actions">
                            <button
                                onClick={() => handleUpdateGrievanceStatus(selectedGrievance.id, 'In Progress')}
                                className="grievance-detail-modal-button in-progress"
                                disabled={loading || selectedGrievance.status === 'Resolved' || selectedGrievance.status === 'Rejected'}
                            >
                                Mark In Progress
                            </button>
                            <button
                                onClick={() => handleUpdateGrievanceStatus(selectedGrievance.id, 'Resolved')}
                                className="grievance-detail-modal-button resolved"
                                disabled={loading || selectedGrievance.status === 'Resolved' || selectedGrievance.status === 'Rejected'}
                            >
                                Mark Resolved
                            </button>
                            <button
                                onClick={() => handleUpdateGrievanceStatus(selectedGrievance.id, 'Rejected')}
                                className="grievance-detail-modal-button rejected" // New style for rejected
                                style={{ backgroundColor: '#ef4444', hover: { backgroundColor: '#dc2626' } }}
                                disabled={loading || selectedGrievance.status === 'Resolved' || selectedGrievance.status === 'Rejected'}
                            >
                                Mark Rejected
                            </button>
                            <button
                                onClick={() => setSelectedGrievance(null)}
                                className="grievance-detail-modal-button close"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h3 className="resources-list-heading" style={{ marginTop: '2rem' }}>Manage Marketplace Listings</h3>
            {marketplaceListings.length === 0 ? (
                <p className="no-resources-message">No marketplace listings available yet.</p>
            ) : (
                <div className="resources-grid">
                    {marketplaceListings.map(listing => (
                        <div key={listing.id} className="listing-card">
                            <span className={`listing-type-badge ${
                                listing.type === 'book' ? 'type-book' :
                                listing.type === 'equipment' ? 'type-equipment' :
                                'type-housing'
                            }`}>
                                {listing.type.toUpperCase()}
                            </span>
                            <h4 className="listing-card-title">{listing.title}</h4>
                            <p className="listing-card-description">{listing.description}</p>
                            <p className="listing-card-contact">Contact: {listing.contactInfo}</p>
                            <button
                                onClick={() => handleDeleteMarketplaceItem(listing.id)}
                                className="listing-card-button delete"
                                disabled={loading}
                            >
                                Mark Sold / Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminPanel;
