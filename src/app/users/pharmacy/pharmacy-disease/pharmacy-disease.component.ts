import { Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { QuestionService } from 'src/app/services/question.service';
import { UserService } from 'src/app/services/user.service';
import { CommentGet } from 'src/model/CommentGet';
import { FirstAndLastNameGet } from 'src/model/FirstAndLastNameGet';
import { QuestionGet } from 'src/model/QuestionGet';
import { PatientService } from '../../patient/patient/patient.service';
import { PharmacyComponent } from '../pharmacy/pharmacy.component';

@Component({
  selector: 'app-pharmacy-disease',
  templateUrl: './pharmacy-disease.component.html',
  styleUrls: ['./pharmacy-disease.component.css']
})
export class PharmacyDiseaseComponent implements OnInit {

  constructor(private questionService: QuestionService,
    private pharmacyComponent: PharmacyComponent,
    private translate: TranslateService,
    private toastr: ToastrService,
    private patientService: PatientService,
    private userService: UserService) { }

  questionPage: number = 0;
  loadMoreQuestion: boolean;
  questions: QuestionGet[] = [];
  loadingQuestions: boolean = false;
  position: number = 0;
  loading: boolean = false;

  ngOnInit(): void {
    this.getQuestionsTypes();
    this.getAllQuestions();
  }

  questionsTypes: string[] = [this.translate.instant('all')];
  selectedType: number = 0;
  getQuestionsTypes() {
    this.questionService.getQuestionsTypes().subscribe(
      res => {
        let questionsTypes: string[] = res;
        for (let type of questionsTypes)
          this.questionsTypes.push(type);
      }
    );
  }

  getQuestions(key: number) {
    this.selectedType = key;
    this.questionPage = 0;
    this.search='';
    this.getAllQuestions();
  }

  searchQuestions() {
    this.questionPage = 0;
    this.getAllQuestions();
  }

  search: string = '';
  getAllQuestions() {
    if (this.loading == false) {
      let search;
      if (this.search.length == 0)
        search = 'all';
      else
        search = '%' + this.search.split(' ').join('%%') + '%';
      this.loading = true;
      this.loadingQuestions = true;
      this.questionService.getQuestionsByType(this.questionPage, 4,
        this.selectedType == 0 ? 'all' : this.questionsTypes[this.selectedType], search).subscribe(
          res => {
            if (this.questionPage == 0)
              this.questions = [];
            let questions: QuestionGet[] = [];
            questions = res;
            for (let ques of questions) {
              ques.commentPage = 0;
              ques.comments = [];
              ques.invalidComment = false;
              this.questions.push(ques);
              this.getUserFullNameById(ques.postBy, (this.questions.length - 1));
              this.getCommentPosterProfileImg(ques.postBy + 'profilePic', (this.questions.length - 1), 0, 'question');
              this.getPostCommentsByPostId(ques.questionId, (this.questions.length - 1));
            }
            this.questionPage += 1;
            if (questions.length == 4)
              this.loadMoreQuestion = true;
            else
              this.loadMoreQuestion = false;
            document.documentElement.scrollTop = this.position;
            this.loading = false;
          }
        );
    }
  }

  getUserFullNameById(patientId: number, questionKey: number) {
    this.patientService.getUserFullNameById(patientId).subscribe(
      res => {
        let fullName: FirstAndLastNameGet;
        fullName = res;
        this.questions[questionKey].userFullName = fullName.patient_first_name + ' ' + fullName.patient_last_name.toUpperCase();
      }
    );
  }

  getPostCommentsByPostId(postId, questionKey: number) {
    this.questionService.getComments(postId, this.questions[questionKey].commentPage, 2).subscribe(
      res => {
        let comments: CommentGet[] = [];
        comments = res;
        for (let comment of comments) {
          this.questions[questionKey].comments.push(comment);
          this.getCommentPosterName(comment.postedBy, questionKey, (this.questions[questionKey].comments.length - 1))
        }
        if (comments.length == 2)
          this.questions[questionKey].loadMoreComment = true;
        else
          this.questions[questionKey].loadMoreComment = false;
        this.questions[questionKey].commentPage += 1;
        this.loadingQuestions = false;
      }
    );
  }

  getCommentPosterName(userId: number, questionKey: number, commentKey: number) {
    this.userService.getUserFullNameById(userId).subscribe(
      res => {
        let name: FirstAndLastNameGet = res;
        if (name.doctor_first_name) {
          this.questions[questionKey].comments[commentKey].commentPostBy = 'Dr. ' + name.doctor_first_name + ' ' + name.doctor_last_name.toUpperCase();
          this.getCommentPosterProfileImg(userId + 'profilePic', questionKey, commentKey, 'comment');
        }
        else if (name.pharmacy_full_name) {
          this.questions[questionKey].comments[commentKey].commentPostBy = 'Ph. ' + name.pharmacy_full_name.toUpperCase();
          this.getCommentPosterProfileImg(userId + 'profilePic', questionKey, commentKey, 'comment');
        }
      }
    );
  }

  getCommentPosterProfileImg(imageName: string, questionKey: number, commentKey: number, status: string) {
    let retrieveResonse: any;
    let base64Data: any;
    let retrievedImage: any;
    this.patientService.getDoctorPofilePhoto(imageName).subscribe(
      res => {
        if (res != null) {
          retrieveResonse = res;
          base64Data = retrieveResonse.picByte;
          retrievedImage = 'data:image/jpeg;base64,' + base64Data;
          if (status == 'comment')
            this.questions[questionKey].comments[commentKey].posterProfileImage = retrievedImage;
          else if (status == 'question')
            this.questions[questionKey].posterImageProfile = retrievedImage;
        } else {
          if (status == 'comment')
            this.questions[questionKey].comments[commentKey].posterProfileImage = false;
          else if (status == 'question')
            this.questions[questionKey].posterImageProfile = false;
        }
      }
    );
  }

  addPointToComment(commentId: number, questionKey: number, commentKey: number) {
    this.questionService.addPointToPost(commentId, this.pharmacyComponent.pharmacyGet.userId, 'comment').subscribe(
      res => {
        if (res) {
          this.toastr.success(this.translate.instant('pointAdded'), this.translate.instant('point'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
          this.questions[questionKey].comments[commentKey].commentPoints += 1;
        } else {
          this.toastr.warning(this.translate.instant('pointAlreadyAdded'), this.translate.instant('point'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
        }
      },
      err => {
        this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 5000,
          positionClass: 'toast-bottom-left'
        });
      }
    );
  }

  deletePointFromComment(questionId: number, questionKey: number, commentKey: number) {
    this.questionService.deletePointByQuestionIdAndUserId(questionId, this.pharmacyComponent.pharmacyGet.userId, 'comment').subscribe(
      res => {
        if (res) {
          this.toastr.success(this.translate.instant('pointDeleted'), this.translate.instant('point'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
          this.questions[questionKey].comments[commentKey].commentPoints -= 1;
        } else {
          this.toastr.warning(this.translate.instant('addPointFirst'), this.translate.instant('point'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
        }
      },
      err => {
        this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 5000,
          positionClass: 'toast-bottom-left'
        });
      }
    );
  }

  @HostListener("window:scroll", ["$event"])
  onWindowScroll() {
    if (this.loadMoreQuestion && this.loadingQuestions == false) {
      if (parseInt(document.documentElement.scrollTop + document.documentElement.offsetHeight + 10 + "") > document.documentElement.scrollHeight) {
        this.loadingQuestions = true;
        this.position = document.documentElement.scrollHeight;
        this.getAllQuestions();
      }
    }
  }

  addComment(questionId: number, questionKey: number) {
    if (this.questions[questionKey].doctorComment == null) {
      this.questions[questionKey].invalidComment = true;
      this.toastr.warning(this.translate.instant('enterCommentFirst'), this.translate.instant('comment'), {
        timeOut: 5000,
        positionClass: 'toast-bottom-left'
      });
    }
    else {
      this.questionService.addComment(questionId, this.pharmacyComponent.pharmacyGet.userId, this.questions[questionKey].doctorComment).subscribe(
        res => {
          if (res) {
            let comment: CommentGet = { commentId: res, commentPostDate: '', comment: this.questions[questionKey].doctorComment, postedBy: this.pharmacyComponent.pharmacyGet.userId, postId: this.questions[questionKey].questionId, commentPoints: 0, commentPostBy: 'Ph. ' + this.pharmacyComponent.pharmacyGet.pharmacyFullName, posterProfileImage: this.pharmacyComponent.retrievedImage };
            this.toastr.success(this.translate.instant('commentAdded'), this.translate.instant('comment'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
            this.questions[questionKey].comments.push(comment);
            this.questions[questionKey].doctorComment = '';
          }
        },
        err => {
          this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
        }
      );
    }
  }

}
