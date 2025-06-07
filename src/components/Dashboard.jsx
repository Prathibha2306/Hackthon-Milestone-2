// src/components/Dashboard.jsx
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import '../styles/Dashboard.css'; // Import Dashboard specific CSS

// Import section components
import WelfareSchemes from '../sections/WelfareSchemes';
import EmergencyContactNetwork from '../sections/EmergencyContactNetwork';
import ResourceSharingMarketplace from '../sections/ResourceSharingMarketplace';
import GrievanceRedressalSystem from '../sections/GrievanceRedressalSystem';
import AdminPanel from '../sections/AdminPanel';

function Dashboard() {
    const { user, setUser, setUserRole, setError, setCurrentPage, simulateNetworkDelay } = useAppContext();
    const [activeSection, setActiveSection] = useState(user?.role === 'admin' ? 'admin' : 'schemes'); // Default active section based on role

    const handleLogout = async () => {
        try {
            await simulateNetworkDelay(); // Simulate network delay
            setUser(null);
            setUserRole(null);
            localStorage.removeItem('loggedInUser'); // Clear login state from local storage
            setCurrentPage('login');
        } catch (err) {
            console.error("Logout error:", err);
            setError(`Failed to logout: ${err.message}`);
        }
    };

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <h1 className="header-title">Armed Forces Welfare</h1>
                    <div className="user-info">
                        <span className="user-text">Welcome, {user?.email || 'Guest'} ({user?.role || 'N/A'})</span>
                        <button
                            onClick={handleLogout}
                            className="logout-button"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="main-content-area">
                {/* Sidebar Navigation */}
                <nav className="sidebar-nav">
                    <ul>
                        {user?.role !== 'admin' && ( // Show these for non-admin users
                            <>
                                <li>
                                    <button
                                        onClick={() => setActiveSection('schemes')}
                                        className={activeSection === 'schemes' ? 'active' : ''}
                                    >
                                        Welfare Schemes
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveSection('emergency')}
                                        className={activeSection === 'emergency' ? 'active' : ''}
                                    >
                                        Emergency Network
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveSection('marketplace')}
                                        className={activeSection === 'marketplace' ? 'active' : ''}
                                    >
                                        Resource Marketplace
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveSection('grievances')}
                                        className={activeSection === 'grievances' ? 'active' : ''}
                                    >
                                        Grievance Redressal
                                    </button>
                                </li>
                            </>
                        )}
                        {user?.role === 'admin' && ( // Show Admin Panel only for admin
                            <li>
                                <button
                                    onClick={() => setActiveSection('admin')}
                                    className={activeSection === 'admin' ? 'active' : ''}
                                >
                                    Admin Panel
                                </button>
                            </li>
                        )}
                    </ul>
                </nav>

                {/* Content Area - Renders the active section */}
                <main className="content-area">
                    {activeSection === 'schemes' && <WelfareSchemes />}
                    {activeSection === 'emergency' && <EmergencyContactNetwork />}
                    {activeSection === 'marketplace' && <ResourceSharingMarketplace />}
                    {activeSection === 'grievances' && <GrievanceRedressalSystem />}
                    {activeSection === 'admin' && user?.role === 'admin' && <AdminPanel />}
                </main>
            </div>
        </div>
    );
}

export default Dashboard;