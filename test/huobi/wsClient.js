const ws = require('../../src');
const { apiConf } = require('./config');

let wss = new ws.huobi({ ...apiConf, websocketUrl: apiConf.signRequiredWebsocketUrl });

wss.connect();

wss.on('open', data=>{
    console.log("websocket open!!!");
    wss.login();
    // wss.subscribe({
    //   "sub": "market.BTC_CQ.depth.step0",
    //   "id": "id1"
    // });
    // wss.subscribe({
    //   "sub": "market.BTC_CQ.kline.1min",
    //   "id": "id1"
    // });
    // wss.subscribe({
    //   "sub": "market.BTC_CQ.detail",
    //   "id": "id6"
    // });
    // wss.subscribe({
    //   "req": "market.BTC_CQ.trade.detail",
    //   "id": "id8"
    // });
    // wss.subscribe({
    //   "sub": "market.BTC_CQ.trade.detail",
    //   "id": "id7"
    // });
    
});
wss.on('message', wsMessage);
wss.on('loginSuccess', loginSuccess);

function loginSuccess() {
    console.log('login success')
    //wss.subscribe('swap/account:BTC-USD-SWAP');
    //wss.unsubscribe('swap/position:BTC-USD-SWAP');
    wss.subscribe({
      "op": "sub",
      "cid": "40sG903yz80oDFWr",
      "topic": "orders.btc"
    });
}

//websocket 返回消息
function wsMessage(data){
    console.log(`!!! websocket message =${JSON.stringify(data)}`);
    tableMsg(data);
}

function tableMsg(marketData) {
    var tableType = marketData.table;
    if (tableType != undefined) {
        //行情数据
        var asks = marketData.data[0].asks;
        var bids = marketData.data[0].bids;
    }
}