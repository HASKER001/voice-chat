const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);
  });
});

// Пинг самого себя каждые 10 минут, чтобы Render не спал
setInterval(() => {
  const url = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`;
  if (process.env.RENDER_EXTERNAL_HOSTNAME) {
    axios.get(url).then(() => console.log('Keep-alive ping sent')).catch(e => console.log('Ping error'));
  }
}, 600000);

server.listen(process.env.PORT || 3000);
