import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-patient-header',
  templateUrl: './patient-header.component.html',
  styleUrls: ['./patient-header.component.css']
})
export class PatientHeaderComponent implements OnInit {

  constructor(private translate: TranslateService,private appComp:AppComponent,private toastr:ToastrService) { }

  parentHeader:string='profile';
  darkMode:boolean=false;
  en:boolean;
  fr:boolean;
  ngOnInit(): void {
    if(localStorage.getItem("darkMode")=='true'){
      this.appComp.switchTheme('dark');
      this.darkMode=true;
    }else if (localStorage.getItem("darkMode")=='false'){
      this.appComp.switchTheme('light');
      this.darkMode=false;
    }
    this.translate.use(localStorage.getItem("lang"));
    if(localStorage.getItem("lang")=='en'){
      this.en=true;
      this.fr=false;
    }else if (localStorage.getItem("lang")=='fr'){
      this.en=false;
      this.fr=true;
    }
  }
  switchTheme(){
    if(this.darkMode==false){
      this.appComp.switchTheme('dark');
      this.darkMode=true;
      localStorage.setItem("darkMode","true");
      this.toastr.info(this.translate.instant('darkModeOn'),this.translate.instant('theme'),{
        timeOut: 2500,
        positionClass: 'toast-bottom-right'
      });
    }
    else{
      this.appComp.switchTheme('light');
      this.darkMode=false;
      localStorage.setItem("darkMode","false");
      this.toastr.info(this.translate.instant('darkModeOf'),this.translate.instant('theme'),{
        timeOut: 2500,
        positionClass: 'toast-bottom-right'
      });
    }
  }
  changeLang(lang:string){
    this.translate.use(lang);
    localStorage.setItem("lang",lang);
    if(localStorage.getItem("lang")=='en')
    this.toastr.info(this.translate.instant('langToEn'),this.translate.instant('Language'),{
      timeOut: 2500,
      positionClass: 'toast-bottom-right',
      
    });
    else if (localStorage.getItem("lang")=='fr')
    this.toastr.info(this.translate.instant('langToFr'),this.translate.instant('Language'),{
      timeOut: 2500,
      positionClass: 'toast-bottom-right'
    });
  }
  toSection(sectionName:string){
    document.getElementById(sectionName).scrollIntoView({behavior:"smooth"});
  }
  toMedicalProfileSection(){
    document.getElementById("medicalProfileSection").scrollIntoView({behavior:"smooth"});
  }
  toGeneralInfoSection(){
    document.getElementById("generalInfoSection").scrollIntoView({behavior:"smooth"});
  }
  toPrescriptionSection(){
    document.getElementById("prescriptionSection").scrollIntoView({behavior:"smooth"});
  }
  toMyDoctorsSection(){
    document.getElementById("myDoctorsSection").scrollIntoView({behavior:"smooth"});
  }
  toMyPharmaciesSection(){
    document.getElementById("myPharmaciesSection").scrollIntoView({behavior:"smooth"});
  }
}
