const authController = require('../controllers/authController');
const User = require('../models/User');
const Chauffeur = require('../models/Chauffeur');
const { hashPassword, comparePassword } = require('../services/hash');
const { generateToken } = require('../services/jwt');

jest.mock('../models/User', () => ({
    findOne: jest.fn(),
    create: jest.fn()
}));

jest.mock('../models/Chauffeur', () => ({
    create: jest.fn(),
    findOne: jest.fn()
}));

jest.mock('../services/hash', () => ({
    hashPassword: jest.fn(),
    comparePassword: jest.fn()
}));

jest.mock('../services/jwt', () => ({
    generateToken: jest.fn()
}));

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Auth Controller', () => {
    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('registers a user and returns token', async () => {
            const req = {
                body: {
                    name: 'John',
                    email: 'john@test.com',
                    password: 'secret',
                    role: 'chauffeur',
                    phone: '0600000000',
                    licenseNumber: 'LIC-123',
                    serviceYears: 1
                }
            };
            const res = mockResponse();

            User.findOne.mockResolvedValue(null);
            hashPassword.mockResolvedValue('hashed');
            User.create.mockResolvedValue({
                _id: 'user123',
                role: 'chauffeur',
                name: 'John',
                email: 'john@test.com',
                toJSON: () => ({ _id: 'user123', role: 'chauffeur', name: 'John', email: 'john@test.com' })
            });
            Chauffeur.create.mockResolvedValue({ _id: 'chauffeur123', status: 'inactif' });
            generateToken.mockReturnValue('jwt-token');

            await authController.register(req, res, next);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'john@test.com' });
            expect(hashPassword).toHaveBeenCalledWith('secret');
            expect(User.create).toHaveBeenCalledWith({ ...req.body, password: 'hashed' });
            expect(generateToken).toHaveBeenCalledWith({ id: 'user123', role: 'chauffeur' });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                status: 201,
                message: 'User registered successfully',
                data: { user: expect.any(Object), token: 'jwt-token' }
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('rejects duplicate email', async () => {
            const req = { body: { name: 'Jane', email: 'jane@test.com', password: 'secret' } };
            const res = mockResponse();

            User.findOne.mockResolvedValue({ _id: 'existing' });

            await authController.register(req, res, next);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'jane@test.com' });
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                status: 400,
                message: 'This email is already taken'
            });
            expect(User.create).not.toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it('passes errors to next', async () => {
            const req = { body: { name: 'Jane', email: 'jane@test.com', password: 'secret' } };
            const res = mockResponse();
            const error = new Error('db fail');

            User.findOne.mockRejectedValue(error);

            await authController.register(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('login', () => {
        it('logs in user with valid credentials', async () => {
            const req = { body: { email: 'john@test.com', password: 'secret' } };
            const res = mockResponse();

            User.findOne.mockResolvedValue({
                _id: 'user123',
                role: 'chauffeur',
                password: 'hashed',
                toJSON: () => ({ _id: 'user123', role: 'chauffeur' })
            });
            Chauffeur.findOne.mockResolvedValue({ _id: 'chauffeur123', status: 'actif' });
            comparePassword.mockResolvedValue(true);
            generateToken.mockReturnValue('jwt-token');

            await authController.login(req, res, next);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'john@test.com' });
            expect(comparePassword).toHaveBeenCalledWith('secret', 'hashed');
            expect(generateToken).toHaveBeenCalledWith({ id: 'user123', role: 'chauffeur' });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                status: 200,
                data: { user: expect.any(Object), token: 'jwt-token' }
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('rejects unknown email', async () => {
            const req = { body: { email: 'no@test.com', password: 'secret' } };
            const res = mockResponse();

            User.findOne.mockResolvedValue(null);

            await authController.login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                status: 401,
                message: 'Invalid credentials'
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('rejects wrong password', async () => {
            const req = { body: { email: 'john@test.com', password: 'wrong' } };
            const res = mockResponse();

            User.findOne.mockResolvedValue({ _id: 'user123', role: 'chauffeur', password: 'hashed' });
            comparePassword.mockResolvedValue(false);

            await authController.login(req, res, next);

            expect(comparePassword).toHaveBeenCalledWith('wrong', 'hashed');
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                status: 401,
                message: 'Invalid credentials'
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('passes errors to next', async () => {
            const req = { body: { email: 'john@test.com', password: 'secret' } };
            const res = mockResponse();
            const error = new Error('db fail');

            User.findOne.mockRejectedValue(error);

            await authController.login(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
