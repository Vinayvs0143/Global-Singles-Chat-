const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static('public'));

let waiting = null;
io.on('connection', socket => {
  if (waiting) {
    const partner = waiting; waiting = null;
    const room = socket.id + '#' + partner.id;
    socket.join(room); partner.join(room);
    socket.emit('matched');
    partner.emit('matched');
  } else waiting = socket;

  socket.on('message', ({ text }) =>
    io.to([...socket.rooms][1]).emit('message', { text })
  );

  socket.on('typing', () =>
    socket.broadcast.emit('typing')
  );
  socket.on('stop_typing', () =>
    socket.broadcast.emit('stop_typing')
  );

  socket.on('disconnect', () =>
    socket.broadcast.emit('partner_disconnected')
  );
});

server.listen(3000, () => console.log('Listening on port 3000'));
