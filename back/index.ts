import express from 'express';
import wordRouter from './src/routes/words';
import cors from 'cors'

const app = express();
app.use(express.json());
app.use(cors());

app.get('/ping', (_req, res) => {
  console.log('someone pinged here');
  res.send('pong');
});

app.use('/api/words', wordRouter)


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});