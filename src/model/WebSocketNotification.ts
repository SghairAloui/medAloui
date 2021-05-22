import { MessageGet } from "./MessageGet";
import { NotificationGet } from "./NotificationGet";

export interface WebSocketNotification{
    type:string;
    data:string;
    notification:NotificationGet;
    message:MessageGet;
}