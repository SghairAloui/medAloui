import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AcceuilService } from './acceuil.service';

@Component({
  selector: 'app-acceuil',
  templateUrl: './acceuil.component.html',
  styleUrls: ['./acceuil.component.css']
})
export class AcceuilComponent implements OnInit {

  constructor(private acceuilService: AcceuilService, private router:Router) { }
  body: String = 'acceuilBody';
  FormName:any;
  ngOnInit(): void {
    this.acceuilService.displayForm$.subscribe(data=>{
      this.FormName=data;
    })
  }
}
