// src/sections/ResourceSharingMarketplace.jsx
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import '../styles/ResourceSharingMarketplace.css'; // Import ResourceSharingMarketplace specific CSS

function ResourceSharingMarketplace() {
    const { user, setError, simulateNetworkDelay } = useAppContext();
    const [listings, setListings] = useState([]); // Listings now managed locally
    const [type, setType] = useState('book');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [editListingId, setEditListingId] = useState(null);
    const [loading, setLoading] = useState(true); // Set to true initially for fetching

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch('/api/marketplace');
                if (!response.ok) throw new Error('Failed to fetch marketplace listings.');
                const fetchedListings = await response.json();
                setListings(fetchedListings);
            } catch (err) {
                console.error("Error fetching listings:", err);
                setError(`Failed to load marketplace listings: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [setError]); // Re-fetch if error state changes

    const handleAddOrUpdateListing = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await simulateNetworkDelay(); // Simulate network delay
            let response;
            let data;

            if (editListingId) {
                // Update existing listing
                response = await fetch(`/api/marketplace/${editListingId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type, title, description, contactInfo }),
                });
                data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Failed to update listing.');

                setListings(prev => prev.map(listing =>
                    listing.id === editListingId ? data.listing : listing
                ));
                alert('Listing updated successfully!');
            } else {
                // Add new listing
                response = await fetch('/api/marketplace', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.email, type, title, description, contactInfo }),
                });
                data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Failed to add listing.');

                setListings(prev => [...prev, data.listing]);
                alert('Listing added successfully!');
            }
            setType('book');
            setTitle('');
            setDescription('');
            setContactInfo('');
            setEditListingId(null);
        } catch (err) {
            console.error("Error adding/updating listing:", err);
            setError(`Failed to save listing: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (listing) => {
        setType(listing.type);
        setTitle(listing.title);
        setDescription(listing.description);
        setContactInfo(listing.contactInfo);
        setEditListingId(listing.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing (mark as sold/remove)?')) return;
        setLoading(true);
        setError('');
        try {
            await simulateNetworkDelay();
            const response = await fetch(`/api/marketplace/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to delete listing.');

            setListings(prev => prev.filter(listing => listing.id !== id));
            alert('Listing deleted successfully!');
        } catch (err) {
            console.error("Error deleting listing:", err);
            setError(`Failed to delete listing: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="marketplace-container">
                <p className="no-resources-message">Loading marketplace listings...</p>
            </div>
        );
    }

    return (
        <div className="marketplace-container">
            <h2 className="marketplace-title">Resource Sharing Marketplace</h2>

            <h3 className="listing-form-heading">{editListingId ? 'Edit Listing' : 'Create New Listing'}</h3>
            <form onSubmit={handleAddOrUpdateListing} className="listing-form">
                <div className="listing-form-group">
                    <label htmlFor="listingType">Type</label>
                    <select
                        id="listingType"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="book">Book</option>
                        <option value="equipment">Equipment</option>
                        <option value="housing">Housing</option>
                    </select>
                </div>
                <div className="listing-form-group">
                    <label htmlFor="listingTitle">Title</label>
                    <input
                        type="text"
                        id="listingTitle"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="listing-form-group">
                    <label htmlFor="listingDescription">Description</label>
                    <textarea
                        id="listingDescription"
                        rows="3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div className="listing-form-group">
                    <label htmlFor="contactInfo">Contact Info</label>
                    <input
                        type="text"
                        id="contactInfo"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        placeholder="Email or Phone Number"
                        required
                    />
                </div>
                <div className="listing-form-actions">
                    {editListingId && (
                        <button
                            type="button"
                            onClick={() => { setType('book'); setTitle(''); setDescription(''); setContactInfo(''); setEditListingId(null); }}
                            className="listing-form-button cancel-edit"
                        >
                            Cancel Edit
                        </button>
                    )}
                    <button
                        type="submit"
                        className="listing-form-button save-listing"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : (editListingId ? 'Update Listing' : 'Add Listing')}
                    </button>
                </div>
            </form>

            <h3 className="resources-list-heading">Available Resources</h3>
            {listings.length === 0 ? (
                <p className="no-resources-message">No resources listed yet.</p>
            ) : (
                <div className="resources-grid">
                    {listings.map(listing => (
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
                            {listing.userId === user.email && ( // Allow editing/deleting own listings
                                <div className="listing-card-actions">
                                    <button
                                        onClick={() => handleEdit(listing)}
                                        className="listing-card-button edit"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(listing.id)}
                                        className="listing-card-button delete"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ResourceSharingMarketplace;