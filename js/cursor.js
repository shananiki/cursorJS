const ws = new WebSocket(`${location.protocol === 'http:' ? 'ws:' : 'wss:'}//${window.location.host}` + ':11000');

const cursors = {};
let clientId = null;

ws.onopen = () => {
    console.log('Connected to the server');
};

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
    // Remove cursors that no longer exist
    for (const id in cursors) {
        if (!cursorsData.hasOwnProperty(id)) {
            document.body.removeChild(cursors[id]);
            delete cursors[id];
        }
    }

    // Update or add new cursors
    for (const id in cursorsData) {
        if (id === String(clientId)) {
            continue;
        }
        if (!cursors.hasOwnProperty(id)) {
            const cursorElement = document.createElement('div');
            cursorElement.classList.add('cursor');
            cursorElement.textContent = id; // Add client ID
            cursorElement.setAttribute('data-id', id); // Set client ID as an attribute

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