const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const fs = require('fs');

app.use(express.static('public'));
app.use(express.json());

// Configuracion para WebRTC
let webrtcConfig;
try {
    const configFile = fs.readFileSync('webrtcConfig.json', 'utf8');
    webrtcConfig = JSON.parse(configFile);
} catch (error) {
    console.error('Error reading WebRTC config file:', error);
}

// Database setup
const db = new sqlite3.Database('database.db', (err) => {
    if (err) console.error('Database opening error: ', err);
});

// Create a simple table just for this test's purpose
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT)');
});

// mstroh: and another for "real messages" to simulate a chat
db.run('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, user TEXT, message TEXT)');

// Start listening
server.listen(3000, () => {
    console.log('Server listening on port 3000');
});


// Code to handle my CREATE READ UPDATE DELETE operations
// Create operation
// List all items (messages)
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

// Read operation (to List all the messages)
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

// Endpoint para los mensajes
app.get('/messages', (req, res) => {
    db.all('SELECT * FROM messages', [], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.status(200).json(rows);
    });
});

// WebSocket event listeners
io.on('connection', (socket) => {
    socket.on('newMessage', (data) => {
        db.run('INSERT INTO messages (user, message) VALUES (?, ?)', [data.user, data.message], function(err) {
            if (err) {
                console.error('Database error:', err.message);
                return;
            }
            io.emit('updateChat', { user: data.user, message: data.message });
        });
    });

    socket.on('webrtc-offer', (data) => {
        socket.broadcast.emit('webrtc-offer', data);
    });

    socket.on('webrtc-answer', (data) => {
        socket.broadcast.emit('webrtc-answer', data);
    });

    socket.on('webrtc-ice-candidate', (data) => {

        socket.broadcast.emit('webrtc-ice-candidate', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Finalmente endopoint para Web RTC
app.get('/webrtc-config', (req, res) => {
    res.json(webrtcConfig);
});