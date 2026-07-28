import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
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

    const updateUserInterest = async (interest) => {
        if (!user) return;
        try {
            const res = await apiClient.put('/api/auth/update-interest', {
                userId: user.id,
                interest
            });
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
        } catch (err) {
            console.error('Failed to update interest', err);
        }
    };

    const updateUserStats = (updatedFields) => {
        if (!user) return;
        const updated = { ...user, ...updatedFields };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
    };

    const updateUserProfile = async (profileData) => {
        if (!user) return { success: false, error: 'User not logged in' };
        try {
            const res = await apiClient.put('/api/auth/profile', {
                userId: user.id || user._id,
                ...profileData
            });
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            return { success: true, user: res.data.user };
        } catch (err) {
            console.error('Failed to update profile', err);
            return { success: false, error: err.response?.data?.msg || err.message };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUserInterest, updateUserStats, updateUserProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
