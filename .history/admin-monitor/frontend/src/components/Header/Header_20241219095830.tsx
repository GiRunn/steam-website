import React from 'react';
import './Header.css';

const Header: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
    return (
        <header className="monitor-header glass-effect">
            <div className="header-content">
                <div className="header-left">
                    <h1>{title}</h1>
                    <p className="subtitle">{subtitle}</p>
                </div>
            </div>
        </header>
    );
};

export default Header; 