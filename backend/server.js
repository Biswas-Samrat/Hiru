const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { ensureDefaultAdmin } = require('./utils/ensureAdmin');
const { ensureDefaultGallery } = require('./utils/ensureGallery');
const { startExpiredOrderCleanup } = require('./utils/cleanupExpiredOrders');
const { verifySMTP } = require('./config/mailer');

dotenv.config();

const startServer = async () => {
  await connectDB();
  await ensureDefaultAdmin();
  await ensureDefaultGallery();
  verifySMTP();
  startExpiredOrderCleanup(); // sweep abandoned PENDING_STRIPE orders every 5 min
};
startServer();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST"]
  }
});

app.use(cors());

const stripeWebhookHandler = (req, res) => {
  require('./controllers/paymentController').handleWebhook(req, res, io);
};

// Stripe webhooks need the raw body to verify signatures. Keep these routes
// before express.json(). Use /api/webhook with Stripe CLI:
// stripe listen --forward-to localhost:5000/api/webhook
app.post('/api/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

app.use(express.json());

// Routes
app.use('/api/payments', require('./routes/paymentRoutes')(io));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/orders', require('./routes/orderRoutes')(io));
app.use('/api/order-history', require('./routes/orderHistoryRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes')(io));
app.use('/api/reservations', require('./routes/bookingRoutes')(io));
app.use('/api/reservation-history', require('./routes/reservationHistoryRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes')(io));
app.use('/api/gallery', require('./routes/galleryRoutes'));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinOrder', (orderId) => {
    socket.join(orderId);
    console.log(`User joined order room: ${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
