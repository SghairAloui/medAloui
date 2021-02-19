import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AcceuilComponent } from './acceuil/acceuil.component';
import { SignInFormComponent } from './Form/sign-in-form/sign-in-form.component';
import { SignUpFormComponent } from './Form/sign-up-form/sign-up-form.component';
import { ClientSignUpComponent } from './Form/client-sign-up/client-sign-up.component';
import { AcceuilService } from './acceuil/acceuil.service';
import { PharmacistSignUpComponent } from './form/pharmacist-sign-up/pharmacist-sign-up.component';
import { DoctorSignUpComponent } from './form/doctor-sign-up/doctor-sign-up.component';
import { AboutUsComponent } from './About Us/about-us/about-us.component';

@NgModule({
  declarations: [
    AppComponent,
    AcceuilComponent,
    SignInFormComponent,
    SignUpFormComponent,
    ClientSignUpComponent,
    PharmacistSignUpComponent,
    DoctorSignUpComponent,
    AboutUsComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    AppRoutingModule
  ],
  providers: [AcceuilService],
  bootstrap: [AppComponent]
})
export class AppModule { }
