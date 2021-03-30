export class ValidationPost{
    constructor(
        private validationDecision:string,
        private validateBy:string,
        private accountType:string,
        private userId:number,
    ){};
}