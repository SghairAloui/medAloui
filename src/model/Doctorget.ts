export interface DoctorGet{
    userId:number;
    userUsername:string;
    doctorFirstName:string;
    doctorLastName:string;
    userCity:string;
    doctorBirthDay:string;
    doctorGender:string;
    doctorStatus:string;
    doctorRate:number;
    maxPatientPerDay:number;
    startTime:number;
    exactAddress:string;
    workDays:string;
    appointmentApproximateDuration:number;
    appointmentPrice:number;
    currentPatient:number;
}