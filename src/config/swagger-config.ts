import swaggerJsdoc from 'swagger-jsdoc';

const swaggerConfig = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'User and Store API',
      version: '1.0.0',
      description: 'API for managing users with roles and store information',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8080}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your bearer token in the format: Bearer <token>',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/core/Users/routers/*.ts',   // Rutas de usuarios
    './src/core/Store/routers/*.ts',   // Rutas de tiendas 
    './src/core/Categories/routers/*.ts',   // Rutas de categorias
    './src/core/Records/routers/*.ts',
    './src/core/Clients/routers/*.ts'

  ],
};

const swaggerDocs = swaggerJsdoc(swaggerConfig);

export default swaggerDocs;