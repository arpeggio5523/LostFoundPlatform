import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAnalytics } from '../../../src/controllers/analyticsController.js';
import Item from '../../../src/models/Item.js';

// Mock the Item model
vi.mock('../../../src/models/Item.js');

describe('analyticsController', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('should return analytics data with correct totals', async () => {
    const mockAggregateData = [{
      lostPosts: 10,
      foundPosts: 15,
      pending: 8,
      approved: 12,
      rejected: 3,
      deleted: 2,
    }];

    Item.aggregate.mockResolvedValue(mockAggregateData);

    await getAnalytics(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
        totalPosts: 25,
        lostPosts: 10,
        foundPosts: 15,
        statuses: {
          pending: 8,
          approved: 12,
          rejected: 3,
          deleted: 2,
        },
        generatedAt: expect.any(String),
      },
    });
  });

  it('should handle empty results', async () => {
    Item.aggregate.mockResolvedValue([]);

    await getAnalytics(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      data: {
        totalPosts: 0,
        lostPosts: 0,
        foundPosts: 0,
        statuses: {
          pending: 0,
          approved: 0,
          rejected: 0,
          deleted: 0,
        },
        generatedAt: expect.any(String),
      },
    });
  });

  it('should handle database errors', async () => {
    const errorMsg = 'Database connection failed';
    Item.aggregate.mockRejectedValue(new Error(errorMsg));

    await getAnalytics(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: errorMsg,
    });
  });
});