import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileContrroller';
import authMiddleware from './app/middleware/auth';
import MeetupsController from './app/controllers/MeetupsController';
import Subscription from './app/controllers/SubscriptionController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/meetups', MeetupsController.index);
routes.post('/meetups', MeetupsController.store);
routes.put('/meetups/:id', MeetupsController.update);
routes.delete('/meetups/:id', MeetupsController.delete);

routes.get('/subscription', Subscription.index);
routes.post('/subscription/:id', Subscription.store);

export default routes;
