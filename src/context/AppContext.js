// src/context/AppContext.js
import React, { useState, useEffect, createContext, useContext } from 'react';

// Create the context
const AppContext = createContext(null);

// Custom hook to use the context
export const useAppContext = () => useContext(AppContext);

// Utility function to simulate a short network delay for async operations
const simulateNetworkDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// AppContext Provider component
export const AppContextProvider = ({ children }) => {
    // State for the currently logged-in user
    const [user, setUser] = useState(null); // Stores logged-in user info (email, role)
    const [userRole, setUserRole] = useState(null); // 'officer', 'family', 'admin'
    const [currentPage, setCurrentPage] = useState('login'); // 'login', 'register', 'dashboard'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Data States (NO LONGER PERSISTED TO LOCALSTORAGE HERE) ---
    // These states will now be managed by individual components fetching from the backend.
    // The initial values here are just for type consistency, but won't be used for data.
    const [schemes, setSchemes] = useState([]);
    const [applications, setApplications] = useState([]);
    const [emergencyContacts, setEmergencyContacts] = useState([]);
    const [marketplaceListings, setMarketplaceListings] = useState([]);
    const [grievances, setGrievances] = useState([]);
    // -----------------------------------------------------------------

    // Effect to load user state from localStorage on app start
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (storedUser) {
            setUser(storedUser);
            setUserRole(storedUser.role);
            setCurrentPage('dashboard');
        } else {
            setCurrentPage('login');
        }
        setLoading(false);
    }, []);

    // REMOVED: Effects to save data to localStorage (schemes, applications, etc.)
    // as data will now be fetched from and sent to the backend.

    // Value provided by the context
    const contextValue = {
        user,
        setUser,
        userRole,
        setUserRole,
        error,
        setError,
        currentPage,
        setCurrentPage,
        // The following states are now managed by components that fetch from backend
        // We keep the setters here so components can update them if they need to
        // (e.g., after a successful POST/DELETE)
        schemes, setSchemes, // These will be populated by WelfareSchemes component
        applications, setApplications, // Populated by WelfareSchemes
        emergencyContacts, setEmergencyContacts, // Populated by EmergencyContactNetwork
        marketplaceListings, setMarketplaceListings, // Populated by ResourceSharingMarketplace
        grievances, setGrievances, // Populated by GrievanceRedressalSystem
        simulateNetworkDelay // Still useful for general UI loading states
    };

    return (
        <AppContext.Provider value={contextValue}>
            {loading ? (
                <div className="loading-container">
                    <div className="loading-text">Loading application...</div>
                </div>
            ) : (
                children
            )}
        </AppContext.Provider>
    );
};