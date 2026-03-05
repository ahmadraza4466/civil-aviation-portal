import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap, map, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private userSubject = new BehaviorSubject<User | null>(null);
    public user$ = this.userSubject.asObservable();

    private apiService = inject(ApiService);

    private inactivityTimeout: any;
    private tokenExpiryTimeout: any;
    private readonly INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 mins
    private readonly TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

    constructor() {
        this.hydrate();
        this.setupActivityListeners();
    }

    private hydrate() {
        if (typeof window === 'undefined') return;
        const token = localStorage.getItem('auth_token');
        const loginTime = localStorage.getItem('login_time');
        const lastActivity = localStorage.getItem('last_activity');
        const user = localStorage.getItem('auth_user');

        if (token && loginTime && lastActivity && user) {
            const now = Date.now();
            if (now - parseInt(loginTime, 10) > this.TOKEN_EXPIRY_MS) {
                this.logout();
                return;
            }
            if (now - parseInt(lastActivity, 10) > this.INACTIVITY_LIMIT_MS) {
                this.logout();
                return;
            }

            try {
                const parsedUser = JSON.parse(user);
                parsedUser.token = token;
                this.userSubject.next(parsedUser);
                this.startTimers();
            } catch (e) {
                this.logout();
            }
        }
    }

    private setupActivityListeners() {
        if (typeof window !== 'undefined') {
            window.addEventListener('mousemove', () => this.resetInactivityTimer());
            window.addEventListener('keypress', () => this.resetInactivityTimer());
            window.addEventListener('click', () => this.resetInactivityTimer());
        }
    }

    private resetInactivityTimer() {
        if (this.userSubject.value) {
            localStorage.setItem('last_activity', Date.now().toString());
            this.startInactivityTimer();
        }
    }

    private startTimers() {
        this.startInactivityTimer();
        this.startExpiryTimer();
    }

    private startInactivityTimer() {
        if (this.inactivityTimeout) clearTimeout(this.inactivityTimeout);
        if (typeof window !== 'undefined') {
            this.inactivityTimeout = setTimeout(() => {
                this.logout();
            }, this.INACTIVITY_LIMIT_MS);
        }
    }

    private startExpiryTimer() {
        if (typeof window === 'undefined') return;
        const loginTime = parseInt(localStorage.getItem('login_time') || '0', 10);
        const timeRemaining = this.TOKEN_EXPIRY_MS - (Date.now() - loginTime);
        if (this.tokenExpiryTimeout) clearTimeout(this.tokenExpiryTimeout);
        if (timeRemaining > 0) {
            this.tokenExpiryTimeout = setTimeout(() => {
                this.logout();
            }, timeRemaining);
        } else {
            this.logout();
        }
    }

    login(email: string, password: string): Observable<User | null> {
        return this.apiService.post<{ success: boolean; data: { access_token: string; user: any } }>('/auth/login', { email, password }).pipe(
            map(res => {
                if (res && res.success && res.data) {
                    const u: User = {
                        id: res.data.user._id,
                        email: res.data.user.email,
                        name: res.data.user.name,
                        role: res.data.user.role,
                        token: res.data.access_token
                    };
                    return u;
                }
                return null;
            }),
            tap(user => {
                if (user && typeof window !== 'undefined') {
                    localStorage.setItem('auth_token', user.token!);
                    localStorage.setItem('auth_user', JSON.stringify({
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    }));
                    localStorage.setItem('login_time', Date.now().toString());
                    localStorage.setItem('last_activity', Date.now().toString());
                    this.userSubject.next(user);
                    this.startTimers();
                }
            }),
            catchError(err => {
                console.error('Login error', err);
                return of(null);
            })
        );
    }

    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('login_time');
            localStorage.removeItem('last_activity');
        }
        this.userSubject.next(null);
        if (this.inactivityTimeout) clearTimeout(this.inactivityTimeout);
        if (this.tokenExpiryTimeout) clearTimeout(this.tokenExpiryTimeout);
    }

    get currentUserValue(): User | null {
        return this.userSubject.value;
    }
}
