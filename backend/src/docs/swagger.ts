// src/docs/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';
import { config } from '../config';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Vehicle Tracker API',
    version: '1.0.0',
    description: 'Comprehensive Vehicle Tracking and Management System API',
    contact: {
      name: 'API Support',
      email: 'support@vehicletracker.com'
    },
    license: {
      name: 'MIT',
      url: 'https://spdx.org/licenses/MIT.html'
    }
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Development server'
    },
    {
      url: 'https://api.vehicletracker.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com'
          },
          name: {
            type: 'string',
            example: 'John Doe'
          },
          role: {
            type: 'string',
            enum: ['ADMIN', 'MANAGER', 'USER'],
            example: 'USER'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Vehicle: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          licensePlate: {
            type: 'string',
            example: 'B 1234 CD'
          },
          brand: {
            type: 'string',
            example: 'Toyota'
          },
          model: {
            type: 'string',
            example: 'Hiace'
          },
          year: {
            type: 'integer',
            example: 2023
          },
          color: {
            type: 'string',
            example: 'White'
          },
          status: {
            type: 'string',
            enum: ['AVAILABLE', 'ON_TRIP', 'MAINTENANCE', 'OUT_OF_SERVICE', 'LOADING'],
            example: 'AVAILABLE'
          },
          fuelLevel: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
            example: 85
          },
          odometer: {
            type: 'integer',
            example: 45230
          },
          latitude: {
            type: 'number',
            format: 'float',
            example: -6.2088
          },
          longitude: {
            type: 'number',
            format: 'float',
            example: 106.8456
          }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Login successful'
          },
          data: {
            type: 'object',
            properties: {
              user: {
                $ref: '#/components/schemas/User'
              },
              tokens: {
                type: 'object',
                properties: {
                  accessToken: {
                    type: 'string'
                  },
                  refreshToken: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            example: 'Error message description'
          }
        }
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/docs/*.ts'
  ],
};

export const swaggerSpec = swaggerJSDoc(options);