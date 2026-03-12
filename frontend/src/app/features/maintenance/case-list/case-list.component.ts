import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { CasesService } from '../../../core/services/cases.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-case-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReusableTableComponent],
  templateUrl: './case-list.component.html'
})
export class CaseListComponent implements OnInit {
  cases: any[] = [];
  filteredCases: any[] = [];
  casesService = inject(CasesService);
  router = inject(Router);

  tableColumns = [
    { key: 'ffsDevice', header: 'Device' },
    { key: 'date', header: 'Date' },
    { key: 'sequenceNo', header: 'Sequence No' },
    { key: 'ataNo', header: 'ATA No' },
    { key: 'status', header: 'Status' }
  ];

  totalCases = 0;
  openCasesCount = 0;
  closedCasesCount = 0;

  ngOnInit() {
    this.casesService.cases$.subscribe(data => {
      this.cases = data;
      this.filteredCases = [...this.cases];
      this.updateSummary();
    });
  }

  updateSummary() {
    this.totalCases = this.cases.length;
    this.openCasesCount = this.cases.filter(p => p.status === 'Open').length;
    this.closedCasesCount = this.cases.filter(p => p.status === 'Closed').length;
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
        // Mock delete via service or local filter
        this.cases = this.cases.filter(p => p.id !== item.id && p.sequenceNo !== item.sequenceNo);
        this.filteredCases = [...this.cases];
        this.updateSummary();
        Swal.fire('Deleted!', 'The case has been removed.', 'success');
      }
    });
  }
}
