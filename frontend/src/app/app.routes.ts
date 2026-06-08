import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { LayoutComponent } from './features/layout/layout.component';
import { authGuard } from './core/guards/auth.guard';

// Roles that can access everything except instructor-only screens
const STAFF_ROLES = ['admin', 'engineer'];
const ADMIN_ROLES = ['admin'];

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: 'app',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            // Default redirect — dashboard guard will bounce instructors to time-logs
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

            // ── Staff-only routes ──────────────────────────────────────────
            {
                path: 'dashboard',
                canActivate: [authGuard],
                data: { allowedRoles: STAFF_ROLES },
                loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent)
            },
            {
                path: 'maintenance/cases',
                canActivate: [authGuard],
                data: { allowedRoles: STAFF_ROLES },
                loadComponent: () => import('./features/maintenance/case-list/case-list.component').then(c => c.CaseListComponent)
            },
            {
                path: 'maintenance/new-snag',
                canActivate: [authGuard],
                data: { allowedRoles: STAFF_ROLES },
                loadComponent: () => import('./features/maintenance/new-snag/new-snag.component').then(c => c.NewSnagComponent)
            },
            {
                path: 'parts/inventory',
                canActivate: [authGuard],
                data: { allowedRoles: STAFF_ROLES },
                loadComponent: () => import('./features/parts/inventory/inventory.component').then(c => c.InventoryComponent)
            },
            {
                path: 'parts/document-library',
                canActivate: [authGuard],
                data: { allowedRoles: STAFF_ROLES },
                loadComponent: () => import('./features/parts/document-library/document-library.component').then(c => c.DocumentLibraryComponent)
            },
            {
                path: 'logbook/shift-diary',
                canActivate: [authGuard],
                data: { allowedRoles: STAFF_ROLES },
                loadComponent: () => import('./features/logbook/shift-diary/shift-diary.component').then(c => c.ShiftDiaryComponent)
            },
            {
                path: 'logbook/shifts',
                canActivate: [authGuard],
                data: { allowedRoles: STAFF_ROLES },
                loadComponent: () => import('./features/logbook/shift-schedule/shift-schedule.component').then(c => c.ShiftScheduleComponent)
            },
            {
                path: 'reporting',
                canActivate: [authGuard],
                data: { allowedRoles: STAFF_ROLES },
                loadComponent: () => import('./features/reporting/reporting.component').then(c => c.ReportingComponent)
            },

            // ── Admin-only routes ─────────────────────────────────────────
            {
                path: 'admin/role-management',
                canActivate: [authGuard],
                data: { allowedRoles: ADMIN_ROLES },
                loadComponent: () => import('./features/admin/role-management/role-management.component').then(c => c.RoleManagementComponent)
            },

            // ── All roles (including instructor) ──────────────────────────
            {
                path: 'logbook/time-logs',
                loadComponent: () => import('./features/time-logs/time-log-list/time-log-list.component').then(c => c.TimeLogListComponent)
            },
            {
                path: 'logbook/time-logs/new',
                loadComponent: () => import('./features/time-logs/time-log-form/time-log-form.component').then(c => c.TimeLogFormComponent)
            },
            {
                path: 'logbook/time-logs/edit',
                loadComponent: () => import('./features/time-logs/time-log-form/time-log-form.component').then(c => c.TimeLogFormComponent)
            }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
