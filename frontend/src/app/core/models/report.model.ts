export interface ReportRequest {
    dateFrom: string;
    dateTo: string;
    device: string;
    status: string;
    reportType: string;
}

export interface ReportMeta {
    title: string;
    generatedAt: string;
    author: string;
}
