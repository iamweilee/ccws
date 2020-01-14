const _ = require('lodash');
const crc32 = require('crc-32');
const pako = require('pako');
// const CryptoJS = require('crypto-js');
const crypto = require('crypto');
const BaseWebsocketClient = require('../BaseWebsocketClient');

class WebsocketClient extends BaseWebsocketClient {

  constructor(data = {}) {
    super(_.assign({}, { websocketUrl: 'wss://real.okex.com:8443/ws/v3' }, data));
    this.pingTimer = null;
    this.pingInterval = data.pingInterval || 5000; // ping服务器的时间间隔, 单位: ms
  }

  login() {
    const timestamp = Date.now() / 1000;
    const str = timestamp + 'GET/users/self/verify';
    const hmac = crypto.createHmac('sha256', this.secretKey);
    const request = JSON.stringify({
      op: 'login',
      args: [
        this.apiKey,
        this.passphrase,
        timestamp.toString(),
        hmac.update(str).digest('base64')
        // CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(str, this.secretKey))
      ]
    });
    this.socket.send(request);
  }

  subscribe(req) {
    this.send(req);
  }

  unsubscribe(req) {
    this.send(req);
  }

  onOpen() {
    console.log(`Connected to ${this.websocketUrl}`);
    this.initPingTimer();
    this.emit('open');
  }

  onClose(code, reason) {
    console.log(`Websocket connection is closed.code=${code},reason=${reason}`);
    this.socket = null;
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    this.emit('close', {code, reason});
  }

  onMessage(data) {
    this.resetPingTimer();
    data = pako.inflateRaw(data, { to: 'string' });
    if (data !== 'pong') {
      data = JSON.parse(data);
      if (data.event !== 'login') {
        this.emit('message', data);
      }
      else {
        if (data.success) {
          this.emit('loginSuccess', data);
        }
        else {
          console.log('Websocket login Failed.');
          this.emit('loginFailed', data);
        }
      }
    }
  }

  close() {
    if (this.socket) {
      console.log(`Closing websocket connection...`);
      this.socket.close();
      if (this.pingTimer) {
        clearInterval(this.pingTimer);
        this.pingTimer = null;
      }
      this.socket = null;
    }
  }

  initPingTimer() {
    this.pingTimer = setTimeout(() => {
      this.socket && this.socket.send('ping');
    }, this.pingInterval);
  }

  resetPingTimer() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
      this.initPingTimer();
    }
  }
  
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
          buff.push(bid[0]);
          buff.push(bid[1]);
        }
        if (item.asks[i]) {
          const ask = item.asks[i];
          buff.push(ask[0]);
          buff.push(ask[1]);
        }
      }
      const checksum = crc32.str(buff.join(':'));
      if (checksum === item.checksum) {
        return true;
      }
    }
    return false;
  }
}

module.exports = WebsocketClient;