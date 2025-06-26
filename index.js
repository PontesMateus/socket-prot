const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const JWT_SECRET = process.env.TOKEN_SECRET;

app.use(express.static(path.join(__dirname, 'public')));

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Token não fornecido'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    return next(new Error('Token inválido'));
  }
});

io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  socket.on('set username', (username) => {
    users[socket.id] = username;
    console.log(`👤 ${username} conectado (${socket.id})`);
  });

  socket.on('chat message', (msg) => {
    const sender = users[socket.id] || 'Anônimo';
    io.emit('chat message', { user: sender, text: msg });
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    console.log(`${username || 'Usuário'} desconectado`);
    delete users[socket.id];
  });
});

server.listen(3223, () => {
  console.log('Local server: http://localhost:3223');
});