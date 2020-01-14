const _ = require('lodash');
const crypto = require('crypto');
const BaseWebsocketClient = require('../BaseWebsocketClient');

class WebsocketClient extends BaseWebsocketClient {

  constructor(data = {}) {
    data = _.assign({}, { websocketUrl: 'wss://stream.binance.com:9443/ws' }, data);
    super(data);
    const pathList = data.websocketUrl.match(/wss?:\/\/([^/]+)((?:\/.+)*)/);
    this.host = pathList[1];
    this.uri = pathList[2];
  }

  login() {
    const timestamp = moment.utc().format('YYYY-MM-DDTHH:mm:ss');

    const data = {
      AccessKeyId: this.apiKey,
      SignatureMethod: 'HmacSHA256',
      SignatureVersion: '2',
      Timestamp: timestamp,
    };

    //计算签名
    data.Signature = this.signSha('GET', this.host, this.uri, data);
    // data.Signature = this.signSha('GET', this.host, this.uri);
    data.op = 'auth';
    data.type = 'api';
    this.send(data);
  }

  subscribe(req) {
    this.send(req);
  }

  unsubscribe(req) {
    this.send(req);
  }
  
  onOpen() {
    console.log(`Connected to ${this.websocketUrl}`);
    this.emit('open');
  }

  onClose(code, reason) {
    console.log(`Websocket connection is closed.code=${code},reason=${reason}`);
    this.socket = null;
    this.emit('close', {code, reason});
  }

  onMessage(data) {
    let text = pako.inflate(data, {
      to: 'string'
    });
    let msg = JSON.parse(text);

    if (msg.op !== 'ping') {
      if (msg.op !== 'auth' && !msg.ping) {
        this.emit('message', msg);
      }
      else if (msg.ping) {
        this.send({
          pong: msg.ping
        });
      }
      else if (msg.op === 'auth') {
        if (msg['err-code'] === 0) {
          this.emit('loginSuccess', msg);
        }
        else {
          console.log('Websocket login Failed.');
          this.emit('loginFailed', msg);
        }
      }
    }
    else {
      this.send({
        op: 'pong',
        ts: msg.ts
      });
    }
  }

  close() {
    if (this.socket) {
      console.log(`Closing websocket connection...`);
      this.socket.close();
      this.socket = null;
    }
  }

/**
 * 签名计算
 * @param method
 * @param host
 * @param path
 * @param data
 * @returns {*|string}
 */
  signSha(method, host, path, data = {}) {
    const pars = [];

    //将参数值 encode
    for (let item in data) {
      pars.push(item + '=' + encodeURIComponent(data[item]));
    }

    //排序 并加入&连接
    const p = pars.sort().join('&');

    // 在method, host, path 后加入\n
    const meta = [method, host, path, p].join('\n');

    //用HmacSHA256 进行加密
    const hash = CryptoJS.HmacSHA256(meta, this.secretKey);
    // 按Base64 编码 字符串
    const Signature = CryptoJS.enc.Base64.stringify(hash);
    // console.log(p);
    return Signature;
  }

}

module.exports = WebsocketClient;
