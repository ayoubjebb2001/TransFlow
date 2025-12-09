require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const errorHandler = require('./middlewares/error');
const auth = require('./middlewares/auth');
const admin = require('./middlewares/admin');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const camionRoutes = require('./routes/camionRoutes');
const remorqueRoutes = require('./routes/remorqueRoutes');
const pneuRoutes = require('./routes/pneuRoutes');
const trajetRoutes = require('./routes/trajetRoutes');

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin/camions', auth, admin, camionRoutes);
app.use('/api/admin/remorques', auth, admin, remorqueRoutes);
app.use('/api/admin/pneus', auth, admin, pneuRoutes);
app.use('/api/admin/trajets', auth, admin, trajetRoutes);

app.route('/api/protected').get(auth, (req, res) => {
    res.send('Protected route');
});

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (err) {
        console.error('Startup error:', err.message);
        process.exit(1);
    }
}

app.use(errorHandler);
start();

module.exports = app;

