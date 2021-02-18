import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-sign-up-form',
  templateUrl: './sign-up-form.component.html',
  styleUrls: ['./sign-up-form.component.css']
})
export class SignUpFormComponent implements OnInit {
  constructor() { }
  @Output() outPutOpenClientSignUp = new EventEmitter<boolean>();
  @Output() outPutOpenSignIn = new EventEmitter<boolean>();
  

  ngOnInit(): void {
  }
  openClientFormFromSignUp(){
    console.log("True")
    this.outPutOpenClientSignUp.emit(true);
  }
  openSignIn(){
    this.outPutOpenSignIn.emit(false);
  }
  

}
