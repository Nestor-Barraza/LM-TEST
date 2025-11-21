import { GET } from '@/app/api/search/route';
import { searchProducts } from '@/lib/db-queries';

jest.mock('@/lib/db-queries', () => ({
  searchProducts: jest.fn(),
}));

interface MockNextRequest {
  nextUrl: {
    searchParams: URLSearchParams;
  };
}

function createMockRequest(url: string): MockNextRequest {
  const urlObj = new URL(url);
  return {
    nextUrl: {
      searchParams: urlObj.searchParams,
    },
  };
}

describe('GET /api/search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful searches', () => {
    test('returns search results for valid query', async () => {
      const mockResults = [
        { id: '1', title: 'Product 1', price: 100 },
        { id: '2', title: 'Product 2', price: 200 },
      ];

      (searchProducts as jest.Mock).mockResolvedValue(mockResults);

      const request = createMockRequest('http://localhost:3000/api/search?q=laptop');
      const response = await GET(request as never);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResults);
      expect(searchProducts).toHaveBeenCalledWith('laptop');
    });

    test('handles query with special characters', async () => {
      const mockResults = [{ id: '1', title: 'Product with & special chars!', price: 100 }];

      (searchProducts as jest.Mock).mockResolvedValue(mockResults);

      const request = createMockRequest('http://localhost:3000/api/search?q=special%20%26%20chars');
      const response = await GET(request as never);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResults);
      expect(searchProducts).toHaveBeenCalledWith('special & chars');
    });

    test('returns empty array when no results found', async () => {
      (searchProducts as jest.Mock).mockResolvedValue([]);

      const request = createMockRequest('http://localhost:3000/api/search?q=nonexistent');
      const response = await GET(request as never);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
      expect(searchProducts).toHaveBeenCalledWith('nonexistent');
    });

    test('handles single character query', async () => {
      const mockResults = [{ id: '1', title: 'Apple', price: 100 }];

      (searchProducts as jest.Mock).mockResolvedValue(mockResults);

      const request = createMockRequest('http://localhost:3000/api/search?q=a');
      const response = await GET(request as never);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResults);
      expect(searchProducts).toHaveBeenCalledWith('a');
    });

    test('handles very long query', async () => {
      const longQuery = 'a'.repeat(500);
      const mockResults = [{ id: '1', title: 'Result', price: 100 }];

      (searchProducts as jest.Mock).mockResolvedValue(mockResults);

      const request = createMockRequest(`http://localhost:3000/api/search?q=${longQuery}`);
      const response = await GET(request as never);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResults);
      expect(searchProducts).toHaveBeenCalledWith(longQuery);
    });
  });

  describe('Error handling', () => {
    test('returns 400 when query parameter is missing', async () => {
      const request = createMockRequest('http://localhost:3000/api/search');
      const response = await GET(request as never);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Query parameter is required' });
      expect(searchProducts).not.toHaveBeenCalled();
    });

    test('returns 400 when query parameter is empty string', async () => {
      const request = createMockRequest('http://localhost:3000/api/search?q=');
      const response = await GET(request as never);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Query parameter is required' });
      expect(searchProducts).not.toHaveBeenCalled();
    });
  });
});
