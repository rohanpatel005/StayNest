const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use(async (socket, next) => {
    try {
      // The token can be passed in auth or headers
      const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('token=')[1]?.split(';')[0];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user._id})`);

    // Join a conversation room securely
    socket.on('join_conversation', async ({ conversationId }) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        // Verify user is part of the conversation
        if (
          conversation.guest.toString() !== socket.user._id.toString() &&
          conversation.host.toString() !== socket.user._id.toString()
        ) {
          return socket.emit('error', 'Unauthorized to join this conversation');
        }

        socket.join(`conversation:${conversationId}`);
        console.log(`${socket.user.name} joined conversation:${conversationId}`);
      } catch (err) {
        console.error('Error joining conversation:', err);
      }
    });

    // Handle sending message
    socket.on('send_message', async ({ conversationId, content }) => {
      try {
        if (!content || !content.trim()) return;
        if (content.length > 2000) {
          return socket.emit('message_error', 'Message is too long. Maximum 2000 characters allowed.');
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return socket.emit('message_error', 'Conversation not found');
        }

        // Verify user is part of conversation
        if (
          conversation.guest.toString() !== socket.user._id.toString() &&
          conversation.host.toString() !== socket.user._id.toString()
        ) {
          return socket.emit('message_error', 'Unauthorized to send message in this conversation');
        }

        const isGuest = socket.user._id.toString() === conversation.guest.toString();
        const receiverId = isGuest ? conversation.host : conversation.guest;
        const senderRole = isGuest ? 'guest' : 'host';

        const newMessage = await Message.create({
          conversation: conversation._id,
          sender: socket.user._id,
          receiver: receiverId,
          senderRole,
          content: content.trim(),
          messageType: 'TEXT',
          isRead: false
        });

        conversation.lastMessage = content.trim();
        conversation.lastMessageAt = Date.now();
        await conversation.save();

        // Broadcast to everyone in the room (including the sender, so they get the DB ID/timestamp)
        io.to(`conversation:${conversationId}`).emit('new_message', {
          _id: newMessage._id,
          conversation: conversationId,
          sender: socket.user._id,
          receiver: receiverId,
          senderRole,
          content: newMessage.content,
          messageType: newMessage.messageType,
          isRead: newMessage.isRead,
          createdAt: newMessage.createdAt,
        });

      } catch (err) {
        console.error('Send message error:', err);
        socket.emit('message_error', 'Failed to send message');
      }
    });

    socket.on('typing_start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing_start', {
        userId: socket.user._id,
        name: socket.user.name,
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing_stop', {
        userId: socket.user._id,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIO };
