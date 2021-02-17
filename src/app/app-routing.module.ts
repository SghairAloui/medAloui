import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AcceuilComponent } from './acceuil/acceuil.component';

const routes: Routes = [
  { path: '', redirectTo: 'acceuil', pathMatch: 'full' },    
  { path: 'acceuil', component: AcceuilComponent},    
  { path: 'admin', component: AcceuilComponent },  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
