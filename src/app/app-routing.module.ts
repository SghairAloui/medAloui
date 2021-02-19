import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AcceuilComponent } from './acceuil/acceuil.component';
import { AboutUsComponent } from './About Us/about-us/about-us.component';

const routes: Routes = [
  { path: '', redirectTo: 'acceuil', pathMatch: 'full' },    
  { path: 'acceuil', component: AcceuilComponent},    
  { path: 'about-us', component: AboutUsComponent },  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
