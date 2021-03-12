import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AcceuilComponent } from './acceuil/acceuil.component';
import { AdminComponent } from './users/admin/admin/admin.component';
import { DoctorComponent } from './users/doctor/doctor/doctor.component';
import { PatientComponent } from './users/patient/patient/patient.component';
import { PharmacyComponent } from './users/pharmacy/pharmacy/pharmacy.component';

const routes: Routes = [
  { path: '', redirectTo: 'acceuil', pathMatch: 'full' },    
  { path: 'acceuil', component: AcceuilComponent},
  { path: 'patient', component: PatientComponent},
  { path: 'pharmacy', component: PharmacyComponent},
  { path: 'doctor', component: DoctorComponent},
  { path: 'admin', component: AdminComponent}    
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
