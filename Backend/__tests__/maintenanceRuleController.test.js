const maintenanceRuleController = require('../controllers/maintenanceRuleController');
const MaintenanceRule = require('../models/MaintenanceRule');

jest.mock('../models/MaintenanceRule', () => ({
    create: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
}));

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('MaintenanceRule Controller', () => {
    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('creates a rule', async () => {
        const req = { body: { type: 'pneus', label: 'Rotation', periodiciteKm: 10000 } };
        const res = mockResponse();
        MaintenanceRule.create.mockResolvedValue({ _id: 'r1', ...req.body });

        await maintenanceRuleController.createRule(req, res, next);

        expect(MaintenanceRule.create).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ success: true, status: 201, data: expect.objectContaining({ _id: 'r1' }) });
    });

    it('lists rules', async () => {
        const req = {};
        const res = mockResponse();
        MaintenanceRule.find.mockResolvedValue([{ _id: 'r1' }]);

        await maintenanceRuleController.listRules(req, res, next);

        expect(MaintenanceRule.find).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, data: [{ _id: 'r1' }] });
    });

    it('updates rule', async () => {
        const req = { params: { id: 'r1' }, body: { label: 'Update' } };
        const res = mockResponse();
        MaintenanceRule.findByIdAndUpdate.mockResolvedValue({ _id: 'r1', label: 'Update' });

        await maintenanceRuleController.updateRule(req, res, next);

        expect(MaintenanceRule.findByIdAndUpdate).toHaveBeenCalledWith('r1', req.body, { new: true, runValidators: true });
        expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, data: { _id: 'r1', label: 'Update' } });
    });

    it('returns 404 on missing rule update', async () => {
        const req = { params: { id: 'r1' }, body: {} };
        const res = mockResponse();
        MaintenanceRule.findByIdAndUpdate.mockResolvedValue(null);

        await maintenanceRuleController.updateRule(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, status: 404, message: 'Règle non trouvée' });
    });

    it('deletes rule', async () => {
        const req = { params: { id: 'r1' } };
        const res = mockResponse();
        MaintenanceRule.findByIdAndDelete.mockResolvedValue({ _id: 'r1' });

        await maintenanceRuleController.deleteRule(req, res, next);

        expect(MaintenanceRule.findByIdAndDelete).toHaveBeenCalledWith('r1');
        expect(res.json).toHaveBeenCalledWith({ success: true, status: 200, message: 'Règle supprimée' });
    });

    it('returns 404 on delete missing', async () => {
        const req = { params: { id: 'r1' } };
        const res = mockResponse();
        MaintenanceRule.findByIdAndDelete.mockResolvedValue(null);

        await maintenanceRuleController.deleteRule(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, status: 404, message: 'Règle non trouvée' });
    });
});