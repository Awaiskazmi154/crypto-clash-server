import express from 'express';
const router = express.Router();
import {generateRandomWords} from '../controllers/wordController.js';

export default router
    .get('/', generateRandomWords);