import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AdminGet } from 'src/model/adminGet';
import { SecureLoginString } from 'src/model/SecureLoginString';
import { AdminService } from './admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private adminService: AdminService, private toastr: ToastrService, private translate: TranslateService, private router: Router) { }

  adminGet: AdminGet;
  secureLogin: SecureLoginString;
  container: string = 'profile';
  adminInfo:boolean;

  ngOnInit(): void {
    this.adminInfo=false;
    this.secureLogin = new SecureLoginString(localStorage.getItem("secureLogin"));
    this.getAdminInfoFromSecureLogin(this.secureLogin);
  }
  getAdminInfoFromSecureLogin(secureLogin: SecureLoginString) {
    this.adminService.getAdminInfoFromSecureLogin(secureLogin).subscribe(
      res => {
        if (res) {
          this.adminGet = res;
          this.adminInfo=true;
          localStorage.setItem('id', this.adminGet.userId.toString());
        } else
          this.router.navigate(['/acceuil']);
      },
      err => {
        this.toastr.info(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 5000,
          positionClass: 'toast-bottom-left'
        });
      }
    );
  }
}
