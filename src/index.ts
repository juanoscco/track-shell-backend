import app from './app';
import AppDataSource from './ormconfig';

const port = process.env.PORT || 8080;

AppDataSource.initialize()
  .then(() => {
    console.log('Base de datos conectada');
    app.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
      console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
    });
  })
  .catch((error) => console.error('Error al conectar la base de datos', error));