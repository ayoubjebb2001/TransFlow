const pneuController = require('../controllers/pneuController');
const Pneu = require('../models/Pneu');
const validate = require('../middlewares/validate');
const { createPneuSchema } = require('../validators/pneu');

jest.mock('../models/Pneu', () => ({
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

describe('Pneu Controller', () => {
    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createPneu', () => {
        it('creates a pneu when numeroSerie is unique', async () => {
            const req = { body: { numeroSerie: 'PNEU-001', marque: 'Michelin', dimension: '315/80R22.5' } };
            const res = mockResponse();

            Pneu.findOne.mockResolvedValue(null);
            Pneu.create.mockResolvedValue({ _id: 'p1', ...req.body });

            await pneuController.createPneu(req, res, next);

            expect(Pneu.findOne).toHaveBeenCalledWith({ numeroSerie: 'PNEU-001' });
            expect(Pneu.create).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 201, data: expect.objectContaining({ _id: 'p1' }) });
            expect(next).not.toHaveBeenCalled();
        });

        it('rejects duplicate numeroSerie', async () => {
            const req = { body: { numeroSerie: 'PNEU-001', marque: 'Michelin', dimension: '315/80R22.5' } };
            const res = mockResponse();

            Pneu.findOne.mockResolvedValue({ _id: 'existing' });

            await pneuController.createPneu(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 400, message: 'Numero de serie already exists' });
            expect(Pneu.create).not.toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('getPneus', () => {
        it('returns all pneus', async () => {
            const res = mockResponse();
            Pneu.find.mockResolvedValue([{ _id: 'p1' }]);

            await pneuController.getPneus({}, res, next);

            expect(Pneu.find).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, data: [{ _id: 'p1' }] });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('getPneuById', () => {
        it('returns pneu when found', async () => {
            const req = { params: { id: 'p1' } };
            const res = mockResponse();
            Pneu.findById.mockResolvedValue({ _id: 'p1' });

            await pneuController.getPneuById(req, res, next);

            expect(Pneu.findById).toHaveBeenCalledWith('p1');
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, data: { _id: 'p1' } });
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 404 when not found', async () => {
            const req = { params: { id: 'p1' } };
            const res = mockResponse();
            Pneu.findById.mockResolvedValue(null);

            await pneuController.getPneuById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 404, message: 'Pneu not found' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('updatePneu', () => {
        it('updates and returns pneu', async () => {
            const req = { params: { id: 'p1' }, body: { etat: 'use' } };
            const res = mockResponse();
            Pneu.findByIdAndUpdate.mockResolvedValue({ _id: 'p1', etat: 'use' });

            await pneuController.updatePneu(req, res, next);

            expect(Pneu.findByIdAndUpdate).toHaveBeenCalledWith('p1', req.body, { new: true, runValidators: true });
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, data: { _id: 'p1', etat: 'use' } });
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 404 when not found', async () => {
            const req = { params: { id: 'p1' }, body: {} };
            const res = mockResponse();
            Pneu.findByIdAndUpdate.mockResolvedValue(null);

            await pneuController.updatePneu(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 404, message: 'Pneu not found' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('deletePneu', () => {
        it('deletes pneu when found', async () => {
            const req = { params: { id: 'p1' } };
            const res = mockResponse();
            Pneu.findByIdAndDelete.mockResolvedValue({ _id: 'p1' });

            await pneuController.deletePneu(req, res, next);

            expect(Pneu.findByIdAndDelete).toHaveBeenCalledWith('p1');
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, message: 'Pneu deleted' });
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 404 when not found', async () => {
            const req = { params: { id: 'p1' } };
            const res = mockResponse();
            Pneu.findByIdAndDelete.mockResolvedValue(null);

            await pneuController.deletePneu(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 404, message: 'Pneu not found' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('validation middleware', () => {
        it('rejects missing required fields on create', async () => {
            const middleware = validate(createPneuSchema);
            const req = { body: { marque: 'Michelin' } }; // missing numeroSerie, dimension
            const res = mockResponse();
            const nextFn = jest.fn();

            await middleware(req, res, nextFn);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: expect.arrayContaining([expect.any(String)]) });
            expect(nextFn).not.toHaveBeenCalled();
        });

        it('rejects lowercase numeroSerie', async () => {
            const middleware = validate(createPneuSchema);
            const req = { body: { numeroSerie: 'pneu-001', marque: 'Michelin', dimension: '315/80R22.5' } };
            const res = mockResponse();
            const nextFn = jest.fn();

            await middleware(req, res, nextFn);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: expect.arrayContaining([expect.stringMatching(/uppercase/i)]) });
            expect(nextFn).not.toHaveBeenCalled();
        });
    });
});
