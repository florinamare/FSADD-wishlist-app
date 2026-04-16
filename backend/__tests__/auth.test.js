const request = require('supertest');

// Mock DB connection so tests don't need a real MongoDB
jest.mock('../src/config/db', () => jest.fn().mockResolvedValue(null));
// Mock socket.io init so httpServer doesn't try to bind
jest.mock('../src/config/socket', () => ({
  initSocket: jest.fn(),
  getIO: jest.fn(),
}));

const User = require('../src/models/User');
jest.mock('../src/models/User');

const { app } = require('../src/server');

describe('POST /api/auth/register — Joi validation', () => {
  it('returns 400 when body is empty', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when email is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'not-an-email', password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  it('returns 400 when password is too short (< 6 chars)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'test@example.com', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/password/i);
  });

  it('returns 400 when username is too short (< 3 chars)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'ab', email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/username/i);
  });

  it('returns 409 when user already exists', async () => {
    User.findOne.mockResolvedValueOnce({ _id: 'existing-id' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'existinguser', email: 'existing@example.com', password: 'password123' });
    expect(res.status).toBe(409);
  });

  it('returns 201 with token on successful registration', async () => {
    User.findOne.mockResolvedValueOnce(null);
    User.create.mockResolvedValueOnce({
      _id: 'new-user-id',
      username: 'newuser',
      shareToken: 'share-token-uuid',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newuser', email: 'new@example.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('username', 'newuser');
  });
});

describe('POST /api/auth/login — Joi validation', () => {
  it('returns 400 when body is empty', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when email is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'password123' });
    expect(res.status).toBe(400);
  });

  it('returns 401 when user does not exist', async () => {
    User.findOne.mockResolvedValueOnce(null);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noone@example.com', password: 'password123' });
    expect(res.status).toBe(401);
  });
});
