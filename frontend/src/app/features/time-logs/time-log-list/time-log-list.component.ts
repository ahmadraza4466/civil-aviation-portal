import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { TimeLogsService, TimeLog } from '../../../core/services/time-logs.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-time-log-list',
    standalone: true,
    imports: [CommonModule, RouterModule, ReusableTableComponent],
    templateUrl: './time-log-list.component.html'
})
export class TimeLogListComponent implements OnInit {
    logs: TimeLog[] = [];
    timeLogsService = inject(TimeLogsService);
    router = inject(Router);

    tableColumns = [
        { key: 'companyCustomer', header: 'Customer' },
        { key: 'configuration', header: 'Configuration' },
        { key: 'startTime', header: 'Start Time' },
        { key: 'endTime', header: 'End Time' },
        { key: 'totalTrainingTime', header: 'Total Training' },
        { key: 'includeInSnag', header: 'In Snag?' }
    ];

    ngOnInit() {
        this.timeLogsService.fetchTimeLogs();
        this.timeLogsService.timeLogs$.subscribe(data => {
            this.logs = data.map(item => ({
                ...item,
                includeInSnag: item.includeInSnag ? 'Yes' : 'No'
            })) as any;
        });
    }

    onAdd() {
        this.router.navigate(['/app/logbook/time-logs/new']);
    }

    onEdit(item: any) {
        this.router.navigate(['/app/logbook/time-logs/edit'], { queryParams: { id: item.id } });
    }

    onDelete(item: any) {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this delete!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                this.timeLogsService.deleteTimeLog(item.id).subscribe(() => {
                    Swal.fire('Deleted!', 'The time log has been deleted.', 'success');
                });
            }
        });
    }
}
