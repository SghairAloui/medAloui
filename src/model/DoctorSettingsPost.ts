export class DoctorSettingsPost{
    constructor(
        private userId:number,
        private startTime:string,
        private exactAddress:string,
        private workDays:string,
        private maxPatientPerDay:number,
        private appointmentPrice:number,
        private appointmentApproximateDuration:number,
    ){};
}