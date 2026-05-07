const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Budget Wishlist API',
      version: '1.0.0',
      description: 'REST API for the Budget Wishlist full-stack application',
    },
    servers: [{ url: '/api', description: 'API base path' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterInput: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: { type: 'string', minLength: 3, maxLength: 50 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            userId: { type: 'string' },
            username: { type: 'string' },
            shareToken: { type: 'string' },
          },
        },
        WishlistItem: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            wishlistId: { type: 'string', nullable: true },
            name: { type: 'string' },
            price: { type: 'number', minimum: 0 },
            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            purchased: { type: 'boolean' },
            boughtBy: { type: 'string', nullable: true },
            imageUrl: { type: 'string', nullable: true },
            breakdown: {
              type: 'array',
              nullable: true,
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  amount: { type: 'number' },
                  purchased: { type: 'boolean' },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateItemInput: {
          type: 'object',
          required: ['name', 'price'],
          properties: {
            name: { type: 'string', maxLength: 200 },
            price: { type: 'number', minimum: 0 },
            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            wishlistId: { type: 'string', nullable: true },
            breakdown: {
              type: 'array',
              nullable: true,
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  amount: { type: 'number' },
                },
              },
            },
          },
        },
        Wishlist: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            shareToken: { type: 'string' },
            isDefault: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        PaginatedItems: {
          type: 'object',
          properties: {
            items: { type: 'array', items: { $ref: '#/components/schemas/WishlistItem' } },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            type: { type: 'string', enum: ['purchased', 'visited'] },
            message: { type: 'string' },
            itemName: { type: 'string', nullable: true },
            boughtBy: { type: 'string', nullable: true },
            read: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Stats: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                totalItems: { type: 'integer' },
                purchasedItems: { type: 'integer' },
                pendingItems: { type: 'integer' },
                activeFriends: { type: 'integer' },
                unreadNotifications: { type: 'integer' },
              },
            },
            itemsByPriority: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  count: { type: 'integer' },
                  totalValue: { type: 'number' },
                },
              },
            },
            spentPerMonth: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'object' },
                  totalSpent: { type: 'number' },
                  count: { type: 'integer' },
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
