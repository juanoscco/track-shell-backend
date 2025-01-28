import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './config/swagger-config';
import cors from 'cors';

// Routers
import storeRoutes from './modules/Store/routers/store.routes';
import categoryRoutes from './modules/Categories/routers/categories.routers';
import recordRouter from './modules/Records/routers/record.router';
import userRoutes from './modules/Users/routers/users.routes';
import clientRouter from './modules/Clients/routers/clients.routers';
import bagRouter from './modules/Bag/routers/bag.router';
import cylRouter from './modules/Cyl/routers/cyl.router';
import sphRouter from './modules/Sph/routers/sph.router';

const app = express();

// Middleware para habilitar CORS y permitir solicitudes desde una URL específica
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
app.use('/api/clients', clientRouter);
app.use('/api/bags', bagRouter);
app.use('/api/cyl', cylRouter);
app.use('/api/sph', sphRouter);

export default app;