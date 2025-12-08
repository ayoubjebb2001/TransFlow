module.exports = (schema) => async (req, res, next) => {
    try {
        await schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        return next();
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.errors });
        }
        return next(err);
    }
};
