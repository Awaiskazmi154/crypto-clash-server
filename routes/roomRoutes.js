import express from 'express';
const router = express.Router();
import {
    joinRoomById,
    getRoomById,
    updateRoomBySecretWord,
    updateRoomByGameStart,
    updateRoomByGuess,
    updateRoomByGuessTimeout,
    updateRoomByRound,
    updateRoom,
    deleteRoomById
} from '../controllers/roomController.js';

export default router
    .post('/:roomId', joinRoomById)
    .get('/:roomId', getRoomById)
    .put('/secret/:roomId', updateRoomBySecretWord)
    .put('/start/:roomId', updateRoomByGameStart)
    .put('/guess/:roomId', updateRoomByGuess)
    .put('/guess/timeout/:roomId', updateRoomByGuessTimeout)
    .put('/round/:roomId', updateRoomByRound)
    .put('/:id', updateRoom)
    .delete('/:roomId', deleteRoomById);