import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { CommentGet } from 'src/model/CommentGet';
import { QuestionGet } from 'src/model/QuestionGet';

const QUESTION_API = environment.apiUrl+'api/question/';
const COMMENT_API = environment.apiUrl+'api/comment/';
const POINT_API = environment.apiUrl+'api/point/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})

export class QuestionService {

  constructor(private http:HttpClient) { }

  public addQuestion(questionName:string,questionAbout:string,question:string,postBy:number){
    return this.http.post<number>(QUESTION_API + 'add',{question,questionAbout,questionName,postBy},httpOptions);
  }

  public getQuestionsByType(page:number,size:number,type:string,words:string){
    return this.http.post<QuestionGet []>(QUESTION_API + 'getQuestionsByType',{page,size,type,words},httpOptions);
  }

  public getQuestionById(questionId:number){
    return this.http.get<QuestionGet>(QUESTION_API + 'getQuestionById/'+questionId,httpOptions);
  }

  public getComments(id:number,page:number,size:number){
    return this.http.post<CommentGet []>(COMMENT_API + 'getAll',{id,page,size},httpOptions);
  }

  public addPointToPost(postId:number,userId:number,postType:string){
    return this.http.post<boolean>(POINT_API + 'add',{postId,userId,postType},httpOptions);
  }

  public deletePointByQuestionIdAndUserId(questionId:number,userId:number,postType:string){
    return this.http.delete<boolean>(POINT_API + 'deleteById/'+questionId+'/'+userId+'/'+postType,httpOptions);
  }

  public addComment(postId:number,postedBy:number,comment:string){
    return this.http.post<number>(COMMENT_API + 'add',{postId,postedBy,comment},httpOptions);
  }

  public getQuestionsByUserId(id:number,page:number,size:number){
    return this.http.post<QuestionGet []>(QUESTION_API + 'getQuestionsByUserId',{id,page,size},httpOptions);
  }

  public getQuestionsTypes(){
    return this.http.get<string []>(QUESTION_API + 'getQuestionsTypes',httpOptions);
  }
}
