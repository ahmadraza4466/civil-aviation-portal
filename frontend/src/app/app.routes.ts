import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { LayoutComponent } from './features/layout/layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: 'app',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent)
            },
            {
                path: 'maintenance/cases',
                loadComponent: () => import('./features/maintenance/case-list/case-list.component').then(c => c.CaseListComponent)
            },
            {
                path: 'maintenance/new-snag',
                loadComponent: () => import('./features/maintenance/new-snag/new-snag.component').then(c => c.NewSnagComponent)
            },
            {
                path: 'parts/inventory',
                loadComponent: () => import('./features/parts/inventory/inventory.component').then(c => c.InventoryComponent)
            },
            {
                path: 'parts/document-library',
                loadComponent: () => import('./features/parts/document-library/document-library.component').then(c => c.DocumentLibraryComponent)
            },
            {
                path: 'logbook/shift-diary',
                loadComponent: () => import('./features/logbook/shift-diary/shift-diary.component').then(c => c.ShiftDiaryComponent)
            },
            {
                path: 'logbook/dr-issue-tracker',
                loadComponent: () => import('./features/logbook/dr-issue-tracker/dr-issue-tracker.component').then(c => c.DrIssueTrackerComponent)
            },
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
            },
            {
                path: 'reporting',
                loadComponent: () => import('./features/reporting/reporting.component').then(c => c.ReportingComponent)
            }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
