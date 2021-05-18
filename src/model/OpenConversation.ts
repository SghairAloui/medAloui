import { MessageGet } from "./MessageGet";

export interface OpenConversation{
    conversationId:number;
    username:string;
    messages:MessageGet [];
    messagePage:number;
    openFullConver:boolean;
    userId:number;
    userImg:any;
}