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
    allLogs: any[] = [];   // source of truth for counts
    filteredLogs: any[] = []; // what the table shows
    selectedFilter = ''; // '' | 'Yes' | 'No'

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

    get totalCount(): number { return this.allLogs.length; }
    get snagLinkedCount(): number { return this.allLogs.filter((l: any) => l.includeInSnag === 'Yes').length; }
    get cleanSessionCount(): number { return this.allLogs.length - this.snagLinkedCount; }

    ngOnInit() {
        this.timeLogsService.fetchTimeLogs();
        this.timeLogsService.timeLogs$.subscribe(data => {
            this.allLogs = data.map(item => ({
                ...item,
                includeInSnag: item.includeInSnag ? 'Yes' : 'No'
            })) as any;
            this.applyFilter();
        });
    }

    filterByCard(filter: string) {
        // Toggle: clicking same card again clears filter (Total always resets)
        this.selectedFilter = filter === '' || this.selectedFilter === filter ? '' : filter;
        this.applyFilter();
    }

    private applyFilter() {
        this.filteredLogs = this.selectedFilter
            ? this.allLogs.filter((l: any) => l.includeInSnag === this.selectedFilter)
            : [...this.allLogs];
    }

    onAdd() { this.router.navigate(['/app/logbook/time-logs/new']); }

    onEdit(item: any) { this.router.navigate(['/app/logbook/time-logs/edit'], { queryParams: { id: item.id } }); }

    onDelete(item: any) {
        Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Yes, delete it!' }).then((result) => {
            if (result.isConfirmed) {
                this.timeLogsService.deleteTimeLog(item.id).subscribe(() => {
                    Swal.fire('Deleted!', 'The time log has been deleted.', 'success');
                });
            }
        });
    }
}
