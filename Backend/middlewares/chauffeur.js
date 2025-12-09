const chauffeurOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'chauffeur') {
        return res.status(403).json({
            success: false,
            status: 403,
            message: 'Accès chauffeur requis'
        });
    }
    return next();
};

const adminOrChauffeur = (req, res, next) => {
    if (!req.user || (req.user.role !== 'chauffeur' && req.user.role !== 'admin')) {
        return res.status(403).json({
            success: false,
            status: 403,
            message: 'Accès chauffeur ou admin requis'
        });
    }
    return next();
};

module.exports = { chauffeurOnly, adminOrChauffeur };
