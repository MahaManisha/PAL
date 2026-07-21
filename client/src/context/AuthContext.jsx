import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData.user);
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData.user));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    // Google OAuth login handler (from redirect URL params)
    const handleGoogleRedirect = () => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const name = params.get('name');
        const email = params.get('email');
        const id = params.get('id');
        const avatar = params.get('avatar');

        if (token && name && email) {
            const userData = {
                token,
                user: { name, email, id, avatar: avatar || '' }
            };
            login(userData);
            // Clean URL
            window.history.replaceState({}, document.title, '/auth/google');
            return true;
        }
        return false;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, handleGoogleRedirect }}>
            {children}
        </AuthContext.Provider>
    );
};
