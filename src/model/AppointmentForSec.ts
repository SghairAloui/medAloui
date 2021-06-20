export interface AppointmentForSec{
    userId:number;
    patientFirstName:string;
    patientLastName:string;
    userCity:string;
    patientBirthDay:string;
    patientGender:string;
    medicalProfileId:number;
    appointmentId:number;
    appointmentDate:string;
    patientProfilePic:any;
    confirmingApp:boolean;
    refusingApp:boolean;
    appointmentStatus:string;
}