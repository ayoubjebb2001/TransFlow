import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthRoutes } from "./AuthRoutes";
import { ChauffeurRoutes } from "./ChauffeurRoutes";

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                {AuthRoutes()}
                {ChauffeurRoutes()}
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
};