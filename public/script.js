const socket = io();

// Function to create an item
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

// Function to update an item
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

// Function to delete an item
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

// WebSocket event listeners
socket.on('updateUI', data => {
    // Update the UI based on the data received
    // This will depend on how you want to display the items
});
