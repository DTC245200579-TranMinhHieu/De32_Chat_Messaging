const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Cấu hình kết nối PostgreSQL
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  user: process.env.POSTGRES_USER || 'chatuser',
  password: process.env.POSTGRES_PASSWORD || 'StrongPassword123!',
  database: process.env.POSTGRES_DB || 'chatdb',
  port: 5432,
});

// Khởi tạo bảng tin nhắn trong PostgreSQL
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        room VARCHAR(50) DEFAULT 'phong-chat-chung',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS room VARCHAR(50) DEFAULT 'phong-chat-chung';
    `);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};
initDb();

app.use(express.static('public'));

// Quản lý danh sách người dùng trực tuyến
const onlineUsers = new Map(); // socket.id -> { username, room }

const broadcastRoomUsers = (room) => {
  const usersInRoom = Array.from(onlineUsers.values())
    .filter(u => u.room === room)
    .map(u => u.username);
  io.to(room).emit('room_users', usersInRoom);
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Xử lý khi User gia nhập phòng
  socket.on('join_room', async ({ username, room }) => {
    socket.leaveAll();
    socket.join(room);

    onlineUsers.set(socket.id, { username, room });
    socket.currentRoom = room;
    socket.username = username;

    // Lấy lịch sử tin nhắn trong phòng
    try {
      const res = await pool.query(
        'SELECT sender, content, created_at FROM messages WHERE room = $1 ORDER BY created_at ASC LIMIT 50',
        [room]
      );
      socket.emit('chat_history', res.rows);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }

    // Gửi thông báo hệ thống & cập nhật danh sách Online Users
    socket.to(room).emit('system_message', {
      content: `👋 ${username} đã tham gia phòng.`,
      created_at: new Date()
    });
    broadcastRoomUsers(room);
  });

  // Xử lý gửi tin nhắn
  socket.on('send_message', async (data) => {
    const room = socket.currentRoom || 'phong-chat-chung';
    const { sender, content } = data;

    try {
      const res = await pool.query(
        'INSERT INTO messages (sender, content, room) VALUES ($1, $2, $3) RETURNING created_at',
        [sender, content, room]
      );
      const createdAt = res.rows[0].created_at;

      io.to(room).emit('receive_message', {
        sender,
        content,
        created_at: createdAt
      });
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  // Xử lý trạng thái Đang gõ tin nhắn (Typing)
  socket.on('typing', (isTyping) => {
    if (socket.currentRoom) {
      socket.to(socket.currentRoom).emit('user_typing', {
        username: socket.username,
        isTyping
      });
    }
  });

  // Xử lý khi Ngắt kết nối
  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      onlineUsers.delete(socket.id);
      socket.to(user.room).emit('system_message', {
        content: `🚪 ${user.username} đã rời khỏi phòng.`,
        created_at: new Date()
      });
      broadcastRoomUsers(user.room);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});