const ws = new WebSocket(`${location.protocol === 'http:' ? 'ws:' : 'wss:'}//shananiki.xyz` + ':30001');

const cursors = {};
let clientId = null;


ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'welcome') {
        console.log('Message from server:', message.message);
        clientId = message.id;
    } else if (message.type === 'cursors') {
        updateCursors(message.cursors);
    }
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

ws.onclose = () => {
    console.log('Disconnected from the server');
};

document.addEventListener('mousemove', (event) => {
    const mousePosition = {
        type: 'mouseMovement',
        x: event.clientX,
        y: event.clientY
    };
    ws.send(JSON.stringify(mousePosition));
});

function updateCursors(cursorsData) {
    for (const id in cursors) {
        if (!cursorsData.hasOwnProperty(id)) {
            document.body.removeChild(cursors[id]);
            delete cursors[id];
        }
    }

    for (const id in cursorsData) {
        if (id === String(clientId)) {
            continue;
        }
        if (!cursors.hasOwnProperty(id)) {
            const cursorElement = document.createElement('div');
            cursorElement.classList.add('cursor');
            cursorElement.setAttribute('data-id', id); 

            const cursorImage = document.createElement('img');
            cursorImage.src = "assets/cursor.png";
            cursorElement.append(cursorImage);

            document.body.appendChild(cursorElement);
            cursors[id] = cursorElement;
        }
        cursors[id].style.left = `${cursorsData[id].x}px`;
        cursors[id].style.top = `${cursorsData[id].y}px`;
    }
}
