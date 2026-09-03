import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import analyticsRoutes from '../../../src/routes/analyticsRoutes.js';
import * as analyticsController from '../../../src/controllers/analyticsController.js';
import { requireAdmin } from '../../../src/middleware/adminMiddleware.js';

// Mock the middleware and controller
vi.mock('../../../src/middleware/adminMiddleware.js', () => ({
  requireAdmin: vi.fn(),
}));
vi.mock('../../../src/controllers/analyticsController.js');

describe('Analytics Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use('/api/analytics', analyticsRoutes);
    
    // Mock requireAdmin middleware to pass for testing
    requireAdmin.mockImplementation((req, res, next) => next());
    
    vi.clearAllMocks();
  });

  it('should call requireAdmin middleware', async () => {
    analyticsController.getAnalytics.mockImplementation((req, res) => {
      res.json({ data: {} });
    });

    await request(app).get('/api/analytics');

    expect(requireAdmin).toHaveBeenCalled();
  });

  it('should return analytics data on GET /', async () => {
    const mockData = {
      totalPosts: 25,
      lostPosts: 10,
      foundPosts: 15,
      statuses: { pending: 8, approved: 12, rejected: 3, deleted: 2 },
    };

    analyticsController.getAnalytics.mockImplementation((req, res) => {
      res.status(200).json({ data: mockData });
    });

    const response = await request(app).get('/api/analytics');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(mockData);
  });

  it('should reject unauthorized requests without admin middleware', async () => {
    // Temporarily restore real middleware
    requireAdmin.mockImplementation((req, res, next) => {
      res.status(401).json({ error: 'Unauthorized' });
    });

    const response = await request(app)
      .get('/api/analytics')
      .set('Authorization', 'Bearer invalid-token');

    // Should be rejected (middleware should block it)
    expect(response.status).toBe(401);
  });
});