import { Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { QuestionService } from 'src/app/services/question.service';
import { UserService } from 'src/app/services/user.service';
import { CommentGet } from 'src/model/CommentGet';
import { FirstAndLastNameGet } from 'src/model/FirstAndLastNameGet';
import { QuestionGet } from 'src/model/QuestionGet';
import { PatientComponent } from '../patient/patient.component';
import { PatientService } from '../patient/patient.service';

@Component({
  selector: 'app-patient-disease',
  templateUrl: './patient-disease.component.html',
  styleUrls: ['./patient-disease.component.css']
})
export class PatientDiseaseComponent implements OnInit {

  constructor(private questionService: QuestionService,
    private patientComponent: PatientComponent,
    private translate: TranslateService,
    private toastr: ToastrService,
    private patientService: PatientService,
    private userService: UserService) { }

  question: string = 'question';
  diseaseName: string;
  diseaseQuestion: string;
  medicamentName: string;
  medicamentQuestion: string;
  invalidDiseaseName: boolean = false; invalidDiseaseQuestion: boolean = false;
  invalidMedicamentName: boolean = false; invalidMedicamentQuestion: boolean = false;
  questionPage: number = 0;
  loadMoreQuestion: boolean = true;
  questions: QuestionGet[] = [];
  loadingQuestions: boolean = false;
  position: number=0;

  ngOnInit(): void {
    this.getAllQuestions();
  }

  postQuestion() {
    if (this.question == 'disease' && this.diseaseName == null) {
      this.invalidDiseaseName = true;
      this.toastr.warning(this.translate.instant('pleaseFillTheForm'), this.translate.instant('info'), {
        timeOut: 5000,
        positionClass: 'toast-bottom-left'
      });
    } else if (this.question == 'disease' && this.diseaseQuestion == null) {
      this.invalidDiseaseQuestion = true;
      this.toastr.warning(this.translate.instant('pleaseFillTheForm'), this.translate.instant('info'), {
        timeOut: 5000,
        positionClass: 'toast-bottom-left'
      });
    } else if (this.question == 'medicament' && this.medicamentName == null) {
      this.invalidMedicamentName = true;
      this.toastr.warning(this.translate.instant('pleaseFillTheForm'), this.translate.instant('info'), {
        timeOut: 5000,
        positionClass: 'toast-bottom-left'
      });
    } else if (this.question == 'medicament' && this.invalidMedicamentName == null) {
      this.invalidMedicamentQuestion = true;
      this.toastr.warning(this.translate.instant('pleaseFillTheForm'), this.translate.instant('info'), {
        timeOut: 5000,
        positionClass: 'toast-bottom-left'
      });
    } else {
      let questionName: string;
      let questionAbout: string;
      let questionText: string;
      if (this.question == 'disease') {
        questionName = this.diseaseName;
        questionAbout = 'disease';
        questionText = this.diseaseQuestion;
      }
      else if (this.question == 'medicament') {
        questionName = this.medicamentName;
        questionAbout = 'medicament';
        questionText = this.medicamentQuestion;
      }
      this.questionService.addQuestion(questionName, questionAbout, questionText, this.patientComponent.patientGet.userId).subscribe(
        res => {
          if (res) {
            this.toastr.success(this.translate.instant('questionPosted'), this.translate.instant('question'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
            this.diseaseName = '';
            this.medicamentName = '';
            this.diseaseQuestion = '';
            this.medicamentQuestion = '';
            let question: QuestionGet = {
              questionId: res,
              questionName: questionName,
              questionAbout: questionAbout,
              question: questionText,
              questionPostTime: '',
              postBy: this.patientComponent.patientGet.userId,
              questionPoints: 0,
              userFullName: this.patientComponent.patientGet.patientFirstName + ' ' + this.patientComponent.patientGet.patientLastName.toUpperCase(),
              comments: [],
              commentPage: 0,
              loadMoreComment: false,
              doctorComment: null,
              invalidComment: null,
              posterImageProfile: this.patientComponent.retrievedImage
            }
            this.questions.unshift(question);
            document.getElementById("allQuestionSection").scrollIntoView({ behavior: 'smooth' });
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

  getAllQuestions() {
    this.questionService.getAll(this.questionPage, 4).subscribe(
      res => {
        let questions: QuestionGet[] = [];
        questions = res;
        for (let ques of questions) {
          ques.commentPage = 0;
          ques.comments = [];
          this.questions.push(ques);
          this.getUserFullNameById(ques.postBy, (this.questions.length - 1));
          this.getPostCommentsByPostId(ques.questionId, (this.questions.length - 1));
          this.getCommentPosterProfileImg(ques.postBy + 'profilePic', (this.questions.length - 1), 0, 'question');
        }
        this.questionPage += 1;
        if (questions.length == 4)
          this.loadMoreQuestion = true;
        else
          this.loadMoreQuestion = false;
        document.documentElement.scrollTop = this.position;
      }
    );
  }

  getUserFullNameById(patientId: number, questionKey: number) {
    this.userService.getUserFullNameById(patientId).subscribe(
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

  addPointToQuestion(questionId: number, questionKey: string) {
    this.questionService.addPointToPost(questionId, this.patientComponent.patientGet.userId, 'question').subscribe(
      res => {
        if (res) {
          this.toastr.success(this.translate.instant('pointAdded'), this.translate.instant('point'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
          this.questions[questionKey].questionPoints += 1;
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

  deletePointFromQuestion(questionId: number, questionKey: string) {
    this.questionService.deletePointByQuestionIdAndUserId(questionId, this.patientComponent.patientGet.userId, 'question').subscribe(
      res => {
        if (res) {
          this.toastr.success(this.translate.instant('pointDeleted'), this.translate.instant('point'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
          this.questions[questionKey].questionPoints -= 1;
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

}
