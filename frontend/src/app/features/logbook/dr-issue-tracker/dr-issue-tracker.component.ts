import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dr-issue-tracker',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="container-fluid py-4">
      <div class="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 class="fw-bold text-white mb-0" style="letter-spacing: 0.1em;"><i class="bi bi-bug me-2 text-primary"></i>DR Issue Tracker</h2>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0">
                <li class="breadcrumb-item"><a routerLink="/app/dashboard" style="color: #64748b; text-decoration: none;">Home</a></li>
                <li class="breadcrumb-item active text-secondary" aria-current="page">Logbook</li>
            </ol>
          </nav>
        </div>
      </div>
      <div class="alert d-flex align-items-center" role="alert" style="background-color: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1);">
        <i class="bi bi-tools me-3 fs-3 text-secondary"></i>
        <div>Deficiency Reporting module is currently under construction. Please check back later.</div>
      </div>
    </div>
  `
})
export class DrIssueTrackerComponent { }
