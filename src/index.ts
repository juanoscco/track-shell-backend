import 'dotenv/config';
import app from './app';
import AppDataSource from './ormconfig';
import { getLocalIPAddress } from './utils';

const host = getLocalIPAddress();
const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
const port = parseInt(process.env.PORT || '8080', 10);

AppDataSource.initialize()
  .then(() => {
    console.log('Base de datos conectada');
    app.listen(port, () => {
      console.log(`Servidor corriendo en ${protocol}://${host}:${port}`);
      console.log(`Swagger docs disponibles en ${protocol}://${host}:${port}/api-docs`);
    });
  })
  .catch((error) => console.error('Error al conectar la base de datos', error));