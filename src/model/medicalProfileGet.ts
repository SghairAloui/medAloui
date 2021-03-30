import { medicalProfileDiseaseGet } from "./medicalProfileDiseaseGet";

export interface medicalProfileGet{
    weight:number;
    height:number;
    medicalProfileDisease:medicalProfileDiseaseGet [];
}