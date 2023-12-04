const socket = io();

// Initial method to fetch all the messages
function fetchItems() {
    fetch('/items')
    .then(response => response.json())
    .then(items => {
        const tableBody = document.querySelector('#itemsList table tbody');
        tableBody.innerHTML = '';
        items.forEach(item => {
            addItemToList(item);
        });
    })
    .catch(error => {
        console.error('Error fetching items:', error);
    });
}

// Function to create a message
function createItem() {
    const itemName = document.getElementById('itemName').value;
    fetch('/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: itemName }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Create Success:', data);
        socket.emit('itemCreated', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Function to update a message
function updateItem() {
    const itemId = document.getElementById('updateItemId').value;
    const itemName = document.getElementById('updateItemName').value;
    fetch('/update', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: itemId, name: itemName }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Update Success:', data);
        socket.emit('itemUpdated', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Function to delete a message
function deleteItem() {
    const itemId = document.getElementById('deleteItemId').value;
    fetch(`/delete/${itemId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        console.log('Delete Success:', data);
        socket.emit('itemDeleted', itemId);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// WebSocket event listeners para actualizar la UI despues de cada operacion
// manuel.stroh: @todo: create validation final
socket.on('updateUI', data => {
    switch (data.action) {
        case 'create':
            addItemToList(data);
            break;
        case 'update':
            updateItemInList(data);
            break;
        case 'delete':
            removeItemFromList(data.id);
            break;
        default:
            console.log('Unknown action');
    }
});

function manualDeleteItem() {
    const itemId = document.getElementById('deleteItemId').value;
    deleteItem(itemId);
}

// Updated deleteItem function
function deleteItem(itemId) {
    fetch(`/delete/${itemId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        console.log('Delete Success:', data);
        removeItemFromList(itemId);
        socket.emit('itemDeleted', itemId);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function addItemToList(item) {
    const tableBody = document.querySelector('#itemsList table tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${item.id}</td>
        <td>${item.name}</td>
        <td>
            <button class="button is-small is-danger" onclick="deleteItem(${item.id})">Delete</button>
        </td>`;
    tableBody.appendChild(row);
}


function updateItemInList(item) {
    const tableBody = document.querySelector('#itemsList table tbody');
    [...tableBody.rows].forEach(row => {
        if (row.cells[0].textContent == item.id) {
            row.cells[1].textContent = item.name;
        }
    });
}

function removeItemFromList(itemId) {
    const tableBody = document.querySelector('#itemsList table tbody');
    [...tableBody.rows].forEach(row => {
        if (row.cells[0].textContent == itemId) {
            tableBody.removeChild(row);
        }
    });
}

// FUNCIONES PARA EL CHAT
// Function to send a message
function sendMessage(user) {
    const input = document.getElementById(`${user}Input`);
    const message = input.value;
    socket.emit('newMessage', { user, message });
    input.value = '';
}

// Function to append message to chat history
function appendMessageToChat(user, message) {
    const chatHistory = document.querySelector('#chatWindow .chat-history');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${user}`;
    messageDiv.textContent = `${user}: ${message}`;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;  // vaya hasta el ultimo mensaje, mas pro se ve
}

// Socket event listener for updating chat
socket.on('updateChat', data => {
    appendMessageToChat(data.user, data.message);
});

// Mostrar todo el historial
document.addEventListener('DOMContentLoaded', () => {
    fetch('/messages')
    .then(response => response.json())
    .then(messages => {
        messages.forEach(msg => {
            appendMessageToChat(msg.user, msg.message);
        });
    })
    .catch(error => console.error('Error fetching messages:', error));
});
// EO CHAT FUNCTIONS

// Intentar agregar el WebRTC para the Video Call
let iceConfiguration;

fetch('/webrtc-config')
    .then(response => response.json())
    .then(config => {
        iceConfiguration = config;
    })
    .catch(error => console.error('Error fetching ICE configuration:', error));

    let localStream, remoteStream, peerConnection;

    // Get local media stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            localStream = stream;
            document.getElementById('localVideo').srcObject = stream;
        })
        .catch(error => console.error('Error accessing media devices:', error));

    // Function to start a call
    function startCall() {
        peerConnection = new RTCPeerConnection(iceConfiguration);

        // Add local stream to peer connection
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        // Create an offer
        peerConnection.createOffer()
            .then(offer => peerConnection.setLocalDescription(offer))
            .then(() => {
                // Send the offer to the server for signaling
                socket.emit('webrtc-offer', { offer: peerConnection.localDescription });
            });

        // Listen for remote stream
        peerConnection.ontrack = event => {
            [remoteStream] = event.streams;
            document.getElementById('remoteVideo').srcObject = remoteStream;
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('webrtc-ice-candidate', { candidate: event.candidate });
            }
        };
    }

    // Function to end a call (work in progress but demonstrates this functionality)
    function endCall() {
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null; // Reset peerConnection after closing
    
            // Stop local stream tracks
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
    
            // Optionally, clear the video elements
            document.getElementById('localVideo').srcObject = null;
            document.getElementById('remoteVideo').srcObject = null;
        } else {
            console.log('No active peer connection to close.');
        }
    }

    // Add listeners to the start and end call buttons
    document.getElementById('startCall').addEventListener('click', startCall);
    document.getElementById('endCall').addEventListener('click', endCall);

    // Handle WebRTC signaling
    socket.on('webrtc-offer', data => {
        console.warn("This is just to test how to handle WebRTC Offer")
    });

    socket.on('webrtc-answer', data => {
        console.warn("This is just to test how to Handle the Answer Call event")
    });

    socket.on('webrtc-ice-candidate', data => {
        console.warn("This is just to test how to Handle received ICE candidate")
    });

// Finalmente para que cuando cargue la pagina se liste todo de una
// medio rudimentario pero cumple con todo
document.addEventListener('DOMContentLoaded', () => {
    fetchItems();
});
