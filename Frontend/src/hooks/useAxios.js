import { useState, useCallback } from 'react';
import api from '../services/axios';

export const useAxios = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const request = useCallback(async (config) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api(config);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const get = useCallback(
        (url, config = {}) => {
            return request({ ...config, method: 'GET', url });
        },
        [request]
    );

    const post = useCallback(
        (url, data, config = {}) => {
            return request({ ...config, method: 'POST', url, data });
        },
        [request]
    );

    const put = useCallback(
        (url, data, config = {}) => {
            return request({ ...config, method: 'PUT', url, data });
        },
        [request]
    );

    const patch = useCallback(
        (url, data, config = {}) => {
            return request({ ...config, method: 'PATCH', url, data });
        },
        [request]
    );

    const del = useCallback(
        (url, config = {}) => {
            return request({ ...config, method: 'DELETE', url });
        },
        [request]
    );

    return {
        loading,
        error,
        request,
        get,
        post,
        put,
        patch,
        delete: del
    };
};
