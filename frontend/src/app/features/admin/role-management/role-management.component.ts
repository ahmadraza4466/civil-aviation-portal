import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, User, CreateUserDto, UpdateUserDto } from '../../../core/services/users.service';
import Swal from 'sweetalert2';

interface RoleDefinition {
    role: string;
    label: string;
    color: string;
    icon: string;
    description: string;
    screens: string[];
}

@Component({
    selector: 'app-role-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
<div class="av-page">

    <!-- Page Header -->
    <div class="page-header">
        <div>
            <div class="page-eyebrow">Admin</div>
            <h1 class="page-title"><i class="bi bi-shield-lock"></i>Role &amp; Permission Management</h1>
            <p class="page-subtitle">Manage user accounts and assign role-based access control</p>
        </div>
        <div class="page-header-actions">
            <button class="btn btn-neon-blue btn-pill px-4" (click)="openCreate()">
                <i class="bi bi-person-plus me-2"></i>Create User
            </button>
        </div>
    </div>

    <!-- Stat Grid -->
    <div class="stat-grid" style="grid-template-columns: repeat(4, 1fr);">
        <div class="stat-card">
            <span class="stat-label">Total Users</span>
            <span class="stat-value">{{ users.length }}</span>
            <span class="stat-sub">All accounts</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Admins</span>
            <span class="stat-value" style="color: #4f46e5;">{{ countRole('admin') }}</span>
            <span class="stat-sub">Full access</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Engineers</span>
            <span class="stat-value" style="color: #10b981;">{{ countRole('engineer') }}</span>
            <span class="stat-sub">Operations</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Instructors</span>
            <span class="stat-value" style="color: #f59e0b;">{{ countRole('instructor') }}</span>
            <span class="stat-sub">Training only</span>
        </div>
    </div>

    <!-- Role Permissions Reference -->
    <div class="content-card">
        <div class="content-card-header">
            <h2 class="content-card-title">Role Permissions</h2>
            <span class="text-secondary" style="font-size: 12px;">System-defined access levels</span>
        </div>
        <div class="p-4">
            <div class="row g-3">
                <div class="col-lg-4" *ngFor="let rd of roleDefinitions">
                    <div class="rm-role-card" [style.--role-color]="rd.color">
                        <div class="rm-role-card-top">
                            <div class="rm-role-icon-wrap" [style.background]="rd.color + '18'" [style.border-color]="rd.color + '40'">
                                <i class="bi" [ngClass]="rd.icon" [style.color]="rd.color"></i>
                            </div>
                            <div class="ms-3 flex-grow-1 min-width-0">
                                <div class="d-flex align-items-center gap-2">
                                    <span class="fw-bold text-white" style="font-size: 14px;">{{ rd.label }}</span>
                                    <span class="badge rounded-pill rm-role-badge"
                                        [style.background-color]="rd.color + '18'"
                                        [style.color]="rd.color"
                                        [style.border-color]="rd.color + '40'">
                                        {{ rd.role }}
                                    </span>
                                </div>
                                <p class="text-secondary mb-0" style="font-size: 11px; margin-top: 3px;">{{ rd.description }}</p>
                            </div>
                        </div>
                        <div class="rm-screens-area">
                            <span class="rm-screen-tag" *ngFor="let screen of rd.screens">
                                <i class="bi bi-check2 me-1" [style.color]="rd.color"></i>{{ screen }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Users Table -->
    <div class="content-card">
        <div class="content-card-header">
            <h2 class="content-card-title">User Accounts</h2>
            <span class="text-secondary" style="font-size: 12px;">{{ users.length }} registered users</span>
        </div>

        <div *ngIf="loading" class="p-5 text-center">
            <div class="spinner-border text-primary" role="status"></div>
            <div class="text-secondary mt-3" style="font-size: 13px;">Loading users…</div>
        </div>

        <div class="table-responsive" *ngIf="!loading">
            <table class="table table-borderless mb-0 rm-table">
                <thead>
                    <tr>
                        <th class="rm-th">Name</th>
                        <th class="rm-th">Email</th>
                        <th class="rm-th">Role</th>
                        <th class="rm-th text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="rm-tr" *ngFor="let user of users">
                        <td class="rm-td">
                            <div class="d-flex align-items-center gap-3">
                                <div class="rm-avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
                                <span class="fw-semibold text-white">{{ user.name }}</span>
                            </div>
                        </td>
                        <td class="rm-td">
                            <span class="text-secondary" style="font-size: 13px;">{{ user.email }}</span>
                        </td>
                        <td class="rm-td">
                            <span class="badge rounded-pill rm-role-badge px-3 py-2"
                                [style.background-color]="getRoleColor(user.role) + '18'"
                                [style.color]="getRoleColor(user.role)"
                                [style.border-color]="getRoleColor(user.role) + '40'">
                                <i class="bi me-1"
                                    [ngClass]="getRoleDefinition(user.role)?.icon || 'bi-person'"></i>
                                {{ getRoleLabel(user.role) }}
                            </span>
                        </td>
                        <td class="rm-td text-end">
                            <button class="btn btn-sm btn-outline-darker btn-pill px-3 me-2" (click)="openEdit(user)">
                                <i class="bi bi-pencil me-1"></i>Edit
                            </button>
                            <button class="btn btn-sm rm-btn-danger btn-pill px-3" (click)="deleteUser(user)">
                                <i class="bi bi-trash me-1"></i>Delete
                            </button>
                        </td>
                    </tr>
                    <tr *ngIf="users.length === 0 && !loading">
                        <td colspan="4" class="py-5 text-center">
                            <i class="bi bi-people d-block mb-3 text-secondary" style="font-size: 2.5rem; opacity: 0.35;"></i>
                            <span class="text-secondary">No users found</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Backdrop -->
    <div class="rm-backdrop" *ngIf="showModal" (click)="closeModal()"></div>

    <!-- Create / Edit Modal -->
    <div class="rm-modal" *ngIf="showModal">
        <!-- Modal Header -->
        <div class="rm-modal-header">
            <div class="d-flex align-items-center gap-3">
                <div class="rm-modal-icon">
                    <i class="bi" [ngClass]="isEditMode ? 'bi-pencil-square' : 'bi-person-plus-fill'"></i>
                </div>
                <h5 class="text-white fw-bold mb-0">
                    {{ isEditMode ? 'Edit User' : 'Create New User' }}
                </h5>
            </div>
            <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
        </div>

        <!-- Modal Body -->
        <div class="rm-modal-body">
            <div class="mb-3">
                <label class="rm-label">Full Name <span class="rm-required">*</span></label>
                <input type="text" class="form-control rm-input" [(ngModel)]="form.name"
                    placeholder="e.g. Ahmad Raza">
            </div>
            <div class="mb-3">
                <label class="rm-label">Email Address <span class="rm-required">*</span></label>
                <input type="email" class="form-control rm-input" [(ngModel)]="form.email"
                    placeholder="e.g. user@example.com">
            </div>
            <div class="mb-3">
                <label class="rm-label">
                    Password
                    <span class="rm-required" *ngIf="!isEditMode">*</span>
                    <span class="rm-hint-inline" *ngIf="isEditMode">Leave blank to keep unchanged</span>
                </label>
                <input type="password" class="form-control rm-input" [(ngModel)]="form.password"
                    [placeholder]="isEditMode ? 'Leave blank to keep current password' : 'Minimum 6 characters'">
            </div>
            <div class="mb-3">
                <label class="rm-label">Role <span class="rm-required">*</span></label>
                <select class="form-select rm-input" [(ngModel)]="form.role">
                    <option *ngFor="let r of roles" [value]="r">{{ getRoleLabel(r) }}</option>
                </select>
            </div>
            <!-- Dynamic role description hint -->
            <div class="rm-role-hint" *ngIf="getRoleDefinition(form.role) as rd">
                <i class="bi me-2" [ngClass]="rd.icon" [style.color]="rd.color"></i>
                <span>{{ rd.description }}</span>
                <div class="rm-hint-screens mt-2">
                    <span *ngFor="let s of rd.screens" class="rm-hint-tag">{{ s }}</span>
                </div>
            </div>
        </div>

        <!-- Modal Footer -->
        <div class="rm-modal-footer">
            <button class="btn btn-outline-darker btn-pill" (click)="closeModal()" [disabled]="submitting">
                Cancel
            </button>
            <button class="btn btn-neon-blue btn-pill px-4" (click)="saveUser()" [disabled]="submitting">
                <span *ngIf="submitting" class="spinner-border spinner-border-sm me-2"></span>
                <i class="bi bi-check2-circle me-1" *ngIf="!submitting"></i>
                {{ isEditMode ? 'Save Changes' : 'Create User' }}
            </button>
        </div>
    </div>

</div>
    `,
    styles: [`

        /* ── Role permission cards ─────────────────────────────── */
        .rm-role-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 14px;
            overflow: hidden;
            height: 100%;
            transition: border-color 0.2s;
        }
        .rm-role-card:hover {
            border-color: rgba(255, 255, 255, 0.12);
        }
        .rm-role-card-top {
            display: flex;
            align-items: flex-start;
            padding: 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .rm-role-icon-wrap {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            border: 1px solid transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;
        }
        .rm-screens-area {
            padding: 12px 16px;
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }
        .rm-screen-tag {
            font-size: 10px;
            font-weight: 600;
            color: #94a3b8;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 5px;
            padding: 3px 8px;
            white-space: nowrap;
        }
        .rm-role-badge {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .05em;
            border: 1px solid transparent;
        }

        /* ── Table ──────────────────────────────────────────────── */
        .rm-th {
            padding: 11px 20px;
            color: #64748b;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .08em;
            background: transparent;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        .rm-td {
            padding: 13px 20px;
            vertical-align: middle;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
        }
        .rm-tr {
            transition: background 0.15s;
        }
        .rm-tr:hover {
            background: rgba(255, 255, 255, 0.02);
        }
        .rm-tr:last-child .rm-td {
            border-bottom: none !important;
        }
        .rm-avatar {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: linear-gradient(135deg, #4f46e5, #3b82f6);
            color: #fff;
            font-size: 13px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .rm-btn-danger {
            background: rgba(239, 68, 68, 0.1);
            color: #f87171;
            border: 1px solid rgba(239, 68, 68, 0.25);
            transition: all 0.2s;
        }
        .rm-btn-danger:hover {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
            border-color: rgba(239, 68, 68, 0.45);
        }

        /* ── Modal ──────────────────────────────────────────────── */
        .rm-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.65);
            z-index: 1040;
            backdrop-filter: blur(3px);
        }
        .rm-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1050;
            background: #1e2638;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            width: calc(100% - 40px);
            max-width: 500px;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
            overflow: hidden;
        }
        .rm-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }
        .rm-modal-icon {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            background: rgba(59, 130, 246, 0.12);
            border: 1px solid rgba(59, 130, 246, 0.25);
            color: #3b82f6;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .rm-modal-body {
            padding: 24px;
        }
        .rm-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            padding: 16px 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.07);
        }
        .rm-label {
            display: block;
            color: #94a3b8;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .07em;
            margin-bottom: 7px;
        }
        .rm-required {
            color: #f87171;
            margin-left: 2px;
        }
        .rm-hint-inline {
            font-size: 10px;
            font-weight: 400;
            text-transform: none;
            color: #64748b;
            margin-left: 6px;
        }
        .rm-input {
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            color: #e2e8f0 !important;
            border-radius: 9px !important;
            padding: 9px 13px !important;
            font-size: 13px !important;
        }
        .rm-input:focus {
            background: rgba(255, 255, 255, 0.07) !important;
            border-color: #3b82f6 !important;
            color: #fff !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
        }
        .rm-input::placeholder {
            color: #475569 !important;
        }
        .rm-input option {
            background: #1e293b;
            color: #e2e8f0;
        }
        .rm-role-hint {
            margin-top: 8px;
            padding: 10px 13px;
            background: rgba(59, 130, 246, 0.06);
            border: 1px solid rgba(59, 130, 246, 0.14);
            border-radius: 9px;
            color: #94a3b8;
            font-size: 11px;
            line-height: 1.5;
        }
        .rm-hint-screens {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }
        .rm-hint-tag {
            font-size: 10px;
            font-weight: 600;
            color: #64748b;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 4px;
            padding: 2px 7px;
        }

        /* ── Light theme overrides ──────────────────────────────── */
        :host-context(body.light-theme) .rm-role-card {
            background: #f8fafc;
            border-color: #e2e8f0;
        }
        :host-context(body.light-theme) .rm-role-card:hover {
            border-color: #cbd5e1;
        }
        :host-context(body.light-theme) .rm-role-card-top {
            border-bottom-color: #e2e8f0;
        }
        :host-context(body.light-theme) .rm-screen-tag {
            background: #f1f5f9;
            color: #475569;
            border-color: #e2e8f0;
        }
        :host-context(body.light-theme) .rm-th {
            border-bottom-color: #e2e8f0 !important;
            color: #94a3b8;
        }
        :host-context(body.light-theme) .rm-td {
            border-bottom-color: #f1f5f9 !important;
        }
        :host-context(body.light-theme) .rm-tr:hover {
            background: #fafafa;
        }
        :host-context(body.light-theme) .rm-modal {
            background: #ffffff;
            border-color: #e2e8f0;
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.15);
        }
        :host-context(body.light-theme) .rm-modal-header {
            border-bottom-color: #e2e8f0;
        }
        :host-context(body.light-theme) .rm-modal-footer {
            border-top-color: #e2e8f0;
        }
        :host-context(body.light-theme) .rm-role-hint {
            background: rgba(59, 130, 246, 0.04);
            border-color: rgba(59, 130, 246, 0.12);
        }
        :host-context(body.light-theme) .rm-hint-tag {
            background: #f1f5f9;
            color: #64748b;
            border-color: #e2e8f0;
        }
        :host-context(body.light-theme) .rm-backdrop {
            background: rgba(15, 23, 42, 0.45);
        }
    `]
})
export class RoleManagementComponent implements OnInit {
    users: User[] = [];
    loading = false;
    showModal = false;
    isEditMode = false;
    submitting = false;
    editingId: string | null = null;

    form: { name: string; email: string; password: string; role: string } = {
        name: '', email: '', password: '', role: 'engineer'
    };

    readonly roles = ['admin', 'engineer', 'instructor'];

    readonly roleDefinitions: RoleDefinition[] = [
        {
            role: 'admin',
            label: 'Administrator',
            color: '#4f46e5',
            icon: 'bi-shield-fill-check',
            description: 'Full system access — can manage users, roles, and all operational data.',
            screens: ['Dashboard', 'Case Registry', 'Spare Parts Inventory', 'Engineers Shifts', 'Logbook', 'Shift Diary', 'Simulator Time Log', 'Reporting', 'Docs Library', 'Role Management']
        },
        {
            role: 'engineer',
            label: 'Engineer',
            color: '#10b981',
            icon: 'bi-tools',
            description: 'Access to all operational screens for day-to-day maintenance work.',
            screens: ['Dashboard', 'Case Registry', 'Spare Parts Inventory', 'Engineers Shifts', 'Logbook', 'Shift Diary', 'Simulator Time Log', 'Reporting', 'Docs Library']
        },
        {
            role: 'instructor',
            label: 'Instructor',
            color: '#f59e0b',
            icon: 'bi-person-video3',
            description: 'Restricted to training-related screens only.',
            screens: ['Simulator Time Log']
        }
    ];

    private usersService = inject(UsersService);

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.loading = true;
        this.usersService.getUsers().subscribe({
            next: users => { this.users = users; this.loading = false; },
            error: () => { this.loading = false; }
        });
    }

    countRole(role: string): number {
        return this.users.filter(u => u.role === role).length;
    }

    openCreate() {
        this.isEditMode = false;
        this.editingId = null;
        this.form = { name: '', email: '', password: '', role: 'engineer' };
        this.showModal = true;
    }

    openEdit(user: User) {
        this.isEditMode = true;
        this.editingId = user._id;
        this.form = { name: user.name, email: user.email, password: '', role: user.role };
        this.showModal = true;
    }

    closeModal() {
        if (!this.submitting) this.showModal = false;
    }

    saveUser() {
        if (!this.form.name.trim() || !this.form.email.trim()) {
            Swal.fire('Validation Error', 'Name and email are required.', 'warning');
            return;
        }
        if (!this.isEditMode && !this.form.password.trim()) {
            Swal.fire('Validation Error', 'Password is required when creating a user.', 'warning');
            return;
        }
        this.submitting = true;

        if (this.isEditMode && this.editingId) {
            const dto: UpdateUserDto = { name: this.form.name, email: this.form.email, role: this.form.role };
            if (this.form.password.trim()) dto.password = this.form.password;

            this.usersService.updateUser(this.editingId, dto).subscribe({
                next: () => {
                    this.submitting = false;
                    this.showModal = false;
                    Swal.fire({ icon: 'success', title: 'Saved', text: 'User updated successfully.', timer: 1500, showConfirmButton: false });
                    this.loadUsers();
                },
                error: (err) => {
                    this.submitting = false;
                    Swal.fire('Error', err?.error?.message || 'Failed to update user.', 'error');
                }
            });
        } else {
            const dto: CreateUserDto = {
                name: this.form.name,
                email: this.form.email,
                password: this.form.password,
                role: this.form.role
            };
            this.usersService.createUser(dto).subscribe({
                next: () => {
                    this.submitting = false;
                    this.showModal = false;
                    Swal.fire({ icon: 'success', title: 'Created', text: 'User created successfully.', timer: 1500, showConfirmButton: false });
                    this.loadUsers();
                },
                error: (err) => {
                    this.submitting = false;
                    Swal.fire('Error', err?.error?.message || 'Failed to create user.', 'error');
                }
            });
        }
    }

    deleteUser(user: User) {
        Swal.fire({
            title: 'Delete User?',
            html: `Remove <strong>${user.name}</strong> (${user.email})?<br><small>This cannot be undone.</small>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#ef4444'
        }).then(res => {
            if (res.isConfirmed) {
                this.usersService.deleteUser(user._id).subscribe({
                    next: () => {
                        Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
                        this.loadUsers();
                    },
                    error: (err) => {
                        Swal.fire('Error', err?.error?.message || 'Failed to delete user.', 'error');
                    }
                });
            }
        });
    }

    getRoleColor(role: string): string {
        return this.roleDefinitions.find(r => r.role === role)?.color ?? '#64748b';
    }

    getRoleLabel(role: string): string {
        const def = this.roleDefinitions.find(r => r.role === role);
        return def ? def.label : role.charAt(0).toUpperCase() + role.slice(1);
    }

    getRoleDefinition(role: string): RoleDefinition | undefined {
        return this.roleDefinitions.find(r => r.role === role);
    }
}
