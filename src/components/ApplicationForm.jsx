// src/sections/EmergencyContactNetwork.jsx
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import '../styles/EmergencyContactNetwork.css'; // Import EmergencyContactNetwork specific CSS

function EmergencyContactNetwork() {
    const { user, setError, simulateNetworkDelay } = useAppContext();
    const [contacts, setContacts] = useState([]); // Contacts now managed locally
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [relationship, setRelationship] = useState('');
    const [editContactId, setEditContactId] = useState(null);
    const [loading, setLoading] = useState(true); // Set to true initially for fetching

    useEffect(() => {
        const fetchContacts = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch contacts for the current user
                const response = await fetch(`/api/users/${user.email}/emergency-contacts`); // Use user.email as userId
                if (!response.ok) throw new Error('Failed to fetch emergency contacts.');
                const fetchedContacts = await response.json();
                setContacts(fetchedContacts);
            } catch (err) {
                console.error("Error fetching contacts:", err);
                setError(`Failed to load emergency contacts: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        if (user) { // Only fetch if user is logged in
            fetchContacts();
        }
    }, [user, setError]); // Re-fetch if user changes or error state changes

    const handleAddOrUpdateContact = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await simulateNetworkDelay(); // Simulate network delay
            let response;
            let data;

            if (editContactId) {
                // Update existing contact
                response = await fetch(`/api/emergency-contacts/${editContactId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, phone, relationship }),
                });
                data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Failed to update contact.');

                setContacts(prev => prev.map(contact =>
                    contact.id === editContactId ? data.contact : contact
                ));
                alert('Contact updated successfully!');
            } else {
                // Add new contact
                response = await fetch('/api/emergency-contacts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.email, name, phone, relationship }),
                });
                data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Failed to add contact.');

                setContacts(prev => [...prev, data.contact]);
                alert('Contact added successfully!');
            }
            setName('');
            setPhone('');
            setRelationship('');
            setEditContactId(null);
        } catch (err) {
            console.error("Error adding/updating contact:", err);
            setError(`Failed to save contact: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (contact) => {
        setName(contact.name);
        setPhone(contact.phone);
        setRelationship(contact.relationship);
        setEditContactId(contact.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this contact?')) return;
        setLoading(true);
        setError('');
        try {
            await simulateNetworkDelay();
            const response = await fetch(`/api/emergency-contacts/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to delete contact.');

            setContacts(prev => prev.filter(contact => contact.id !== id));
            alert('Contact deleted successfully!');
        } catch (err) {
            console.error("Error deleting contact:", err);
            setError(`Failed to delete contact: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSOS = () => {
        alert('SOS signal sent! (This is a simulated action. In a real app, emergency services/contacts would be notified.)');
    };

    if (loading) {
        return (
            <div className="emergency-container">
                <p className="no-contacts-message">Loading emergency contacts...</p>
            </div>
        );
    }

    return (
        <div className="emergency-container">
            <h2 className="emergency-title">Emergency Contact Network</h2>

            <button
                onClick={handleSOS}
                className="sos-button"
            >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 102 0V6zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path></svg>
                <span>SOS - Emergency Help!</span>
            </button>

            <h3 className="contact-form-heading">{editContactId ? 'Edit Contact' : 'Add New Contact'}</h3>
            <form onSubmit={handleAddOrUpdateContact} className="contact-form">
                <div className="contact-form-group">
                    <label htmlFor="contactName">Name</label>
                    <input
                        type="text"
                        id="contactName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="contact-form-group">
                    <label htmlFor="contactPhone">Phone</label>
                    <input
                        type="tel"
                        id="contactPhone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>
                <div className="contact-form-group">
                    <label htmlFor="contactRelationship">Relationship</label>
                    <input
                        type="text"
                        id="contactRelationship"
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        placeholder="e.g., Spouse, Parent, Friend"
                        required
                    />
                </div>
                <div className="contact-form-actions">
                    {editContactId && (
                        <button
                            type="button"
                            onClick={() => { setName(''); setPhone(''); setRelationship(''); setEditContactId(null); }}
                            className="contact-form-button cancel-edit"
                        >
                            Cancel Edit
                        </button>
                    )}
                    <button
                        type="submit"
                        className="contact-form-button save-contact"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : (editContactId ? 'Update Contact' : 'Add Contact')}
                    </button>
                </div>
            </form>

            <h3 className="contacts-list-heading">Your Emergency Contacts</h3>
            {contacts.length === 0 ? (
                <p className="no-contacts-message">No emergency contacts added yet.</p>
            ) : (
                <div className="contacts-grid">
                    {contacts.map(contact => (
                        <div key={contact.id} className="contact-card">
                            <p className="contact-card-name">{contact.name}</p>
                            <p className="contact-card-phone">{contact.phone}</p>
                            <p className="contact-card-relationship">{contact.relationship}</p>
                            <div className="contact-card-actions">
                                <button
                                    onClick={() => handleEdit(contact)}
                                    className="contact-card-button edit"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(contact.id)}
                                    className="contact-card-button delete"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default EmergencyContactNetwork;