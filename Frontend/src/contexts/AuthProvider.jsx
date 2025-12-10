import { useState } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '../services/authService';

const safeParseJson = (value) => {
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(() => safeParseJson(localStorage.getItem('user')));
    const [loading] = useState(false);

    const persistAuth = ({ nextUser, nextToken }) => {
        setUser(nextUser);
        setToken(nextToken);

        if (nextToken) {
            localStorage.setItem('token', nextToken);
        } else {
            localStorage.removeItem('token');
        }

        if (nextUser) {
            localStorage.setItem('user', JSON.stringify(nextUser));
        } else {
            localStorage.removeItem('user');
        }
    };

    const login = async (credentials) => {
        const response = await authService.login(credentials);
        const { user: userData, token: authToken } = response.data;

        persistAuth({ nextUser: userData, nextToken: authToken });

        return response;
    };

    const register = async (userData) => {
        const response = await authService.register(userData);
        const { user: newUser, token: authToken } = response.data;

        persistAuth({ nextUser: newUser, nextToken: authToken });

        return response;
    };

    const logout = () => {
        persistAuth({ nextUser: null, nextToken: null });
    };

    const isAuthenticated = () => {
        return !!token && !!user;
    };

    const hasRole = (role) => {
        return user?.role === role;
    };

    const isChauffeurInactive = () => {
        return user?.role === 'chauffeur' && user?.chauffeurStatus === 'inactif';
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        hasRole,
        isChauffeurInactive,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
