import { HttpClient } from '@angular/common/http';
import { EventEmitter, Component, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sign-in-form',
  templateUrl: './sign-in-form.component.html',
  styleUrls: ['./sign-in-form.component.css']
})
export class SignInFormComponent implements OnInit {

  constructor(private http:HttpClient,private translate: TranslateService,private toastr:ToastrService) { }
  @Output() outPutOpenSignUp = new EventEmitter<boolean>();
  ngOnInit(): void {
  }
  InvalidInfo:boolean=false;
  emailAddressInfo:string=this.translate.instant('username');passwordInfo:string=this.translate.instant('password');
  username:string;password:string;
  openSignUp(){
    this.outPutOpenSignUp.emit(true);
  }
  openAccount(){
    this.checkInfoForm();
  }
  checkInfoForm(){
    let url='http://localhost:8080/patient/getPatientIdFromUsernameAndPassword/'+this.username+'/'+this.password;
    this.http.get<number>(url).subscribe(
      res=>{
        if(res!=null){

        }else{
          url='http://localhost:8080/doctor/getDoctorIdFromUsernameAndPassword/'+this.username+'/'+this.password;
          this.http.get<number>(url).subscribe(
            res=>{
              if(res!=null){

              }else{
                url='http://localhost:8080/pharmacy/getPharmacyIdFromUsernameAndPassword/'+this.username+'/'+this.password;
                this.http.get<number>(url).subscribe(
                  res=>{
                    if(res!=null){

                    }else{
                      this.emailAddressInfo=this.translate.instant('checkUsername');
                      this.passwordInfo=this.translate.instant('checkPassword');
                      this.InvalidInfo=true;
                    }
                  },
                  err=>{
                    this.toastr.warning(this.translate.instant('checkCnx'),this.translate.instant('cnx'),{
                      timeOut: 5000,
                      positionClass: 'toast-bottom-left'
                    });
                  }
                );
              }
            },
            err=>{
              this.toastr.warning(this.translate.instant('checkCnx'),this.translate.instant('cnx'),{
                timeOut: 5000,
                positionClass: 'toast-bottom-left'
              });
            }
          );
        }
      },
      err=>{
        this.toastr.warning(this.translate.instant('checkCnx'),this.translate.instant('cnx'),{
          timeOut: 5000,
          positionClass: 'toast-bottom-left'
        });
      }
    );
  }
}
