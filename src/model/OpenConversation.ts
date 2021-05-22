import { MessageGet } from "./MessageGet";

export interface OpenConversation{
    conversationId:number;
    username:string;
    messages:MessageGet [];
    messagePage:number;
    userId:number;
    userImg:any;
    isUnread:boolean;
    lastMessageSenderId:number;
    conversationStatus:string;
    loadMoreMessage:boolean;
    statusUpdatedBy:number;
}