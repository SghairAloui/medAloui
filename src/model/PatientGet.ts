import { medicalProfileGet } from "./medicalProfileGet";
import { prescriptionGet } from "./prescriptionGet";

export interface PatientGet{
    patientId:number;
    patientUserName:string;
    patientFirstName:string;
    patientLastName:string;
    patientCity:string;
    patientPassword:string;
    patientBirthDay:string;
    patientGender:string;
    patientCreationDate:string;
    patientSecureLogin:string;
    medicalProfile:medicalProfileGet;
    prescription:prescriptionGet[];
}