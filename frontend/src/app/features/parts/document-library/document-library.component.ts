import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-document-library',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './document-library.component.html'
})
export class DocumentLibraryComponent {
    documents = [
        { id: 1, name: 'A350 Maintenance Manual Volume 1', type: 'PDF', size: '15 MB', date: '2025-10-15' },
        { id: 2, name: 'B737 Engine Schematic', type: 'PDF', size: '5 MB', date: '2026-01-20' },
        { id: 3, name: 'Simulator Operator Guide', type: 'DOCX', size: '2.5 MB', date: '2026-02-10' },
        { id: 4, name: 'Q1 Compliance Report', type: 'PDF', size: '1.2 MB', date: '2026-03-01' }
    ];

    viewDoc(docName: string) {
        Swal.fire({
            title: docName,
            html: `
        <div class="text-center p-4">
          <i class="bi bi-file-earmark-pdf text-danger display-1 mb-3"></i>
          <p class="text-muted">Previewing document content...</p>
        </div>
      `,
            confirmButtonText: 'Close',
            width: '600px'
        });
    }

    downloadDoc(docName: string) {
        Swal.fire({
            title: `Download ${docName}?`,
            text: "This will start downloading the file to your device.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Download',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                // Mock download logic
                const blob = new Blob(['Dummy content for testing download.'], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = docName.replace(/ /g, '_') + '.txt';
                a.click();
                window.URL.revokeObjectURL(url);

                Swal.fire('Downloaded!', `${docName} has been downloaded.`, 'success');
            }
        });
    }
}
