import express from 'express';
import { getCall, postCall } from '../controllers/call.js';

const router = express.Router();

router.get('/', getCall);

router.post('/', postCall);

export default router;