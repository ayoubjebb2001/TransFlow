import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthRoutes } from "./AuthRoutes";
import { ChauffeurRoutes } from "./ChauffeurRoutes";
import { AdminRoutes } from "./AdminRoutes";

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                {AuthRoutes()}
                {ChauffeurRoutes()}
                {AdminRoutes()}
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
};