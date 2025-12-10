import { Route } from 'react-router-dom';
import Register from '../pages/Register';
import Login from '../pages/Login';

export const AuthRoutes = () => {
    return (
        <>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
        </>
    );
};
