import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'Health Care';
  theme: Theme = 'light-theme';
  constructor(translate: TranslateService,@Inject(DOCUMENT) private document:Document,private renderer:Renderer2) {
    translate.setDefaultLang('en');}

    ngOnInit(){
      this.initializeTheme();
    }

    switchTheme(mode:string){
      if(mode=='dark')
      this.document.body.classList.replace(this.theme,this.theme = 'dark-theme');
      else if (mode=='light')
      this.document.body.classList.replace(this.theme,this.theme = 'light-theme');
    }

    initializeTheme = ():void =>this.renderer.addClass(this.document.body,this.theme);
}

export type Theme = "light-theme" | "dark-theme";