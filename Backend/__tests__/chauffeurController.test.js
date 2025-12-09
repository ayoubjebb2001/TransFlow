const chauffeurController = require('../controllers/chauffeurController');
const Chauffeur = require('../models/Chauffeur');
const User = require('../models/User');

jest.mock('../models/Chauffeur', () => ({
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn()
}));

jest.mock('../models/User', () => ({
    findByIdAndDelete: jest.fn()
}));

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Chauffeur Controller', () => {
    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('listChauffeurs', () => {
        it('returns list', async () => {
            const res = mockResponse();
            Chauffeur.find.mockReturnValue({ populate: jest.fn().mockResolvedValue([{ _id: 'c1' }]) });

            await chauffeurController.listChauffeurs({}, res, next);

            expect(Chauffeur.find).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, data: [{ _id: 'c1' }] });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('updateChauffeur', () => {
        it('updates and returns chauffeur', async () => {
            const req = { params: { id: 'c1' }, body: { status: 'inactif' } };
            const res = mockResponse();
            Chauffeur.findByIdAndUpdate.mockReturnValue({ populate: jest.fn().mockResolvedValue({ _id: 'c1', status: 'inactif' }) });

            await chauffeurController.updateChauffeur(req, res, next);

            expect(Chauffeur.findByIdAndUpdate).toHaveBeenCalledWith('c1', req.body, { new: true, runValidators: true, context: 'query' });
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, data: { _id: 'c1', status: 'inactif' } });
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 404 when not found', async () => {
            const req = { params: { id: 'c1' }, body: {} };
            const res = mockResponse();
            Chauffeur.findByIdAndUpdate.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

            await chauffeurController.updateChauffeur(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 404, message: 'Chauffeur not found' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('deleteChauffeur', () => {
        it('deletes chauffeur and linked user', async () => {
            const req = { params: { id: 'c1' } };
            const res = mockResponse();
            Chauffeur.findById.mockResolvedValue({ _id: 'c1', user: 'u1' });
            Chauffeur.findByIdAndDelete.mockResolvedValue({});
            User.findByIdAndDelete.mockResolvedValue({});

            await chauffeurController.deleteChauffeur(req, res, next);

            expect(Chauffeur.findById).toHaveBeenCalledWith('c1');
            expect(User.findByIdAndDelete).toHaveBeenCalledWith('u1');
            expect(Chauffeur.findByIdAndDelete).toHaveBeenCalledWith('c1');
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, message: 'Chauffeur deleted' });
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 404 when chauffeur missing', async () => {
            const req = { params: { id: 'c1' } };
            const res = mockResponse();
            Chauffeur.findById.mockResolvedValue(null);

            await chauffeurController.deleteChauffeur(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 404, message: 'Chauffeur not found' });
            expect(next).not.toHaveBeenCalled();
        });
    });
});
