import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-shift-diary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <div class="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 class="fw-bold text-white mb-0" style="letter-spacing: 0.1em;"><i class="bi bi-journal-text me-2 text-primary"></i>Shift Diary</h2>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0">
                <li class="breadcrumb-item"><a routerLink="/app/dashboard" style="color: #64748b; text-decoration: none;">Home</a></li>
                <li class="breadcrumb-item active text-secondary" aria-current="page">Logbook</li>
            </ol>
          </nav>
        </div>
        <button class="btn btn-neon-blue btn-pill px-4"><i class="bi bi-plus-lg me-2"></i>Add Entry</button>
      </div>
      <div class="card dark-panel-card border-0">
        <div class="card-body p-4 p-md-5">
          <div class="timeline position-relative">
            <!-- Central Line simulation -->
            <div style="position: absolute; left: 100px; top: 0; bottom: 0; width: 1px; background-color: rgba(255,255,255,0.05); z-index: 0;"></div>
            
            <div class="d-flex mb-5 position-relative z-1">
              <div class="time pe-4 fw-monospace text-secondary text-end" style="width: 100px; font-size: 0.85rem; padding-top: 3px;">08:00</div>
              <div class="content flex-grow-1 ps-4 pb-2" style="border-left: 2px solid #38bdf8;">
                <span class="badge mb-3 px-3 py-2" style="background-color: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">A300-600 FFS</span>
                <p class="mb-2 fw-bold text-white fs-5" style="letter-spacing: 0.5px;">Morning Readiness - Complete</p>
                <p class="text-secondary" style="font-size: 0.85rem;">Observation: System power up successful. No immediate issues detected during daily check.</p>
              </div>
            </div>

            <div class="d-flex mb-4 position-relative z-1">
              <div class="time pe-4 fw-monospace text-secondary text-end" style="width: 100px; font-size: 0.85rem; padding-top: 3px;">06:30</div>
               <div class="content flex-grow-1 ps-4 pb-2" style="border-left: 2px solid #f59e0b;">
                <span class="badge mb-3 px-3 py-2" style="background-color: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3);">B757 FTD</span>
                <p class="mb-2 fw-bold text-white fs-5" style="letter-spacing: 0.5px;">Visual System Glitch</p>
                <p class="text-secondary" style="font-size: 0.85rem;">Observation: Left projector flickering briefly. Will monitor during next training session.</p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  `
})
export class ShiftDiaryComponent { }
