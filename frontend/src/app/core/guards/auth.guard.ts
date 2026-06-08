import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.currentUserValue;

    if (!user) {
        router.navigate(['/login']);
        return false;
    }

    const allowedRoles: string[] | undefined = route.data['allowedRoles'];
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Instructors are redirected to their only permitted screen
        const fallback = user.role === 'instructor'
            ? '/app/logbook/time-logs'
            : '/app/dashboard';
        Swal.fire('Access Denied', 'You do not have permission to view this page.', 'error');
        router.navigate([fallback]);
        return false;
    }

    return true;
};
