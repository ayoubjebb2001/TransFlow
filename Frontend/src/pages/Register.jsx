import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import { useRegisterForm } from '../hooks/useRegisterForm';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const { values, errors, handleChange, validate, setErrors } = useRegisterForm();
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        if (!validate()) return;

        setLoading(true);

        try {
            const { ...userData } = values;
            const response = await register(userData);
            const registeredUser = response.data.user;

            // Check chauffeur status if role is chauffeur
            if (registeredUser.role === 'chauffeur') {

                if (registeredUser.chauffeurStatus === 'inactif') {
                    navigate('/chauffeur/inactive');
                    return;
                }

                navigate('/chauffeur/dashboard');
            } else {
                navigate('/admin/dashboard');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            setServerError(message);

            // Handle field-specific errors if backend returns them
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
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
                        <p className="text-gray-600 mt-2">Create your account</p>
                    </div>

                    {serverError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {serverError}
                        </div>
                    )}

                    <RegisterForm
                        values={values}
                        errors={errors}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        loading={loading}
                    />

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Login here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
