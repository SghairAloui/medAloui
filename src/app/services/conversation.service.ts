import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConversationGet } from 'src/model/ConversationGet';
import { MessageGet } from 'src/model/MessageGet';

const CONVERSATION_API = 'http://localhost:8080/api/conversation/';
const MESSAGE_API = 'http://localhost:8080/api/message/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ConversationService {

  constructor(private http:HttpClient) { }

  public getConversationByUserId (userId:number,page:number,size:number){
    return this.http.post<ConversationGet []>(CONVERSATION_API + 'getConversationByUserId',{userId,page,size},httpOptions);
  }

  public getMessagesByConversationId (id:number,page:number,size:number){
    return this.http.post<MessageGet []>(MESSAGE_API + 'getMessagesByConversationId',{id,page,size},httpOptions);
  }

  public sendMessage (senderId:number,recipientId:number,messageContent:string,conversationId:number){
    return this.http.post<boolean>(MESSAGE_API + 'add',{senderId,recipientId,messageContent,conversationId},httpOptions);
  }
}
