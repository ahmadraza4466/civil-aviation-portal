import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private renderer: Renderer2;
    private currentTheme: 'dark' | 'light' = 'dark';

    constructor(rendererFactory: RendererFactory2) {
        this.renderer = rendererFactory.createRenderer(null, null);
        this.initTheme();
    }

    private initTheme() {
        if (typeof window !== 'undefined' && localStorage) {
            const savedTheme = localStorage.getItem('app-theme') as 'dark' | 'light';
            if (savedTheme) {
                this.currentTheme = savedTheme;
            }
        }
        this.applyTheme(this.currentTheme);
    }

    public toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        if (typeof window !== 'undefined' && localStorage) {
            localStorage.setItem('app-theme', this.currentTheme);
        }
        this.applyTheme(this.currentTheme);
    }

    public get isDarkMode(): boolean {
        return this.currentTheme === 'dark';
    }

    public getTheme(): string {
        return this.currentTheme;
    }

    private applyTheme(theme: 'dark' | 'light') {
        if (typeof document !== 'undefined') {
            if (theme === 'light') {
                this.renderer.addClass(document.body, 'light-theme');
            } else {
                this.renderer.removeClass(document.body, 'light-theme');
            }
        }
    }
}
