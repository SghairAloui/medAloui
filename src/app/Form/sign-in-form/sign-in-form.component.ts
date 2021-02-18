import { EventEmitter, Component, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-sign-in-form',
  templateUrl: './sign-in-form.component.html',
  styleUrls: ['./sign-in-form.component.css']
})
export class SignInFormComponent implements OnInit {

  constructor() { }
  @Output() outPutOpenSignUp = new EventEmitter<boolean>();
  ngOnInit(): void {
  }
  openSignUp(){
    this.outPutOpenSignUp.emit(true);
  }
}
