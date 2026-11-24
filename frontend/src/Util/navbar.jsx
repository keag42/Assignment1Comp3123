import React, { useEffect, useState } from 'react';
import './navbar.css';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('token')));

    useEffect(() => {
        const syncAuth = () => setIsLoggedIn(Boolean(localStorage.getItem('token')));
        window.addEventListener('auth-changed', syncAuth);
        window.addEventListener('storage', syncAuth);
        return () => {
            window.removeEventListener('auth-changed', syncAuth);
            window.removeEventListener('storage', syncAuth);
        };
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setIsOpen(false);
        window.location.href = '/login';
    };

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
                {!isLoggedIn && <li><a href="/login" onClick={() => setIsOpen(false)}>Login</a></li>}
                {!isLoggedIn && <li><a href="/" onClick={() => setIsOpen(false)}>Signup</a></li>}
                {isLoggedIn && <li><a href="/contact" onClick={() => setIsOpen(false)}>Employees</a></li>}
                {isLoggedIn && <li><a href="/about" onClick={() => setIsOpen(false)}>Search</a></li>}
                {isLoggedIn && <li><a href="/services" onClick={() => setIsOpen(false)}>Add employee</a></li>}
                {isLoggedIn && <li><button className="nav-logout" type="button" onClick={logout}>Log out</button></li>}
            </ul>
        </nav>
    );
}
