import { Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { SpecialityService } from 'src/app/speciality/speciality.service';
import { ValidationService } from 'src/app/validation/validation.service';
import { DoctorPendingGet } from 'src/model/DoctorPendingGet';
import { IntegerAndStringPost } from 'src/model/IntegerAndStringPost';
import { SpecialityPost } from 'src/model/SpecialityPost';
import { TwoStringsPost } from 'src/model/TwoStringsPost';
import { ValidationPost } from 'src/model/ValidationPost';
import { DoctorService } from '../../doctor/doctor/doctor.service';
import { AdminService } from '../admin/admin.service';

@Component({
  selector: 'app-admin-doctor',
  templateUrl: './admin-doctor.component.html',
  styleUrls: ['./admin-doctor.component.css']
})
export class AdminDoctorComponent implements OnInit {

  specialityPost: SpecialityPost;
  specialityCode: string; specialityName: string;
  validationPost: ValidationPost;
  twoStringsPost: TwoStringsPost;
  integerAndString: IntegerAndStringPost;
  docDocuments: boolean[] = [];
  retrievedImage: any;
  base64Data: any;
  retrieveResonse: any;
  profileImages: any[] = [];
  documentPic: string[] = [];
  cinImages: any[] = []; specialityImages: any[] = []; clinicImages: any[] = [];
  showPendingDoc: boolean[] = []; pendingDocDecision: string[] = [];
  pendingDoctors: DoctorPendingGet[] = [];
  page: number = 0;
  doctorName: string;
  pendingDoctorsNumber: number;
  loadPendingDoc: boolean = true;
  constructor(private adminService: AdminService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private doctorService: DoctorService,
    private validationService: ValidationService,
    private specialityService: SpecialityService) { }

  ngOnInit(): void {
    this.getPendingDoctorsNumber();
  }

  getPendingDoctors(page: number, size: number) {
    let pendingDoctors: DoctorPendingGet[] = [];
    this.adminService.getPendingDoctors(page, size).subscribe(
      res => {
        pendingDoctors = res;
        for (let i of pendingDoctors) {
          i.docIndex = this.pendingDoctors.length;
          this.pendingDoctors.push(i);
          this.showPendingDoc.push(true);
          this.checkDocImg(i.userId, i.docIndex);
          this.docDocuments.push(false);
          this.getCinImage(i.userId, i.docIndex);
          this.getSpecialityImage(i.userId, i.docIndex);
          this.getClinicImage(i.userId, i.docIndex);
          this.documentPic.push('cin');
        }
        if (pendingDoctors.length == 4)
          this.loadPendingDoc = true;
        else
          this.loadPendingDoc = false;
      },
      err => {
        this.toastr.info(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 5000,
          positionClass: 'toast-bottom-left'
        });
      }
    );
  }

  checkDocImg(doctorId: number, index: number) {
    this.getProfileImage(doctorId + 'profilePic', doctorId, index);
  }

  getProfileImage(imageName: string, doctorId: number, index: number) {
    this.doctorService.getDoctorPofilePhoto(imageName).subscribe(
      res => {
        if (res != null) {
          this.retrieveResonse = res;
          this.base64Data = this.retrieveResonse.picByte;
          this.retrievedImage = 'data:image/jpeg;base64,' + this.base64Data;
          this.profileImages[index] = this.retrievedImage;
        } else
          this.profileImages[index] = false;
      }
    );
  }

  getCinImage(doctorId: number, index: number) {
    let imageName: string = 'doctorCinPic';
    this.doctorService.getDoctorPofilePhoto(doctorId + imageName).subscribe(
      res => {
        if (res != null) {
          this.retrieveResonse = res;
          this.base64Data = this.retrieveResonse.picByte;
          this.retrievedImage = 'data:image/jpeg;base64,' + this.base64Data;
          this.cinImages[index] = this.retrievedImage;
        }
      }
    );
  }

  getClinicImage(doctorId: number, index: number) {
    let imageName: string = 'doctorMedicalClinicPic';
    this.doctorService.getDoctorPofilePhoto(doctorId + imageName).subscribe(
      res => {
        if (res != null) {
          this.retrieveResonse = res;
          this.base64Data = this.retrieveResonse.picByte;
          this.retrievedImage = 'data:image/jpeg;base64,' + this.base64Data;
          this.clinicImages[index] = this.retrievedImage;
        }
      }
    );
  }

  getSpecialityImage(doctorId: number, index: number) {
    let imageName: string = 'doctorMedicalSpecialty';
    this.doctorService.getDoctorPofilePhoto(doctorId + imageName).subscribe(
      res => {
        if (res != null) {
          this.retrieveResonse = res;
          this.base64Data = this.retrieveResonse.picByte;
          this.retrievedImage = 'data:image/jpeg;base64,' + this.base64Data;
          this.specialityImages[index] = this.retrievedImage;
        }
      }
    );
  }

  approveDoc(id: number, key: number) {
    this.doctorService.changeDoctorStatusById(id,'approvedByAdmin').subscribe(
      res => {
        if (res) {
          this.validationPost = new ValidationPost('approved', localStorage.getItem('id'), 'doctor', id);
          this.validationService.addValidation(this.validationPost).subscribe(
            res => {
              if (res) {
                this.toastr.success(this.translate.instant('docApproved'), this.translate.instant('proving'), {
                  timeOut: 5000,
                  positionClass: 'toast-bottom-left'
                });
                this.showPendingDoc[key] = false;
                this.pendingDocDecision[key] = this.translate.instant('Approved');
              }
            }
          );
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

  disapproveDoc(id: number, doctorStatus: string, key: number) {
    let des: string;
    if (doctorStatus == 'pending')
      des = 'disapprovedByAdmin';
    else if (doctorStatus == 'reVerify')
      des = 'disapprovedPermanently';
    this.doctorService.changeDoctorStatusById(id, des).subscribe(
      res => {
        if (res) {
          this.validationPost = new ValidationPost('disapproved', localStorage.getItem('id'), 'doctor', id);
          this.validationService.addValidation(this.validationPost).subscribe(
            res => {
              if (res) {
                this.doctorService.deleteByImageName(id + 'doctorCinPic').subscribe(
                  res => {
                    if (res == 1) {
                      this.doctorService.deleteByImageName(id + 'doctorMedicalClinicPic').subscribe(
                        res => {
                          if (res == 1) {
                            this.doctorService.deleteByImageName(id + 'doctorMedicalSpecialty').subscribe(
                              res => {
                                if (res == 1) {
                                  if (doctorStatus == 'reVerify') {
                                    this.specialityService.deleteByDoctorId(id).subscribe(
                                      res => {
                                        if (res) {
                                          this.toastr.success(this.translate.instant('docDispproved'), this.translate.instant('proving'), {
                                            timeOut: 5000,
                                            positionClass: 'toast-bottom-left'
                                          });
                                          this.showPendingDoc[key] = false;
                                          this.pendingDocDecision[key] = this.translate.instant('DisapprovedPer');
                                        }
                                      },
                                      err => {
                                        this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
                                          timeOut: 5000,
                                          positionClass: 'toast-bottom-left'
                                        });
                                      }
                                    );
                                  } else {
                                    this.toastr.success(this.translate.instant('docDispproved'), this.translate.instant('proving'), {
                                      timeOut: 5000,
                                      positionClass: 'toast-bottom-left'
                                    });
                                    this.showPendingDoc[key] = false;
                                    this.pendingDocDecision[key] = this.translate.instant('Disapproved');
                                  }
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
                        },
                        err => {
                          this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
                            timeOut: 5000,
                            positionClass: 'toast-bottom-left'
                          });
                        }
                      );
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
          );
        }
      },
      err => {
        this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 5000,
          positionClass: 'toast-bottom-left'
        });
      }
    );
    /* } else {
     this.twoStringsPost = new TwoStringsPost(id.toString(), 'disapprovedPermanently');
     this.doctorService.changeDoctorStatusById(this.twoStringsPost).subscribe(
       res => {
         if (res == 'doctorStatusUpdated') {
           this.validationPost = new ValidationPost('disapprovedPermanently', localStorage.getItem('id'), 'doctor', id.toString());
           this.validationService.addValidation(this.validationPost).subscribe(
             res => {
               if (res == 'validationAdd') {
                 this.doctorService.deleteByImageName(id + 'doctorCinPic').subscribe(
                   res => {
                     if (res == 1) {
                       this.doctorService.deleteByImageName(id + 'doctorMedicalClinicPic').subscribe(
                         res => {
                           if (res == 1) {
                             this.doctorService.deleteByImageName(id + 'doctorMedicalSpecialty').subscribe(
                               res => {
                                 if (res == 1) {
                                   this.toastr.success(this.translate.instant('docDispproved'), this.translate.instant('proving'), {
                                     timeOut: 5000,
                                     positionClass: 'toast-bottom-left'
                                   });
                                   this.ngOnInit();
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
                         },
                         err => {
                           this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
                             timeOut: 5000,
                             positionClass: 'toast-bottom-left'
                           });
                         }
                       );
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
           );
         }
       },
       err => {
         this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
           timeOut: 5000,
           positionClass: 'toast-bottom-left'
         });
       }
     );
   }*/
  }

  addSpeciality() {
    this.specialityPost = new SpecialityPost(this.specialityCode, this.specialityName);
    this.specialityService.addSpeciality(this.specialityPost).subscribe(
      res => {
        if (res == 'specialityAdded') {
          this.toastr.success(this.translate.instant('specialityAdded'), this.translate.instant('speciality'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
        } else if (res == 'specialityAlreadyExist') {
          this.toastr.info(this.translate.instant('specialityAlreadyAdded'), this.translate.instant('speciality'), {
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

  getPendingDoctorsNumber() {
    this.doctorService.getPendingDoctorsNumber().subscribe(
      res => {
        this.pendingDoctorsNumber = res;
        if (this.pendingDoctorsNumber == 0)
          this.loadPendingDoc = false;
      }
    );
  }

  @HostListener("window:scroll", ["$event"])
  onWindowScroll() {
    if (this.loadPendingDoc == true) {
      let pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.offsetHeight;
      let max = document.documentElement.scrollHeight;
      if (max == pos) {
        this.getPendingDoctors(this.page, 4);
        this.page += 1;
      }
    }
  }
}
