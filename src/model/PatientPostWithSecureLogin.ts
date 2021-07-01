export class PatientPostWithSecureLogin{
    constructor(
        private patientFirstName:string,
        private patientLastName:string,
        private userCity:string,
        private patientBirthDay:string,
        private patientGender:string,
        private userId:number
    ){};
}