import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

export const roleGuard: CanActivateFn = (route) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.currentUserValue;

    const expectedRole = route.data?.['role'];

    if (!user || (expectedRole && user.role !== expectedRole)) {
        Swal.fire('Access Denied', 'You do not have permission to access this resource.', 'error');
        router.navigate(['/app/dashboard']);
        return false;
    }

    return true;
};
