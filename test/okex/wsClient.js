const ws = require('../../src');
const { apiConf } = require('./config');

let wss = new ws.okex(apiConf);

wss.connect();

wss.on('open', data=>{
    console.log("websocket open!!!");
    wss.login();
    // wss.subscribe({ op: 'subscribe', args: ['swap/depth:BTC-USD-SWAP']});
});
wss.on('message', wsMessage);
wss.on('loginSuccess', loginSuccess);

function loginSuccess() {
    console.log('login success')
    //wss.subscribe('swap/account:BTC-USD-SWAP');
    //wss.unsubscribe('swap/position:BTC-USD-SWAP');
    // wss.subscribe({"op": "subscribe", "args": ["futures/position:BTC-USD-191101"]});
    // wss.subscribe({"op": "subscribe", "args": ["futures/account:BTC"]});
    wss.subscribe({"op": "subscribe", "args": ["futures/order:BTC-USD-191101"]});
    
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