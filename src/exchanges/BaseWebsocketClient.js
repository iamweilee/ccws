/**
 * 所有websocket接口客户端基类
 */
const { EventEmitter } = require('events');
const WebSocket = require('ws');
const pako = require('pako');
const SocksProxyAgent = require('socks-proxy-agent');
const HttpsProxyAgent = require('https-proxy-agent');
const { MethodNotImplementError } = require('../util/error');

class BaseWebsocketClient extends EventEmitter {
  
  constructor({ apiKey, secretKey, passphrase, websocketUrl, pingInterval = 5000, proxy = {} }) {
    super();

    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.passphrase = passphrase;

    this.websocketUrl = websocketUrl;
    this.pingInterval = pingInterval; // ping服务器的时间间隔, 单位: ms
    this.proxy = proxy;

    this.socket = null;
    this.pingTimer = null;

    this.connect();
  }

  connect() {
    this.socket && this.socket.close();

    let proxy = this.proxy;
    const wsConf = {};

    if (proxy.enable) {
      let sProxy = `${proxy.protocol}://${proxy.host}:${proxy.port}`;
      // let parsed = url.parse(sProxy);
      let agent;

      if (/http|https/.test(proxy.protocol)) {
        agent = new HttpsProxyAgent(sProxy);
      }
      else if (/socks|sock4|sock5/.test(proxy.protocol)) {
        agent = new SocksProxyAgent(sProxy);
      }

      wsConf.agent = agent;
      console.log('Will create ws instance with proxy: ', sProxy);
    }

    this.socket = new WebSocket(this.websocketUrl, wsConf);
    console.log(`Connecting to ${this.websocketUrl}`);

    this.socket.on('open', () => this.onOpen());
    this.socket.on('close', (code, reason) => this.onClose(code, reason));
    this.socket.on('message', data => this.onMessage(data));
  }

  login() {
    throw new MethodNotImplementError('login not implement');
  }

  subscribe(...args) {
    throw new MethodNotImplementError('subscribe not implement');
  }

  unsubscribe(...args) {
    throw new MethodNotImplementError('unsubscribe not implement');
  }

  onOpen() {
    console.log(`Connected to ${this.websocketUrl}`);
    this.initPingTimer();
    this.emit('open');
  }

  onClose() {
    console.log(`Websocket connection is closed.code=${code},reason=${reason}`);
    this.socket = null;
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    this.emit('close');
  }

  onMessage(data) {
    this.resetPingTimer();
    if (typeof data !== 'string') {
      data = pako.inflateRaw(data, { to: 'string' });
    }
    if (data === 'pong') {
      return;
    }
    this.emit('message', data);
  }

  send(messageObject) {
    this.socket.send(JSON.stringify(messageObject));
  }

  initPingTimer() {
    this.pingTimer = setInterval(() => {
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

}

module.exports = BaseWebsocketClient;