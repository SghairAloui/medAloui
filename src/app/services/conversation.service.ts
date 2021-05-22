import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Conversation } from 'src/model/Conversation';
import { ConversationGet } from 'src/model/ConversationGet';
import { MessageGet } from 'src/model/MessageGet';
import { StringGet } from 'src/model/StringGet';

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
  
  public addConversation (openedBy:number,openedTo:number){
    return this.http.post<Conversation>(CONVERSATION_API + 'add',{openedTo,openedBy},httpOptions);
  }

  public getMessagesByConversationId (id:number,page:number,size:number){
    return this.http.post<MessageGet []>(MESSAGE_API + 'getMessagesByConversationId',{id,page,size},httpOptions);
  }

  public sendMessage (senderId:number,recipientId:number,messageContent:string,conversationId:number){
    return this.http.post<StringGet>(MESSAGE_API + 'add',{senderId,recipientId,messageContent,conversationId},httpOptions);
  }

  public getConversationByid (conversationId:number,userid:number){
    return this.http.get<ConversationGet>(CONVERSATION_API + 'getConversationByid/'+conversationId+'/'+userid,httpOptions);
  }

  public readConversationById (conversationId:number,userId:number){
    return this.http.get<boolean>(CONVERSATION_API + 'readConversationById/'+conversationId+'/'+userId,httpOptions);
  }

  public updateConversationStatusById (id:number,status:string,changedBy:number,changedTo:number){
    return this.http.post<boolean>(CONVERSATION_API + 'updateConversationStatusById',{id,status,changedBy,changedTo},httpOptions);
  }
}
