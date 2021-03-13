import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { doctor } from 'src/model/Doctor';
import { AdminService } from '../admin/admin.service';

@Component({
  selector: 'app-admin-doctor',
  templateUrl: './admin-doctor.component.html',
  styleUrls: ['./admin-doctor.component.css']
})
export class AdminDoctorComponent implements OnInit {

  notApprovedDoctors:doctor [] = [];
  doctorName:string;
  constructor(private adminService:AdminService,private toastr:ToastrService,private translate:TranslateService) { }

  ngOnInit(): void {
    this.getNotApprovedDoctors();
  }
  getNotApprovedDoctors(){
    this.adminService.getNotApprovedDoctors().subscribe(
      res=>{
        this.notApprovedDoctors=res;
      },
      err=>{
        this.toastr.info(this.translate.instant('checkCnx'),this.translate.instant('cnx'),{
          timeOut: 5000,
          positionClass: 'toast-bottom-left'
        });
      }
    );
  }
}
