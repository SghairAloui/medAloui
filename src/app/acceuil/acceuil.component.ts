import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AcceuilService } from './acceuil.service';

@Component({
  selector: 'app-acceuil',
  templateUrl: './acceuil.component.html',
  styleUrls: ['./acceuil.component.css']
})
export class AcceuilComponent implements OnInit {

  constructor(private acceuilService: AcceuilService, private router:Router) { }
  signUpForm: boolean = false;
  FormName:any;
  ngOnInit(): void {
    this.acceuilService.displayForm$.subscribe(data=>{
      this.FormName=data;
    })
  }
  recieveMessage($event){
    this.signUpForm=$event;
  }
  goTo(path:String){
    this.router.navigate([path]);
  }
}
