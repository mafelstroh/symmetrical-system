const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));
app.use(express.json());

// Database setup
const db = new sqlite3.Database('database.db', (err) => {
    if (err) console.error('Database opening error: ', err);
});

// Create a simple table just for this test's purpose
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT)');
});

// Start listening
server.listen(3000, () => {
    console.log('Server listening on port 3000');
});


// Code to handle my CREATE READ UPDATE DELETE operations

// Create operation
app.post('/create', (req, res) => {
    const { name } = req.body;
    db.run('INSERT INTO items (name) VALUES (?)', [name], function(err) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        io.emit('updateUI', { action: 'create', id: this.lastID, name });
        res.status(200).json({ id: this.lastID, name });
    });
});

// Read operation (optional, if you want to display all items)
app.get('/items', (req, res) => {
    db.all('SELECT * FROM items', [], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.status(200).json(rows);
    });
});

// Update operation
app.put('/update', (req, res) => {
    const { id, name } = req.body;
    db.run('UPDATE items SET name = ? WHERE id = ?', [name, id], function(err) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        io.emit('updateUI', { action: 'update', id, name });
        res.status(200).json({ id, name });
    });
});

// Delete operation
app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM items WHERE id = ?', id, function(err) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        io.emit('updateUI', { action: 'delete', id });
        res.status(200).json({ id });
    });
});

// WebSocket event listeners
io.on('connection', (socket) => {
    // Add listeners for CRUD operations
    // ...

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

