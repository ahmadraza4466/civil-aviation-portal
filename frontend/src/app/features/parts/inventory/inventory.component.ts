import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { APP_CONSTANTS } from '../../../core/constants/app.constants';
import Swal from 'sweetalert2';

interface Part {
  id: string;
  partNumber: string;
  serialNumber: string;
  status: string;
  location: string;
  condition: string;
  quantity: number;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ReusableTableComponent],
  templateUrl: './inventory.component.html'
})
export class InventoryComponent implements OnInit {
  parts: Part[] = [];
  filteredParts: Part[] = [];

  tableColumns = [
    { key: 'partNumber', header: 'Part No' },
    { key: 'serialNumber', header: 'Serial No' },
    { key: 'location', header: 'Location' },
    { key: 'condition', header: 'Condition' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'status', header: 'Status' }
  ];

  deviceOptions = APP_CONSTANTS.DEVICES.map(d => d.name);
  selectedDevice = '';
  selectedStatus = ''; // '' = all

  totalParts = 0;
  lowStockCount = 0;
  outOfStockCount = 0;
  inStockCount = 0;

  ngOnInit() {
    this.parts = [
      { id: '1', partNumber: 'PN-10023', serialNumber: 'SN-0091', status: 'In Stock', location: 'Shelf A1', condition: 'New', quantity: 15 },
      { id: '2', partNumber: 'PN-88741', serialNumber: 'SN-0092', status: 'Low Stock', location: 'Shelf B2', condition: 'Serviceable', quantity: 2 },
      { id: '3', partNumber: 'PN-44512', serialNumber: 'SN-0093', status: 'Out of Stock', location: 'Shelf C1', condition: 'Unserviceable', quantity: 0 },
      { id: '4', partNumber: 'PN-99231', serialNumber: 'SN-0094', status: 'In Stock', location: 'Shelf A3', condition: 'New', quantity: 20 },
    ];
    this.applyFilters();
  }

  filterByStatus(status: string) {
    this.selectedStatus = status === '' || this.selectedStatus === status ? '' : status;
    this.applyFilters();
  }

  filterByDevice(device: string) {
    this.selectedDevice = device;
    this.applyFilters();
  }

  private applyFilters() {
    const base = this.selectedDevice
      ? this.parts.filter(p => (p as any).system === this.selectedDevice)
      : [...this.parts];

    // Counts always from the full/device-filtered list
    this.totalParts = base.length;
    this.inStockCount = base.filter(p => p.status === 'In Stock').length;
    this.lowStockCount = base.filter(p => p.status === 'Low Stock').length;
    this.outOfStockCount = base.filter(p => p.status === 'Out of Stock').length;

    // Status filter for table
    this.filteredParts = this.selectedStatus
      ? base.filter(p => p.status === this.selectedStatus)
      : base;
  }

  onAdd() {
    Swal.fire({
      title: 'Add New Part',
      html: `
        <input id="swal-input1" class="swal2-input custom-dark-input mx-0 w-100 mb-3" placeholder="Part Number">
        <input id="swal-input2" class="swal2-input custom-dark-input mx-0 w-100 mb-3" placeholder="Serial Number">
        <input id="swal-input3" class="swal2-input custom-dark-input mx-0 w-100 mb-0" placeholder="Quantity" type="number">
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const pn = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const sn = (document.getElementById('swal-input2') as HTMLInputElement).value;
        const qty = parseInt((document.getElementById('swal-input3') as HTMLInputElement).value, 10);
        if (!pn || !sn || isNaN(qty)) { Swal.showValidationMessage('Please fill all fields'); return null; }
        let status = 'In Stock';
        if (qty === 0) status = 'Out of Stock';
        else if (qty < 5) status = 'Low Stock';
        return { pn, sn, qty, status };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.parts.unshift({ id: Date.now().toString(), partNumber: result.value.pn, serialNumber: result.value.sn, status: result.value.status, location: 'TBD', condition: 'New', quantity: result.value.qty });
        this.applyFilters();
        Swal.fire('Added', 'Part has been added.', 'success');
      }
    });
  }

  onEdit(part: any) {
    Swal.fire({
      title: 'Edit Part',
      html: `
        <input id="swal-input1" class="swal2-input custom-dark-input mx-0 w-100 mb-3" placeholder="Part Number" value="${part.partNumber}">
        <input id="swal-input2" class="swal2-input custom-dark-input mx-0 w-100 mb-3" placeholder="Serial Number" value="${part.serialNumber}">
        <input id="swal-input3" class="swal2-input custom-dark-input mx-0 w-100 mb-0" placeholder="Quantity" type="number" value="${part.quantity}">
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const pn = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const sn = (document.getElementById('swal-input2') as HTMLInputElement).value;
        const qty = parseInt((document.getElementById('swal-input3') as HTMLInputElement).value, 10);
        if (!pn || !sn || isNaN(qty)) { Swal.showValidationMessage('Please fill all fields'); return null; }
        let status = 'In Stock';
        if (qty === 0) status = 'Out of Stock';
        else if (qty < 5) status = 'Low Stock';
        return { pn, sn, qty, status };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const idx = this.parts.findIndex(p => p.id === part.id);
        if (idx !== -1) {
          this.parts[idx] = { ...this.parts[idx], partNumber: result.value.pn, serialNumber: result.value.sn, quantity: result.value.qty, status: result.value.status };
        }
        this.applyFilters();
        Swal.fire('Updated', 'Part details updated.', 'success');
      }
    });
  }

  onDelete(part: any) {
    Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Yes, delete it!' }).then((result) => {
      if (result.isConfirmed) {
        this.parts = this.parts.filter(p => p.id !== part.id);
        this.applyFilters();
        Swal.fire('Deleted!', 'The part has been removed.', 'success');
      }
    });
  }

  onViewHistory(part: any) {
    Swal.fire({
      title: 'Part Movement History',
      html: `<div class="table-responsive"><table class="table table-sm text-start text-white mb-0" style="background:transparent"><thead><tr><th>Date</th><th>Action</th><th>Location</th></tr></thead><tbody><tr><td>2026-03-01</td><td>Received</td><td>Receiving Bay</td></tr><tr><td>2026-03-02</td><td>Moved</td><td>Shelf A1</td></tr></tbody></table></div>`,
      width: 600
    });
  }
}
