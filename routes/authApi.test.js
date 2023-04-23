const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const { User } = require('../schemas/user');

const { PORT, DB_HOST_TEST } = process.env;

describe('test api/users/register route', () => {
  let server = null;

  beforeAll(async () => {
    server = app.listen(PORT);

    await mongoose.connect(DB_HOST_TEST);
  });

  afterAll(async () => {
    server.close();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany();
  });

  test('test register route with correct data', async () => {
    const registerData = {
      name: 'Ivan',
      email: 'ivan@mail.com',
      password: '123456',
    };

    const res = await request(app)
      .post('/api/users/register')
      .send(registerData);

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe(registerData.name);
    expect(res.body.email).toBe(registerData.email);
    expect(res.body.avatarUrl).toBeUndefined();
    expect(res.body.avatarUrl).not.toBeNull();
    expect(res.body.subscription).toBe('starter');
    expect(res.body.token).toBeUndefined();
    expect(res.body.token).not.toBeNull();
  });

  /**
   * testing name field ========================================
   */
  test('test register route without name', async () => {
    const registerData = {
      email: 'ivan@mail.com',
      password: '123456',
    };

    const res = await request(app)
      .post('/api/users/register')
      .send(registerData);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      `user validation failed: name: Name is required`
    );
  });

  test('test register route with empty name', async () => {
    const registerData = {
      name: '',
      email: 'ivan@mail.com',
      password: '123456',
    };

    const res = await request(app)
      .post('/api/users/register')
      .send(registerData);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('"Name" cannot be empty');
  });

  test('test register route with name value is not a string', async () => {
    const registerData = {
      name: 1,
      email: 'ivan@mail.com',
      password: '123456',
    };

    const res = await request(app)
      .post('/api/users/register')
      .send(registerData);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(`"Name" must be string`);
  });

  /**
   * testing email field ========================================
   */
  test('test register route when email is already registered ', async () => {
    const registerData = {
      name: 'Ivan',
      email: 'mail2@mail.com',
      password: '123456',
    };

    const res_1 = await request(app)
      .post('/api/users/register')
      .send(registerData);

    const res = await request(app)
      .post('/api/users/register')
      .send(registerData);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe(`Email in use`);
  });

  test('test register route without email', async () => {
    const registerData = {
      name: 'Ivan',
      password: '123456',
    };

    const res = await request(app)
      .post('/api/users/register')
      .send(registerData);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(`"Email" is required`);
  });

  test('test register route with empty email', async () => {
    const registerData = {
      name: 'Ivan',
      email: '',
      password: '123456',
    };

    const res = await request(app)
      .post('/api/users/register')
      .send(registerData);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('"Email" cannot be empty');
  });

  test('test register route with email value is not a string', async () => {
    const registerData = {
      name: 'Ivan',
      email: 123,
      password: '123456',
    };

    const res = await request(app)
      .post('/api/users/register')
      .send(registerData);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(`"Email" must be string`);
  });

  /**
   * testing password field ========================================
   */
  test('test register route without password', async () => {
    const registerData = {
      name: 'Ivan',
      email: 'ivan@mail.com',
      password: '',
    };

    const res = await request(app)
      .post('/api/users/register')
      .send(registerData);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('"Password" cannot be empty');
  });

  test('test register route with empty password', async () => {
    const registerData = {
      name: 'Ivan',
      email: 'ivan@mail.com',
      password: '',
    };

    const res = await request(app)
      .post('/api/users/register')
      .send(registerData);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('"Password" cannot be empty');
  });

  test('test register route with password value is not a string', async () => {
    const registerData = {
      name: 'Ivan',
      email: 'ivan@mail.com',
      password: 123456,
    };

    const res = await request(app)
      .post('/api/users/register')
      .send(registerData);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(`"Password" must be string`);
  });
});

/**
 * ===========================================================================================
 * testing login route ========================================
 */
describe('test api/users/login route', () => {
  let server = null;

  beforeAll(async () => {
    server = app.listen(PORT);

    await mongoose.connect(DB_HOST_TEST);
  });

  afterAll(async () => {
    server.close();
    await mongoose.connection.close();
  });

  const registerData = {
    name: 'Ivan',
    email: 'ivan@mail.com',
    password: '123456',
  };

  beforeEach(async () => {
    await request(app).post('/api/users/register').send(registerData);
  });

  afterEach(async () => {
    await User.deleteMany();
  });

  /**
   * testing login route with correct data ========================================
   */
  test('test login route with correct data', async () => {
    const loginData = {
      email: 'ivan@mail.com',
      password: '123456',
    };

    const res = await request(app).post('/api/users/login').send(loginData);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.name).toBe(registerData.name);
    expect(res.body.user.email).toBe(loginData.email);
    expect(res.body.user.avatarUrl).toBeDefined();
    expect(res.body.user.avatarUrl).not.toBeNull();
    expect(res.body.token).toBeDefined();
    expect(res.body.token).not.toBeNull();
  });

  /**
   * testing login route with wrong email ========================================
   */
  test('test login route with wrong email', async () => {
    const loginData = {
      email: 'wrong@mail.com',
      password: '123456',
    };

    const res = await request(app).post('/api/users/login').send(loginData);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe(`Email or password is wrong`);
  });

  /**
   * testing login route with wrong password ========================================
   */
  test('test login route with wrong password', async () => {
    const loginData = {
      email: 'ivan@mail.com',
      password: '111111',
    };

    const res = await request(app).post('/api/users/login').send(loginData);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe(`Email or password is wrong`);
  });
});

// /**
//  * ===========================================================================================
//  * testing current route ========================================
//  */
// describe('test api/users/current route', () => {
//   let server = null;

//   beforeAll(async () => {
//     server = app.listen(PORT);

//     await mongoose.connect(DB_HOST_TEST);
//   });

//   afterAll(async () => {
//     server.close();
//     await mongoose.connection.close();
//   });

//   beforeEach(async () => {});

//   afterEach(async () => {
//     // await User.deleteMany();
//   });

//   /**
//    * testing current route ========================================
//    */
//   test('test get current user', async () => {
//     const registerData = {
//       name: 'Ivan',
//       email: 'ivan@mail.com',
//       password: '123456',
//     };

//     const loginData = {
//       email: 'ivan@mail.com',
//       password: '123456',
//     };

//     const registerUserRes = await request(app)
//       .post('/api/users/register')
//       .send(registerData);

//     const loginUserRes = await request(app)
//       .post('/api/users/login')
//       .send(loginData);

//     const { token } = loginUserRes.body;

//     console.log('token in test: ', token);

//     const res = await request(app)
//       .get('/api/users/current')
//       .set('Authorization', `Bearer ${token}`)
//       .send();

//     console.log('res:::::::::::::::::::::::::::::::::::::::::: ', res.body);

//     expect(registerUserRes.statusCode).toBe(201);
//     expect(loginUserRes.statusCode).toBe(200);
//     expect(res.statusCode).toBe(200);
//     expect(res.body.user.name).toBe(registerData.name);
//     expect(res.body.user.email).toBe(registerData.email);
//     expect(res.body.user.avatarUrl).toBeDefined();
//     expect(res.body.user.avatarUrl).not.toBeNull();
//     expect(res.body.token).toBeDefined();
//     expect(res.body.token).not.toBeNull();
//   });
// });
