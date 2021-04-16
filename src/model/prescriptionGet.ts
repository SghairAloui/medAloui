import { doctor } from "./Doctor";
import { PrescriptionMedicament } from "./PrescriptionMedicament";

export interface prescriptionGet{
    prescriptionId:number;
    prescriptionDate:string;
    patientId:number;
    doctorId:number;
    medicament:PrescriptionMedicament [];
    fullData:boolean;
    prescriptiondoctor:doctor;
}