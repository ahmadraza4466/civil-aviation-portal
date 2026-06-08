import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { CasesService } from '../../../core/services/cases.service';
import { APP_CONSTANTS } from '../../../core/constants/app.constants';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-case-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReusableTableComponent],
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.css']
})
export class CaseListComponent implements OnInit {
  cases: any[] = [];
  filteredCases: any[] = [];
  casesService = inject(CasesService);
  router = inject(Router);

  tableColumns = [
    { key: 'ffsDevice', header: 'Device' },
    { key: 'date', header: 'Date' },
    { key: 'sequenceNo', header: 'Seq No' },
    { key: 'ataNo', header: 'ATA' },
    { key: 'complaint', header: 'Complaint Overview', type: 'truncate' },
    { key: 'status', header: 'Status' }
  ];

  deviceOptions = APP_CONSTANTS.DEVICES.map(d => d.name);
  selectedDevice = '';
  selectedStatus = ''; // empty = All

  // Status counts (reflect device filter, not status filter)
  totalCases = 0;
  openCount = 0;
  inProgressCount = 0;
  closedCount = 0;
  deferredCount = 0;
  monitoringCount = 0;

  ngOnInit() {
    this.casesService.cases$.subscribe(data => {
      this.cases = data;
      this.applyFilters();
    });
  }

  filterByStatus(status: string) {
    // Total card always resets to "show all"; other cards toggle
    this.selectedStatus = status === '' || this.selectedStatus === status ? '' : status;
    this.applyFilters();
  }

  filterByDevice(device: string) {
    this.selectedDevice = device;
    this.applyFilters();
  }

  private applyFilters() {
    // Step 1: device filter
    const deviceFiltered = this.selectedDevice
      ? this.cases.filter(c => c.ffsDevice === this.selectedDevice)
      : [...this.cases];

    // Step 2: update card counts from device-filtered data (status filter doesn't affect counts)
    this.totalCases = deviceFiltered.length;
    this.openCount = deviceFiltered.filter(p => p.status === 'Open').length;
    this.inProgressCount = deviceFiltered.filter(p => p.status === 'In Progress').length;
    this.closedCount = deviceFiltered.filter(p => p.status === 'Closed').length;
    this.deferredCount = deviceFiltered.filter(p => p.status === 'Deferred').length;
    this.monitoringCount = deviceFiltered.filter(p => p.status === 'Monitoring').length;

    // Step 3: apply status filter for the table
    this.filteredCases = this.selectedStatus
      ? deviceFiltered.filter(c => c.status === this.selectedStatus)
      : deviceFiltered;
  }

  onAdd() {
    this.router.navigate(['/app/maintenance/new-snag']);
  }

  onEdit(item: any) {
    if (item.isTimeLog) {
      this.router.navigate(['/app/logbook/time-logs/edit'], { queryParams: { id: item.id } });
    } else {
      this.router.navigate(['/app/maintenance/new-snag'], { queryParams: { id: item.id } });
    }
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
        this.casesService.deleteCase(item.id).subscribe(() => {
          Swal.fire('Deleted!', 'The case has been removed.', 'success');
        });
      }
    });
  }
}
