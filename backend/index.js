const express = require('express');
const http = require('http');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const cors = require('cors');
require('dotenv').config();

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Document = require('./models/Document'); // <-- Make sure you created this file as shown below

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('API is working with Socket.IO');
});

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',  // Set to trusted domain(s) before deploying to production
    methods: ['GET', 'POST'],
  }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth && socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// Default document content (for new docs)
const DEFAULT_DATA = { ops: [{ insert: '\n' }] };

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.user.username, socket.id);

  // Handle joining a document
  socket.on('join-document', async (documentId) => {
    socket.join(documentId);

    // Get or create the document in MongoDB
    let document = await Document.findById(documentId);
    if (!document) {
      document = await Document.create({ _id: documentId, data: DEFAULT_DATA });
    }

    // Send initial document contents to the user
    socket.emit('load-document', document.data);

    // Handle incoming document changes
    socket.on('send-changes', ({ delta }) => {
      // Broadcast changes to all other users in the room
      socket.to(documentId).emit('receive-changes', delta);
    });

    // Handle document save requests from clients
    socket.on('save-document', async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔴 User disconnected: ${socket.user?.username || socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
