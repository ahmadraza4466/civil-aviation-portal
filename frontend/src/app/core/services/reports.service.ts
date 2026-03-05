import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ReportRequest } from '../models/report.model';

@Injectable({
    providedIn: 'root'
})
export class ReportsService {
    generateReport(req: ReportRequest): Observable<Blob> {
        // Fake a file blob generation
        const content = `Report generated for ${req.device} from ${req.dateFrom} to ${req.dateTo}.\nType: ${req.reportType}\nStatus: ${req.status}`;
        const blob = new Blob([content], { type: 'text/plain' });
        return of(blob).pipe(delay(1500));
    }
}
