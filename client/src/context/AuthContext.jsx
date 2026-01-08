import React, { createContext, useState, useContext, useEffect } from 'react';

import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check localStorage for saved user
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setIsLoggedIn(true);
        }
    }, []);

    const login = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('user');
    };

    const register = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const checkAttendance = async (username) => {
        try {
            const res = await fetch(`${API_URL}/api/user/attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const data = await res.json();
            if (data.success) {
                // Update local user points
                setUser(prev => {
                    const updated = { ...prev, points: data.points };
                    localStorage.setItem('user', JSON.stringify(updated));
                    return updated;
                });
                return data;
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, login, logout, register, updateUser, checkAttendance }}>
            {children}
        </AuthContext.Provider>
    );
};
