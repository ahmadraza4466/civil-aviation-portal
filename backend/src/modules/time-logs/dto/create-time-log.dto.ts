export class CreateTimeLogDto {
    companyCustomer: string;
    instructor?: string;
    pilot1?: string;
    pilot2?: string;
    observer1?: string;
    observer2?: string;
    startTime: string;
    endTime: string;
    timeLost?: string;
    totalTrainingTime: string;
    configuration: string;
    simulatorUsedAs: string;
    timelogSubmitTo?: string[];
    qualityLevel?: number;
    comment?: string;
    engineerOnDuty?: string;
    customerEmail?: string;
    includeInSnag?: boolean;
}

export class UpdateTimeLogDto extends CreateTimeLogDto { }
