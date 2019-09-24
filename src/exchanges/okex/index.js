const _ = require('lodash');
const crc32 = require('crc-32');
const CryptoJS = require('crypto-js');
const BaseWebsocketClient = require('../BaseWebsocketClient');

class WebsocketClient extends BaseWebsocketClient {

  constructor(data = {}) {
    super(_.assign({}, { websocketUrl: 'wss://real.okex.com:8443/ws/v3', pingInterval: 5000 }, data));
  }

  login() {
    const timestamp = Date.now() / 1000;
    const str = timestamp + 'GET/users/self/verify';
    const request = JSON.stringify({
      op: 'login',
      args: [
        this.apiKey,
        this.passphrase,
        timestamp.toString(),
        CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(str, this.secretKey))
      ]
    });
    this.socket.send(request);
  }

  subscribe(...args) {
    this.send({ op: 'subscribe', args });
  }

  unsubscribe(...args) {
    this.send({ op: 'unsubscribe', args });
  }
  
  // 循环冗余校验, 目前该算法有问题
  checksum(data) {
    if (data == null) {
      return false;
    }
    let result = data;
    if (typeof data === 'string') {
      result = JSON.parse(data);
    }
    if (result.data && result.data.length > 0) {
      const item = result.data[0];
      const buff = [];
      for (let i = 0; i < 25; i++) {
        if (item.bids[i]) {
          const bid = item.bids[i];
          buff.push(...bid);
        }
        if (item.asks[i]) {
          const ask = item.asks[i];
          buff.push(...ask);
        }
      }
      let checksum = crc32.str(buff.join(':'));
      if (checksum === item.checksum) {
        return true;
      }
    }
    return false;
  }
}

module.exports = WebsocketClient;