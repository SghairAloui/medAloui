export class SearchedDoctorInfo{
    constructor(
        private doctorId:number,
        private doctorFirstName:string,
        private doctorLastName:string,
        private doctorCity:string,
        private doctorGender:string,
        private doctorRate:number,
        private exactAdress:string,
        private workDays:string,
        private maxPatientPerDay:number
    ){};

    public getDoctorId():number{
        return this.doctorId;
    }
    public getMaxPatientPerDay():number{
        return this.maxPatientPerDay;
    }


}