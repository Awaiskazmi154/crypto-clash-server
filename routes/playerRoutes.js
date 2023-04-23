import express from 'express';
const router = express.Router();
import {createPlayer, getPlayerByName, getPlayerById, updatePlayerById, deletePlayerById} from '../controllers/playerController.js';

export default router
    .post('/', createPlayer)
    .post('/name', getPlayerByName)
    .get('/:id', getPlayerById)
    .put('/:id', updatePlayerById)
    .delete('/:id', deletePlayerById);

