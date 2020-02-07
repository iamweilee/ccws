const ws = require('../../src');
const { apiConf } = require('./config');

let wss = new ws.binance(apiConf);
wss.connect();

wss.on('open', data=>{
    console.log("websocket open!!!");
    
    
});
wss.on('message', wsMessage);
wss.on('loginSuccess', loginSuccess);

function loginSuccess() {
    console.log('login success')
    
}

//websocket 返回消息
function wsMessage(data){
    console.log(`!!! websocket message =${JSON.stringify(data)}`);

}
