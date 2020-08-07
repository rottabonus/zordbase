import express from 'express';
import wordService from '../services/wordService'

const router = express.Router();

router.get('/', (_req, res) => {
  console.log('someone pinged word-service')
  res.send(wordService.getEntries());
})

export default router;