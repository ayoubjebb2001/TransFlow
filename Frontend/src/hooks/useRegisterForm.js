import { useState } from 'react';

export const useRegisterForm = (initialValues = {}) => {
    const [values, setValues] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'admin',
        phone: '',
        licenseNumber: '',
        serviceYears: 0,
        ...initialValues
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!values.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!values.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(values.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!values.password) {
            newErrors.password = 'Password is required';
        } else if (values.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!values.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (values.password !== values.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (values.role === 'chauffeur') {
            if (!values.licenseNumber.trim()) {
                newErrors.licenseNumber = 'License number is required for chauffeur';
            }
            if (!values.phone.trim()) {
                newErrors.phone = 'Phone number is required for chauffeur';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const reset = () => {
        setValues({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'admin',
            phone: '',
            licenseNumber: '',
            serviceYears: 0,
            ...initialValues
        });
        setErrors({});
    };

    return { values, errors, handleChange, validate, reset, setErrors };
};
