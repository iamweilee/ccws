var url = require('url');
 
// HTTP/HTTPS proxy to connect to
var proxy = 'https://168.63.76.32:3128';
console.log('using proxy server %j', proxy);
 
// WebSocket endpoint for the proxy to connect to
var endpoint = 'ws://echo.websocket.org';
var parsed = url.parse(endpoint);
console.log(parsed);
 
// create an instance of the `HttpsProxyAgent` class with the proxy server information
var options = url.parse(proxy);
console.log(options);
console.log('this is a test, over.')