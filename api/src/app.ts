import express, { Application } from 'express';
import path from 'path';
import { errorHandler, catchAsync } from './middlewares/errorHandler';
import { router } from './routes';
import cors from 'cors';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api', (req, res) => {
    res.json({ message: 'Torneos API funcionando' });
});

app.use('/api', router);

const angularPath = path.join(__dirname, '../../dist/sports-tournaments');
console.log('Ruta de Angular detectada:', angularPath);
app.use(express.static(angularPath));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(angularPath, 'index.html'));
});
// app.use((req, res) => {
//     res.status(404).json({ error: 'Ruta no encontrada' });
// });

app.use(errorHandler);
app.use(catchAsync);

export { app };