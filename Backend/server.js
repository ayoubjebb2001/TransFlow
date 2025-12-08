require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const errorHandler = require('./middlewares/error');
const auth = require('./middlewares/auth');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

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

