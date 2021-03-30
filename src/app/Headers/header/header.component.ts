import { Component, OnInit, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { AppComponent } from '../../app.component'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  USER_KEY = 'auth-user';
  userName:any;
  constructor(private translate: TranslateService,private appComp:AppComponent,
    private toastr:ToastrService,
    private tokenStorageService:TokenStorageService) { 
    translate.addLangs(['en','fr']);
    /*document.addEventListener('click', this.closeAllMenu.bind(this));*/
  }

  

  ngOnInit(): void {
    const user = window.sessionStorage.getItem(this.USER_KEY);
    if (user) {
      this.userName= JSON.parse(user).username;
    }
    if(localStorage.getItem("darkMode")=='true'){
      this.appComp.switchTheme('dark');
      this.darkMode=true;
    }else{
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
    }else{
      localStorage.setItem("lang","en");
      this.en=true;
      this.fr=false;
    }
  }
  en:boolean=true;
  fr:boolean=false;
  settingsBoxUnder700:boolean=false;
  displaySettingsBox:boolean=false;
  darkMode:boolean=false;

  menuCheckBox:boolean=false;
  headerOnScrollVariable=false;

  @HostListener("document:scroll")
  scroll(){
    if(document.body.scrollTop > 0 || document.documentElement.scrollTop > 0){
      this.headerOnScrollVariable=true;
    }else{
      this.headerOnScrollVariable=false;
    }
  }
  toDoctocSection(){
    document.getElementById("doctocSection").scrollIntoView({behavior:"smooth"});
    this.menuCheckBox=false;
  }
  toAcceuilSection(){
    document.getElementById("acceuilSection").scrollIntoView({behavior:"smooth"});
    this.menuCheckBox=false;
  }
  toConnexionSection(){
    if(this.userName==null){
    document.getElementById("connexionSection").scrollIntoView({behavior:"smooth"});
    this.menuCheckBox=false;
    }else{
      // deconnection
      this.tokenStorageService.signOut();
      this.reloadPage();
    }
  }

  reloadPage(): void {
    window.location.reload();
  }

  toMaladiesSection(){
    document.getElementById("maladiesSection").scrollIntoView({behavior:"smooth"});
    this.menuCheckBox=false;
  }
  toAboutSection(){
    document.getElementById("aboutSection").scrollIntoView({behavior:"smooth"});
    this.menuCheckBox=false;
  }
  changeLang(lang:string){
    this.translate.use(lang);
    localStorage.setItem("lang",lang);
    if(localStorage.getItem("lang")=='en')
    this.toastr.info(this.translate.instant('langToEn'),this.translate.instant('Language'),{
      timeOut: 2500,
      positionClass: 'toast-bottom-left',
      
    });
    else if (localStorage.getItem("lang")=='fr')
    this.toastr.info(this.translate.instant('langToFr'),this.translate.instant('Language'),{
      timeOut: 2500,
      positionClass: 'toast-bottom-left'
    });
  }
  /*closeAllMenu(event:any) {
    if(this.menuCheckBox==true || this.displaySettingsBox==true){
      this.menuCheckBox=false;
      this.displaySettingsBox=false;
    }
  }*/

  closeMenu(){
    this.menuCheckBox=false;
  }
  switchTheme(){
    if(this.darkMode==false){
      this.appComp.switchTheme('dark');
      this.darkMode=true;
      localStorage.setItem("darkMode","true");
      this.toastr.info(this.translate.instant('darkModeOn'),this.translate.instant('theme'),{
        timeOut: 2500,
        positionClass: 'toast-bottom-left'
      });
    }
    else{
      this.appComp.switchTheme('light');
      this.darkMode=false;
      localStorage.setItem("darkMode","false");
      this.toastr.info(this.translate.instant('darkModeOf'),this.translate.instant('theme'),{
        timeOut: 2500,
        positionClass: 'toast-bottom-left'
      });
    }
  }
}
