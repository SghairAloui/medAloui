import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-acceuil-body',
  templateUrl: './acceuil-body.component.html',
  styleUrls: ['./acceuil-body.component.css']
})
export class AcceuilBodyComponent implements OnInit {

  signUpForm:boolean = false;
  constructor() { }

  ngOnInit(): void {
  }
  recieveMessage($event){
    this.signUpForm=$event;
  }

}
