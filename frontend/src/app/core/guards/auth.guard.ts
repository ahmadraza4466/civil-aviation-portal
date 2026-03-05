import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.currentUserValue;

    if (user) {
        // Placeholder logic for role-based access
        const requiredRole = route.data['role'];
        if (requiredRole && user.role !== requiredRole) {
            Swal.fire('Access Denied', 'You do not have permission to view this page.', 'error');
            router.navigate(['/app/dashboard']);
            return false;
        }
        return true;
    }

    router.navigate(['/login']);
    return false;
};
