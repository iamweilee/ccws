'use strict';
const ws = require('../../src');

var client = new ws.bitmex({testnet: true});

client.addStream('XBTUSD', 'quote', function(data, symbol, table) {
  console.log('Update on ' + table + ':' + symbol + '. New data:\n', data, '\n');
});

client.on('error', function(e) {
  console.error('Received error:', e);
});
