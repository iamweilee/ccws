const _ = require('lodash');
const moment = require('moment');
const pako = require('pako');
const CryptoJS = require('crypto-js');
const BaseWebsocketClient = require('../BaseWebsocketClient');

class WebsocketClient extends BaseWebsocketClient {

  constructor(data = {}) {
    super(_.assign({}, { websocketUrl: 'wss://api.huobi.pro/ws', pingInterval: 5000 }, data));
    this.host = "api.huobi.pro";
    this.uri = "/ws/v1"
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
    data.op = 'auth';
    this.send(data);
  }

  subscribe(args) {
    this.send({ op: 'sub', ...args });
  }

  unsubscribe(args) {
    this.send({ op: 'unsub', ...args });
  }
  
  onOpen() {
    console.log(`Connected to ${this.websocketUrl}`);
    this.login();
    this.emit('open');
  }

  onClose() {
    console.log(`Websocket connection is closed.code=${code},reason=${reason}`);
    this.socket = null;
    this.emit('close');
  }

  onMessage(data) {
    let text = pako.inflate(data, {
      to: 'string'
    });
    let msg = JSON.parse(text);
    if (msg.ping) {
      this.send({
        pong: msg.ping
      });
    }

    this.emit('message', msg);
  }

/**
 * 签名计算
 * @param method
 * @param host
 * @param path
 * @param data
 * @returns {*|string}
 */
  signSha(method, host, path, data) {
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
