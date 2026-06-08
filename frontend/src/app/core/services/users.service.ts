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

export interface CreateUserDto {
    name: string;
    email: string;
    password: string;
    role: string;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
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

    createUser(dto: CreateUserDto): Observable<User> {
        return this.apiService.post<{ success: boolean; data: User }>('/users', dto).pipe(
            map(res => res.data)
        );
    }

    updateUser(id: string, dto: UpdateUserDto): Observable<User> {
        return this.apiService.patch<{ success: boolean; data: User }>(`/users/${id}`, dto).pipe(
            map(res => res.data)
        );
    }

    deleteUser(id: string): Observable<any> {
        return this.apiService.delete<{ success: boolean; data: any }>(`/users/${id}`).pipe(
            map(res => res.data)
        );
    }
}
