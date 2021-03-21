export class AppointmentPost{
    constructor(
        private appointmentDate:string,
        private doctorId:number,
        private patientId:number,
        private patientTurn:number
    ){};
}