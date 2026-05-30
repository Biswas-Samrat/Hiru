const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { ensureDefaultAdmin } = require('./utils/ensureAdmin');
const { ensureDefaultGallery } = require('./utils/ensureGallery');

dotenv.config();

const startServer = async () => {
  await connectDB();
  await ensureDefaultAdmin();
  await ensureDefaultGallery();
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
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/orders', require('./routes/orderRoutes')(io));
app.use('/api/reservations', require('./routes/reservationRoutes')(io));
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
