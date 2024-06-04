require ('dotenv').config();
const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');
const app = express();

var CERT_PATH = process.env.CERT_PATH;
var KEY_PATH = process.env.KEY_PATH;
var HOST_PORT = process.env.HOST_PORT;
var HOST_IP = process.env.HOST_IP;
const wss = new WebSocket.Server({ server });

let currentVisitors = 0;
let allVisitors = 0;
function broadcastVisitors() {
        const data = JSON.stringify({ type: 'visitors', all: allVisitors, current: currentVisitors });
        wss.clients.forEach(client => {
        if(client.readyState === WebSocket.OPEN) {
                client.send(data);
        }
        });

}

function broadcastCursors() {
    const data = JSON.stringify({ type: 'cursors', cursors });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}


wss.on('connection', (ws) => {
    currentVisitors++;
    allVisitors++;
    console.log(`New connection. Current visitors: ${currentVisitors}`);

    broadcastVisitors();


    ws.on('close', () => {
        currentVisitors--;
        console.log(`Connection closed. Current visitors: ${currentVisitors}`);
        broadcastVisitors();
    });
});

server.listen(HOST_PORT, HOST_IP, () => {
    console.log('Secure WebSocket server is running on wss://[::]:30000');
});
