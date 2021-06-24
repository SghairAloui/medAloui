import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AcceuilComponent } from './acceuil/acceuil.component';
import { SignInFormComponent } from './Form/sign-in-form/sign-in-form.component';
import { SignUpFormComponent } from './Form/sign-up-form/sign-up-form.component';
import { AcceuilService } from './acceuil/acceuil.service';
import { AcceuilBodyComponent } from './bodyContent/acceuil-body/acceuil-body.component';
import { HeaderComponent } from './Headers/header/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SaveNewUserService } from './Form/sign-up-form/save-new-user.service';
import { PatientComponent } from './users/patient/patient/patient.component';
import { ToastrModule } from 'ngx-toastr';
import { SignInService } from './Form/sign-in-form/sign-in.service';
import { DoctorComponent } from './users/doctor/doctor/doctor.component';
import { PharmacyComponent } from './users/pharmacy/pharmacy/pharmacy.component';
import { PatientService } from './users/patient/patient/patient.service';
import { PatientDoctorComponent } from './users/patient/patient-doctor/patient-doctor.component';
import { AdminComponent } from './users/admin/admin/admin.component';
import { AdminService } from './users/admin/admin/admin.service';
import { AdminDoctorComponent } from './users/admin/admin-doctor/admin-doctor.component';
import { AdminPatientComponent } from './users/admin/admin-patient/admin-patient.component';
import { AdminPharmacyComponent } from './users/admin/admin-pharmacy/admin-pharmacy.component';
import { AdminDiseaseComponent } from './users/admin/admin-disease/admin-disease.component';
import { SpecialityService } from './speciality/speciality.service';
import { AppointmentService } from './appointment/appointment.service';

import { authInterceptorProviders } from './helpers/auth.interceptor';
import { UserService } from './services/user.service';
import { MedicamentService } from './services/medicament.service';
import { PrescriptionService } from './services/prescription.service';
import { HeaderService } from './Headers/header/header.service';
import { PharmacyService } from './users/pharmacy/pharmacy.service';
import { PatientDiseaseComponent } from './users/patient/patient-disease/patient-disease.component';
import { QuestionService } from './services/question.service';
import { DoctorDiseaseComponent } from './users/doctor/doctor-disease/doctor-disease.component';
import { NotificationService } from './services/notification.service';
import { DragScrollModule } from 'ngx-drag-scroll';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { EmailService } from './services/email.service';
import { ConversationService } from './services/conversation.service';
import { WebSocketService } from './services/web-socket.service';
import { PharmacyDiseaseComponent } from './users/pharmacy/pharmacy-disease/pharmacy-disease.component';
import { DoctorSecretaryComponent } from './users/doctor/doctor-secretary/doctor-secretary.component';
import { SecretaryComponent } from './users/secretary/secretary.component';
import { SecretaryService } from './users/secretary/secretary.service';
import { RateService } from './services/rate.service';

@NgModule({
  declarations: [
    AppComponent,
    AcceuilComponent,
    SignInFormComponent,
    SignUpFormComponent,
    AcceuilBodyComponent,
    HeaderComponent,
    PatientComponent,
    DoctorComponent,
    PharmacyComponent,
    PatientDoctorComponent,
    AdminComponent,
    AdminDoctorComponent,
    AdminPatientComponent,
    AdminPharmacyComponent,
    AdminDiseaseComponent,
    PatientDiseaseComponent,
    DoctorDiseaseComponent,
    ForgetPasswordComponent,
    PharmacyDiseaseComponent,
    DoctorSecretaryComponent,
    SecretaryComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    DragScrollModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
    }
    }),
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
  ],
  providers: [AcceuilService,AppComponent,SaveNewUserService,
    SignInService,PatientService,PatientComponent,AdminService,
    AdminComponent,DoctorComponent,PharmacyComponent,SpecialityService,AppointmentService,UserService,
    MedicamentService,PrescriptionService,HeaderService,PharmacyService,QuestionService,EmailService,
    NotificationService,ConversationService,WebSocketService,SecretaryService,SecretaryComponent,
    RateService,authInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
