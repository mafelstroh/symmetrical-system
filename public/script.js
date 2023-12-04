const socket = io();


// Initial method to fetch all the messages
function fetchItems() {
    fetch('/items')
    .then(response => response.json())
    .then(items => {
        const listElement = document.querySelector('#itemsList .list');
        listElement.innerHTML = ''; // Clear existing items
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'list-item';
            itemElement.textContent = `Item ID: ${item.id}, Name: ${item.name}`;
            listElement.appendChild(itemElement);
        });
    })
    .catch(error => {
        console.error('Error:', error);
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

function addItemToList(item) {
    const listElement = document.querySelector('#itemsList .list');
    const itemElement = document.createElement('div');
    itemElement.className = 'list-item';
    itemElement.textContent = `Item ID: ${item.id}, Name: ${item.name}`;
    listElement.appendChild(itemElement);
}

function updateItemInList(item) {
    const listElement = document.querySelector('#itemsList .list');
    const itemElements = listElement.getElementsByClassName('list-item');
    for (let elem of itemElements) {
        if (elem.textContent.includes(`Item ID: ${item.id}`)) {
            elem.textContent = `Item ID: ${item.id}, Name: ${item.name}`;
            break;
        }
    }
}

function removeItemFromList(itemId) {
    const listElement = document.querySelector('#itemsList .list');
    const itemElements = listElement.getElementsByClassName('list-item');
    for (let elem of itemElements) {
        if (elem.textContent.includes(`Item ID: ${itemId}`)) {
            listElement.removeChild(elem);
            break;
        }
    }
}