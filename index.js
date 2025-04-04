const express = require('express');
const { WebSocketServer } = require('ws');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3007; // Using 3007 to avoid conflicts

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads')); // Serve uploaded files
app.set('view engine', 'ejs');

// File Upload Setup with Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only .jpg, .jpeg, and .png files are allowed!'));
    }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Routes
app.get('/', (req, res) => {
    res.render('index', { error: null });
});

// File Upload Route
// app.post('/upload', upload.single('file'), (req, res) => {
//     if (!req.file) {
//         return res.render('index', { error: 'No file uploaded or invalid file type', fileUrl: null });
//     }
//     res.render('index', { error: null, fileUrl: `/uploads/${req.file.filename}` });
// });

// HTTP Server
const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// WebSocket Server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('New client connected');

    // Broadcast messages to all clients
    ws.on('message', (message) => {
        const msg = message.toString();
        wss.clients.forEach(client => {
            if (client.readyState === 1) { // 1 means OPEN
                client.send(msg);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});