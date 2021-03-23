import { AppointmentGet } from "./AppointmentGet";
import { SpecialityGet } from "./SpecialityGet";

export interface DoctorGet{
    doctorId:number;
    doctorUserName:string;
    doctorFirstName:string;
    doctorLastName:string;
    doctorCity:string;
    doctorBirthDay:string;
    doctorGender:string;
    doctorStatus:string;
    doctorPassword:string;
    doctorRate:number;
    speciality: SpecialityGet [];
    maxPatientPerDay:string;
    startTime:string;
    exactAdress:string;
    workDays:string;
    appointment:AppointmentGet [];
}