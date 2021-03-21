import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { SpecialityService } from 'src/app/speciality/speciality.service';
import { ValidationService } from 'src/app/validation/validation.service';
import { DoctorGet } from 'src/model/Doctorget';
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
  docDocuments: boolean[] = [];
  retrievedImage: any;
  base64Data: any;
  retrieveResonse: any;
  profileImagesRes: any[] = [];
  profileImages: any[] = [];
  documentPic: string[] = [];
  cinImages: any[] = []; specialityImages: any[] = []; clinicImages: any[] = [];
  pendingDoctors: DoctorGet[] = [];
  doctorName: string;
  constructor(private adminService: AdminService, private toastr: ToastrService, private translate: TranslateService, private doctorService: DoctorService, private validationService: ValidationService, private specialityService: SpecialityService) { }

  ngOnInit(): void {
    this.getPendingDoctors();
  }
  getPendingDoctors() {
    this.adminService.getPendingDoctors().subscribe(
      res => {
        this.pendingDoctors = res;
        for (let i of this.pendingDoctors) {
          this.checkDocImg(i.doctorId);
          this.docDocuments[i.doctorId] = false;
          this.getCinImage(i.doctorId);
          this.getSpecialityImage(i.doctorId);
          this.getClinicImage(i.doctorId);
          this.documentPic[i.doctorId] = 'cin';
        }
      },
      err => {
        this.toastr.info(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 5000,
          positionClass: 'toast-bottom-left'
        });
      }
    );
  }
  checkDocImg(doctorId: number) {
    this.getProfileImage(doctorId + 'doctorProfilePic', doctorId);
  }
  getProfileImage(imageName: string, doctorId: number) {
    this.doctorService.getDoctorPofilePhoto(imageName).subscribe(
      res => {
        if (res != null) {
          this.retrieveResonse = res;
          this.profileImagesRes[doctorId] = this.retrieveResonse;
          this.base64Data = this.retrieveResonse.picByte;
          this.retrievedImage = 'data:image/jpeg;base64,' + this.base64Data;
          this.profileImages[doctorId] = this.retrievedImage;
        }
      }
    );
  }
  getCinImage(doctorId: number) {
    let imageName: string = 'doctorCinPic';
    this.doctorService.getDoctorPofilePhoto(doctorId + imageName).subscribe(
      res => {
        if (res != null) {
          this.retrieveResonse = res;
          this.base64Data = this.retrieveResonse.picByte;
          this.retrievedImage = 'data:image/jpeg;base64,' + this.base64Data;
          this.cinImages[doctorId] = this.retrievedImage;
        }
      }
    );
  }
  getClinicImage(doctorId: number) {
    let imageName: string = 'doctorMedicalClinicPic';
    this.doctorService.getDoctorPofilePhoto(doctorId + imageName).subscribe(
      res => {
        if (res != null) {
          this.retrieveResonse = res;
          this.base64Data = this.retrieveResonse.picByte;
          this.retrievedImage = 'data:image/jpeg;base64,' + this.base64Data;
          this.clinicImages[doctorId] = this.retrievedImage;
        }
      }
    );
  }
  getSpecialityImage(doctorId: number) {
    let imageName: string = 'doctorMedicalSpecialty';
    this.doctorService.getDoctorPofilePhoto(doctorId + imageName).subscribe(
      res => {
        if (res != null) {
          this.retrieveResonse = res;
          this.base64Data = this.retrieveResonse.picByte;
          this.retrievedImage = 'data:image/jpeg;base64,' + this.base64Data;
          this.specialityImages[doctorId] = this.retrievedImage;
        }
      }
    );
  }
  approveDoc(id: number) {
    this.twoStringsPost = new TwoStringsPost(id.toString(), 'approvedByAdmin');
    this.doctorService.changeDoctorStatusById(this.twoStringsPost).subscribe(
      res => {
        if (res == 'doctorStatusUpdated') {
          this.validationPost = new ValidationPost('approved', localStorage.getItem('id'), 'doctor', id.toString());
          this.validationService.addValidation(this.validationPost).subscribe(
            res => {
              if (res == 'validationAdd') {
                this.toastr.success(this.translate.instant('docApproved'), this.translate.instant('proving'), {
                  timeOut: 5000,
                  positionClass: 'toast-bottom-left'
                });
                this.ngOnInit();
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
  disapproveDoc(id: number, doctorStatus: string) {
    if (doctorStatus == 'pending') {
      this.twoStringsPost = new TwoStringsPost(id.toString(), 'disapprovedByAdmin');
      this.doctorService.changeDoctorStatusById(this.twoStringsPost).subscribe(
        res => {
          if (res == 'doctorStatusUpdated') {
            this.validationPost = new ValidationPost('disapproved', localStorage.getItem('id'), 'doctor', id.toString());
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
                                    this.specialityService.deleteByDoctorId(id).subscribe(
                                      res => {
                                        this.toastr.success(this.translate.instant('docDispproved'), this.translate.instant('proving'), {
                                          timeOut: 5000,
                                          positionClass: 'toast-bottom-left'
                                        });
                                        this.ngOnInit();
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
    } else {
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
    }
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
}
