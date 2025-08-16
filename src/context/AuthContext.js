import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('user_token');
        if (token) {
            setIsAuthenticated(true);
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            setUserId(decodedToken.user_id);
            setUserName(decodedToken.name);
        }
    }, []);

    const login = (token) => {
        localStorage.setItem('user_token', token);
        setIsAuthenticated(true);
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setUserId(decodedToken.user_id);
        setUserName(decodedToken.name);
    };

    const logout = () => {
        localStorage.removeItem('user_token');
        setIsAuthenticated(false);
        setUserId(null);
        setUserName(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userId, userName, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
