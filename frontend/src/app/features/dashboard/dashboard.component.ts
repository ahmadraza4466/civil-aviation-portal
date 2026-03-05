import { Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CasesService } from '../../core/services/cases.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { APP_CONSTANTS } from '../../core/constants/app.constants';
import { ReusableTableComponent } from '../../shared/components/reusable-table/reusable-table.component';
import { ReusableDropdownComponent } from '../../shared/components/reusable-dropdown/reusable-dropdown.component';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SnagCase } from '../../core/models/snag-case.model';

Chart.register(...registerables);

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
    recentCases: any[] = [];
    allCases: any[] = [];
    filteredCases: any[] = [];
    casesService = inject(CasesService);
    router = inject(Router);
    fb = inject(FormBuilder);

    @ViewChild('pieChart') pieChart!: ElementRef;
    @ViewChild('barChart') barChart!: ElementRef;

    uptimePercentage = 98.5;
    openSnagsCount = 0;
    pendingMaintCount = 0;
    animatedOpenSnags = 0;
    animatedPendingMaint = 0;

    devices = APP_CONSTANTS.DEVICES;
    ataCodes = APP_CONSTANTS.ATA_CODES.map(a => `${a.code}-${a.description}`);

    filterForm: FormGroup = this.fb.group({
        device: [null],
        ata: [null],
        date: [null]
    });

    tableColumns = [
        { key: 'ffsDevice', header: 'Device' },
        { key: 'date', header: 'Date' },
        { key: 'sequenceNo', header: 'Sequence No' },
        { key: 'ataNo', header: 'ATA No' },
        { key: 'status', header: 'Status' }
    ];

    ngOnInit() {
        this.casesService.cases$.subscribe(cases => {
            this.allCases = cases;
            this.filteredCases = [...cases];
            this.recentCases = cases.slice(0, 5);
            this.openSnagsCount = cases.filter(c => c.status === 'Open').length || 12; // fallback for design purely
            this.pendingMaintCount = cases.filter(c => c.status === 'In Progress').length || 3;
            this.animateCounters();

            this.filterForm.valueChanges.subscribe(values => {
                this.applyFilters(values);
            });
        });
    }

    applyFilters(filters: any) {
        this.filteredCases = this.allCases.filter(c => {
            let match = true;
            if (filters.device && c.ffsDevice !== filters.device) match = false;
            if (filters.ata && c.ataNo !== filters.ata) match = false;
            if (filters.date && c.date !== filters.date) match = false;
            return match;
        });
    }

    onEdit(item: SnagCase) {
        this.router.navigate(['/app/maintenance/new-snag'], { queryParams: { id: item.id } });
    }

    onDelete(item: SnagCase) {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#334155',
            background: '#1e2638',
            color: '#fff',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                this.casesService.deleteCase(item.id).subscribe(() => {
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'The snag has been deleted.',
                        icon: 'success',
                        background: '#1e2638',
                        color: '#fff',
                        confirmButtonColor: '#3b82f6'
                    });
                });
            }
        });
    }

    exportToPdf() {
        const doc = new jsPDF() as any;
        const head = [this.tableColumns.map(c => c.header)];
        const body = this.filteredCases.map(c => this.tableColumns.map(col => c[col.key]));

        doc.text("Snag Cases Report", 14, 15);
        doc.autoTable({
            head: head,
            body: body,
            startY: 20
        });

        doc.save("SnagCasesReport.pdf");
        Swal.fire({
            title: 'Success',
            text: 'PDF Report exported successfully',
            icon: 'success',
            background: '#1e2638',
            color: '#fff',
            confirmButtonColor: '#3b82f6'
        });
    }

    ngAfterViewInit() {
        this.initPieChart();
        this.initBarChart();
    }

    animateCounters() {
        let step = 1;
        const interval = setInterval(() => {
            let done = true;
            if (this.animatedOpenSnags < this.openSnagsCount) {
                this.animatedOpenSnags += step;
                done = false;
            }
            if (this.animatedPendingMaint < this.pendingMaintCount) {
                this.animatedPendingMaint += step;
                done = false;
            }
            if (done) clearInterval(interval);
        }, 50);
    }

    initPieChart() {
        new Chart(this.pieChart.nativeElement, {
            type: 'doughnut',
            data: {
                labels: ['Open', 'In Progress', 'Closed'],
                datasets: [{
                    data: [this.openSnagsCount, this.pendingMaintCount, this.allCases.length - this.openSnagsCount - this.pendingMaintCount || 15],
                    backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { usePointStyle: true, padding: 20, font: { family: "'Segoe UI', sans-serif" }, color: '#94a3b8' }
                    }
                }
            }
        });
    }

    initBarChart() {
        const ctx = this.barChart.nativeElement.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#4f46e5');

        new Chart(this.barChart.nativeElement, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Maintenance Tasks',
                    data: [12, 19, 3, 5, 2, 8],
                    backgroundColor: gradient,
                    borderRadius: 6,
                    barThickness: 20
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { display: true, color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#94a3b8' },
                        border: { display: false }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' },
                        border: { display: false }
                    }
                }
            }
        });
    }

    getBadgeClass(status: string): string {
        if (!status) return 'bg-secondary';
        const s = status.toLowerCase();
        if (s.includes('open') || s.includes('out')) return 'bg-danger';
        if (s.includes('in progress') || s.includes('low') || s.includes('progress')) return 'bg-warning text-dark';
        if (s.includes('closed') || s.includes('stock') || s.includes('close')) return 'bg-success';
        if (s.includes('def')) return 'bg-secondary';
        return 'bg-primary';
    }

    getProgressBarWidth(status: string): string {
        if (!status) return '0%';
        const s = status.toLowerCase();
        if (s.includes('open') || s.includes('out') || s.includes('def')) return '33%';
        if (s.includes('progress') || s.includes('low') || s.includes('in progress')) return '66%';
        if (s.includes('close') || s.includes('stock') || s.includes('closed')) return '100%';
        return '100%';
    }
}
