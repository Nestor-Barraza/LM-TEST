import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => {
      const body = JSON.stringify(data);
      return {
        status: init?.status || 200,
        headers: new Headers({
          'Content-Type': 'application/json',
          ...init?.headers,
        }),
        json: async () => data,
        text: async () => body,
      };
    },
  },
}));
