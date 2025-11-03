import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from '../config';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Vehicle Tracker API',
    version: '1.0.0',
    description: 'Comprehensive Vehicle Tracking and Management System API',
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Development server'
    },
    {
      url: 'https://api.vehicletracker.my.id',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>'
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
      Trip: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          vehicleId: {
            type: 'string',
            format: 'uuid'
          },
          startTime: {
            type: 'string',
            format: 'date-time'
          },
          endTime: {
            type: 'string',
            format: 'date-time',
            nullable: true
          },
          startLat: {
            type: 'number',
            format: 'float'
          },
          startLng: {
            type: 'number',
            format: 'float'
          },
          endLat: {
            type: 'number',
            format: 'float',
            nullable: true
          },
          endLng: {
            type: 'number',
            format: 'float',
            nullable: true
          },
          distance: {
            type: 'number',
            format: 'float',
            nullable: true
          },
          fuelUsed: {
            type: 'number',
            format: 'float',
            nullable: true
          },
          status: {
            type: 'string',
            enum: ['ACTIVE', 'COMPLETED', 'CANCELLED']
          }
        }
      },
      Maintenance: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          vehicleId: {
            type: 'string',
            format: 'uuid'
          },
          type: {
            type: 'string',
            enum: ['OIL_CHANGE', 'TIRE_REPLACEMENT', 'BRAKE_SERVICE', 'ENGINE_REPAIR', 'GENERAL_INSPECTION', 'OTHER']
          },
          description: {
            type: 'string'
          },
          cost: {
            type: 'number',
            format: 'float',
            nullable: true
          },
          date: {
            type: 'string',
            format: 'date-time'
          },
          status: {
            type: 'string',
            enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']
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
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string'
          },
          data: {
            type: 'object'
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
      },
      PaginationResponse: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            example: 1
          },
          limit: {
            type: 'integer',
            example: 10
          },
          total: {
            type: 'integer',
            example: 100
          },
          totalPages: {
            type: 'integer',
            example: 10
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Auth',
      description: 'Authentication and authorization endpoints'
    },
    {
      name: 'Users',
      description: 'User management endpoints (Admin only)'
    },
    {
      name: 'Vehicles',
      description: 'Vehicle management endpoints'
    },
    {
      name: 'Trips',
      description: 'Trip tracking endpoints'
    },
    {
      name: 'Maintenance',
      description: 'Vehicle maintenance endpoints'
    },
    {
      name: 'Reports',
      description: 'Report generation endpoints'
    }
  ]
};

const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/docs/*.docs.ts'
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
export { swaggerUi };

