const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');

jest.mock('../models/user.model', () => {
    return jest.fn().mockImplementation((data) => {
        return {
            ...data,
            _id: "mocked-user-id",
            save: jest.fn().mockResolvedValue(true),
        };
    });
});

User.findOne = jest.fn();


beforeAll(() => {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ message: 'ok' }),
        })
    );
});

describe('User Controller', () => {
    it('should create a new user', async () => {
        // Arrange
        User.findOne.mockResolvedValue(null); // aucun user trouvé

        // Act
        const res = await request(app)
            .post('/api/users/create')
            .send({
                firstName: "Momo",
                lastName: "Shiki",
                userName: "Momo",
                email: "test@test.com",
                password: "password",
                credits: "0",
                phone: "06 54 89 45 72",
                tier: "freemium"
            });

        // Assert
        expect(res.status).toBe(201);
        expect(res.body.email).toBe('test@test.com');
        expect(res.body._id).toBe('mocked-user-id');

        expect(User.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
        expect(global.fetch).toHaveBeenCalled();
    });    
});

describe('User Controller - addCredits', () => {
  beforeAll(() => {
    // Mock global.fetch pour le middleware d'auth
    global.fetch = jest.fn((url, options) => {
      if (url.includes('/auth/verifyToken')) {
        // Réponse OK de l'AuthService
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: { id: 'mocked-user-id' } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'ok' }),
      });
    });
  });
  

  it('should return 401 if no token is provided', async () => {
    const res = await request(app)
      .put('/api/users/buyCredits')
      .send({ userId: "mocked-user-id", productName: "Premium" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token manquant, Connexion requise');
  });

});


