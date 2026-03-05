import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Location } from '@angular/common';
import { CasesService } from '../../../core/services/cases.service';
import { AuthService } from '../../../core/services/auth.service';
import { UsersService, User } from '../../../core/services/users.service';
import { APP_CONSTANTS } from '../../../core/constants/app.constants';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-new-snag',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './new-snag.component.html'
})
export class NewSnagComponent implements OnInit {
    snagForm: FormGroup;
    newActionControl = new FormControl('');
    isSubmitting = false;
    actionHistory: any[] = [];
    engineers: string[] = ['Unassigned'];
    currentCaseId: string | null = null;
    isEditMode = false;

    private fb = inject(FormBuilder);
    private casesService = inject(CasesService);
    private authService = inject(AuthService);
    private usersService = inject(UsersService);
    private location = inject(Location);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    currentUser = this.authService.currentUserValue;
    currentDateStr = new Date().toISOString().split('T')[0];
    currentTimeStr = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    devices = APP_CONSTANTS.DEVICES;
    statuses = APP_CONSTANTS.STATUS_LIST;
    ataNos = APP_CONSTANTS.ATA_CODES;
    positions = ['Left', 'Right', 'Center', 'Nose', 'Tail', 'None selected'];
    units = ['Aileron', 'Elevator', 'Rudder', 'Strut', 'Valve', 'None selected'];

    constructor() {
        this.snagForm = this.fb.group({
            ffsDevice: [this.devices[0].name, Validators.required],
            date: [new Date().toISOString().split('T')[0], Validators.required],
            sequenceNo: [''],
            status: [this.statuses[0].name, Validators.required],
            ataNo: [this.ataNos[0].code + '-' + this.ataNos[0].description, Validators.required],
            position: ['None selected'],
            unit: ['None selected'],
            orderNo: [''],
            assignee: ['Unassigned'],
            complaint: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.usersService.getUsers().subscribe({
            next: (users: User[]) => {
                const names = users.map(u => u.name);
                this.engineers = ['Unassigned', ...names];
            },
            error: (err) => console.error('Failed to load users', err)
        });

        this.route.queryParams.subscribe(params => {
            if (params['id']) {
                this.currentCaseId = params['id'];
                this.isEditMode = true;
                this.casesService.cases$.subscribe(cases => {
                    const existingCase = cases.find(c => c.id === this.currentCaseId);
                    if (existingCase) {
                        this.snagForm.patchValue({
                            ffsDevice: existingCase.ffsDevice,
                            date: existingCase.date,
                            sequenceNo: existingCase.sequenceNo,
                            status: existingCase.status,
                            ataNo: existingCase.ataNo || 'None selected',
                            position: existingCase.position || 'None selected',
                            unit: existingCase.unit || 'None selected',
                            orderNo: existingCase.orderNo || '',
                            assignee: existingCase.assignedTo || 'Unassigned',
                            complaint: existingCase.complaint
                        });

                        if (existingCase.actions && Array.isArray(existingCase.actions)) {
                            this.actionHistory = existingCase.actions.map(a => ({
                                user: a.author,
                                date: a.timestamp.split(' ')[0] || new Date().toISOString().split('T')[0],
                                time: a.timestamp.split(' ')[1] || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                                text: a.message
                            }));
                        }
                    }
                });
            }
        });

        this.snagForm.get('assignee')?.valueChanges.subscribe(val => {
            if (val && val !== 'Unassigned') {
                this.actionHistory.push({
                    user: this.currentUser?.name || 'System',
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                    text: `Case assigned to ${val}`
                });
            }
        });
    }

    addAction() {
        const text = this.newActionControl.value;
        if (text && text.trim().length > 0) {
            this.actionHistory.push({
                user: this.currentUser?.name || 'Engineer',
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                text: text.trim()
            });
            this.newActionControl.reset();
        }
    }

    onSave() {
        if (this.snagForm.invalid) {
            this.snagForm.markAllAsTouched();
            Swal.fire('Validation Error', 'Please fill in required fields.', 'error');
            return;
        }

        this.isSubmitting = true;
        const formValue = this.snagForm.value;
        const casePayload = {
            ...formValue,
            id: this.currentCaseId,
            assignedTo: formValue.assignee !== 'Unassigned' ? formValue.assignee : undefined,
            actions: this.actionHistory.map(a => ({
                author: a.user,
                timestamp: `${a.date} ${a.time}`,
                message: a.text
            }))
        };

        const req$ = this.isEditMode
            ? this.casesService.updateCase(casePayload)
            : this.casesService.addCase(casePayload);

        req$.subscribe({
            next: () => {
                this.isSubmitting = false;
                Swal.fire('Success', `Snag case ${this.isEditMode ? 'updated' : 'saved'} successfully!`, 'success').then(() => {
                    this.router.navigate(['/app/dashboard']);
                });
            },
            error: () => this.isSubmitting = false
        });
    }

    onClear() {
        this.snagForm.reset({
            date: new Date().toISOString().split('T')[0],
            status: 'Open',
            ataNo: 'None selected',
            position: 'None selected',
            unit: 'None selected',
            assignee: 'Unassigned'
        });
        this.actionHistory = [];

        // Toast
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });

        Toast.fire({
            icon: 'info',
            title: 'Form cleared'
        });
    }

    onCancel() {
        if (this.snagForm.dirty) {
            Swal.fire({
                title: 'Discard changes?',
                text: 'You have unsaved changes. Are you sure you want to cancel?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, discard it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.location.back();
                }
            });
        } else {
            this.location.back();
        }
    }
}
