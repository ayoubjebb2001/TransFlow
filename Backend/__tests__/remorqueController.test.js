const remorqueController = require('../controllers/remorqueController');
const Remorque = require('../models/Remorque');
const validate = require('../middlewares/validate');
const { createRemorqueSchema } = require('../validators/remorque');

jest.mock('../models/Remorque', () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
}));

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Remorque Controller', () => {
    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createRemorque', () => {
        it('creates a remorque when immatriculation is unique', async () => {
            const req = { body: { immatriculation: 'REM-001', marque: 'Schmitz' } };
            const res = mockResponse();

            Remorque.findOne.mockResolvedValue(null);
            Remorque.create.mockResolvedValue({ _id: 'r1', ...req.body });

            await remorqueController.createRemorque(req, res, next);

            expect(Remorque.findOne).toHaveBeenCalledWith({ immatriculation: 'REM-001' });
            expect(Remorque.create).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 201, data: expect.objectContaining({ _id: 'r1' }) });
            expect(next).not.toHaveBeenCalled();
        });

        it('rejects duplicate immatriculation', async () => {
            const req = { body: { immatriculation: 'REM-001', marque: 'Schmitz' } };
            const res = mockResponse();

            Remorque.findOne.mockResolvedValue({ _id: 'existing' });

            await remorqueController.createRemorque(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 400, message: 'Immatriculation already exists' });
            expect(Remorque.create).not.toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('getRemorques', () => {
        it('returns all remorques', async () => {
            const res = mockResponse();
            Remorque.find.mockResolvedValue([{ _id: 'r1' }]);

            await remorqueController.getRemorques({}, res, next);

            expect(Remorque.find).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, data: [{ _id: 'r1' }] });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('getRemorqueById', () => {
        it('returns remorque when found', async () => {
            const req = { params: { id: 'r1' } };
            const res = mockResponse();
            Remorque.findById.mockResolvedValue({ _id: 'r1' });

            await remorqueController.getRemorqueById(req, res, next);

            expect(Remorque.findById).toHaveBeenCalledWith('r1');
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, data: { _id: 'r1' } });
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 404 when not found', async () => {
            const req = { params: { id: 'r1' } };
            const res = mockResponse();
            Remorque.findById.mockResolvedValue(null);

            await remorqueController.getRemorqueById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 404, message: 'Remorque not found' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('updateRemorque', () => {
        it('updates and returns remorque', async () => {
            const req = { params: { id: 'r1' }, body: { marque: 'Kogel' } };
            const res = mockResponse();
            Remorque.findByIdAndUpdate.mockResolvedValue({ _id: 'r1', marque: 'Kogel' });

            await remorqueController.updateRemorque(req, res, next);

            expect(Remorque.findByIdAndUpdate).toHaveBeenCalledWith('r1', req.body, { new: true, runValidators: true });
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, data: { _id: 'r1', marque: 'Kogel' } });
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 404 when not found', async () => {
            const req = { params: { id: 'r1' }, body: {} };
            const res = mockResponse();
            Remorque.findByIdAndUpdate.mockResolvedValue(null);

            await remorqueController.updateRemorque(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 404, message: 'Remorque not found' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('deleteRemorque', () => {
        it('deletes remorque when found', async () => {
            const req = { params: { id: 'r1' } };
            const res = mockResponse();
            Remorque.findByIdAndDelete.mockResolvedValue({ _id: 'r1' });

            await remorqueController.deleteRemorque(req, res, next);

            expect(Remorque.findByIdAndDelete).toHaveBeenCalledWith('r1');
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, message: 'Remorque deleted' });
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 404 when not found', async () => {
            const req = { params: { id: 'r1' } };
            const res = mockResponse();
            Remorque.findByIdAndDelete.mockResolvedValue(null);

            await remorqueController.deleteRemorque(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 404, message: 'Remorque not found' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('validation middleware', () => {
        it('rejects missing required fields on create', async () => {
            const middleware = validate(createRemorqueSchema);
            const req = { body: { marque: 'Schmitz' } }; // missing immatriculation, modele, annee
            const res = mockResponse();
            const nextFn = jest.fn();

            await middleware(req, res, nextFn);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: expect.arrayContaining([expect.any(String)]) });
            expect(nextFn).not.toHaveBeenCalled();
        });

        it('rejects lowercase immatriculation', async () => {
            const middleware = validate(createRemorqueSchema);
            const req = { body: { immatriculation: 'rem-001', marque: 'Schmitz', modele: 'X', annee: 2024 } };
            const res = mockResponse();
            const nextFn = jest.fn();

            await middleware(req, res, nextFn);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: expect.arrayContaining([expect.stringMatching(/uppercase/i)]) });
            expect(nextFn).not.toHaveBeenCalled();
        });
    });
});
