import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '@/components/molecules/SearchBar';
import { useSearchBox, useHits, useInstantSearch } from 'react-instantsearch';
import { useRouter } from 'next/navigation';

jest.mock('react-instantsearch', () => ({
  useSearchBox: jest.fn(),
  useHits: jest.fn(),
  useInstantSearch: jest.fn(),
  Configure: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

jest.mock('react-instantsearch-nextjs', () => ({
  InstantSearchNext: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: {
    src: string;
    alt: string;
    fill?: boolean;
    sizes?: string;
    className?: string;
    placeholder?: string;
    blurDataURL?: string;
    quality?: number;
    loading?: string;
    priority?: boolean;
    onLoad?: () => void;
    onError?: () => void;
  }) => {
    const {
      fill: _fill,
      sizes: _sizes,
      placeholder: _placeholder,
      blurDataURL: _blurDataURL,
      quality: _quality,
      loading: _loading,
      priority: _priority,
      onLoad: _onLoad,
      onError: _onError,
      ...rest
    } = props;
    return <img {...rest} />;
  },
}));

window.HTMLElement.prototype.scrollIntoView = jest.fn();

interface MockHit {
  objectID: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  thumbnail: string;
  category_name: string;
  condition: string;
  average_rating: number;
}

const mockHits: MockHit[] = [
  {
    objectID: '1',
    title: 'Product 1',
    description: 'Description 1',
    price: 100,
    currency: 'ARS',
    thumbnail: '/test1.jpg',
    category_name: 'Category 1',
    condition: 'new',
    average_rating: 4.5,
  },
  {
    objectID: '2',
    title: 'Product 2',
    description: 'Description 2',
    price: 200,
    currency: 'ARS',
    thumbnail: '/test2.jpg',
    category_name: 'Category 2',
    condition: 'used',
    average_rating: 4.0,
  },
];

describe('SearchBar', () => {
  const mockRefine = jest.fn();
  const mockPush = jest.fn();
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useSearchBox as jest.Mock).mockReturnValue({
      query: '',
      refine: mockRefine,
    });

    (useHits as jest.Mock).mockReturnValue({
      hits: [],
      results: {},
    });

    (useInstantSearch as jest.Mock).mockReturnValue({
      status: 'idle',
    });
  });

  describe('Initial render', () => {
    test('renders search input with placeholder', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Buscar productos, marcas y más...');
      expect(input).toBeInTheDocument();
    });

    test('renders search button', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    test('search button is disabled when query is empty', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    test('does not show results initially', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
    });
  });

  describe('Search input interaction', () => {
    test('updates query when user types', async () => {
      const user = userEvent.setup();
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Buscar productos, marcas y más...');
      await user.type(input, 'laptop');

      expect(mockRefine).toHaveBeenCalledWith('l');
      expect(mockRefine).toHaveBeenCalledWith('a');
      expect(mockRefine).toHaveBeenCalledWith('p');
      expect(mockRefine).toHaveBeenCalledTimes(6);
    });

    test('shows results when input is focused with query', () => {
      (useSearchBox as jest.Mock).mockReturnValue({
        query: 'laptop',
        refine: mockRefine,
      });

      (useHits as jest.Mock).mockReturnValue({
        hits: mockHits,
        results: { nbHits: 2 },
      });

      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Buscar productos, marcas y más...');
      fireEvent.focus(input);

      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });

    test('displays no results message when hits are empty', () => {
      (useSearchBox as jest.Mock).mockReturnValue({
        query: 'nonexistent',
        refine: mockRefine,
      });

      (useHits as jest.Mock).mockReturnValue({
        hits: [],
        results: { nbHits: 0 },
      });

      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Buscar productos, marcas y más...');
      fireEvent.focus(input);

      expect(screen.getByText('No se encontraron productos')).toBeInTheDocument();
    });
  });

  describe('Keyboard navigation', () => {
    beforeEach(() => {
      (useSearchBox as jest.Mock).mockReturnValue({
        query: 'laptop',
        refine: mockRefine,
      });

      (useHits as jest.Mock).mockReturnValue({
        hits: mockHits,
        results: { nbHits: 2 },
      });
    });

    test('navigates down with ArrowDown key', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Buscar productos, marcas y más...');
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      const results = screen.getAllByText(/Product/).map(el => el.closest('div[class*="cursor-pointer"]'));
      const selectedResult = results.find(el => el?.className.includes('bg-blue-50'));
      expect(selectedResult).toBeDefined();
      expect(selectedResult?.textContent).toContain('Product 1');
    });

    test('navigates up with ArrowUp key', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Buscar productos, marcas y más...');
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      const results = screen.getAllByText(/Product/).map(el => el.closest('div[class*="cursor-pointer"]'));
      const selectedResult = results.find(el => el?.className.includes('bg-blue-50'));
      expect(selectedResult).toBeDefined();
      expect(selectedResult?.textContent).toContain('Product 1');
    });

    test('does not navigate beyond last item', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Buscar productos, marcas y más...');
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      const results = screen.getAllByText(/Product/).map(el => el.closest('div[class*="cursor-pointer"]'));
      const selectedResult = results.find(el => el?.className.includes('bg-blue-50'));
      expect(selectedResult).toBeDefined();
      expect(selectedResult?.textContent).toContain('Product 2');
    });

    test('navigates to product on Enter when item is selected', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Buscar productos, marcas y más...');
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockPush).toHaveBeenCalledWith('/product/1');
    });

    test('calls onSearch on Enter when no item is selected', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Buscar productos, marcas y más...');
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockOnSearch).toHaveBeenCalledWith('laptop');
    });

    test('closes results on Escape key', async () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Buscar productos, marcas y más...');
      fireEvent.focus(input);

      expect(screen.getByText('Product 1')).toBeInTheDocument();

      fireEvent.keyDown(input, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Click interactions', () => {
    beforeEach(() => {
      (useSearchBox as jest.Mock).mockReturnValue({
        query: 'laptop',
        refine: mockRefine,
      });

      (useHits as jest.Mock).mockReturnValue({
        hits: mockHits,
        results: { nbHits: 2 },
      });
    });

    test('navigates to product when clicking on result', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Buscar productos, marcas y más...');
      fireEvent.focus(input);

      const product = screen.getByText('Product 1');
      fireEvent.click(product);

      expect(mockPush).toHaveBeenCalledWith('/product/1');
    });

    test('calls onSearch when clicking search button with query', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnSearch).toHaveBeenCalledWith('laptop');
    });

    test('navigates to selected product when clicking search button with selection', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Buscar productos, marcas y más...');
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith('/product/1');
    });
  });

  describe('Product display', () => {
    beforeEach(() => {
      (useSearchBox as jest.Mock).mockReturnValue({
        query: 'laptop',
        refine: mockRefine,
      });

      (useHits as jest.Mock).mockReturnValue({
        hits: mockHits,
        results: { nbHits: 2 },
      });
    });

    test('displays product title and price', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Buscar productos, marcas y más...');
      fireEvent.focus(input);

      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('$100')).toBeInTheDocument();
    });

    test('displays product category', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Buscar productos, marcas y más...');
      fireEvent.focus(input);

      expect(screen.getByText('Category 1')).toBeInTheDocument();
    });

    test('displays product rating when available', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Buscar productos, marcas y más...');
      fireEvent.focus(input);

      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('4.0')).toBeInTheDocument();
    });

    test('displays product thumbnail', () => {
      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Buscar productos, marcas y más...');
      fireEvent.focus(input);

      const images = screen.getAllByRole('img');
      expect(images.some(img => img.getAttribute('src') === '/test1.jpg')).toBeTruthy();
    });
  });

  describe('Focus and blur behavior', () => {
    test('hides results when input loses focus', async () => {
      (useSearchBox as jest.Mock).mockReturnValue({
        query: 'laptop',
        refine: mockRefine,
      });

      (useHits as jest.Mock).mockReturnValue({
        hits: mockHits,
        results: { nbHits: 2 },
      });

      render(<SearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Buscar productos, marcas y más...');
      fireEvent.focus(input);

      expect(screen.getByText('Product 1')).toBeInTheDocument();

      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
      }, { timeout: 300 });
    });
  });
});
