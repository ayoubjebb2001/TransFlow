const camionController = require('../controllers/camionController');
const Camion = require('../models/Camion');
const validate = require('../middlewares/validate');
const { createCamionSchema } = require('../validators/camion');

jest.mock('../models/Camion', () => ({
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

describe('Camion Controller', () => {
    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createCamion', () => {
        it('creates a camion when immatriculation is unique', async () => {
            const req = { body: { immatriculation: 'ABC-123', marque: 'Volvo' } };
            const res = mockResponse();

            Camion.findOne.mockResolvedValue(null);
            Camion.create.mockResolvedValue({ _id: 'id1', ...req.body });

            await camionController.createCamion(req, res, next);

            expect(Camion.findOne).toHaveBeenCalledWith({ immatriculation: 'ABC-123' });
            expect(Camion.create).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 201, data: expect.objectContaining({ _id: 'id1' }) });
            expect(next).not.toHaveBeenCalled();
        });

        it('rejects duplicate immatriculation', async () => {
            const req = { body: { immatriculation: 'ABC-123', marque: 'Volvo' } };
            const res = mockResponse();

            Camion.findOne.mockResolvedValue({ _id: 'existing' });

            await camionController.createCamion(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 400, message: 'Immatriculation already exists' });
            expect(Camion.create).not.toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

    });

    describe('getCamions', () => {
        it('returns all camions', async () => {
            const req = {};
            const res = mockResponse();
            Camion.find.mockResolvedValue([{ _id: '1' }]);

            await camionController.getCamions(req, res, next);

            expect(Camion.find).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, data: [{ _id: '1' }] });
            expect(next).not.toHaveBeenCalled();
        });

    });

    describe('getCamionById', () => {
        it('returns camion when found', async () => {
            const req = { params: { id: 'id1' } };
            const res = mockResponse();
            Camion.findById.mockResolvedValue({ _id: 'id1' });

            await camionController.getCamionById(req, res, next);

            expect(Camion.findById).toHaveBeenCalledWith('id1');
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, data: { _id: 'id1' } });
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 404 when not found', async () => {
            const req = { params: { id: 'id1' } };
            const res = mockResponse();
            Camion.findById.mockResolvedValue(null);

            await camionController.getCamionById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 404, message: 'Camion not found' });
            expect(next).not.toHaveBeenCalled();
        });

    });

    describe('updateCamion', () => {
        it('updates and returns camion', async () => {
            const req = { params: { id: 'id1' }, body: { marque: 'Renault' } };
            const res = mockResponse();
            Camion.findByIdAndUpdate.mockResolvedValue({ _id: 'id1', marque: 'Renault' });

            await camionController.updateCamion(req, res, next);

            expect(Camion.findByIdAndUpdate).toHaveBeenCalledWith('id1', req.body, { new: true, runValidators: true });
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, data: { _id: 'id1', marque: 'Renault' } });
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 404 when not found', async () => {
            const req = { params: { id: 'id1' }, body: {} };
            const res = mockResponse();
            Camion.findByIdAndUpdate.mockResolvedValue(null);

            await camionController.updateCamion(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 404, message: 'Camion not found' });
            expect(next).not.toHaveBeenCalled();
        });

    });

    describe('deleteCamion', () => {
        it('deletes camion when found', async () => {
            const req = { params: { id: 'id1' } };
            const res = mockResponse();
            Camion.findByIdAndDelete.mockResolvedValue({ _id: 'id1' });

            await camionController.deleteCamion(req, res, next);

            expect(Camion.findByIdAndDelete).toHaveBeenCalledWith('id1');
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, message: 'Camion deleted' });
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 404 when not found', async () => {
            const req = { params: { id: 'id1' } };
            const res = mockResponse();
            Camion.findByIdAndDelete.mockResolvedValue(null);

            await camionController.deleteCamion(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 404, message: 'Camion not found' });
            expect(next).not.toHaveBeenCalled();
        });

    });

    describe('validation middleware', () => {
        it('rejects missing required fields on create', async () => {
            const middleware = validate(createCamionSchema);
            const req = { body: { marque: 'Volvo' } }; // missing immatriculation, modele, annee
            const res = mockResponse();
            const nextFn = jest.fn();

            await middleware(req, res, nextFn);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: expect.arrayContaining([expect.any(String)]) });
            expect(nextFn).not.toHaveBeenCalled();
        });

        it('rejects lowercase immatriculation', async () => {
            const middleware = validate(createCamionSchema);
            const req = { body: { immatriculation: 'abc-123', marque: 'Volvo', modele: 'FH', annee: 2024 } };
            const res = mockResponse();
            const nextFn = jest.fn();

            await middleware(req, res, nextFn);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: expect.arrayContaining([expect.stringMatching(/uppercase/i)]) });
            expect(nextFn).not.toHaveBeenCalled();
        });
    });
});
