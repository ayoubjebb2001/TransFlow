import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const InactiveChauffeur = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="text-center mb-6">
                        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <svg
                                className="w-8 h-8 text-yellow-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Account Pending Approval
                        </h1>
                        <p className="text-gray-600">
                            Welcome, {user?.username || 'Chauffeur'}!
                        </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <h2 className="font-semibold text-yellow-900 mb-2">
                            Your account is not active yet
                        </h2>
                        <p className="text-yellow-800 text-sm">
                            Your chauffeur account has been successfully created but requires admin approval before you can access the system.
                            Please wait for an administrator to activate your account.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-2 text-sm">
                                What happens next?
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li className="flex items-start">
                                    <span className="text-blue-600 mr-2">1.</span>
                                    <span>An administrator will review your registration</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-600 mr-2">2.</span>
                                    <span>Once approved, you'll receive access to your dashboard</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-600 mr-2">3.</span>
                                    <span>You can then manage your trips and view mission orders</span>
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={logout}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Logout
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            Need help?
                            <Link to="/contact" className="text-blue-600 hover:text-blue-700">
                                Contact support
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InactiveChauffeur;
