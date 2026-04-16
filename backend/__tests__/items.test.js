const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/db', () => jest.fn().mockResolvedValue(null));
jest.mock('../src/config/socket', () => ({
  initSocket: jest.fn(),
  getIO: jest.fn(),
}));

const WishlistItem = require('../src/models/WishlistItem');
const Wishlist = require('../src/models/Wishlist');
jest.mock('../src/models/WishlistItem');
jest.mock('../src/models/Wishlist');

const { app } = require('../src/server');

const makeToken = (userId = 'user123') =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('GET /api/items — authentication', () => {
  it('returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/items')
      .set('Authorization', 'Bearer bad-token');
    expect(res.status).toBe(401);
  });

  it('returns paginated items with valid token', async () => {
    WishlistItem.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    });
    WishlistItem.countDocuments.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/items')
      .set('Authorization', `Bearer ${makeToken()}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('totalPages');
  });
});

describe('POST /api/items — Joi validation', () => {
  it('returns 401 without Authorization header', async () => {
    const res = await request(app).post('/api/items').send({ name: 'Test', price: 100 });
    expect(res.status).toBe(401);
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ price: 100 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name/i);
  });

  it('returns 400 when price is missing', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ name: 'Test Item' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/price/i);
  });

  it('returns 400 when price is negative', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ name: 'Test Item', price: -10 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when priority is invalid', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ name: 'Test Item', price: 100, priority: 'ultra' });
    expect(res.status).toBe(400);
  });

  it('creates item successfully with valid data', async () => {
    Wishlist.findOne.mockResolvedValue({ _id: 'wishlist123', isDefault: true });
    Wishlist.create.mockResolvedValue({ _id: 'wishlist123' });
    Wishlist.exists.mockResolvedValue(true);

    const mockItem = {
      _id: 'item123',
      userId: 'user123',
      wishlistId: 'wishlist123',
      name: 'New Laptop',
      price: 1500,
      priority: 'high',
      purchased: false,
    };

    const mockSave = jest.fn().mockResolvedValue(mockItem);
    WishlistItem.mockImplementation(() => ({ save: mockSave, ...mockItem }));

    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ name: 'New Laptop', price: 1500, priority: 'high' });

    expect(res.status).toBe(201);
  });
});

describe('DELETE /api/items/:id — authentication', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).delete('/api/items/someItemId');
    expect(res.status).toBe(401);
  });

  it('returns 404 when item does not belong to user', async () => {
    WishlistItem.findOneAndDelete.mockResolvedValue(null);
    const res = await request(app)
      .delete('/api/items/nonexistentId')
      .set('Authorization', `Bearer ${makeToken()}`);
    expect(res.status).toBe(404);
  });
});
