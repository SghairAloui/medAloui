import { AppointmentGet } from "./AppointmentGet";
import { QuestionGet } from "./QuestionGet";

export interface UserSearchGet{
    userId:number;
    userType:string;
    userFullName:string;
    userGender:string;
    pharmacyType:string;
    appApproxDuration:number;
    appPrice:number;
    doctorRate:number;
    maxPatPerDay:number;
    startTime:string;
    workDays:string;
    userExactAddress:string;
    userBirthDay:string;
    userLatitude:string;
    userLongitude:string;
    userCity:string;
    userImg:any;
    startingConversation:boolean;
    patientAppointment:AppointmentGet [];
    patientAppPage:number;
    loadMoreApp:boolean;
    patientQuestions: QuestionGet[];
    patientQuestionsPage: number;
    loadMoreQuestion:boolean;
}