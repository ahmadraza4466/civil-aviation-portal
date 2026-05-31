import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';

export interface Shift {
    _id: string;
    engineerId: string;
    type: string; // 'Morning' | 'Evening' | 'Night' | 'Off' | 'Vacation'
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    startTime?: string;
    endTime?: string;
    hours: number;
    notes?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ShiftsService {
    private apiService = inject(ApiService);

    getShifts(month?: string, engineerId?: string): Observable<Shift[]> {
        let params = new HttpParams();
        if (month) params = params.set('month', month);
        if (engineerId) params = params.set('engineerId', engineerId);

        return this.apiService.get<{ success: boolean; data: Shift[] }>('/shifts', params).pipe(
            map(res => res.data || [])
        );
    }

    createShift(shift: Omit<Shift, '_id'>): Observable<Shift> {
        return this.apiService.post<{ success: boolean; data: Shift }>('/shifts', shift).pipe(
            map(res => res.data)
        );
    }

    updateShift(id: string, shift: Partial<Shift>): Observable<Shift> {
        return this.apiService.put<{ success: boolean; data: Shift }>(`/shifts/${id}`, shift).pipe(
            map(res => res.data)
        );
    }

    deleteShift(id: string): Observable<any> {
        return this.apiService.delete<{ success: boolean; data: any }>(`/shifts/${id}`).pipe(
            map(res => res.data)
        );
    }
}
