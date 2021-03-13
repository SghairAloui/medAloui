export class DoctorPostWithSecureLogin{
    constructor(
        private doctorUserName:string,
        private doctorFirstName:string,
        private doctorLastName:string,
        private doctorCity:string,
        private doctorPassword:string,
        private doctorBirthDay:string,
        private doctorGender:string,
        private doctorSecureLogin:string
    ){};
}