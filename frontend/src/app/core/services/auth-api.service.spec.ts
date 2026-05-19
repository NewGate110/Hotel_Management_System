// Author: S2401265 Ahmed Aslan Ibrahim
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthApiService } from './auth-api.service';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login() POSTs to /api/Auth/login', () => {
    const body = { email: 'test@example.com', password: 'Test@1234!' };
    const mockResponse = {
      token: 'mock-token',
      userId: 1,
      email: 'test@example.com',
      role: 'Guest' as const,
      fullName: 'Test User',
      expiresAt: '2026-01-01T00:00:00Z',
      requiresPasswordChange: false,
      canManageMedia: false,
    };

    service.login(body).subscribe(res => {
      expect(res.email).toBe('test@example.com');
    });

    const req = httpMock.expectOne('/api/Auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mockResponse);
  });

  it('logout() POSTs to /api/Auth/logout', () => {
    service.logout().subscribe();

    const req = httpMock.expectOne('/api/Auth/logout');
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('register() POSTs to /api/Auth/register', () => {
    const body = {
      email: 'new@example.com',
      password: 'New@1234!',
      firstName: 'New',
      lastName: 'User',
      phone: '',
    };
    const mockResponse = {
      token: 'mock-token',
      userId: 2,
      email: 'new@example.com',
      role: 'Guest' as const,
      fullName: 'New User',
      expiresAt: '2026-01-01T00:00:00Z',
      requiresPasswordChange: false,
      canManageMedia: false,
    };

    service.register(body).subscribe();

    const req = httpMock.expectOne('/api/Auth/register');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
