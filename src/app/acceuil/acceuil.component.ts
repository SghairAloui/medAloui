import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AcceuilService } from './acceuil.service';

@Component({
  selector: 'app-acceuil',
  templateUrl: './acceuil.component.html',
  styleUrls: ['./acceuil.component.css']
})
export class AcceuilComponent implements OnInit {
  constructor(private acceuilService: AcceuilService, private router:Router,private translate: TranslateService) {
    translate.addLangs(['en','fr']);
    translate.setDefaultLang('en');
   }
  body: String = 'acceuilBody';
  FormName:any;
  
  ngOnInit(): void {
    this.acceuilService.displayForm$.subscribe(data=>{
      this.FormName=data;
    })
  }
  changeLangTo(lang:string){
    this.translate.use(lang);
  }
}
