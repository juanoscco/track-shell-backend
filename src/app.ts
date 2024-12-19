import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './config/swagger-config';
import cors from 'cors';

import storeRoutes from './core/Store/routers/store.routes';
import categoryRoutes from './core/Categories/routers/categories.routers';
import recordRouter from './core/Records/routers/record.router';
import userRoutes from './core/Users/routers/users.routes';
import clientRouter from './core/Clients/routers/clients.routers';

const app = express();

// Middleware para habilitar CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Configuración de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas principales
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/records', recordRouter);
app.use('/api/clients', clientRouter)

export default app;