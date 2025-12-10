import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthRoutes } from "./AuthRoutes";

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                {AuthRoutes()}
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
};