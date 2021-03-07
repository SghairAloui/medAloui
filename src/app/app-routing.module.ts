import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AcceuilComponent } from './acceuil/acceuil.component';
import { PatientComponent } from './users/patient/patient/patient.component';

const routes: Routes = [
  { path: '', redirectTo: 'acceuil', pathMatch: 'full' },    
  { path: 'acceuil', component: AcceuilComponent},  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
