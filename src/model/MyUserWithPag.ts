import { MyUser } from "./MyUser";

export interface MyUserWithPag{
    list:MyUser[];
    count:number;
}