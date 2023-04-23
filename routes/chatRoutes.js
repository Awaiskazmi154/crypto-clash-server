import express from 'express';
const router = express.Router();
import {joinChat, leaveChat, getChat, updateChat, deleteChat} from '../controllers/chatController.js';

export default router
    .post('/', joinChat)
    .post('/exit', leaveChat)
    .post('/get', getChat)
    .post('/update', updateChat)
    .delete('/', deleteChat)