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


@NgModule({
  declarations: [
    AppComponent,
    AcceuilComponent,
    SignInFormComponent,
    SignUpFormComponent,
    AcceuilBodyComponent,
    HeaderComponent,
  ],
  imports: [
    BrowserModule,
    NgbModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
    }
    }),
    BrowserAnimationsModule
  ],
  providers: [AcceuilService,AppComponent,SaveNewUserService],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
