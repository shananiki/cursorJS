require ('dotenv').config();
const express = require('express');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const fs = require('fs');
const cors = require('cors');

const app = express();

var CERT_FILE = process.env.CERT_PATH;
var KEY_FILE = process.env.KEY_PATH;

const credentials = {
    cert: fs.readFileSync(CERT_FILE),
    key: fs.readFileSync(process.env.KEY_PATH)
};

// CORS setup
const corsOptions = {
    origin: 'https://cursor.shananiki.org',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
};
app.use(cors(corsOptions));

// Create HTTPS server
const server = https.createServer(credentials, app);
const wss = new WebSocket.Server({ server });

let cursors = {}; // To store cursor positions of all clients
let ids = 0;

wss.on('connection', (ws) => {
    ws.id = ids++;
    cursors[ws.id] = { x: 0, y: 0 }; // Initialize cursor position

    ws.send(JSON.stringify({ type: 'welcome', message: "Welcome to the Server!", id: ws.id }));

    ws.on('error', console.error);

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'mouseMovement') {
            cursors[ws.id] = { x: data.x, y: data.y };
            console.log(`Client ${ws.id} mouse position: x=${data.x}, y=${data.y}`);
            broadcastCursors();
        }
    });

    ws.on('close', () => {
        delete cursors[ws.id];
        broadcastCursors();
    });
});

function broadcastCursors() {
    const data = JSON.stringify({ type: 'cursors', cursors });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

server.listen(11000, () => {
    console.log('Server started on port 11000');
});
