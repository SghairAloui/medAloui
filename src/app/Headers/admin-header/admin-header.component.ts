import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from 'src/app/app.component';
import { AdminComponent } from 'src/app/users/admin/admin/admin.component';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent implements OnInit {

  parentHeader:string='profile';
  darkMode:boolean=false;
  en:boolean;
  fr:boolean;
  constructor( private appComp:AppComponent, private toastr:ToastrService, private translate:TranslateService,private router:Router,private adminComp:AdminComponent) { }

  ngOnInit(): void {
    if(localStorage.getItem("darkMode")=='true'){
      this.appComp.switchTheme('dark');
      this.darkMode=true;
    }else if (localStorage.getItem("darkMode")=='false'){
      this.appComp.switchTheme('light');
      this.darkMode=false;
    }
    if( localStorage.getItem("lang") != null ){
      this.translate.use(localStorage.getItem("lang"));
      if(localStorage.getItem("lang")=='en'){
        this.en=true;
        this.fr=false;
      }else if (localStorage.getItem("lang")=='fr'){
        this.en=false;
        this.fr=true;
      }
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
  logOut(){
    localStorage.setItem("secureLogin","");
    localStorage.setItem("id","");
    localStorage.setItem("secureLoginType","");
    this.router.navigate(['/acceuil']);
  }
  openContainer(containerName:string){
    this.adminComp.container=containerName;
  }
}
