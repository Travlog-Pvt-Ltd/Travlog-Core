import log from 'npmlog';
import { server } from '../app.js';
const socket = require('socket.io');

const io = socket(server, {
    cors: {
        origin: '*',
    },
});

io.on('connection', (socket) => {
    log.info(`New client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

export default io;
