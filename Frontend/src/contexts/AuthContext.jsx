import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user and token from localStorage on mount
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        const response = await authService.login(credentials);
        const { user: userData, token: authToken } = response.data;

        // Store in state
        setUser(userData);
        setToken(authToken);

        // Store in localStorage
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));

        return response;
    };

    const register = async (userData) => {
        const response = await authService.register(userData);
        const { user: newUser, token: authToken } = response.data;

        // Store in state
        setUser(newUser);
        setToken(authToken);

        // Store in localStorage
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        return response;
    };

    const logout = () => {
        // Clear state
        setUser(null);
        setToken(null);

        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const isAuthenticated = () => {
        return !!token && !!user;
    };

    const hasRole = (role) => {
        return user?.role === role;
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        hasRole
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
