const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 80 });

server.on('connection', function connection(socket) {
  console.log('ws server connected.');
  socket.on('message', function incoming(message) {
    let data = parse(message);
    console.log('ws server received: %j, timeDiff: %s', data, Data.now() - data.clientTimestamp);
    socket.send(stringify({ data: { text: 'Hello Client' }, serverTimestamp: Date.now(), clientTimestamp: data.clientTimestamp }));
  });

  socket.send(stringify({ data: { text: 'Hello Client' }, serverTimestamp: Date.now() }));
});

function stringify(data) {
  return JSON.stringify(data);
}

function parse(str) {
  return JSON.parse(str);
}