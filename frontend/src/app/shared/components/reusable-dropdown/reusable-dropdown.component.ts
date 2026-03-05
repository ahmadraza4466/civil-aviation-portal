import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reusable-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reusable-dropdown.component.html',
  styleUrls: ['./reusable-dropdown.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ReusableDropdownComponent),
      multi: true
    }
  ]
})
export class ReusableDropdownComponent implements ControlValueAccessor {
  @Input() options: any[] = [];
  @Input() labelKey: string = 'name';
  @Input() valueKey: string = 'id';
  @Input() placeholder: string = 'Select an option...';
  @Input() label: string = '';
  @Input() id: string = `dropdown-${Math.floor(Math.random() * 1000)}`;

  @Output() selectionChange = new EventEmitter<any>();

  value: any = null;
  isDisabled = false;

  private onChange: (value: any) => void = () => { };
  private onTouched: () => void = () => { };

  writeValue(val: any): void {
    this.value = val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onSelectChange(event: any) {
    const selectedValue = event.target.value;
    this.value = selectedValue;
    this.onChange(selectedValue);
    this.onTouched();
    this.selectionChange.emit(selectedValue);
  }

  getOptionLabel(option: any): string {
    return this.labelKey ? option[this.labelKey] : option;
  }

  getOptionValue(option: any): any {
    return this.valueKey ? option[this.valueKey] : option;
  }
}
