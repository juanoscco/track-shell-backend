import swaggerJsdoc from 'swagger-jsdoc';
import { getLocalIPAddress } from '../utils';

const host = getLocalIPAddress();
const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

const swaggerConfig = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'User and Store API',
      version: '1.0.0',
      description: 'API for managing users with roles and store information',
    },
    servers: process.env.NODE_ENV === 'production'
      ? []
      : [
          {
            url: `${protocol}://${host}:${process.env.PORT || 8080}`,
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
  apis: process.env.NODE_ENV === 'development'
    ? [
      './src/modules/Users/routers/*.ts',
      './src/modules/Store/routers/*.ts',
      './src/modules/Categories/routers/*.ts',
      './src/modules/Records/routers/*.ts',
      './src/modules/Clients/routers/*.ts',
      './src/modules/Bag/routers/*.ts',
      './src/modules/Cyl/routers/*.ts',
      './src/modules/Sph/routers/*.ts',
    ]
    : [
      './dist/modules/Users/routers/*.js',
      './dist/modules/Store/routers/*.js',
      './dist/modules/Categories/routers/*.js',
      './dist/modules/Records/routers/*.js',
      './dist/modules/Clients/routers/*.js',
      './dist/modules/Bag/routers/*.js',
      './dist/modules/Cyl/routers/*.js',
      './dist/modules/Sph/routers/*.js',
    ],
};

const swaggerDocs = swaggerJsdoc(swaggerConfig);

export default swaggerDocs;