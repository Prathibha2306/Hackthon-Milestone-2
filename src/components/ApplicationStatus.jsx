// src/components/ApplicationStatus.jsx
import React from 'react';
import '../styles/ApplicationStatus.css'; // Import ApplicationStatus specific CSS

function ApplicationStatus({ applications }) {
    return (
        <div className="application-status-card">
            <h3 className="application-status-title">Your Application Status</h3>
            {applications.length === 0 ? (
                <p className="application-status-empty">You haven't submitted any applications yet.</p>
            ) : (
                <div className="application-list">
                    {applications.map(app => (
                        <div key={app.id} className="application-item">
                            <div className="application-item-details">
                                <p className="scheme-name">{app.schemeName}</p>
                                <p className="applied-date">Applied on: {new Date(app.appliedAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`application-status-badge ${
                                app.status === 'Pending' ? 'status-pending' :
                                app.status === 'Approved' ? 'status-approved' :
                                'status-rejected'
                            }`}>
                                {app.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ApplicationStatus;
