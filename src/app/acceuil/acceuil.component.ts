import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { doctor } from 'src/model/Doctor';
import { AcceuilService } from './acceuil.service';

@Component({
  selector: 'app-acceuil',
  templateUrl: './acceuil.component.html',
  styleUrls: ['./acceuil.component.css']
})
export class AcceuilComponent implements OnInit {
  constructor(private acceuilService: AcceuilService, private router:Router,private translate: TranslateService, private http:HttpClient) {
    translate.addLangs(['en','fr']);
    translate.setDefaultLang('en');
   }
  body: String = 'acceuilBody';
  FormName:any;
  doctors:doctor[]=[];
  doctorName:String="";
  
  ngOnInit(): void {
    this.acceuilService.displayForm$.subscribe(data=>{
      this.FormName=data;
    });
    this.getAllDoctors();
  }
  changeLangTo(lang:string){
    this.translate.use(lang);
  }

  public getAllDoctors(){
    let url="http://localhost:8080/doctor/all";
    this.http.get<doctor[]>(url).subscribe(
      res => {
        this.doctors=res;
      },
      err => {
        alert("Error")
      }
    );
  }

  showSearchValue(){
    console.log(this.doctorName);
  }
}
