import React, { useState } from 'react';
import './navbar.css';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="navbar" role="navigation" aria-label="Main Navigation">
            <div className="navbar-logo">
                <p style={{ paddingRight: '15px' }}>
                    3074 <span style={{ color: '#D2A9EB' }}>Assignment 2</span>
                </p>
            </div>

            {/* Hamburger icon for mobile view */}
            <button
                className={`navbar-toggle ${isOpen ? 'open' : ''}`}
                onClick={toggleMenu}
                aria-label="Toggle navigation menu"
            >
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </button>

            {/* Navigation links */}
            <ul className={`navbar-links ${isOpen ? 'active' : ''}`}>
                <li><a href="/" onClick={() => setIsOpen(false)}>Login/Signup</a></li>
                <li><a href="/about" onClick={() => setIsOpen(false)}>employees</a></li>
                <li><a href="/services" onClick={() => setIsOpen(false)}>employee add</a></li>
                <li><a href="/contact" onClick={() => setIsOpen(false)}>employee viewer</a></li>
            </ul>
        </nav>
    );
}