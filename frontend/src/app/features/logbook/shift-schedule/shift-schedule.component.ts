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
    <div class="shift-page">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="eyebrow">Avio Training Management System</div>
          <h1>
            <i class="bi bi-calendar3"></i>
            Engineers Shift Schedule
          </h1>
          <p>Monthly team shift planning, working hours, and vacation tracking</p>
        </div>

        <div class="header-actions">
          <button class="btn-soft" type="button" (click)="setCurrentMonth()">Today</button>
          <button class="btn-icon" type="button" (click)="prevMonth()">
            <i class="bi bi-chevron-left"></i>
          </button>
          <button class="btn-icon" type="button" (click)="nextMonth()">
            <i class="bi bi-chevron-right"></i>
          </button>
          <div class="month-pill">{{ getMonthName() }} {{ selectedYear }}</div>
          <button class="btn-primary-av" type="button" (click)="openAddModal()">
            <i class="bi bi-plus-lg"></i>
            Add Shift
          </button>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar-card">
        <div class="filter-box">
          <i class="bi bi-funnel"></i>
          <select [(ngModel)]="filterEngineerId" (change)="loadShifts()">
            <option value="">All Engineers</option>
            <option *ngFor="let eng of engineers" [value]="eng._id">{{ eng.name }}</option>
          </select>
        </div>

        <div class="toolbar-note">
          <i class="bi bi-info-circle"></i>
          Double-click empty cell to assign shift. Click existing shift to edit.
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card">
          <span class="label">Month Hours</span>
          <strong>{{ totalScheduledHours }}</strong>
          <small>Total scheduled hours</small>
        </div>

        <div class="summary-card">
          <span class="label">People Scheduled</span>
          <strong>{{ peopleCount }}</strong>
          <small>Engineers with shifts</small>
        </div>

        <div class="summary-card">
          <span class="label">Total Shifts</span>
          <strong>{{ totalShiftCount }}</strong>
          <small>Working shift entries</small>
        </div>

        <div class="summary-card">
          <span class="label">Vacation Days</span>
          <strong>{{ vacationDaysCount }}</strong>
          <small>Annual paid vacation</small>
        </div>
      </div>

      <!-- Schedule -->
      <div class="schedule-card">
        <div class="schedule-titlebar">
          <div>
            <h2>AVIO ENGINEERS SHIFT SCHEDULE</h2>
            <span>{{ getFilteredEngineers().length }} Members · {{ getMonthName() }} {{ selectedYear }}</span>
          </div>

          <div class="legend">
            <span><i class="dot morning"></i> Morning</span>
            <span><i class="dot evening"></i> Evening</span>
            <span><i class="dot night"></i> Night</span>
            <span><i class="dot vacation"></i> Vacation</span>
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
                  <!-- Vacation -->
                  <td
                    *ngIf="cell.type === 'Vacation'"
                    [attr.colspan]="cell.span"
                    class="schedule-cell vacation-cell"
                  >
                    <div class="vacation-bar" (click)="openEditModal(cell.shift)">
                      <strong>Annual Paid Vacation</strong>
                      <span>{{ cell.shift?.startDate }} → {{ cell.shift?.endDate }}</span>
                    </div>
                  </td>

                  <!-- Shift -->
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

                  <!-- Empty -->
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

      <!-- Modal -->
      <div *ngIf="isModalOpen" class="modal-backdrop-custom">
        <div class="modal-card">
          <div class="modal-header-custom">
            <div>
              <h3>{{ isEditing ? 'Edit Shift' : 'Schedule New Shift' }}</h3>
              <p>{{ isEditing ? 'Update engineer shift details' : 'Assign a new shift to engineer' }}</p>
            </div>
            <button type="button" class="modal-close" (click)="closeModal()">×</button>
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
              <button type="button" class="btn-danger-soft" *ngIf="isEditing" (click)="deleteShift()">
                <i class="bi bi-trash"></i>
                Delete
              </button>

              <div class="modal-footer-right">
                <button type="button" class="btn-soft" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary-av">Save Shift</button>
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
      background: #f8fafc;
      color: #1e293b;
      min-height: 100vh;
    }

    .shift-page {
      padding: 24px;
      background:
        radial-gradient(circle at top right, rgba(14, 165, 233, 0.10), transparent 28%),
        #f8fafc;
      min-height: 100vh;
    }

    .page-header {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 22px 24px;
      display: flex;
      justify-content: space-between;
      gap: 18px;
      align-items: center;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
      margin-bottom: 16px;
    }

    .eyebrow {
      font-size: 12px;
      color: #0284c7;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .08em;
      margin-bottom: 6px;
    }

    .page-header h1 {
      margin: 0;
      color: #0f172a;
      font-size: 28px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .page-header h1 i {
      color: #0284c7;
    }

    .page-header p {
      margin: 6px 0 0;
      color: #64748b;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .btn-soft,
    .btn-icon,
    .btn-primary-av,
    .btn-danger-soft {
      border: 0;
      border-radius: 12px;
      padding: 9px 14px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      transition: .15s ease;
      display: inline-flex;
      align-items: center;
      gap: 7px;
    }

    .btn-soft {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #e2e8f0;
    }

    .btn-soft:hover {
      background: #e2e8f0;
    }

    .btn-icon {
      background: #ffffff;
      color: #334155;
      border: 1px solid #e2e8f0;
      width: 38px;
      height: 38px;
      justify-content: center;
      padding: 0;
    }

    .btn-icon:hover {
      border-color: #0284c7;
      color: #0284c7;
    }

    .btn-primary-av {
      background: linear-gradient(135deg, #0284c7, #0ea5e9);
      color: #ffffff;
      box-shadow: 0 8px 18px rgba(2, 132, 199, 0.25);
    }

    .btn-primary-av:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 24px rgba(2, 132, 199, 0.32);
    }

    .btn-danger-soft {
      background: #fee2e2;
      color: #b91c1c;
    }

    .month-pill {
      background: #0f172a;
      color: #ffffff;
      border-radius: 999px;
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 800;
      white-space: nowrap;
    }

    .toolbar-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 14px 16px;
      display: flex;
      justify-content: space-between;
      gap: 14px;
      align-items: center;
      box-shadow: 0 6px 20px rgba(15, 23, 42, 0.05);
      margin-bottom: 16px;
    }

    .filter-box {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #64748b;
    }

    .filter-box select {
      min-width: 210px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      color: #1e293b;
      border-radius: 12px;
      padding: 9px 12px;
      outline: none;
      font-weight: 600;
    }

    .toolbar-note {
      color: #64748b;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(150px, 1fr));
      gap: 14px;
      margin-bottom: 16px;
    }

    .summary-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 6px 20px rgba(15, 23, 42, 0.05);
    }

    .summary-card .label {
      color: #64748b;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .07em;
    }

    .summary-card strong {
      display: block;
      margin-top: 7px;
      color: #0f172a;
      font-size: 28px;
      line-height: 1;
      font-weight: 900;
    }

    .summary-card small {
      display: block;
      margin-top: 7px;
      color: #64748b;
      font-size: 12px;
    }

    .schedule-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      box-shadow: 0 12px 34px rgba(15, 23, 42, 0.08);
      overflow: hidden;
    }

    .schedule-titlebar {
      padding: 16px 18px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      gap: 14px;
      align-items: center;
    }

    .schedule-titlebar h2 {
      margin: 0;
      color: #0284c7;
      font-size: 14px;
      font-weight: 900;
      letter-spacing: .06em;
    }

    .schedule-titlebar span {
      color: #64748b;
      font-size: 12px;
      font-weight: 600;
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
      color: #475569;
      font-weight: 700;
      font-size: 12px;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      display: inline-block;
    }

    .dot.morning { background: #0ea5e9; }
    .dot.evening { background: #8b5cf6; }
    .dot.night { background: #4f46e5; }
    .dot.vacation { background: #94a3b8; }

    .loading-box {
      min-height: 280px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #64748b;
      font-weight: 700;
    }

    .schedule-scroll {
      overflow: auto;
      max-height: 68vh;
      position: relative;
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
      background: #0f172a;
      color: #ffffff;
      border-right: 1px solid rgba(255, 255, 255, .08);
      border-bottom: 1px solid rgba(255, 255, 255, .08);
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
      background: #0b1220 !important;
    }

    .day-num {
      font-size: 14px;
      font-weight: 900;
      line-height: 1;
    }

    .day-name {
      margin-top: 4px;
      color: #cbd5e1;
      font-size: 10px;
      font-weight: 700;
    }

    .weekend-head {
      background: #1e293b !important;
    }

    .today-head {
      background: #075985 !important;
      box-shadow: inset 0 -3px 0 #38bdf8;
    }

    .daily-row td {
      position: sticky;
      top: 53px;
      z-index: 4;
      background: #f8fafc;
      border-right: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
      padding: 7px 6px;
      text-align: center;
      min-width: 76px;
      width: 76px;
    }

    .daily-row .engineer-head {
      z-index: 7 !important;
      background: #0b1220 !important;
      color: #cbd5e1;
    }

    .daily-label {
      font-size: 11px;
      font-weight: 700;
      line-height: 1.5;
    }

    .daily-hours {
      color: #0284c7;
      font-weight: 900;
      font-size: 12px;
    }

    .daily-people {
      color: #64748b;
      font-weight: 800;
      font-size: 11px;
    }

    .schedule-table tbody td {
      min-width: 76px;
      width: 76px;
      height: 82px;
      border-right: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
      background: #ffffff;
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
      background: #ffffff !important;
      text-align: left !important;
      border-right: 2px solid #cbd5e1 !important;
      padding: 10px 14px !important;
    }

    .engineer-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .avatar {
      width: 38px;
      height: 38px;
      border-radius: 999px;
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      box-shadow: 0 6px 16px rgba(2, 132, 199, .22);
      flex: 0 0 auto;
    }

    .engineer-name {
      color: #0f172a;
      font-weight: 900;
      font-size: 13px;
      line-height: 1.2;
    }

    .engineer-hours {
      color: #64748b;
      font-size: 11px;
      margin-top: 4px;
      font-weight: 700;
    }

    .schedule-table tbody tr:hover .engineer-cell,
    .schedule-table tbody tr:hover .schedule-cell {
      background: #f8fafc;
    }

    .schedule-cell.weekend-cell,
    .weekend-cell {
      background: #f8fafc !important;
    }

    .today-cell {
      background: #ecfeff !important;
      box-shadow: inset 0 0 0 2px rgba(14, 165, 233, .35);
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
      box-shadow: 0 4px 10px rgba(15, 23, 42, .06);
    }

    .shift-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 18px rgba(15, 23, 42, .14);
    }

    .shift-card strong {
      display: block;
      font-size: 11px;
      font-weight: 900;
      line-height: 1.15;
    }

    .shift-card span {
      display: block;
      font-size: 10px;
      margin-top: 4px;
      font-weight: 700;
      opacity: .86;
    }

    .shift-card small {
      display: block;
      font-size: 9px;
      margin-top: 3px;
      opacity: .8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .shift-morning {
      background: #e0f2fe;
      color: #075985;
      border-left-color: #0284c7;
    }

    .shift-evening {
      background: #ede9fe;
      color: #5b21b6;
      border-left-color: #7c3aed;
    }

    .shift-night {
      background: #e0e7ff;
      color: #3730a3;
      border-left-color: #4f46e5;
    }

    .shift-off {
      background: #f1f5f9;
      color: #64748b;
      border-left-color: #94a3b8;
    }

    .vacation-cell {
      background: #f8fafc !important;
      padding: 8px !important;
    }

    .vacation-bar {
      height: 54px;
      background: linear-gradient(135deg, #cbd5e1, #94a3b8);
      color: #334155;
      border-radius: 13px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 0 1px rgba(51, 65, 85, .18), 0 6px 14px rgba(15, 23, 42, .10);
      transition: .15s ease;
    }

    .vacation-bar:hover {
      transform: translateY(-1px);
      box-shadow: inset 0 0 0 1px rgba(51, 65, 85, .25), 0 10px 18px rgba(15, 23, 42, .16);
    }

    .vacation-bar strong {
      font-size: 12px;
      font-weight: 900;
    }

    .vacation-bar span {
      margin-top: 4px;
      font-size: 10px;
      font-weight: 700;
      opacity: .85;
    }

    .empty-cell {
      position: relative;
    }

    .add-cell-btn {
      width: 28px;
      height: 28px;
      border-radius: 999px;
      border: 1px dashed #cbd5e1;
      background: transparent;
      color: transparent;
      font-weight: 900;
      transition: .15s ease;
      cursor: pointer;
    }

    .empty-cell:hover .add-cell-btn {
      color: #0284c7;
      background: #e0f2fe;
      border-color: #38bdf8;
    }

    .empty-state {
      padding: 40px !important;
      color: #64748b;
      font-weight: 700;
      text-align: center;
    }

    .modal-backdrop-custom {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, .58);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      padding: 18px;
      backdrop-filter: blur(6px);
    }

    .modal-card {
      width: min(560px, 100%);
      background: #ffffff;
      color: #1e293b;
      border-radius: 20px;
      box-shadow: 0 24px 70px rgba(15, 23, 42, .28);
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }

    .modal-header-custom {
      padding: 20px 22px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: flex-start;
      background: #f8fafc;
    }

    .modal-header-custom h3 {
      margin: 0;
      color: #0f172a;
      font-weight: 900;
      font-size: 20px;
    }

    .modal-header-custom p {
      margin: 5px 0 0;
      color: #64748b;
      font-size: 13px;
    }

    .modal-close {
      border: 0;
      background: #e2e8f0;
      color: #334155;
      width: 34px;
      height: 34px;
      border-radius: 999px;
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
    }

    .modal-body-custom {
      padding: 22px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .form-group {
      margin-bottom: 14px;
    }

    .form-group label {
      display: block;
      color: #475569;
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .06em;
      margin-bottom: 7px;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      color: #1e293b;
      border-radius: 12px;
      padding: 10px 12px;
      outline: none;
      font-weight: 600;
    }

    .form-group input:focus,
    .form-group select:focus {
      border-color: #38bdf8;
      box-shadow: 0 0 0 4px rgba(56, 189, 248, .15);
      background: #ffffff;
    }

    .modal-footer-custom {
      padding: 16px 22px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      background: #f8fafc;
    }

    .modal-footer-right {
      display: flex;
      gap: 10px;
      margin-left: auto;
    }

    @media (max-width: 1100px) {
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .page-header,
      .toolbar-card,
      .schedule-titlebar {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-actions {
        justify-content: flex-start;
      }
    }

    @media (max-width: 650px) {
      .shift-page {
        padding: 14px;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .page-header h1 {
        font-size: 22px;
      }
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

  // Precalculated maps & values for high-performance rendering & crash prevention
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
          u.role === 'engineer' ||
          u.role === 'ENGINEER' ||
          u.role === 'Engineer' ||
          u.position === 'Engineer'
        );

        if (this.engineers.length === 0) {
          this.engineers = users;
        }
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
      timeout(10000), // 10 seconds timeout
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

  // Pure, crash-safe, pre-calculations that execute once on data load
  precalculateAll() {
    try {
      const cellsMap: Record<string, any[]> = {};
      const hoursMap: Record<string, number> = {};
      
      // Initialize hours for all loaded engineers to 0
      for (const eng of this.engineers) {
        hoursMap[eng._id] = 0;
      }

      const daysInMonth = this.days.length;

      for (const engineer of this.engineers) {
        const cells = [];
        const engShifts = this.shifts.filter((s: any) => this.getShiftEngineerId(s) === engineer._id);
        
        let d = 1;
        while (d <= daysInMonth) {
          const currentDateStr = this.days[d - 1].dateString;

          const vacation = engShifts.find(s =>
            s.type === 'Vacation' &&
            s.startDate &&
            s.endDate &&
            s.startDate <= currentDateStr &&
            s.endDate >= currentDateStr
          );

          if (vacation) {
            const lastDayStr = this.days[daysInMonth - 1].dateString;
            const vacEnd = (vacation.endDate && vacation.endDate > lastDayStr) ? lastDayStr : (vacation.endDate || currentDateStr);
            const parts = vacEnd.split('-');
            const endDay = parts.length === 3 ? Number(parts[2]) : d;
            
            let span = 1;
            if (!isNaN(endDay)) {
              span = Math.max(endDay - d + 1, 1);
            }

            cells.push({
              type: 'Vacation',
              span,
              shift: vacation,
              dateString: currentDateStr
            });

            d += span;
          } else {
            const shift = engShifts.find(s =>
              s.type !== 'Vacation' &&
              s.startDate === currentDateStr
            );

            if (shift) {
              cells.push({
                type: 'Shift',
                span: 1,
                shift,
                dateString: currentDateStr
              });
              // Add to engineer hours if not Vacation or Off
              if (shift.type !== 'Off' && shift.hours) {
                hoursMap[engineer._id] += (Number(shift.hours) || 0);
              }
            } else {
              cells.push({
                type: 'Empty',
                span: 1,
                shift: null,
                dateString: currentDateStr
              });
            }

            d += 1;
          }
        }
        cellsMap[engineer._id] = cells;
      }
      this.engineerCellsMap = cellsMap;
      this.engineerTotalHoursMap = hoursMap;

      // Calculate daily hours and people
      const dailyHours: Record<string, number> = {};
      const dailyPeople: Record<string, number> = {};
      
      for (const day of this.days) {
        const dateStr = day.dateString;
        
        // Daily hours
        const hrs = this.shifts
          .filter(s => s.type !== 'Vacation' && s.type !== 'Off' && s.startDate && s.endDate && s.startDate <= dateStr && s.endDate >= dateStr)
          .reduce((sum, s) => sum + (Number(s.hours) || 0), 0);
        dailyHours[dateStr] = hrs;

        // Daily people count
        const peopleSet = new Set<string>();
        this.shifts
          .filter(s => s.type !== 'Vacation' && s.type !== 'Off' && s.startDate && s.endDate && s.startDate <= dateStr && s.endDate >= dateStr)
          .forEach((s: any) => {
            const engId = this.getShiftEngineerId(s);
            if (engId) peopleSet.add(engId);
          });
        dailyPeople[dateStr] = peopleSet.size;
      }
      
      this.dailyHoursMap = dailyHours;
      this.dailyPeopleMap = dailyPeople;

      // Summary metrics
      this.totalScheduledHours = this.shifts
        .filter(s => s.type !== 'Vacation' && s.type !== 'Off')
        .reduce((sum, s) => sum + (Number(s.hours) || 0), 0);

      const uniquePeople = new Set<string>();
      this.shifts
        .filter(s => s.type !== 'Vacation' && s.type !== 'Off')
        .forEach((s: any) => {
          const engId = this.getShiftEngineerId(s);
          if (engId) uniquePeople.add(engId);
        });
      this.peopleCount = uniquePeople.size;

      this.totalShiftCount = this.shifts.filter(s => s.type !== 'Vacation' && s.type !== 'Off').length;

      this.vacationDaysCount = this.shifts
        .filter(s => s.type === 'Vacation' && s.startDate && s.endDate)
        .reduce((sum, s) => {
          const start = new Date(s.startDate);
          const end = new Date(s.endDate);
          if (isNaN(start.getTime()) || isNaN(end.getTime())) return sum;
          const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          return sum + Math.max(diff, 1);
        }, 0);

    } catch (error) {
      console.error('Error precalculating shift schedule data:', error);
    }
  }

  setCurrentMonth() {
    this.selectedMonth = 2;
    this.selectedYear = 2026;
    this.generateCalendarDays();
    this.loadShifts();
  }

  getMonthName(): string {
    return this.monthsList[this.selectedMonth];
  }

  prevMonth() {
    if (this.selectedMonth === 0) {
      this.selectedMonth = 11;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }

    this.generateCalendarDays();
    this.loadShifts();
  }

  nextMonth() {
    if (this.selectedMonth === 11) {
      this.selectedMonth = 0;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }

    this.generateCalendarDays();
    this.loadShifts();
  }

  getFilteredEngineers() {
    if (this.filterEngineerId) {
      return this.engineers.filter(e => e._id === this.filterEngineerId);
    }
    return this.engineers;
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
      case 'Morning':
        return 'shift-morning';
      case 'Evening':
        return 'shift-evening';
      case 'Night':
        return 'shift-night';
      case 'Off':
        return 'shift-off';
      default:
        return 'shift-off';
    }
  }

  isWeekend(dateStr: string): boolean {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  isToday(dateStr: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  }

  getInitials(name: string): string {
    if (!name) return '?';

    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  showTimeFields(): boolean {
    const type = this.shiftForm.get('type')?.value;
    return type !== 'Vacation' && type !== 'Off';
  }

  showHoursField(): boolean {
    const type = this.shiftForm.get('type')?.value;
    return type !== 'Vacation';
  }

  onShiftTypeChange() {
    const type = this.shiftForm.get('type')?.value;

    if (type === 'Morning') {
      this.shiftForm.patchValue({ startTime: '08:00', endTime: '16:00', hours: 8 });
    } else if (type === 'Evening') {
      this.shiftForm.patchValue({ startTime: '16:00', endTime: '24:00', hours: 8 });
    } else if (type === 'Night') {
      this.shiftForm.patchValue({ startTime: '00:00', endTime: '08:00', hours: 8 });
    } else if (type === 'Off') {
      this.shiftForm.patchValue({ startTime: '', endTime: '', hours: 0 });
    } else if (type === 'Vacation') {
      this.shiftForm.patchValue({ startTime: '', endTime: '', hours: 0 });
    }
  }

  openAddModal(engineerId?: string, dateStr?: string) {
    this.isEditing = false;
    this.editingShiftId = null;

    const defaultDate = dateStr || `${this.selectedYear}-${(this.selectedMonth + 1).toString().padStart(2, '0')}-01`;

    this.shiftForm.reset({
      engineerId: engineerId || '',
      type: 'Morning',
      startDate: defaultDate,
      endDate: defaultDate,
      startTime: '08:00',
      endTime: '16:00',
      hours: 8,
      notes: ''
    });

    this.isModalOpen = true;
  }

  openEditModal(shift: Shift) {
    if (!shift) return;
    this.isEditing = true;
    this.editingShiftId = shift._id;

    this.shiftForm.reset({
      engineerId: this.getShiftEngineerId(shift),
      type: shift.type,
      startDate: shift.startDate,
      endDate: shift.endDate,
      startTime: shift.startTime || '',
      endTime: shift.endTime || '',
      hours: shift.hours || 0,
      notes: shift.notes || ''
    });

    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveShift() {
    if (this.shiftForm.invalid) {
      Swal.fire('Error', 'Please fill all required fields.', 'error');
      return;
    }

    const payload = this.shiftForm.value;

    if (this.isEditing && this.editingShiftId) {
      this.shiftsService.updateShift(this.editingShiftId, payload).subscribe({
        next: () => {
          Swal.fire('Updated', 'Shift schedule updated successfully.', 'success');
          this.closeModal();
          this.loadShifts();
        },
        error: (err) => {
          console.error('Failed to update shift:', err);
          Swal.fire('Error', 'Failed to update shift.', 'error');
        }
      });
    } else {
      this.shiftsService.createShift(payload).subscribe({
        next: () => {
          Swal.fire('Scheduled', 'New shift scheduled successfully.', 'success');
          this.closeModal();
          this.loadShifts();
        },
        error: (err) => {
          console.error('Failed to create shift:', err);
          Swal.fire('Error', 'Failed to create shift.', 'error');
        }
      });
    }
  }

  deleteShift() {
    if (!this.editingShiftId) return;

    Swal.fire({
      title: 'Remove Shift?',
      text: 'Are you sure you want to delete this shift from the schedule?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.shiftsService.deleteShift(this.editingShiftId!).subscribe({
          next: () => {
            Swal.fire('Deleted', 'Shift removed from schedule.', 'success');
            this.closeModal();
            this.loadShifts();
          },
          error: (err) => {
            console.error('Failed to delete shift:', err);
            Swal.fire('Error', 'Failed to delete shift.', 'error');
          }
        });
      }
    });
  }
}