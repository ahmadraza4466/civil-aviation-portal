import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface TimeLog {
    id?: string;
    companyCustomer: string;
    instructor?: string;
    pilot1?: string;
    pilot2?: string;
    observer1?: string;
    observer2?: string;
    startTime: string; // "HH:MM"
    endTime: string;
    timeLost?: string;
    totalTrainingTime: string;
    configuration: string;
    simulatorUsedAs: string;
    timelogSubmitTo?: string[];
    qualityLevel?: number;
    comment?: string;
    engineerOnDuty?: string;
    customerEmail?: string;
    includeInSnag?: boolean;
    createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class TimeLogsService {
    private timeLogsSubject = new BehaviorSubject<TimeLog[]>([]);
    public timeLogs$ = this.timeLogsSubject.asObservable();
    private apiService = inject(ApiService);

    constructor() { this.fetchTimeLogs(); }

    fetchTimeLogs() {
        this.apiService.get<{ success: boolean; data: any[] }>('/time-logs').pipe(
            map(res => {
                if (res && res.success) {
                    return res.data.map(item => ({ ...item, id: item._id }));
                }
                return [];
            }),
            catchError(err => {
                console.error('Error fetching time logs', err);
                return of([]);
            })
        ).subscribe(logs => this.timeLogsSubject.next(logs));
    }

    getTimeLog(id: string): Observable<TimeLog | null> {
        return this.apiService.get<{ success: boolean; data: any }>(`/time-logs/${id}`).pipe(
            map(res => res && res.success ? { ...res.data, id: res.data._id } : null),
            catchError(() => of(null))
        );
    }

    createTimeLog(log: TimeLog): Observable<boolean> {
        return this.apiService.post<{ success: boolean }>('/time-logs', log).pipe(
            tap(res => { if (res && res.success) this.fetchTimeLogs(); }),
            map(res => !!(res && res.success)),
            catchError(() => of(false))
        );
    }

    updateTimeLog(id: string, log: TimeLog): Observable<boolean> {
        return this.apiService.put<{ success: boolean }>(`/time-logs/${id}`, log).pipe(
            tap(res => { if (res && res.success) this.fetchTimeLogs(); }),
            map(res => !!(res && res.success)),
            catchError(() => of(false))
        );
    }

    deleteTimeLog(id: string): Observable<boolean> {
        return this.apiService.delete<{ success: boolean }>(`/time-logs/${id}`).pipe(
            tap(res => { if (res && res.success) this.fetchTimeLogs(); }),
            map(res => !!(res && res.success)),
            catchError(() => of(false))
        );
    }
}
