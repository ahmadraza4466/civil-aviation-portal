import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DiaryEntry {
  time: string;
  device: string;
  deviceColor: string;
  title: string;
  note: string;
  flagged: boolean;
  date: string;
}

@Component({
  selector: 'app-shift-diary',
  standalone: true,
  imports: [CommonModule],
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
      <div *ngIf="selectedFilter"
        style="display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:50rem;font-size:11px;font-weight:700;color:#3b82f6;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.25);cursor:pointer;"
        (click)="filterByCard('')">
        <i class="bi bi-funnel-fill"></i>
        {{ selectedFilter === 'today' ? "Today's Entries" : 'Flagged Items' }}
        <i class="bi bi-x-lg ms-1" style="font-size:9px;"></i>
      </div>
      <button class="btn btn-neon-blue btn-pill px-4">
        <i class="bi bi-plus-lg me-2"></i>Add Entry
      </button>
    </div>
  </div>

  <!-- Clickable Stats -->
  <div class="stat-grid" style="grid-template-columns: repeat(3, 1fr);">

    <div class="stat-card card-btn"
      [class.card-active-blue]="selectedFilter === ''"
      (click)="filterByCard('')"
      title="Show all diary entries">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="stat-label">Total Entries</span>
        <div class="sc-stat-icon" style="background:rgba(59,130,246,0.12);border-color:rgba(59,130,246,0.2);">
          <i class="bi bi-journal-text" style="color:#3b82f6;"></i>
        </div>
      </div>
      <strong class="stat-value" style="color:#3b82f6;">{{ totalCount < 10 ? '0' + totalCount : totalCount }}</strong>
      <small class="stat-sub">Diary records</small>
    </div>

    <div class="stat-card card-btn"
      [class.card-active-green]="selectedFilter === 'today'"
      (click)="filterByCard('today')"
      title="Filter: Today's entries only">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="stat-label">Today's Entries</span>
        <div class="sc-stat-icon" style="background:rgba(16,185,129,0.12);border-color:rgba(16,185,129,0.2);">
          <i class="bi bi-calendar-check-fill" style="color:#10b981;"></i>
        </div>
      </div>
      <strong class="stat-value" style="color:#10b981;">{{ todayCount < 10 ? '0' + todayCount : todayCount }}</strong>
      <small class="stat-sub">Logged today</small>
    </div>

    <div class="stat-card card-btn"
      [class.card-active-amber]="selectedFilter === 'flagged'"
      (click)="filterByCard('flagged')"
      title="Filter: Flagged items only">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="stat-label">Flagged Items</span>
        <div class="sc-stat-icon" style="background:rgba(245,158,11,0.12);border-color:rgba(245,158,11,0.2);">
          <i class="bi bi-flag-fill" style="color:#f59e0b;"></i>
        </div>
      </div>
      <strong class="stat-value" style="color:#f59e0b;">{{ flaggedCount < 10 ? '0' + flaggedCount : flaggedCount }}</strong>
      <small class="stat-sub">Needs follow-up</small>
    </div>

  </div>

  <!-- Timeline Card -->
  <div class="content-card">
    <div class="content-card-header">
      <h2 class="content-card-title">
        <i class="bi bi-clock me-2"></i>
        {{ selectedFilter === 'today' ? "Today's Log" : selectedFilter === 'flagged' ? 'Flagged Items' : 'Shift Timeline' }}
      </h2>
      <div class="d-flex align-items-center gap-2">
        <span class="text-secondary" style="font-size:12px;">{{ filteredEntries.length }} entr{{ filteredEntries.length !== 1 ? 'ies' : 'y' }}</span>
        <button *ngIf="selectedFilter" class="btn btn-sm btn-outline-darker rounded-pill px-3" style="font-size:11px;" (click)="filterByCard('')">
          <i class="bi bi-x me-1"></i>Clear
        </button>
      </div>
    </div>

    <div class="p-4 p-md-5">

      <!-- Empty state -->
      <div *ngIf="filteredEntries.length === 0" class="text-center py-5 text-secondary" style="opacity:.45;">
        <i class="bi bi-journal-x d-block mb-3" style="font-size:2.5rem;"></i>
        <p class="mb-0" style="font-size:13px;">No {{ selectedFilter === 'flagged' ? 'flagged' : "today's" }} entries found.</p>
      </div>

      <!-- Timeline entries -->
      <div class="timeline position-relative" *ngIf="filteredEntries.length > 0">
        <div style="position:absolute;left:100px;top:0;bottom:0;width:1px;background:rgba(255,255,255,0.05);z-index:0;"></div>

        <div class="d-flex mb-5 position-relative z-1" *ngFor="let entry of filteredEntries; let last = last" [class.mb-0]="last">
          <div class="time pe-4 text-secondary text-end" style="width:100px;font-size:0.85rem;padding-top:3px;font-family:monospace;font-weight:700;">
            {{ entry.time }}
          </div>
          <div class="content flex-grow-1 ps-4 pb-2" [style.border-left]="'2px solid ' + entry.deviceColor">
            <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
              <span class="badge px-3 py-2"
                [style.background-color]="entry.deviceColor + '1a'"
                [style.color]="entry.deviceColor"
                [style.border]="'1px solid ' + entry.deviceColor + '4d'">
                {{ entry.device }}
              </span>
              <span *ngIf="entry.flagged" class="badge px-3 py-2"
                style="background:rgba(245,158,11,0.1);color:#f59e0b;border:1px solid rgba(245,158,11,0.3);">
                <i class="bi bi-flag-fill me-1" style="font-size:9px;"></i>Flagged
              </span>
            </div>
            <p class="mb-2 fw-bold text-white fs-5" style="letter-spacing:0.5px;">{{ entry.title }}</p>
            <p class="text-secondary mb-0" style="font-size:0.85rem;">{{ entry.note }}</p>
          </div>
        </div>

      </div>
    </div>
  </div>

</div>
  `
})
export class ShiftDiaryComponent {
  selectedFilter = ''; // '' | 'today' | 'flagged'

  private today = new Date().toISOString().split('T')[0];

  entries: DiaryEntry[] = [
    {
      time: '08:00',
      device: 'A300-600 FFS',
      deviceColor: '#38bdf8',
      title: 'Morning Readiness — Complete',
      note: 'System power up successful. No immediate issues detected during daily check.',
      flagged: false,
      date: this.today
    },
    {
      time: '06:30',
      device: 'B757 FTD',
      deviceColor: '#f59e0b',
      title: 'Visual System Glitch',
      note: 'Left projector flickering briefly. Will monitor during next training session.',
      flagged: true,
      date: this.today
    }
  ];

  get totalCount(): number { return this.entries.length; }
  get todayCount(): number { return this.entries.filter(e => e.date === this.today).length; }
  get flaggedCount(): number { return this.entries.filter(e => e.flagged).length; }

  get filteredEntries(): DiaryEntry[] {
    if (this.selectedFilter === 'today') return this.entries.filter(e => e.date === this.today);
    if (this.selectedFilter === 'flagged') return this.entries.filter(e => e.flagged);
    return this.entries;
  }

  filterByCard(filter: string) {
    this.selectedFilter = filter === '' || this.selectedFilter === filter ? '' : filter;
  }
}
