import { CommentGet } from "./CommentGet";

export interface QuestionGet{
    questionId:number;
    questionName:string;
    questionAbout:string;
    question:string;
    questionPostTime:string;
    postBy:number;
    questionPoints:number;
    userFullName:string;
    comments:CommentGet [];
    commentPage:number;
    loadMoreComment:boolean;
    doctorComment:string;
    invalidComment:boolean;
    posterImageProfile:any;
}