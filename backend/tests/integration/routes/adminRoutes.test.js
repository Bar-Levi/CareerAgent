const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const { app } = require('../../../server');
const { cleanupTask } = require('../../../tasks/cleanupTokens');
const Admin = require('../../../models/adminModel');
const emailService = require('../../../utils/emailService');

jest.mock('../../../utils/emailService', () => ({
  ...jest.requireActual('../../../utils/emailService'),
  sendAdminOtpEmail: jest.fn(),
}));

process.env.ADMIN_JWT_SECRET = 'test-admin-secret';
const EMAIL = 'admin@test.com';
const PASSWORD = 'CorrectHorse1!';

let mongoServer;

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
  jest.clearAllMocks();
  await Admin.deleteMany({});
  await Admin.create({ email: EMAIL, passwordHash: await bcrypt.hash(PASSWORD, 4) });
});

afterAll(async () => {
  if (cleanupTask && cleanupTask.stop) {
    cleanupTask.stop();
  }
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

const login = (password = PASSWORD) => request(app).post('/api/admin/login').send({ email: EMAIL, password });
const lastOtp = () => emailService.sendAdminOtpEmail.mock.calls.at(-1)[1];

describe('admin auth', () => {
  it('rejects the admin API without a session', async () => {
    await request(app).get('/api/admin/overview').expect(401);
  });

  it('login + OTP gives a session that can read the overview', async () => {
    const { body } = await login().expect(200);
    const verify = await request(app)
      .post('/api/admin/verify-otp')
      .send({ challengeToken: body.challengeToken, otp: lastOtp() })
      .expect(200);
    const cookie = verify.headers['set-cookie'];
    const res = await request(app).get('/api/admin/overview').set('Cookie', cookie).expect(200);
    expect(res.body).toHaveProperty('totalUsers');
    // The code is single use.
    await request(app).post('/api/admin/verify-otp').send({ challengeToken: body.challengeToken, otp: lastOtp() }).expect(401);
  });

  it('voids the code after 3 wrong tries, even if the 4th is right', async () => {
    const { body } = await login().expect(200);
    const good = lastOtp();
    const bad = good === '000000' ? '111111' : '000000';
    for (let i = 0; i < 2; i++) {
      await request(app).post('/api/admin/verify-otp').send({ challengeToken: body.challengeToken, otp: bad }).expect(400);
    }
    await request(app).post('/api/admin/verify-otp').send({ challengeToken: body.challengeToken, otp: bad }).expect(401);
    await request(app).post('/api/admin/verify-otp').send({ challengeToken: body.challengeToken, otp: good }).expect(401);
  });

  it('locks the account after 5 wrong passwords, even for the right one', async () => {
    for (let i = 0; i < 5; i++) await login('wrong-password').expect(401);
    await login().expect(401);
    const admin = await Admin.findOne({ email: EMAIL });
    expect(admin.lockUntil.getTime()).toBeGreaterThan(Date.now());
  });
});
