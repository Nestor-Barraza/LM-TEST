import { GET } from '@/app/api/items/[id]/route';
import { getProductById } from '@/lib/db-queries';

jest.mock('@/lib/db-queries', () => ({
  getProductById: jest.fn(),
}));

describe('GET /api/items/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful requests', () => {
    test('returns product when found', async () => {
      const mockProduct = {
        id: 'MLA123456',
        title: 'Test Product',
        price: 1000,
        currency: 'ARS',
        description: 'Test description',
      };

      (getProductById as jest.Mock).mockResolvedValue(mockProduct);

      const request = {} as Request;
      const params = Promise.resolve({ id: 'MLA123456' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProduct);
      expect(getProductById).toHaveBeenCalledWith('MLA123456');
    });

    test('handles numeric IDs', async () => {
      const mockProduct = {
        id: '12345',
        title: 'Numeric ID Product',
        price: 500,
      };

      (getProductById as jest.Mock).mockResolvedValue(mockProduct);

      const request = {} as Request;
      const params = Promise.resolve({ id: '12345' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProduct);
      expect(getProductById).toHaveBeenCalledWith('12345');
    });

    test('handles IDs with special characters', async () => {
      const mockProduct = {
        id: 'MLA-123-456',
        title: 'Product with dashes',
        price: 750,
      };

      (getProductById as jest.Mock).mockResolvedValue(mockProduct);

      const request = {} as Request;
      const params = Promise.resolve({ id: 'MLA-123-456' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProduct);
      expect(getProductById).toHaveBeenCalledWith('MLA-123-456');
    });
  });

  describe('Error handling', () => {
    test('returns 404 when product not found', async () => {
      (getProductById as jest.Mock).mockResolvedValue(null);

      const request = {} as Request;
      const params = Promise.resolve({ id: 'NONEXISTENT' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Product not found' });
      expect(getProductById).toHaveBeenCalledWith('NONEXISTENT');
    });

    test('returns 404 when product is undefined', async () => {
      (getProductById as jest.Mock).mockResolvedValue(undefined);

      const request = {} as Request;
      const params = Promise.resolve({ id: 'UNDEFINED' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Product not found' });
    });

    test('handles empty ID gracefully', async () => {
      (getProductById as jest.Mock).mockResolvedValue(null);

      const request = {} as Request;
      const params = Promise.resolve({ id: '' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Product not found' });
      expect(getProductById).toHaveBeenCalledWith('');
    });
  });

  describe('Product data integrity', () => {
    test('preserves all product fields', async () => {
      const mockProduct = {
        id: 'MLA123',
        title: 'Complete Product',
        price: 1000,
        currency: 'ARS',
        description: 'Full description',
        images: ['img1.jpg', 'img2.jpg'],
        category: 'Electronics',
        condition: 'new',
        available_quantity: 10,
      };

      (getProductById as jest.Mock).mockResolvedValue(mockProduct);

      const request = {} as Request;
      const params = Promise.resolve({ id: 'MLA123' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(data).toEqual(mockProduct);
      expect(Object.keys(data).length).toBe(Object.keys(mockProduct).length);
    });
  });
});
