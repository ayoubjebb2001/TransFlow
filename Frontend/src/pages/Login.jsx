import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const location = useLocation();
    const { login } = useAuth();
    const successMessage = location.state?.message;

    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!credentials.email.trim()) {
            newErrors.email = 'Email is required';
        }

        if (!credentials.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        if (!validate()) return;

        setLoading(true);

        try {
            const response = await login(credentials);
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            setServerError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">TransFlow</h1>
                        <p className="text-gray-600 mt-2">Login to your account</p>
                    </div>

                    {successMessage && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                            {successMessage}
                        </div>
                    )}

                    {serverError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={credentials.email}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="Enter your email"
                            autoComplete="email"
                        />

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            value={credentials.password}
                            onChange={handleChange}
                            error={errors.password}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />

                        <Button type="submit" loading={loading}>
                            Login
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Register here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
