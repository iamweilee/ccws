/**
 * listenKey 过期推送
 * 当前连接使用的有效listenKey过期时，user data stream 将会推送此事件。
 * 注意:
 * 1. 此事件与websocket连接中断没有必然联系
 * 2. 只有正在连接中的有效listenKey过期时才会收到此消息
 * 3. 收到此消息后user data stream将不再更新，直到用户使用新的有效的listenKey
 * --------------------------------------------
 * Balance和Position更新推送
 * 账户更新事件的事件类型固定为 ACCOUNT_UPDATE
 * 当账户信息有变动时，会推送此事件
 * --------------------------------------------
 * 订单/交易 更新推送
 * 当有新订单创建、订单有新成交或者新的状态变化时会推送此类事件 事件类型统一为 ORDER_TRADE_UPDATE
 * 
 * 订单方向
 * 1. BUY 买入
 * 2. SELL 卖出
 * 
 * 订单类型
 * 1. MARKET 市价单
 * 2. LIMIT 限价单
 * 3. STOP 止损单
 * 4. TAKE_PROFIT 止盈单
 * 
 * 本次事件的具体执行类型
 * 1. NEW
 * 2. PARTIAL_FILL 部分成交
 * 3. FILL 成交
 * 4. CANCELED 已撤
 * 5. REJECTED 拒绝订单
 * 6. CALCULATED 强平单
 * 7. EXPIRED 订单失效
 * 8. TRADE 交易
 * 9. RESTATED
 * 
 * 订单状态
 * 1. NEW
 * 2. PARTIALLY_FILLED
 * 3. FILLED
 * 4. CANCELED
 * 5. REPLACED
 * 6. STOPPED
 * 7. REJECTED
 * 8. EXPIRED
 * 9. NEW_INSURANCE 风险保障基金（强平）
 * 10. NEW_ADL 自动减仓序列（强平）
 * 
 * 有效方式:
 * 1. GTC
 * 2. IOC
 * 3. FOK
 * 4. GTX
 */
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
