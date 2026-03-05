import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { SnagCase } from '../models/snag-case.model';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class CasesService {
    private casesSubject = new BehaviorSubject<SnagCase[]>([]);
    public cases$ = this.casesSubject.asObservable();
    private apiService = inject(ApiService);

    constructor() {
        this.fetchCases();
    }

    private fetchCases() {
        this.apiService.get<{ success: boolean; data: any[] }>('/cases').pipe(
            map(res => {
                if (res && res.success) {
                    return res.data.map(item => ({
                        id: item._id,
                        ffsDevice: item.deviceId,
                        date: new Date(item.createdAt).toISOString().split('T')[0],
                        sequenceNo: item.sequenceNumber,
                        status: item.status,
                        ataNo: 'N/A', // Mocking ATA No based on current model limits
                        position: 'N/A',
                        unit: 'N/A',
                        orderNo: 'N/A',
                        complaint: item.title + ' - ' + item.description,
                        action: '',
                        assignedTo: item.assignedTo,
                        actions: item.actions
                    }));
                }
                return [];
            }),
            catchError(err => {
                console.error('Error fetching cases', err);
                return of([]);
            })
        ).subscribe(cases => this.casesSubject.next(cases));
    }

    getCases(): Observable<SnagCase[]> {
        return this.cases$;
    }

    addCase(newCase: SnagCase): Observable<boolean> {
        const payload = {
            sequenceNumber: newCase.sequenceNo || Date.now().toString(),
            title: newCase.complaint?.split(' - ')[0] || 'Snag Report',
            deviceId: newCase.ffsDevice,
            description: newCase.complaint,
            reportedBy: 'System User', // Might want to extract from auth
            status: newCase.status || 'Open',
            assignedTo: newCase.assignedTo,
            actions: newCase.actions
        };

        return this.apiService.post<{ success: boolean }>('/cases', payload).pipe(
            tap(res => {
                if (res && res.success) {
                    this.fetchCases(); // Refresh
                }
            }),
            map(res => !!(res && res.success)),
            catchError(err => {
                console.error('Error adding case', err);
                return of(false);
            })
        );
    }

    updateCase(updatedCase: SnagCase): Observable<boolean> {
        const payload = {
            deviceId: updatedCase.ffsDevice,
            status: updatedCase.status,
            description: updatedCase.complaint,
            title: updatedCase.complaint?.split(' - ')[0] || 'Snag Report',
            assignedTo: updatedCase.assignedTo,
            actions: updatedCase.actions
        };

        return this.apiService.put<{ success: boolean }>(`/cases/${updatedCase.id}`, payload).pipe(
            tap(res => {
                if (res && res.success) {
                    this.fetchCases(); // Refresh
                }
            }),
            map(res => !!(res && res.success)),
            catchError(err => {
                console.error('Error updating case', err);
                return of(false);
            })
        );
    }

    deleteCase(id: string): Observable<boolean> {
        return this.apiService.delete<{ success: boolean }>(`/cases/${id}`).pipe(
            tap(res => {
                if (res && res.success) {
                    this.fetchCases(); // Refresh
                }
            }),
            map(res => !!(res && res.success)),
            catchError(err => {
                console.error('Error deleting case', err);
                return of(false);
            })
        );
    }
}
