const fs = require('fs');
const css = `

/* GLOBAL LIGHT THEME OVERRIDES */
body.light-theme {
    background-color: #f8fafc !important;
    color: #1e293b !important;
}

body.light-theme .text-white {
    color: #1e293b !important;
}
body.light-theme .text-light {
    color: #334155 !important;
}
body.light-theme .text-secondary {
    color: #64748b !important;
}
body.light-theme .bg-transparent {
    background-color: transparent !important;
}

body.light-theme .swal2-popup.swal2-toast,
body.light-theme .swal2-popup {
    background: #ffffff !important;
    color: #1e293b !important;
    border: 1px solid #e2e8f0 !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
}

body.light-theme .swal2-title {
    color: #1e293b !important;
}

body.light-theme .swal2-html-container {
    color: #475569 !important;
}

body.light-theme ::-webkit-scrollbar-track {
    background: #f1f5f9;
}
body.light-theme ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
}
body.light-theme ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

body.light-theme .dark-panel-card {
    background-color: #ffffff !important;
    border-radius: 1rem !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.02) !important;
    border: 1px solid #e2e8f0 !important;
}

body.light-theme .kpi-card {
    background-color: #ffffff !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
    border: 1px solid #e2e8f0 !important;
}
body.light-theme .kpi-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
}

body.light-theme .table-dark-custom th {
    background-color: #f1f5f9 !important;
    color: #475569 !important;
    border-bottom: 2px solid #cbd5e1 !important;
}
body.light-theme .table-dark-custom td {
    background-color: #ffffff !important;
    color: #1e293b !important;
    border-bottom: 1px solid #e2e8f0 !important;
}
body.light-theme .table-dark-custom tbody tr:hover td {
    background-color: #f8fafc !important;
}

body.light-theme .custom-dark-input {
    background-color: #ffffff !important;
    border: 1px solid #cbd5e1 !important;
    color: #1e293b !important;
}

/* Base custom forms light */
body.light-theme .form-control,
body.light-theme .form-select {
    background-color: #ffffff !important;
    border-color: #cbd5e1 !important;
    color: #1e293b !important;
}

body.light-theme .form-select {
    --bs-form-select-bg-img: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23334155' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e") !important;
}

body.light-theme input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(0) !important;
}

/* Layout overrides */
body.light-theme #page-content-wrapper {
    background-color: #f8fafc !important;
}

body.light-theme .navbar {
    background-color: #ffffff !important;
    border-bottom-color: #e2e8f0 !important;
}

body.light-theme .sidebar-heading,
body.light-theme .sidebar-text,
body.light-theme .sidebar-label,
body.light-theme .sidebar-icon,
body.light-theme .navbar-brand {
    color: #1e293b !important;
}

body.light-theme #sidebar-wrapper {
    background-color: #ffffff !important;
    border-right: 1px solid #e2e8f0 !important;
}

body.light-theme .list-group-item {
    color: #1e293b !important;
}
body.light-theme .list-group-item:hover,
body.light-theme .list-group-item.active-menu,
body.light-theme .list-group-item.active {
    background-color: #f1f5f9 !important;
    color: #3b82f6 !important;
}

body.light-theme .dropdown-menu {
    background-color: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
}

body.light-theme .dropdown-item {
    color: #1e293b !important;
}
body.light-theme .dropdown-item:hover {
    background-color: #f1f5f9 !important;
}

body.light-theme .nav-link .border-secondary {
    border-color: #cbd5e1 !important;
    background-color: #f1f5f9 !important;
    color: #1e293b !important;
}
body.light-theme #menu-toggle {
    color: #1e293b !important;
}

`;
fs.appendFileSync('D:\\air-sim-maintenance-portal\\frontend\\src\\styles.css', css);
console.log('Appended styles.');
