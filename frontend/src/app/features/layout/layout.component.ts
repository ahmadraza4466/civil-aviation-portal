import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterModule],
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
    isSidebarCollapsed = false;
    activeMenus: { [key: string]: boolean } = {
        maintenance: true,
        parts: false,
        logbook: false
    };
    currentUser: any;

    private authService = inject(AuthService);
    private router = inject(Router);
    public themeService = inject(ThemeService);

    ngOnInit() {
        this.authService.user$.subscribe(user => {
            this.currentUser = user;
        });
    }

    toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }

    toggleMenu(menuName: string) {
        this.activeMenus[menuName] = !this.activeMenus[menuName];
    }

    isRouteActive(routePath: string): boolean {
        return this.router.url.includes(routePath);
    }

    logout() {
        Swal.fire({
            title: 'Logout?',
            text: 'Are you sure you want to sign out?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                this.authService.logout();
                this.router.navigate(['/login']);
            }
        });
    }

    closeSidebarOnMobile() {
        if (window.innerWidth < 992) {
            this.isSidebarCollapsed = false;
        }
    }
}
