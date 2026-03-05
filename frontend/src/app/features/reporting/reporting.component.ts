import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { ReportsService } from '../../core/services/reports.service';

@Component({
    selector: 'app-reporting',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './reporting.component.html'
})
export class ReportingComponent {
    reportForm: FormGroup;
    isGenerating = false;

    reportsService = inject(ReportsService);
    fb = inject(FormBuilder);

    devices = ['All Devices', 'A220 FFS #2-R', 'B737 FTD', 'A320 FFS', 'A350 FFS'];
    statuses = ['All Statuses', 'Open', 'In Progress', 'Deferred', 'Closed'];
    reportTypes = [
        { id: 'shift_diary_pdf', name: 'Shift Diary Report (PDF)' },
        { id: 'dr_issue_pdf', name: 'DR Issue Summary (PDF)' },
        { id: 'maintenance_docx', name: 'Maintenance Summary (DOCX)' },
        { id: 'parts_pdf', name: 'Parts Inventory Snapshot (PDF)' }
    ];

    constructor() {
        const today = new Date();
        const lastMonth = new Date();
        lastMonth.setMonth(today.getMonth() - 1);

        this.reportForm = this.fb.group({
            dateFrom: [lastMonth.toISOString().split('T')[0], Validators.required],
            dateTo: [today.toISOString().split('T')[0], Validators.required],
            device: ['All Devices', Validators.required],
            status: ['All Statuses', Validators.required],
            reportType: ['shift_diary_pdf', Validators.required]
        });
    }

    downloadHistory: { name: string, date: string, status: string }[] = [];

    async generateReport() {
        if (this.reportForm.invalid) {
            Swal.fire('Error', 'Please fill all required fields', 'error');
            return;
        }

        const formValue = this.reportForm.value;

        // "Add report status indicator (Generated / Downloaded)"
        const newHistory = {
            name: this.getReportName(formValue.reportType),
            date: new Date().toLocaleString(),
            status: 'Generating...'
        };
        this.downloadHistory.unshift(newHistory);

        this.isGenerating = true;

        Swal.fire({
            title: 'Generating Report...',
            html: 'Please wait while we prepare your document.',
            allowEscapeKey: false,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            newHistory.status = 'Generated';

            const reportId = formValue.reportType;

            if (reportId.endsWith('_pdf')) {
                this.generatePDF(formValue, newHistory);
            } else if (reportId.endsWith('_docx')) {
                await this.generateDOCX(formValue);
                newHistory.status = 'Downloaded';
                Swal.fire({
                    icon: 'success',
                    title: 'Report Generated!',
                    text: 'Your file has been downloaded successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }

        } catch (error) {
            newHistory.status = 'Failed';
            Swal.fire('Error', 'Failed to generate report', 'error');
        } finally {
            this.isGenerating = false;
        }
    }

    private generatePDF(data: any, historyItem: any) {
        const doc = new jsPDF();
        const reportName = this.getReportName(data.reportType);

        // Header - Logo Placeholder
        doc.setFillColor(13, 50, 77); // dark blue logo
        doc.rect(14, 15, 10, 10, 'F');
        doc.setFontSize(22);
        doc.setTextColor(13, 50, 77);
        doc.text('CIVIL AVIATION PORTAL', 28, 23);

        doc.setFontSize(16);
        doc.setTextColor(100);
        doc.text('Simulator Maintenance Report', 14, 35);

        // Details
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Report Type: ${reportName}`, 14, 50);
        doc.text(`Date Range: ${data.dateFrom} to ${data.dateTo}`, 14, 60);
        doc.text(`Device Filter: ${data.device}`, 14, 70);
        doc.text(`Status Filter: ${data.status}`, 14, 80);

        // Body mock - Table
        doc.setFontSize(14);
        doc.text('Summary of Activities', 14, 100);
        (doc as any).autoTable({
            startY: 105,
            head: [['Date', 'Device', 'Status', 'Description']],
            body: [
                ['2026-03-01', data.device, data.status, 'Routine inspection completed.'],
                ['2026-03-02', data.device, data.status, 'Resolved snag #001.'],
                ['2026-03-03', data.device, data.status, 'Pending parts delivery.']
            ],
            theme: 'grid',
            headStyles: { fillColor: [13, 50, 77] }
        });

        // Signature block
        const finalY = (doc as any).lastAutoTable.finalY || 150;
        doc.setFontSize(12);
        doc.text('Authorized Signature:', 14, finalY + 30);
        doc.line(14, finalY + 45, 80, finalY + 45); // signature line
        doc.setFontSize(10);
        doc.text('Engineer / Manager', 14, finalY + 50);

        // Footer with page numbers
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            const dateStr = new Date().toLocaleString();
            doc.text(`Generated on: ${dateStr}`, 14, 285);
            doc.text(`Page ` + String(i) + ` of ` + String(pageCount), 180, 285);
        }

        // Preview Modal
        Swal.close();
        const pdfDataUri = doc.output('datauristring');

        Swal.fire({
            title: 'Report Preview',
            html: `<iframe src="${pdfDataUri}" width="100%" height="400px" style="border: none;"></iframe>`,
            width: '800px',
            showCancelButton: true,
            confirmButtonText: 'Download',
            cancelButtonText: 'Close'
        }).then((result) => {
            if (result.isConfirmed) {
                historyItem.status = 'Downloaded';
                doc.save(`${data.reportType}_${Date.now()}.pdf`);
                Swal.fire('Downloaded', 'Your PDF has been saved.', 'success');
            } else {
                historyItem.status = 'Previewed (Not Downloaded)';
            }
        });
    }

    private async generateDOCX(data: any) {
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: "CIVIL AVIATION PORTAL", bold: true, size: 48 }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Maintenance Summary Report", size: 32, color: "555555" }),
                        ],
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: `Date Range: ${data.dateFrom} to ${data.dateTo}` }),
                    new Paragraph({ text: `Device: ${data.device}` }),
                    new Paragraph({ text: `Status: ${data.status}` }),
                    new Paragraph({ text: "" }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "This DOCX was generated client-side using the docx library.", italics: true })
                        ]
                    })
                ],
            }],
        });

        const blob = await Packer.toBlob(doc);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `maintenance_summary_${Date.now()}.docx`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    private getReportName(id: string) {
        return this.reportTypes.find(t => t.id === id)?.name || id;
    }
}
