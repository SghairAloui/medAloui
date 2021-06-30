export class DoctorPostWithSecureLogin{
    constructor(
        private userUsername:string,
        private doctorFirstName:string,
        private doctorLastName:string,
        private userCity:string,
        private userPassword:string,
        private doctorBirthDay:string,
        private doctorGender:string,
        private userId:number
    ){};
}