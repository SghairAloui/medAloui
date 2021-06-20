import { SecretaryWork } from "./SecretaryWork";

export interface SecretaryPublicInfo{

    secretaryFirstName:string;
    secretaryLastName:string;
    secretaryGender:string;
    secretaryRate:number;
    secretaryBirthDay:string;
    userId:number;
    profilePic:any;
    secretaryWork:SecretaryWork[];

}