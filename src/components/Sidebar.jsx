// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom'; // If you're using react-router-dom for full page navigation
//import '../styles/Sidebar.css'; // Make sure you have sidebar styles

// Assuming handleNavigation is a prop that takes (componentName, adminSubSection)
function Sidebar({ userRole, handleNavigation, logout }) {
    return (
        <aside className="sidebar-container">
            <div className="sidebar-header">
                <h2 className="sidebar-title">Menu</h2>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    {userRole === 'admin' ? (
                        <>
                            {/* Admin Links */}
                            <li>
                                <button
                                    className="sidebar-button"
                                    onClick={() => handleNavigation('admin', 'adminOverview')}
                                >
                                    Admin Overview
                                </button>
                            </li>
                            <li className="sidebar-submenu-heading">Admin Panel</li>
                            <li>
                                <button
                                    className="sidebar-button"
                                    onClick={() => handleNavigation('admin', 'manageSchemes')}
                                >
                                    Manage Schemes
                                </button>
                            </li>
                            <li>
                                <button
                                    className="sidebar-button"
                                    onClick={() => handleNavigation('admin', 'manageGrievances')}
                                >
                                    Manage Grievances
                                </button>
                            </li>
                            <li>
                                <button
                                    className="sidebar-button"
                                    onClick={() => handleNavigation('admin', 'manageMarketplace')}
                                >
                                    Manage Marketplace
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            {/* Regular User Links */}
                            <li>
                                <button
                                    className="sidebar-button"
                                    onClick={() => handleNavigation('home')}
                                >
                                    Home
                                </button>
                            </li>
                            <li>
                                <button
                                    className="sidebar-button"
                                    onClick={() => handleNavigation('schemes')}
                                >
                                    Welfare Schemes
                                </button>
                            </li>
                            <li>
                                <button
                                    className="sidebar-button"
                                    onClick={() => handleNavigation('grievances')}
                                >
                                    Grievance Redressal
                                </button>
                            </li>
                            <li>
                                <button
                                    className="sidebar-button"
                                    onClick={() => handleNavigation('marketplace')}
                                >
                                    Resource Sharing
                                </button>
                            </li>
                        </>
                    )}
                    {/* Common Links */}
                    <li>
                        <button
                            className="sidebar-button"
                            onClick={() => handleNavigation('profile')}
                        >
                            Profile
                        </button>
                    </li>
                    <li>
                        <button
                            className="sidebar-button logout-button"
                            onClick={logout}
                        >
                            Logout
                        </button>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar;