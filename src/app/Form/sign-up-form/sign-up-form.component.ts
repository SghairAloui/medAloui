import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AcceuilService } from 'src/app/acceuil/acceuil.service';

@Component({
  selector: 'app-sign-up-form',
  templateUrl: './sign-up-form.component.html',
  styleUrls: ['./sign-up-form.component.css']
})
export class SignUpFormComponent implements OnInit { 
  @Output() outPutOpenClientSignUp = new EventEmitter<boolean>();
  @Output() outPutOpenSignIn = new EventEmitter<boolean>();
  
  constructor(private acceuilService: AcceuilService) { }
 

  ngOnInit(): void {
  }
  openClientFormFromSignUp(){
    this.acceuilService.setFormVisible('Client');
  }
  openPharmacistFormFromSignUp(){
    this.acceuilService.setFormVisible('Pharmacist');
  }
  openDoctorFormFromSignUp(){
    this.acceuilService.setFormVisible('Doctor');
  }
  openSignIn(){
    this.outPutOpenSignIn.emit(false);
  }
  

}
