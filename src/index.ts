import 'dotenv/config';
import app from './app';
import AppDataSource from './ormconfig';

const host = process.env.HOST || '127.0.0.1'; // Dirección IP desde el archivo .env
const port = parseInt(process.env.PORT || '8080', 10); // Puerto desde el archivo .env

AppDataSource.initialize()
  .then(() => {
    console.log('Base de datos conectada');
    app.listen(port, host, () => {
      console.log(`Servidor corriendo en http://${host}:${port}`);
      console.log(`Swagger docs disponibles en http://${host}:${port}/api-docs`);
    });
  })
  .catch((error) => console.error('Error al conectar la base de datos', error));