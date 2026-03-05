export interface SnagCase {
    id: string;
    ffsDevice: string;
    date: string;
    sequenceNo: string;
    status: string;
    ataNo: string;
    position: string;
    unit: string;
    orderNo: string;
    complaint: string;
    action: string;
    assignedTo?: string;
    actions?: any[];
}
