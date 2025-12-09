const trajetController = require('../controllers/trajetController');
const Trajet = require('../models/Trajet');
const Camion = require('../models/Camion');
const Remorque = require('../models/Remorque');
const Chauffeur = require('../models/Chauffeur');

jest.mock('../models/Trajet', () => ({
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
}));

jest.mock('../models/Camion', () => ({
    findById: jest.fn()
}));

jest.mock('../models/Remorque', () => ({
    findById: jest.fn()
}));

jest.mock('../models/Chauffeur', () => ({
    findById: jest.fn()
}));

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Trajet Controller', () => {
    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createTrajet', () => {
        it('creates a trajet without chauffeur when camion is available', async () => {
            const req = { body: { depart: 'A', arrivee: 'B', date: new Date(), camion: 'c1' } };
            const res = mockResponse();

            Camion.findById.mockResolvedValue({ statut: 'disponible', kilometrage: 1200 });
            Chauffeur.findById.mockResolvedValue(null);
            Trajet.create.mockResolvedValue({ _id: 't1', ...req.body, kilometrageDepart: 1200 });

            await trajetController.createTrajet(req, res, next);

            expect(Camion.findById).toHaveBeenCalledWith('c1');
            expect(Trajet.create).toHaveBeenCalledWith(expect.objectContaining({ kilometrageDepart: 1200 }));
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 201, data: expect.objectContaining({ _id: 't1' }) });
            expect(next).not.toHaveBeenCalled();
        });

        it('rejects when camion not available', async () => {
            const req = { body: { depart: 'A', arrivee: 'B', date: new Date(), camion: 'c1' } };
            const res = mockResponse();

            Camion.findById.mockResolvedValue({ statut: 'en_cours' });

            await trajetController.createTrajet(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 400, message: 'Camion non disponible' });
            expect(Trajet.create).not.toHaveBeenCalled();
        });

        it('rejects inactive chauffeur', async () => {
            const req = { body: { depart: 'A', arrivee: 'B', date: new Date(), camion: 'c1', chauffeur: 'ch1' } };
            const res = mockResponse();

            Camion.findById.mockResolvedValue({ statut: 'disponible', kilometrage: 500 });
            Chauffeur.findById.mockResolvedValue({ status: 'inactif' });

            await trajetController.createTrajet(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 400, message: 'Chauffeur non trouvé ou inactif' });
            expect(Trajet.create).not.toHaveBeenCalled();
        });

        it('rejects unavailable remorque', async () => {
            const req = { body: { depart: 'A', arrivee: 'B', date: new Date(), camion: 'c1', remorque: 'r1' } };
            const res = mockResponse();

            Camion.findById.mockResolvedValue({ statut: 'disponible', kilometrage: 700 });
            Chauffeur.findById.mockResolvedValue(null);
            Remorque.findById.mockResolvedValue({ statut: 'en_reparation' });

            await trajetController.createTrajet(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 400, message: 'Remorque non disponible' });
            expect(Trajet.create).not.toHaveBeenCalled();
        });
    });

    describe('updateTrajet', () => {
        it('blocks update when statut is not "à faire"', async () => {
            const req = { params: { id: 't1' }, body: { depart: 'C' } };
            const res = mockResponse();
            Trajet.findById.mockResolvedValue({ _id: 't1', statut: 'en_cours' });

            await trajetController.updateTrajet(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 400, message: 'Trajet non modifiable hors statut "à faire"' });
            expect(Trajet.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        it('rejects inactive chauffeur on update', async () => {
            const req = { params: { id: 't1' }, body: { chauffeur: 'ch1' } };
            const res = mockResponse();

            Trajet.findById.mockResolvedValue({ _id: 't1', statut: 'à faire' });
            Chauffeur.findById.mockResolvedValue({ status: 'inactif' });

            await trajetController.updateTrajet(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 400, message: 'Chauffeur non trouvé ou inactif' });
            expect(Trajet.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        it('updates when statut is "à faire" and data valid', async () => {
            const req = { params: { id: 't1' }, body: { arrivee: 'D' } };
            const res = mockResponse();

            Trajet.findById.mockResolvedValue({ _id: 't1', statut: 'à faire' });
            Trajet.findByIdAndUpdate.mockResolvedValue({ _id: 't1', arrivee: 'D' });

            await trajetController.updateTrajet(req, res, next);

            expect(Trajet.findByIdAndUpdate).toHaveBeenCalledWith('t1', { arrivee: 'D' }, { new: true, runValidators: true });
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, data: { _id: 't1', arrivee: 'D' } });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('assignChauffeur', () => {
        it('returns 404 when trajet missing', async () => {
            const req = { params: { id: 't1' }, body: { chauffeur: 'ch1' } };
            const res = mockResponse();

            Trajet.findById.mockResolvedValue(null);

            await trajetController.assignChauffeur(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 404, message: 'Trajet not found' });
        });

        it('rejects assignment when statut is not "à faire"', async () => {
            const req = { params: { id: 't1' }, body: { chauffeur: 'ch1' } };
            const res = mockResponse();

            Trajet.findById.mockResolvedValue({ _id: 't1', statut: 'en_cours' });

            await trajetController.assignChauffeur(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 400, message: 'Assignation impossible hors statut "à faire"' });
        });

        it('rejects inactive chauffeur on assignment', async () => {
            const req = { params: { id: 't1' }, body: { chauffeur: 'ch1' } };
            const res = mockResponse();

            Trajet.findById.mockResolvedValue({ _id: 't1', statut: 'à faire' });
            Chauffeur.findById.mockResolvedValue({ status: 'inactif' });

            await trajetController.assignChauffeur(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 400, message: 'Chauffeur non trouvé ou inactif' });
        });

        it('assigns active chauffeur when trajet is à faire', async () => {
            const req = { params: { id: 't1' }, body: { chauffeur: 'ch1' } };
            const res = mockResponse();
            const save = jest.fn().mockResolvedValue();

            Trajet.findById.mockResolvedValue({ _id: 't1', statut: 'à faire', save });
            Chauffeur.findById.mockResolvedValue({ _id: 'ch1', status: 'actif' });

            await trajetController.assignChauffeur(req, res, next);

            expect(save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, data: expect.objectContaining({ _id: 't1', chauffeur: 'ch1' }) });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('getTrajets', () => {
        it('returns list of trajets', async () => {
            const res = mockResponse();
            Trajet.find.mockResolvedValue([{ _id: 't1' }]);

            await trajetController.getTrajets({}, res, next);

            expect(Trajet.find).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, data: [{ _id: 't1' }] });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('deleteTrajet', () => {
        it('deletes trajet when found', async () => {
            const req = { params: { id: 't1' } };
            const res = mockResponse();

            Trajet.findByIdAndDelete.mockResolvedValue({ _id: 't1' });

            await trajetController.deleteTrajet(req, res, next);

            expect(Trajet.findByIdAndDelete).toHaveBeenCalledWith('t1');
            expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, message: 'Trajet deleted' });
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 404 when missing', async () => {
            const req = { params: { id: 't1' } };
            const res = mockResponse();

            Trajet.findByIdAndDelete.mockResolvedValue(null);

            await trajetController.deleteTrajet(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, status: 404, message: 'Trajet not found' });
            expect(next).not.toHaveBeenCalled();
        });
    });
});