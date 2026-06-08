import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ShiftsService, Shift } from '../../../core/services/shifts.service';
import { UsersService, User } from '../../../core/services/users.service';
import Swal from 'sweetalert2';
import { timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-shift-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="av-page">

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="page-eyebrow">Operations</div>
          <h1 class="page-title"><i class="bi bi-calendar3"></i>Engineers Shift Schedule</h1>
          <p class="page-subtitle">Monthly team shift planning, working hours, and vacation tracking</p>
        </div>

        <div class="page-header-actions">
          <button class="btn btn-outline-darker btn-pill" type="button" (click)="setCurrentMonth()">Today</button>
          <button class="sc-icon-btn" type="button" (click)="prevMonth()">
            <i class="bi bi-chevron-left"></i>
          </button>
          <button class="sc-icon-btn" type="button" (click)="nextMonth()">
            <i class="bi bi-chevron-right"></i>
          </button>
          <div class="month-pill">{{ getMonthName() }} {{ selectedYear }}</div>

          <!-- Engineer filter dropdown -->
          <div class="dropdown">
            <button class="btn btn-outline-darker btn-pill dropdown-toggle" type="button"
              data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-funnel me-1"></i>{{ getSelectedEngineerName() }}
            </button>
            <ul class="dropdown-menu dropdown-menu-end sc-dropdown-menu">
              <li>
                <a class="dropdown-item text-secondary py-2" href="javascript:void(0)"
                  (click)="selectEngineer('')">
                  <i class="bi bi-people me-2 opacity-50"></i>All Engineers
                </a>
              </li>
              <li><hr class="dropdown-divider my-1" style="border-color: rgba(255,255,255,0.08);"></li>
              <li *ngFor="let eng of engineers">
                <a class="dropdown-item py-2"
                  [class.text-info]="filterEngineerId === eng._id"
                  [class.text-light]="filterEngineerId !== eng._id"
                  href="javascript:void(0)" (click)="selectEngineer(eng._id)">
                  <i class="bi bi-check2 me-2"
                    [style.visibility]="filterEngineerId === eng._id ? 'visible' : 'hidden'"></i>{{ eng.name }}
                </a>
              </li>
            </ul>
          </div>

          <button class="btn btn-neon-blue btn-pill" type="button" (click)="openAddModal()">
            <i class="bi bi-plus-lg me-1"></i>Add Shift
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="stat-grid" style="grid-template-columns: repeat(4, 1fr);">
        <div class="stat-card">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="stat-label">Month Hours</span>
            <div class="sc-stat-icon" style="background:rgba(6,182,212,0.12);border-color:rgba(6,182,212,0.2);">
              <i class="bi bi-clock-fill" style="color:#06b6d4;"></i>
            </div>
          </div>
          <strong class="stat-value" style="color:#06b6d4;">{{ totalScheduledHours }}</strong>
          <small class="stat-sub">Total scheduled hours</small>
        </div>
        <div class="stat-card">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="stat-label">People Scheduled</span>
            <div class="sc-stat-icon" style="background:rgba(79,70,229,0.12);border-color:rgba(79,70,229,0.2);">
              <i class="bi bi-people-fill" style="color:#4f46e5;"></i>
            </div>
          </div>
          <strong class="stat-value" style="color:#4f46e5;">{{ peopleCount }}</strong>
          <small class="stat-sub">Engineers with shifts</small>
        </div>
        <div class="stat-card">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="stat-label">Total Shifts</span>
            <div class="sc-stat-icon" style="background:rgba(59,130,246,0.12);border-color:rgba(59,130,246,0.2);">
              <i class="bi bi-calendar-check-fill" style="color:#3b82f6;"></i>
            </div>
          </div>
          <strong class="stat-value" style="color:#3b82f6;">{{ totalShiftCount }}</strong>
          <small class="stat-sub">Working shift entries</small>
        </div>
        <div class="stat-card">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="stat-label">Vacation Days</span>
            <div class="sc-stat-icon" style="background:rgba(245,158,11,0.12);border-color:rgba(245,158,11,0.2);">
              <i class="bi bi-umbrella-fill" style="color:#f59e0b;"></i>
            </div>
          </div>
          <strong class="stat-value" style="color:#f59e0b;">{{ vacationDaysCount }}</strong>
          <small class="stat-sub">Annual paid vacation</small>
        </div>
      </div>

      <!-- Schedule Card -->
      <div class="content-card">
        <div class="content-card-header">
          <div>
            <h6 class="content-card-title">AVIO ENGINEERS SHIFT SCHEDULE</h6>
            <span class="sc-sub-text">{{ getFilteredEngineers().length }} Members &middot; {{ getMonthName() }} {{ selectedYear }}</span>
          </div>
          <div class="sc-card-header-right">
            <div class="legend">
              <span><i class="dot morning"></i>Morning</span>
              <span><i class="dot evening"></i>Evening</span>
              <span><i class="dot night"></i>Night</span>
              <span><i class="dot vacation"></i>Vacation</span>
            </div>
            <small class="sc-tip">Double-click cell to assign &middot; Click shift to edit</small>
          </div>
        </div>

        <div *ngIf="isLoading" class="loading-box">
          <div class="spinner-border text-info" role="status"></div>
          <span>Loading shift schedule...</span>
        </div>

        <div *ngIf="!isLoading" class="schedule-scroll">
          <table class="schedule-table">
            <thead>
              <tr>
                <th class="engineer-head">
                  <div>Engineers</div>
                </th>
                <th
                  *ngFor="let day of days"
                  [class.weekend-head]="isWeekend(day.dateString)"
                  [class.today-head]="isToday(day.dateString)"
                >
                  <div class="day-num">{{ day.dayNum }}</div>
                  <div class="day-name">{{ day.dayName }}</div>
                </th>
              </tr>

              <tr class="daily-row">
                <td class="engineer-head daily-label">
                  <div>Daily hours</div>
                  <div>People</div>
                </td>
                <td
                  *ngFor="let day of days"
                  [class.weekend-cell]="isWeekend(day.dateString)"
                  [class.today-cell]="isToday(day.dateString)"
                >
                  <div class="daily-hours">{{ dailyHoursMap[day.dateString] || 0 }}</div>
                  <div class="daily-people">{{ dailyPeopleMap[day.dateString] || 0 }}</div>
                </td>
              </tr>
            </thead>

            <tbody>
              <tr *ngFor="let eng of getFilteredEngineers()">
                <td class="engineer-cell">
                  <div class="engineer-info">
                    <div class="avatar">{{ getInitials(eng.name) }}</div>
                    <div>
                      <div class="engineer-name">{{ eng.name }}</div>
                      <div class="engineer-hours">{{ engineerTotalHoursMap[eng._id] || 0 }} monthly hours</div>
                    </div>
                  </div>
                </td>

                <ng-container *ngFor="let cell of engineerCellsMap[eng._id] || []">
                  <td
                    *ngIf="cell.type === 'Vacation'"
                    [attr.colspan]="cell.span"
                    class="schedule-cell vacation-cell"
                  >
                    <div class="vacation-bar" (click)="openEditModal(cell.shift)">
                      <strong>Annual Paid Vacation</strong>
                      <span>{{ cell.shift?.startDate }} &rarr; {{ cell.shift?.endDate }}</span>
                    </div>
                  </td>

                  <td
                    *ngIf="cell.type === 'Shift'"
                    class="schedule-cell"
                    [class.weekend-cell]="isWeekend(cell.dateString)"
                    [class.today-cell]="isToday(cell.dateString)"
                  >
                    <div class="shift-card" [ngClass]="getShiftClass(cell.shift?.type)" (click)="openEditModal(cell.shift)">
                      <strong>{{ cell.shift?.type }}</strong>
                      <span *ngIf="cell.shift?.startTime && cell.shift?.endTime">
                        {{ cell.shift?.startTime }} - {{ cell.shift?.endTime }}
                      </span>
                      <small *ngIf="cell.shift?.notes">{{ cell.shift?.notes }}</small>
                    </div>
                  </td>

                  <td
                    *ngIf="cell.type === 'Empty'"
                    class="schedule-cell empty-cell"
                    [class.weekend-cell]="isWeekend(cell.dateString)"
                    [class.today-cell]="isToday(cell.dateString)"
                    (dblclick)="openAddModal(eng._id, cell.dateString)"
                  >
                    <button class="add-cell-btn" type="button" (click)="openAddModal(eng._id, cell.dateString)">
                      +
                    </button>
                  </td>
                </ng-container>
              </tr>

              <tr *ngIf="getFilteredEngineers().length === 0">
                <td class="empty-state" [attr.colspan]="days.length + 1">
                  No engineers found. Please check users/engineers data.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div *ngIf="isModalOpen" class="modal-backdrop-custom">
        <div class="modal-card">
          <div class="modal-header-custom">
            <div>
              <h3>{{ isEditing ? 'Edit Shift' : 'Schedule New Shift' }}</h3>
              <p>{{ isEditing ? 'Update engineer shift details' : 'Assign a new shift to engineer' }}</p>
            </div>
            <button type="button" class="modal-close" (click)="closeModal()">&times;</button>
          </div>

          <form [formGroup]="shiftForm" (ngSubmit)="saveShift()">
            <div class="modal-body-custom">
              <div class="form-group">
                <label>Assign to Engineer</label>
                <select formControlName="engineerId">
                  <option value="">Select Engineer...</option>
                  <option *ngFor="let eng of engineers" [value]="eng._id">{{ eng.name }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Shift Type</label>
                <select formControlName="type" (change)="onShiftTypeChange()">
                  <option value="Morning">Morning (08:00 - 16:00)</option>
                  <option value="Evening">Evening (16:00 - 24:00)</option>
                  <option value="Night">Night (00:00 - 08:00)</option>
                  <option value="Vacation">Annual Paid Vacation</option>
                  <option value="Off">Scheduled Off</option>
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Start Date</label>
                  <input type="date" formControlName="startDate" />
                </div>
                <div class="form-group">
                  <label>End Date</label>
                  <input type="date" formControlName="endDate" />
                </div>
              </div>

              <div class="form-row" *ngIf="showTimeFields()">
                <div class="form-group">
                  <label>Start Time</label>
                  <input type="time" formControlName="startTime" />
                </div>
                <div class="form-group">
                  <label>End Time</label>
                  <input type="time" formControlName="endTime" />
                </div>
              </div>

              <div class="form-group" *ngIf="showHoursField()">
                <label>Scheduled Hours</label>
                <input type="number" step="0.5" formControlName="hours" />
              </div>

              <div class="form-group">
                <label>Notes / Simulator Target</label>
                <input type="text" placeholder="e.g. A320 FFS, Maintenance Duty" formControlName="notes" />
              </div>
            </div>

            <div class="modal-footer-custom">
              <button type="button" class="btn btn-danger btn-sm rounded-pill px-3" *ngIf="isEditing" (click)="deleteShift()">
                <i class="bi bi-trash me-1"></i>Delete
              </button>
              <div class="modal-footer-right">
                <button type="button" class="btn btn-outline-darker btn-pill" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-neon-blue btn-pill">Save Shift</button>
              </div>
            </div>
          </form>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      color: #f8fafc;

      /* Table-level CSS variables — dark default */
      --card-bg: #1e2638;
      --card-border: rgba(255, 255, 255, 0.05);
      --title-color: #ffffff;
      --sub-text: #94a3b8;
      --table-header-bg: #0f172a;
      --table-header-border: rgba(255, 255, 255, 0.08);
      --daily-bg: #15192b;
      --cell-bg: #1e2638;
      --cell-border: rgba(255, 255, 255, 0.05);
      --cell-weekend-bg: #15192b;
      --cell-today-bg: rgba(2, 132, 199, 0.15);
      --cell-today-border: rgba(14, 165, 233, 0.5);
      --modal-backdrop: rgba(15, 23, 42, 0.8);
      --modal-bg: #1e2638;
      --modal-header-bg: #15192b;
      --input-bg: rgba(15, 23, 42, 0.4);
      --input-border: rgba(255, 255, 255, 0.1);
      --input-color: #e2e8f0;
      --empty-cell-btn-color: rgba(255, 255, 255, 0.15);
    }

    :host-context(body.light-theme) {
      color: #1e293b;
      --card-bg: #ffffff;
      --card-border: #e2e8f0;
      --title-color: #0f172a;
      --sub-text: #64748b;
      --table-header-bg: #f1f5f9;
      --table-header-border: #e2e8f0;
      --daily-bg: #f8fafc;
      --cell-bg: #ffffff;
      --cell-border: #e2e8f0;
      --cell-weekend-bg: #f8fafc;
      --cell-today-bg: #ecfeff;
      --cell-today-border: rgba(14, 165, 233, 0.35);
      --modal-backdrop: rgba(15, 23, 42, 0.58);
      --modal-bg: #ffffff;
      --modal-header-bg: #f8fafc;
      --input-bg: #ffffff;
      --input-border: #cbd5e1;
      --input-color: #1e293b;
      --empty-cell-btn-color: #cbd5e1;
    }

    /* Small icon button for prev/next month nav */
    .sc-icon-btn {
      width: 38px;
      height: 38px;
      border: 1px solid #334155;
      border-radius: 10px;
      background: transparent;
      color: #94a3b8;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: .15s ease;
    }

    .sc-icon-btn:hover {
      border-color: #3b82f6;
      color: #3b82f6;
    }

    :host-context(body.light-theme) .sc-icon-btn {
      border-color: #cbd5e1;
      color: #64748b;
    }

    .month-pill {
      background: var(--table-header-bg);
      color: var(--title-color);
      border: 1px solid var(--card-border);
      border-radius: 999px;
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 800;
      white-space: nowrap;
    }

    /* Dropdown menu for engineer filter */
    .sc-dropdown-menu {
      background-color: #1e2638;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      border-radius: 0.75rem !important;
      min-width: 200px;
    }

    :host-context(body.light-theme) .sc-dropdown-menu {
      background-color: #ffffff !important;
      border-color: #e2e8f0 !important;
    }

    /* Content card sub-header elements */
    .sc-sub-text {
      color: var(--sub-text);
      font-size: 12px;
      font-weight: 600;
      display: block;
      margin-top: 3px;
    }

    .sc-card-header-right {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .sc-tip {
      color: var(--sub-text);
      font-size: 11px;
      font-style: italic;
      white-space: nowrap;
    }

    .legend {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .legend span {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--sub-text);
      font-weight: 700;
      font-size: 12px;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      display: inline-block;
    }

    .dot.morning  { background: #38bdf8; }
    .dot.evening  { background: #8b5cf6; }
    .dot.night    { background: #4f46e5; }
    .dot.vacation { background: #94a3b8; }

    /* ── Table ── */
    .loading-box {
      min-height: 280px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: var(--sub-text);
      font-weight: 700;
    }

    .schedule-scroll {
      overflow: auto;
      max-height: 68vh;
    }

    .schedule-table {
      border-collapse: separate;
      border-spacing: 0;
      width: max-content;
      min-width: 100%;
      table-layout: fixed;
      font-size: 12px;
    }

    .schedule-table th {
      position: sticky;
      top: 0;
      z-index: 5;
      min-width: 76px;
      width: 76px;
      background: var(--table-header-bg);
      color: var(--title-color);
      border-right: 1px solid var(--table-header-border);
      border-bottom: 1px solid var(--table-header-border);
      padding: 9px 6px;
      text-align: center;
    }

    .engineer-head {
      left: 0;
      z-index: 8 !important;
      min-width: 245px !important;
      width: 245px !important;
      text-align: left !important;
      padding-left: 16px !important;
      background: var(--table-header-bg) !important;
      color: var(--title-color) !important;
      border-right: 2px solid var(--card-border) !important;
    }

    .day-num { font-size: 14px; font-weight: 900; line-height: 1; }
    .day-name { margin-top: 4px; color: var(--sub-text); font-size: 10px; font-weight: 700; }

    .weekend-head { background: var(--table-header-bg) !important; opacity: .95; }

    .today-head {
      background: rgba(56, 189, 248, 0.15) !important;
      box-shadow: inset 0 -3px 0 #38bdf8;
    }

    .daily-row td {
      position: sticky;
      top: 53px;
      z-index: 4;
      background: var(--daily-bg);
      border-right: 1px solid var(--card-border);
      border-bottom: 1px solid var(--card-border);
      padding: 7px 6px;
      text-align: center;
      min-width: 76px;
      width: 76px;
    }

    .daily-row .engineer-head {
      z-index: 7 !important;
      background: var(--table-header-bg) !important;
      color: var(--title-color) !important;
    }

    .daily-label { font-size: 11px; font-weight: 700; line-height: 1.5; }
    .daily-hours { color: #3b82f6; font-weight: 900; font-size: 12px; }
    .daily-people { color: var(--sub-text); font-weight: 800; font-size: 11px; }

    .schedule-table tbody td {
      min-width: 76px;
      width: 76px;
      height: 82px;
      border-right: 1px solid var(--cell-border);
      border-bottom: 1px solid var(--cell-border);
      background: var(--cell-bg);
      padding: 7px;
      vertical-align: middle;
      text-align: center;
    }

    .engineer-cell {
      position: sticky;
      left: 0;
      z-index: 3;
      min-width: 245px !important;
      width: 245px !important;
      background: var(--card-bg) !important;
      color: var(--title-color) !important;
      text-align: left !important;
      border-right: 2px solid var(--card-border) !important;
      padding: 10px 14px !important;
    }

    .engineer-info { display: flex; align-items: center; gap: 10px; }

    .avatar {
      width: 38px;
      height: 38px;
      border-radius: 999px;
      background: linear-gradient(135deg, #4f46e5, #3b82f6);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      box-shadow: 0 6px 16px rgba(59, 130, 246, .22);
      flex: 0 0 auto;
    }

    .engineer-name  { color: var(--title-color); font-weight: 900; font-size: 13px; line-height: 1.2; }
    .engineer-hours { color: var(--sub-text); font-size: 11px; margin-top: 4px; font-weight: 700; }

    .schedule-table tbody tr:hover .engineer-cell,
    .schedule-table tbody tr:hover .schedule-cell {
      background: rgba(255, 255, 255, 0.02) !important;
    }

    :host-context(body.light-theme) .schedule-table tbody tr:hover .engineer-cell,
    :host-context(body.light-theme) .schedule-table tbody tr:hover .schedule-cell {
      background: #f8fafc !important;
    }

    .schedule-cell.weekend-cell,
    .weekend-cell { background: var(--cell-weekend-bg) !important; }

    .today-cell {
      background: var(--cell-today-bg) !important;
      box-shadow: inset 0 0 0 2px var(--cell-today-border);
    }

    .shift-card {
      min-height: 54px;
      border-radius: 12px;
      padding: 7px;
      text-align: left;
      cursor: pointer;
      transition: .15s ease;
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-left: 4px solid transparent;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }

    :host-context(body.light-theme) .shift-card {
      box-shadow: 0 4px 10px rgba(15, 23, 42, .06);
    }

    .shift-card:hover { transform: translateY(-2px); box-shadow: 0 10px 18px rgba(0,0,0,.25); }
    :host-context(body.light-theme) .shift-card:hover { box-shadow: 0 10px 18px rgba(15,23,42,.14); }

    .shift-card strong { display: block; font-size: 11px; font-weight: 900; line-height: 1.15; }
    .shift-card span   { display: block; font-size: 10px; margin-top: 4px; font-weight: 700; opacity: .86; }
    .shift-card small  { display: block; font-size: 9px; margin-top: 3px; opacity: .8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .shift-morning { background: #e0f2fe; color: #075985; border-left-color: #0284c7; }
    .shift-evening { background: #ede9fe; color: #5b21b6; border-left-color: #7c3aed; }
    .shift-night   { background: #e0e7ff; color: #3730a3; border-left-color: #4f46e5; }
    .shift-off     { background: rgba(255,255,255,.05); color: var(--sub-text); border-left-color: #94a3b8; }
    :host-context(body.light-theme) .shift-off { background: #f1f5f9; color: #64748b; }

    .vacation-cell  { background: var(--cell-weekend-bg) !important; padding: 8px !important; }

    .vacation-bar {
      height: 54px;
      background: linear-gradient(135deg, #64748b, #475569);
      color: #ffffff;
      border-radius: 13px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,.1), 0 6px 14px rgba(0,0,0,.25);
      transition: .15s ease;
    }

    :host-context(body.light-theme) .vacation-bar {
      background: linear-gradient(135deg, #cbd5e1, #94a3b8);
      color: #334155;
    }

    .vacation-bar:hover { transform: translateY(-1px); }
    .vacation-bar strong { font-size: 12px; font-weight: 900; }
    .vacation-bar span   { margin-top: 4px; font-size: 10px; font-weight: 700; opacity: .85; }

    .empty-cell { position: relative; }

    .add-cell-btn {
      width: 28px;
      height: 28px;
      border-radius: 999px;
      border: 1px dashed var(--empty-cell-btn-color);
      background: transparent;
      color: transparent;
      font-weight: 900;
      transition: .15s ease;
      cursor: pointer;
    }

    .empty-cell:hover .add-cell-btn {
      color: #3b82f6;
      background: rgba(59,130,246,.15);
      border-color: #3b82f6;
    }

    .empty-state { padding: 40px !important; color: var(--sub-text); font-weight: 700; text-align: center; }

    /* ── Modal ── */
    .modal-backdrop-custom {
      position: fixed;
      inset: 0;
      background: var(--modal-backdrop);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      padding: 18px;
      backdrop-filter: blur(6px);
    }

    .modal-card {
      width: min(560px, 100%);
      background: var(--modal-bg);
      color: #f8fafc;
      border-radius: 20px;
      box-shadow: 0 24px 70px rgba(0,0,0,.45);
      overflow: hidden;
      border: 1px solid var(--card-border);
    }

    :host-context(body.light-theme) .modal-card { color: #1e293b; box-shadow: 0 24px 70px rgba(15,23,42,.28); }

    .modal-header-custom {
      padding: 20px 22px;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: flex-start;
      background: var(--modal-header-bg);
    }

    .modal-header-custom h3 { margin: 0; color: var(--title-color); font-weight: 900; font-size: 20px; }
    .modal-header-custom p  { margin: 5px 0 0; color: var(--sub-text); font-size: 13px; }

    .modal-close {
      border: 0;
      background: rgba(255,255,255,.07);
      color: var(--sub-text);
      width: 34px;
      height: 34px;
      border-radius: 999px;
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
    }

    :host-context(body.light-theme) .modal-close { background: #f1f5f9; }

    .modal-body-custom { padding: 22px; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { margin-bottom: 14px; }

    .form-group label {
      display: block;
      color: var(--sub-text);
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .06em;
      margin-bottom: 7px;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      border: 1px solid var(--input-border);
      background: var(--input-bg);
      color: var(--input-color);
      border-radius: 12px;
      padding: 10px 12px;
      outline: none;
      font-weight: 600;
    }

    .form-group input:focus,
    .form-group select:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59,130,246,.15);
      background: var(--card-bg);
    }

    .modal-footer-custom {
      padding: 16px 22px;
      border-top: 1px solid var(--card-border);
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      background: var(--modal-header-bg);
    }

    .modal-footer-right { display: flex; gap: 10px; margin-left: auto; }

    @media (max-width: 650px) {
      .form-row { grid-template-columns: 1fr; }
      .sc-card-header-right { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class ShiftScheduleComponent implements OnInit {
  fb = inject(FormBuilder);
  shiftsService = inject(ShiftsService);
  usersService = inject(UsersService);

  engineers: User[] = [];
  shifts: Shift[] = [];
  days: any[] = [];

  isLoading = false;

  selectedMonth = 2;
  selectedYear = 2026;

  filterEngineerId = '';

  isModalOpen = false;
  isEditing = false;
  editingShiftId: string | null = null;
  shiftForm!: FormGroup;

  monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  engineerCellsMap: Record<string, any[]> = {};
  engineerTotalHoursMap: Record<string, number> = {};
  dailyHoursMap: Record<string, number> = {};
  dailyPeopleMap: Record<string, number> = {};
  totalScheduledHours = 0;
  peopleCount = 0;
  totalShiftCount = 0;
  vacationDaysCount = 0;

  ngOnInit() {
    this.initForm();
    this.generateCalendarDays();
    this.loadEngineers();
    this.loadShifts();
  }

  initForm() {
    this.shiftForm = this.fb.group({
      engineerId: ['', Validators.required],
      type: ['Morning', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      startTime: ['08:00'],
      endTime: ['16:00'],
      hours: [8, [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  selectEngineer(id: string) {
    this.filterEngineerId = id;
    this.loadShifts();
  }

  getSelectedEngineerName(): string {
    if (!this.filterEngineerId) return 'All Engineers';
    const eng = this.engineers.find(e => e._id === this.filterEngineerId);
    return eng ? eng.name : 'All Engineers';
  }

  loadEngineers() {
    this.usersService.getUsers().pipe(
      timeout(10000),
      catchError((err) => {
        console.error('Engineers load failed or timed out:', err);
        return throwError(() => new Error(err.message || 'Request timed out'));
      })
    ).subscribe({
      next: (res: any) => {
        const usersPayload = res?.data ?? res?.users ?? res;
        const users = Array.isArray(usersPayload) ? usersPayload : [];
        this.engineers = users.filter((u: any) =>
          u.role === 'engineer' || u.role === 'ENGINEER' || u.role === 'Engineer' || u.position === 'Engineer'
        );
        if (this.engineers.length === 0) this.engineers = users;
        this.precalculateAll();
      },
      error: (err) => {
        console.error('Failed to load engineers list:', err);
        Swal.fire('Error', 'Failed to load engineers list. Please check database connection.', 'error');
      }
    });
  }

  loadShifts() {
    this.isLoading = true;
    const monthStr = `${this.selectedYear}-${(this.selectedMonth + 1).toString().padStart(2, '0')}`;

    this.shiftsService.getShifts(monthStr, this.filterEngineerId).pipe(
      timeout(10000),
      catchError((err) => {
        console.error('Shifts load failed or timed out:', err);
        return throwError(() => new Error(err.message || 'Request timed out'));
      })
    ).subscribe({
      next: (res: any) => {
        const payload = res?.data ?? res?.shifts ?? res;
        this.shifts = Array.isArray(payload) ? payload : [];
        this.precalculateAll();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load shifts:', err);
        this.shifts = [];
        this.precalculateAll();
        this.isLoading = false;
        Swal.fire('Error', 'Failed to load shift schedule. Please try again.', 'error');
      }
    });
  }

  generateCalendarDays() {
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
    const daysArr = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(this.selectedYear, this.selectedMonth, d);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 2);
      daysArr.push({
        dayNum: d,
        dayName,
        dateString: `${this.selectedYear}-${(this.selectedMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
      });
    }
    this.days = daysArr;
  }

  precalculateAll() {
    try {
      const cellsMap: Record<string, any[]> = {};
      const hoursMap: Record<string, number> = {};
      for (const eng of this.engineers) hoursMap[eng._id] = 0;

      const daysInMonth = this.days.length;
      for (const engineer of this.engineers) {
        const cells = [];
        const engShifts = this.shifts.filter((s: any) => this.getShiftEngineerId(s) === engineer._id);
        let d = 1;
        while (d <= daysInMonth) {
          const currentDateStr = this.days[d - 1].dateString;
          const vacation = engShifts.find(s =>
            s.type === 'Vacation' && s.startDate && s.endDate &&
            s.startDate <= currentDateStr && s.endDate >= currentDateStr
          );
          if (vacation) {
            const lastDayStr = this.days[daysInMonth - 1].dateString;
            const vacEnd = (vacation.endDate && vacation.endDate > lastDayStr) ? lastDayStr : (vacation.endDate || currentDateStr);
            const parts = vacEnd.split('-');
            const endDay = parts.length === 3 ? Number(parts[2]) : d;
            const span = !isNaN(endDay) ? Math.max(endDay - d + 1, 1) : 1;
            cells.push({ type: 'Vacation', span, shift: vacation, dateString: currentDateStr });
            d += span;
          } else {
            const shift = engShifts.find(s => s.type !== 'Vacation' && s.startDate === currentDateStr);
            if (shift) {
              cells.push({ type: 'Shift', span: 1, shift, dateString: currentDateStr });
              if (shift.type !== 'Off' && shift.hours) hoursMap[engineer._id] += (Number(shift.hours) || 0);
            } else {
              cells.push({ type: 'Empty', span: 1, shift: null, dateString: currentDateStr });
            }
            d += 1;
          }
        }
        cellsMap[engineer._id] = cells;
      }
      this.engineerCellsMap = cellsMap;
      this.engineerTotalHoursMap = hoursMap;

      const dailyHours: Record<string, number> = {};
      const dailyPeople: Record<string, number> = {};
      for (const day of this.days) {
        const dateStr = day.dateString;
        dailyHours[dateStr] = this.shifts
          .filter(s => s.type !== 'Vacation' && s.type !== 'Off' && s.startDate && s.endDate && s.startDate <= dateStr && s.endDate >= dateStr)
          .reduce((sum, s) => sum + (Number(s.hours) || 0), 0);
        const peopleSet = new Set<string>();
        this.shifts
          .filter(s => s.type !== 'Vacation' && s.type !== 'Off' && s.startDate && s.endDate && s.startDate <= dateStr && s.endDate >= dateStr)
          .forEach((s: any) => { const id = this.getShiftEngineerId(s); if (id) peopleSet.add(id); });
        dailyPeople[dateStr] = peopleSet.size;
      }
      this.dailyHoursMap = dailyHours;
      this.dailyPeopleMap = dailyPeople;

      this.totalScheduledHours = this.shifts.filter(s => s.type !== 'Vacation' && s.type !== 'Off').reduce((sum, s) => sum + (Number(s.hours) || 0), 0);
      const uniquePeople = new Set<string>();
      this.shifts.filter(s => s.type !== 'Vacation' && s.type !== 'Off').forEach((s: any) => { const id = this.getShiftEngineerId(s); if (id) uniquePeople.add(id); });
      this.peopleCount = uniquePeople.size;
      this.totalShiftCount = this.shifts.filter(s => s.type !== 'Vacation' && s.type !== 'Off').length;
      this.vacationDaysCount = this.shifts.filter(s => s.type === 'Vacation' && s.startDate && s.endDate).reduce((sum, s) => {
        const start = new Date(s.startDate);
        const end = new Date(s.endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return sum;
        return sum + Math.max(Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1, 1);
      }, 0);
    } catch (error) {
      console.error('Error precalculating shift schedule data:', error);
    }
  }

  setCurrentMonth() { this.selectedMonth = 2; this.selectedYear = 2026; this.generateCalendarDays(); this.loadShifts(); }
  getMonthName(): string { return this.monthsList[this.selectedMonth]; }

  prevMonth() {
    if (this.selectedMonth === 0) { this.selectedMonth = 11; this.selectedYear--; } else { this.selectedMonth--; }
    this.generateCalendarDays(); this.loadShifts();
  }

  nextMonth() {
    if (this.selectedMonth === 11) { this.selectedMonth = 0; this.selectedYear++; } else { this.selectedMonth++; }
    this.generateCalendarDays(); this.loadShifts();
  }

  getFilteredEngineers() {
    return this.filterEngineerId ? this.engineers.filter(e => e._id === this.filterEngineerId) : this.engineers;
  }

  getShiftEngineerId(shift: any): string {
    if (!shift) return '';
    if (typeof shift.engineerId === 'string') return shift.engineerId;
    if (shift.engineerId?._id) return shift.engineerId._id;
    if (shift.engineer?._id) return shift.engineer._id;
    return '';
  }

  getShiftClass(type: string): string {
    switch (type) {
      case 'Morning': return 'shift-morning';
      case 'Evening': return 'shift-evening';
      case 'Night':   return 'shift-night';
      default:        return 'shift-off';
    }
  }

  isWeekend(dateStr: string): boolean { const d = new Date(dateStr).getDay(); return d === 0 || d === 6; }
  isToday(dateStr: string): boolean { return dateStr === new Date().toISOString().split('T')[0]; }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(p => p.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  showTimeFields(): boolean { const t = this.shiftForm.get('type')?.value; return t !== 'Vacation' && t !== 'Off'; }
  showHoursField(): boolean { return this.shiftForm.get('type')?.value !== 'Vacation'; }

  onShiftTypeChange() {
    const type = this.shiftForm.get('type')?.value;
    if (type === 'Morning')  this.shiftForm.patchValue({ startTime: '08:00', endTime: '16:00', hours: 8 });
    else if (type === 'Evening') this.shiftForm.patchValue({ startTime: '16:00', endTime: '24:00', hours: 8 });
    else if (type === 'Night')   this.shiftForm.patchValue({ startTime: '00:00', endTime: '08:00', hours: 8 });
    else this.shiftForm.patchValue({ startTime: '', endTime: '', hours: 0 });
  }

  openAddModal(engineerId?: string, dateStr?: string) {
    this.isEditing = false;
    this.editingShiftId = null;
    const defaultDate = dateStr || `${this.selectedYear}-${(this.selectedMonth + 1).toString().padStart(2, '0')}-01`;
    this.shiftForm.reset({ engineerId: engineerId || '', type: 'Morning', startDate: defaultDate, endDate: defaultDate, startTime: '08:00', endTime: '16:00', hours: 8, notes: '' });
    this.isModalOpen = true;
  }

  openEditModal(shift: Shift) {
    if (!shift) return;
    this.isEditing = true;
    this.editingShiftId = shift._id;
    this.shiftForm.reset({ engineerId: this.getShiftEngineerId(shift), type: shift.type, startDate: shift.startDate, endDate: shift.endDate, startTime: shift.startTime || '', endTime: shift.endTime || '', hours: shift.hours || 0, notes: shift.notes || '' });
    this.isModalOpen = true;
  }

  closeModal() { this.isModalOpen = false; }

  saveShift() {
    if (this.shiftForm.invalid) { Swal.fire('Error', 'Please fill all required fields.', 'error'); return; }
    const payload = this.shiftForm.value;
    if (this.isEditing && this.editingShiftId) {
      this.shiftsService.updateShift(this.editingShiftId, payload).subscribe({
        next: () => { Swal.fire('Updated', 'Shift schedule updated successfully.', 'success'); this.closeModal(); this.loadShifts(); },
        error: () => Swal.fire('Error', 'Failed to update shift.', 'error')
      });
    } else {
      this.shiftsService.createShift(payload).subscribe({
        next: () => { Swal.fire('Scheduled', 'New shift scheduled successfully.', 'success'); this.closeModal(); this.loadShifts(); },
        error: () => Swal.fire('Error', 'Failed to create shift.', 'error')
      });
    }
  }

  deleteShift() {
    if (!this.editingShiftId) return;
    Swal.fire({ title: 'Remove Shift?', text: 'Are you sure you want to delete this shift from the schedule?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Yes, delete it' }).then((result) => {
      if (result.isConfirmed) {
        this.shiftsService.deleteShift(this.editingShiftId!).subscribe({
          next: () => { Swal.fire('Deleted', 'Shift removed from schedule.', 'success'); this.closeModal(); this.loadShifts(); },
          error: () => Swal.fire('Error', 'Failed to delete shift.', 'error')
        });
      }
    });
  }
}
