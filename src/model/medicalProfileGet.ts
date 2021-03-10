import { medicalProfileDiseaseGet } from "./medicalProfileDiseaseGet";

export interface medicalProfileGet{
    medicalProfileId:number;
    weight:number;
    height:number;
    medicalProfileDisease:medicalProfileDiseaseGet [];
}