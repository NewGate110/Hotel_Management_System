import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/auth/auth.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let loginSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    loginSpy = vi.fn();

    const authMock = {
      isAuthenticated: signal(false),
      login: loginSpy,
      navigateAfterLogin: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: AuthService, useValue: authMock },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('form is valid with correct email and password', () => {
    component.form.setValue({ email: 'guest@hms.com', password: 'Password1!', remember: false });
    expect(component.form.valid).toBe(true);
  });

  it('form is invalid with a bad email format', () => {
    component.form.setValue({ email: 'not-an-email', password: 'Password1!', remember: false });
    expect(component.form.controls.email.hasError('email')).toBe(true);
  });

  it('does not call login when form is invalid', () => {
    component.submit();
    expect(loginSpy).not.toHaveBeenCalled();
  });

  it('calls AuthService.login with form values on valid submit', () => {
    loginSpy.mockReturnValue(of({ role: 'Guest', userId: 1, fullName: 'Test', email: 'g@h.com', token: 'x', expiresAt: '' }));
    component.form.setValue({ email: 'guest@hms.com', password: 'Password1!', remember: false });
    component.submit();
    expect(loginSpy).toHaveBeenCalledWith({ email: 'guest@hms.com', password: 'Password1!', remember: false });
  });

  it('sets error signal on failed login', () => {
    loginSpy.mockReturnValue(throwError(() => ({ status: 401, error: { detail: 'Invalid credentials' } })));
    component.form.setValue({ email: 'bad@hms.com', password: 'wrongpass', remember: false });
    component.submit();
    expect(component.error()).toBeTruthy();
  });
});
