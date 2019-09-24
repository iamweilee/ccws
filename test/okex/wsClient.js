const { okex } = require('../../src');
const { apiConf } = require('./config');

let wss = new okex(apiConf);

wss.on('open', data=>{
    console.log("websocket open!!!");
    wss.login();
    wss.subscribe('swap/depth:BTC-USD-SWAP');
   
});
wss.on('message', wsMessage);


function loginSuccess() {
    console.log('login success')
    //wss.subscribe('swap/account:BTC-USD-SWAP');
    //wss.unsubscribe('swap/position:BTC-USD-SWAP');
}

//websocket 返回消息
function wsMessage(data){
    console.log(`!!! websocket message =${data}`);
    var obj = JSON.parse(data);
    var eventType = obj.event;
    if (eventType == 'login'){
        //登录消息
        if (obj.success == true){
           loginSuccess();
        }
    }
    else if (eventType == undefined){
        //行情消息相关
        tableMsg(obj);
        // let checked = wss.checksum(obj);
        // console.log('checksum result: ', checked);
    }
}

function tableMsg(marketData) {
    var tableType = marketData.table;
    if (tableType != undefined) {
        //行情数据
        var asks = marketData.data[0].asks;
        var bids = marketData.data[0].bids;
    }
}