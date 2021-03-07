import { Component, OnInit, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from '../../app.component'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private translate: TranslateService,private appComp:AppComponent) { 
    translate.addLangs(['en','fr']);
    /*document.addEventListener('click', this.closeAllMenu.bind(this));*/
  }


  ngOnInit(): void {
    if(localStorage.getItem("darkMode")=='true'){
      this.appComp.switchTheme();
      this.darkMode=true;
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
    document.getElementById("connexionSection").scrollIntoView({behavior:"smooth"});
    this.menuCheckBox=false;
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
    this.appComp.switchTheme();
    if(this.darkMode==false){
      this.darkMode=true;
      localStorage.setItem("darkMode","true");
    }
    else{
      this.darkMode=false;
      localStorage.setItem("darkMode","false");
    }
  }
}
