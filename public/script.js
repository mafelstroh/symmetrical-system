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

// Finalmente para que cuando cargue la pagina se liste todo de una
// medio rudimentario pero cumple con todo
document.addEventListener('DOMContentLoaded', () => {
    fetchItems();
});
