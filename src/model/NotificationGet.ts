export interface NotificationGet{
    notificationId:number;
    notificationType:string;
    senderId:number;
    recipientId:number;
    isUnread:boolean;
    notificationParameter:string;
    timeSent:string;
    name:string;
    order:string;
}