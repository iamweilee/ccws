/**
 * 所有websocket接口客户端基类
 */
const { EventEmitter } = require('events');
const WebSocket = require('ws');
const SocksProxyAgent = require('socks-proxy-agent');
const HttpsProxyAgent = require('https-proxy-agent');
const { MethodNotImplementError } = require('../util/error');

class BaseWebsocketClient extends EventEmitter {
  
  constructor({ apiKey, secretKey, passphrase, websocketUrl, proxy = {} }) {
    super();

    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.passphrase = passphrase;

    this.websocketUrl = websocketUrl;
    this.proxy = proxy;
    this.socket = null;
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

  subscribe(req) {
    throw new MethodNotImplementError('subscribe not implement');
  }

  unsubscribe(req) {
    throw new MethodNotImplementError('unsubscribe not implement');
  }

  onOpen() {
    throw new MethodNotImplementError('onOpen not implement');
  }

  onClose(code, reason) {
    throw new MethodNotImplementError('onClose not implement');
  }

  onMessage(data) {
    throw new MethodNotImplementError('onMessage not implement');
  }

  send(messageObject) {
    this.socket.send(JSON.stringify(messageObject));
  }

  close() {
    throw new MethodNotImplementError('close not implement');
  }

}

module.exports = BaseWebsocketClient;