const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { path: '/socket.io/' });

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  user: process.env.POSTGRES_USER || 'chatuser',
  password: process.env.POSTGRES_PASSWORD || 'StrongPass123!',
  database: process.env.POSTGRES_DB || 'chatdb',
  port: 5432,
});

// Khởi tạo bảng dữ liệu tin nhắn
pool.query(`
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender VARCHAR(50),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).catch(err => console.error('Lỗi khởi tạo DB:', err));

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Người dùng mới kết nối:', socket.id);

  // Lấy lịch sử tin nhắn
  pool.query('SELECT * FROM messages ORDER BY created_at ASC LIMIT 50')
    .then(res => socket.emit('chat_history', res.rows));

  socket.on('send_message', (data) => {
    const { sender, content } = data;
    pool.query('INSERT INTO messages (sender, content) VALUES ($1, $2) RETURNING *', [sender, content])
      .then(res => io.emit('receive_message', res.rows[0]));
  });
});

server.listen(3000, () => {
  console.log('Chat Server đang chạy tại port 3000');
});