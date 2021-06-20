import { AppointmentForSec } from "./AppointmentForSec";

export interface AppointmentForSecWithPag{
    totalPages:number;
    list:AppointmentForSec [];
}