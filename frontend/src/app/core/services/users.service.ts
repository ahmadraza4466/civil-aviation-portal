import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface User {
    _id: string;
    email: string;
    name: string;
    role: string;
}

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    private apiService = inject(ApiService);

    getUsers(): Observable<User[]> {
        return this.apiService.get<{ success: boolean; data: User[] }>('/users').pipe(
            map(res => res.data || [])
        );
    }
}
