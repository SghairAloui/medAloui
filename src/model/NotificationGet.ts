export interface NotificationGet{
    notificationId:number;
    notificationType:string;
    senderId:number;
    recipientId:number;
    unread:boolean;
    notificationParameter:string;
    timeSent:string;
}