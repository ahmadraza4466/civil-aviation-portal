import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TimeLogsService } from '../../../core/services/time-logs.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-time-log-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './time-log-form.component.html',
    styleUrls: ['./time-log-form.component.css']
})
export class TimeLogFormComponent implements OnInit {
    logForm: FormGroup;
    isSubmitting = false;
    isEditMode = false;
    currentId: string | null = null;

    hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    configurations = ['A220-100 LVA.FSTD.04', 'A220-300 #1 LVA.FSTD.05', 'A220-300 #2 LVA.FSTD.07'];
    simUsedAsOpts = ['FFS (with motion)', 'FBS (without motion)'];
    submitToOpts = ['DO', 'ATO Checks', 'ATO Reports'];
    qualityOpts = [1, 2, 3, 4, 5];

    private fb = inject(FormBuilder);
    private timeLogService = inject(TimeLogsService);
    private location = inject(Location);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    constructor() {
        this.logForm = this.fb.group({
            companyCustomer: ['', Validators.required],
            instructor: [''],
            pilot1: [''],
            pilot2: [''],
            observer1: [''],
            observer2: [''],
            startHour: ['00', Validators.required],
            startMinute: ['00', Validators.required],
            endHour: ['00', Validators.required],
            endMinute: ['00', Validators.required],
            lostHour: ['00'],
            lostMinute: ['00'],
            totalHour: ['00', Validators.required],
            totalMinute: ['00', Validators.required],
            configuration: ['', Validators.required],
            simulatorUsedAs: ['', Validators.required],
            submitTo: this.fb.array(this.submitToOpts.map(() => new FormControl(false))),
            qualityLevel: [5, Validators.required],
            comment: [''],
            engineerOnDuty: ['Unassigned'],
            customerEmail: ['', Validators.email],
            confirmed1: [false, Validators.requiredTrue],
            confirmed2: [false, Validators.requiredTrue],
            includeInSnag: [false]
        });
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const idParam = params['id'];
            if (idParam) {
                this.currentId = idParam;
                this.isEditMode = true;
                this.timeLogService.getTimeLog(idParam).subscribe(log => {
                    if (log) {
                        const [sh, sm] = (log.startTime || '00:00').split(':');
                        const [eh, em] = (log.endTime || '00:00').split(':');
                        const [lh, lm] = (log.timeLost || '00:00').split(':');
                        const [th, tm] = (log.totalTrainingTime || '00:00').split(':');

                        const submitToArray = this.submitToOpts.map(opt => (log.timelogSubmitTo || []).includes(opt));

                        this.logForm.patchValue({
                            ...log,
                            startHour: sh, startMinute: sm,
                            endHour: eh, endMinute: em,
                            lostHour: lh, lostMinute: lm,
                            totalHour: th, totalMinute: tm,
                            confirmed1: true,
                            confirmed2: true
                        });

                        this.submitToFormArray.setValue(submitToArray);
                    }
                });
            }
        });
    }

    get submitToFormArray() {
        return this.logForm.controls['submitTo'] as FormArray;
    }

    onSave() {
        const qLevel = this.logForm.get('qualityLevel')?.value;
        const comment = this.logForm.get('comment')?.value;
        if (qLevel < 5 && (!comment || comment.trim() === '')) {
            this.logForm.get('comment')?.setErrors({ required: true });
            this.logForm.markAllAsTouched();
            Swal.fire('Validation Error', 'Comment is required when Quality Level is less than 5.', 'error');
            return;
        }

        if (this.logForm.invalid) {
            this.logForm.markAllAsTouched();
            Swal.fire('Validation Error', 'Please fill in required fields.', 'error');
            return;
        }

        this.isSubmitting = true;
        const v = this.logForm.value;

        const selectedSubmitTo = this.submitToFormArray.value
            .map((checked: boolean, i: number) => checked ? this.submitToOpts[i] : null)
            .filter((v: any) => v !== null);

        const payload = {
            companyCustomer: v.companyCustomer,
            instructor: v.instructor,
            pilot1: v.pilot1,
            pilot2: v.pilot2,
            observer1: v.observer1,
            observer2: v.observer2,
            startTime: `${v.startHour}:${v.startMinute}`,
            endTime: `${v.endHour}:${v.endMinute}`,
            timeLost: `${v.lostHour}:${v.lostMinute}`,
            totalTrainingTime: `${v.totalHour}:${v.totalMinute}`,
            configuration: v.configuration,
            simulatorUsedAs: v.simulatorUsedAs,
            timelogSubmitTo: selectedSubmitTo,
            qualityLevel: v.qualityLevel,
            comment: v.comment,
            engineerOnDuty: v.engineerOnDuty,
            customerEmail: v.customerEmail,
            includeInSnag: v.includeInSnag
        };

        const req$ = this.isEditMode
            ? this.timeLogService.updateTimeLog(this.currentId!, payload)
            : this.timeLogService.createTimeLog(payload);

        req$.subscribe({
            next: (success) => {
                this.isSubmitting = false;
                if (success) {
                    Swal.fire('Success', `Time Log ${this.isEditMode ? 'updated' : 'saved'} successfully!`, 'success').then(() => {
                        this.location.back();
                    });
                } else {
                    Swal.fire('Error', 'Failed to save Time Log', 'error');
                }
            },
            error: () => this.isSubmitting = false
        });
    }

    onCancel() {
        this.location.back();
    }
}
