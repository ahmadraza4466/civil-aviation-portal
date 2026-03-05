import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reusable-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reusable-table.component.html',
  styleUrls: ['./reusable-table.component.css']
})
export class ReusableTableComponent {
  @Input() columns: { key: string; header: string; type?: string }[] = [];
  @Input() set data(value: any[]) {
    this._data = value || [];
    this.updatePagination();
  }
  @Input() emptyMessage = 'No data available';
  @Input() itemsPerPage = 5;

  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  _data: any[] = [];
  currentPage = 1;
  totalPages = 1;
  paginatedData: any[] = [];

  updatePagination() {
    this.totalPages = Math.ceil(this._data.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedData = this._data.slice(startIndex, startIndex + this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  getBadgeClass(status: string): string {
    if (!status) return 'bg-secondary';
    const s = status.toLowerCase();
    if (s.includes('open') || s.includes('out')) return 'bg-danger';
    if (s.includes('progress') || s.includes('low')) return 'bg-warning text-dark';
    if (s.includes('close') || s.includes('stock')) return 'bg-success';
    if (s.includes('def')) return 'bg-secondary';
    return 'bg-primary';
  }

  getProgressBarWidth(status: string): string {
    if (!status) return '0%';
    const s = status.toLowerCase();
    if (s.includes('open') || s.includes('out') || s.includes('def')) return '33%';
    if (s.includes('progress') || s.includes('low')) return '66%';
    if (s.includes('close') || s.includes('stock')) return '100%';
    return '100%';
  }
}
