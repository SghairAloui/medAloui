export class PatientPostWithSecureLogin{
    constructor(
        private patientUserName:string,
        private patientFirstName:string,
        private patientLastName:string,
        private patientCity:string,
        private patientPassword:string,
        private patientBirthDay:string,
        private patientGender:string,
        private patientSecureLogin:string
    ){};
}