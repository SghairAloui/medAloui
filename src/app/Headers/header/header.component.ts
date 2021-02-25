import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  menuCheckBox:boolean;
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
}
