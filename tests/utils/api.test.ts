import { vi } from 'vitest';

type AxiosInstanceMock = {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  request: ReturnType<typeof vi.fn>;
  interceptors: {
    request: { use: ReturnType<typeof vi.fn> };
    response: { use: ReturnType<typeof vi.fn> };
  };
  _req?: (config: any) => any;
  _resErr?: (error: any) => any;
};

const created: AxiosInstanceMock[] = [];

const axiosMock = {
  create: vi.fn(() => {
    const instance: AxiosInstanceMock = {
      get: vi.fn(),
      post: vi.fn(),
      request: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn((fn: any) => {
            instance._req = fn;
          }),
        },
        response: {
          use: vi.fn((_ok: any, err: any) => {
            instance._resErr = err;
          }),
        },
      },
    };
    created.push(instance);
    return instance as any;
  }),
  isAxiosError: vi.fn(() => false),
};

vi.mock('axios', () => ({
  default: axiosMock,
}));

async function importApi() {
  vi.resetModules();
  created.length = 0;
  axiosMock.create.mockClear();
  axiosMock.isAxiosError.mockClear();

  const mod = await import('@/utils/api');
  const apiClient = created[0];
  const rawClient = created[1];
  return { mod, apiClient, rawClient };
}

describe('api utils (auth client)', () => {
  it('adds Authorization header from in-memory token', async () => {
    const { mod, apiClient } = await importApi();
    expect(apiClient._req).toBeTypeOf('function');

    mod.setAccessToken('abc');
    const out = apiClient._req?.({ headers: {} });
    expect(out.headers.Authorization).toBe('Bearer abc');
  });

  it('ensureAuth refreshes token once when missing', async () => {
    const { mod, rawClient } = await importApi();

    rawClient.post.mockResolvedValueOnce({
      data: { access_token: 'new-token', token_type: 'bearer' },
    });

    expect(mod.getAccessToken()).toBeNull();
    await mod.ensureAuth();
    expect(rawClient.post).toHaveBeenCalledWith('/api/auth/token');
    expect(mod.getAccessToken()).toBe('new-token');

    await mod.ensureAuth();
    expect(rawClient.post).toHaveBeenCalledTimes(1);
  });

  it('logout calls backend logout and clears access token', async () => {
    const { mod, rawClient } = await importApi();

    rawClient.get.mockResolvedValueOnce({ data: { message: 'ok' } });
    mod.setAccessToken('abc');

    await mod.logout();
    expect(rawClient.get).toHaveBeenCalledWith('/api/auth/logout');
    expect(mod.getAccessToken()).toBeNull();
  });

  it('logout clears access token even if backend call fails', async () => {
    const { mod, rawClient } = await importApi();

    rawClient.get.mockRejectedValueOnce(new Error('network'));
    mod.setAccessToken('abc');

    await mod.logout();
    expect(mod.getAccessToken()).toBeNull();
  });
});


