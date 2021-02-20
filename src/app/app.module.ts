import { NgModule } from '@angular/core';
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
import { ClientSignUpComponent } from './Form/client-sign-up/client-sign-up.component';
import { AcceuilService } from './acceuil/acceuil.service';
import { PharmacistSignUpComponent } from './form/pharmacist-sign-up/pharmacist-sign-up.component';
import { DoctorSignUpComponent } from './form/doctor-sign-up/doctor-sign-up.component';
import { AcceuilBodyComponent } from './bodyContent/acceuil-body/acceuil-body.component';
import { AboutUsBodyComponent } from './bodyContent/about-us-body/about-us-body.component';

@NgModule({
  declarations: [
    AppComponent,
    AcceuilComponent,
    SignInFormComponent,
    SignUpFormComponent,
    ClientSignUpComponent,
    PharmacistSignUpComponent,
    DoctorSignUpComponent,
    AcceuilBodyComponent,
    AboutUsBodyComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
    }
    })
  ],
  providers: [AcceuilService],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
