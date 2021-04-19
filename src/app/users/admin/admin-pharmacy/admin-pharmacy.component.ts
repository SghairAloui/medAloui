import { Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ValidationService } from 'src/app/validation/validation.service';
import { GetPendingPharmacy } from 'src/model/GetPendingPharmacy';
import { ValidationPost } from 'src/model/ValidationPost';
import { PharmacyService } from '../../pharmacy/pharmacy.service';
import { AdminComponent } from '../admin/admin.component';

@Component({
  selector: 'app-admin-pharmacy',
  templateUrl: './admin-pharmacy.component.html',
  styleUrls: ['./admin-pharmacy.component.css']
})
export class AdminPharmacyComponent implements OnInit {

  constructor(private pharmacyService: PharmacyService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private validationService: ValidationService,
    private adminComponent: AdminComponent) { }

  ngOnInit(): void {
    this.getPendingPharmacies();
  }

  pendingPharmaciesPage: number = 0;
  pendingPharmacies: GetPendingPharmacy[] = [];
  loadPendingPharmacies: boolean = true;
  loadingPharmacies: boolean;


  getPendingPharmacies() {
    this.loadingPharmacies = true;
    this.pharmacyService.getPendingPharmacies(this.pendingPharmaciesPage, 4).subscribe(
      res => {
        let pendingPharmacies: GetPendingPharmacy[] = [];
        pendingPharmacies = res;
        for (let pharmacy of pendingPharmacies) {
          pharmacy.showFullInfo = false;
          pharmacy.decision = 'null';
          pharmacy.currentDoc = 'cin';
          console.log(pharmacy);
          this.pendingPharmacies.push(pharmacy);
          this.getImageByName(pharmacy.userId + 'pharmacyProfilePic', 'profile', this.pendingPharmacies.length);
          this.getImageByName(pharmacy.userId + 'pharmacyCinPic', 'cin', this.pendingPharmacies.length);
          this.getImageByName(pharmacy.userId + 'pharmacyOwnershipPic', 'appartment', this.pendingPharmacies.length);
          this.getImageByName(pharmacy.userId + 'pharmacySpecialty', 'specialty', this.pendingPharmacies.length);
        }
        if (pendingPharmacies.length == 4)
          this.loadPendingPharmacies = true;
        else
          this.loadPendingPharmacies = false;
        this.pendingPharmaciesPage += 1;
        this.loadingPharmacies = false;
      }
    );
  }

  getImageByName(imageName: string, imageType: string, pharmacyKey: number) {
    this.pharmacyService.getImageByName(imageName).subscribe(
      res => {
        if (res != null) {
          let retrieveResonse: any;
          let base64Data: any;
          let retrievedImage: any;
          retrieveResonse = res;
          base64Data = retrieveResonse.picByte;
          retrievedImage = 'data:image/jpeg;base64,' + base64Data;
          if (imageType == 'profile')
            this.pendingPharmacies[pharmacyKey - 1].profilePic = retrievedImage;
          else if (imageType == 'cin')
            this.pendingPharmacies[pharmacyKey - 1].cinPic = retrievedImage;
          else if (imageType == 'appartment')
            this.pendingPharmacies[pharmacyKey - 1].appartmentPic = retrievedImage;
          else if (imageType == 'specialty')
            this.pendingPharmacies[pharmacyKey - 1].specialityPic = retrievedImage;
        } else
          this.pendingPharmacies[pharmacyKey - 1].profilePic = false;
      }
    );
  }

  @HostListener("window:scroll", ["$event"])
  onWindowScroll() {
    if (this.loadPendingPharmacies) {
      let pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.offsetHeight;
      let max = document.documentElement.scrollHeight;
      if (max == pos) {
        this.getPendingPharmacies();
      }
    }
  }

  approvePharmacy(pharmacyId: number, pharmacyKey: number) {
    this.pharmacyService.changePharmacyStatusById('approvedByAdmin', pharmacyId).subscribe(
      res => {
        if (res) {
          this.addValidation('approved', pharmacyId, pharmacyKey);
        }
      }
    );
  }

  disapprovePharmacy(pharmacyId: number, pharmacyStatus: string, pharmacyKey: number) {
    let decision: string;
    if (pharmacyStatus == 'pending')
      decision = 'disapproved';
    else if (pharmacyStatus == 'reVerify')
      decision = 'disapprovedPermanently';
    this.pharmacyService.changePharmacyStatusById(decision, pharmacyId).subscribe(
      res => {
        if (res) {
          this.addValidation(decision, pharmacyId, pharmacyKey);
          this.deleteByImageName(pharmacyId + 'pharmacyCinPic');
          this.deleteByImageName(pharmacyId + 'pharmacyOwnershipPic');
          this.deleteByImageName(pharmacyId + 'pharmacySpecialty');
        }
      }
    );
  }

  addValidation(decision: string, userId: number, pharmacyKey: number) {
    let data: ValidationPost = new ValidationPost(decision, this.adminComponent.adminGet.userId.toString(), 'pharmacy', userId);
    this.validationService.addValidation(data).subscribe(
      res => {
        if (res) {
          this.toastr.success(this.translate.instant(decision), this.translate.instant('info'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
          this.pendingPharmacies[pharmacyKey].decision = this.translate.instant(decision).toLocaleLowerCase();
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

  deleteByImageName(imageName: string) {
    this.pharmacyService.deleteByImageName(imageName).subscribe();
  }
}
