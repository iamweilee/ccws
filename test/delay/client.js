const WebSocket = require('ws');

const ws = new WebSocket('ws://47.74.4.112');

ws.on('open', function open() {
  console.log('ws client connected');
  ws.send(stringify({ data: { text: 'Hello Server' }, clientTimestamp: Date.now() }));
});

ws.on('close', function close() {
  console.log('ws client disconnected');
});

ws.on('message', async function incoming(message) {
  let data = parse(message);
  console.log(`ws client receive message: %j, 2d timeDelay: %s, 1d timeDelay: %s`, data, Date.now() - data.clientTimestamp, Date.now() - data.serverTimestamp);
  await sleep(10000);
  ws.send(stringify({ data: { text: 'Hello Server' }, clientTimestamp: Date.now() }));
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function stringify(data) {
  return JSON.stringify(data);
}

function parse(str) {
  return JSON.parse(str);
}