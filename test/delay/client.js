const WebSocket = require('ws');

const ws = new WebSocket('ws://47.74.4.112');

ws.on('open', function open() {
  console.log('ws client connected');
  ws.send(stringify({ data: { text: 'Hello Server' }, clientTimestamp: Date.now() }));
});

ws.on('close', function close() {
  console.log('ws client disconnected');
});

ws.on('message', function incoming(message) {
  let data = parse(message);
  console.log(`ws client receive message: %j, timeDelay: %s`, data, Date.now() - data.clientTimestamp);

  setInterval(function timeout() {
    ws.send(stringify({ data: { text: 'Hello Server' }, clientTimestamp: Date.now() }));
  }, 10000);
});

function stringify(data) {
  return JSON.stringify(data);
}

function parse(str) {
  return JSON.parse(str);
}