import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-shift-diary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="av-page">

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="page-eyebrow">Logbook</div>
          <h1 class="page-title"><i class="bi bi-journal-text"></i>Shift Diary</h1>
          <p class="page-subtitle">Daily shift observations and handover notes</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-neon-blue btn-pill px-4"><i class="bi bi-plus-lg me-2"></i>Add Entry</button>
        </div>
      </div>

      <!-- Stats -->
      <div class="stat-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="stat-card">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="stat-label">Total Entries</span>
            <div class="sc-stat-icon" style="background:rgba(59,130,246,0.12);border-color:rgba(59,130,246,0.2);">
              <i class="bi bi-journal-text" style="color:#3b82f6;"></i>
            </div>
          </div>
          <strong class="stat-value" style="color:#3b82f6;">02</strong>
          <small class="stat-sub">Diary records</small>
        </div>
        <div class="stat-card">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="stat-label">Today's Entries</span>
            <div class="sc-stat-icon" style="background:rgba(16,185,129,0.12);border-color:rgba(16,185,129,0.2);">
              <i class="bi bi-calendar-check-fill" style="color:#10b981;"></i>
            </div>
          </div>
          <strong class="stat-value" style="color:#10b981;">02</strong>
          <small class="stat-sub">Logged today</small>
        </div>
        <div class="stat-card">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="stat-label">Flagged Items</span>
            <div class="sc-stat-icon" style="background:rgba(245,158,11,0.12);border-color:rgba(245,158,11,0.2);">
              <i class="bi bi-flag-fill" style="color:#f59e0b;"></i>
            </div>
          </div>
          <strong class="stat-value" style="color:#f59e0b;">01</strong>
          <small class="stat-sub">Needs follow-up</small>
        </div>
      </div>

      <!-- Timeline Card -->
      <div class="content-card">
        <div class="content-card-header">
          <h2 class="content-card-title"><i class="bi bi-clock me-2"></i>Shift Timeline</h2>
          <span class="text-secondary" style="font-size:12px;">Today's log</span>
        </div>
        <div class="p-4 p-md-5">
          <div class="timeline position-relative">
            <div style="position:absolute;left:100px;top:0;bottom:0;width:1px;background-color:rgba(255,255,255,0.05);z-index:0;"></div>

            <div class="d-flex mb-5 position-relative z-1">
              <div class="time pe-4 fw-monospace text-secondary text-end" style="width:100px;font-size:0.85rem;padding-top:3px;">08:00</div>
              <div class="content flex-grow-1 ps-4 pb-2" style="border-left:2px solid #38bdf8;">
                <span class="badge mb-3 px-3 py-2" style="background-color:rgba(56,189,248,0.1);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);">A300-600 FFS</span>
                <p class="mb-2 fw-bold text-white fs-5" style="letter-spacing:0.5px;">Morning Readiness - Complete</p>
                <p class="text-secondary" style="font-size:0.85rem;">Observation: System power up successful. No immediate issues detected during daily check.</p>
              </div>
            </div>

            <div class="d-flex mb-4 position-relative z-1">
              <div class="time pe-4 fw-monospace text-secondary text-end" style="width:100px;font-size:0.85rem;padding-top:3px;">06:30</div>
              <div class="content flex-grow-1 ps-4 pb-2" style="border-left:2px solid #f59e0b;">
                <span class="badge mb-3 px-3 py-2" style="background-color:rgba(245,158,11,0.1);color:#f59e0b;border:1px solid rgba(245,158,11,0.3);">B757 FTD</span>
                <p class="mb-2 fw-bold text-white fs-5" style="letter-spacing:0.5px;">Visual System Glitch</p>
                <p class="text-secondary" style="font-size:0.85rem;">Observation: Left projector flickering briefly. Will monitor during next training session.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class ShiftDiaryComponent { }
