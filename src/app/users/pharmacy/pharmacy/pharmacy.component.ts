import { Component, OnInit } from '@angular/core';
import { HeaderService } from 'src/app/Headers/header/header.service';

@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.component.html',
  styleUrls: ['./pharmacy.component.css']
})
export class PharmacyComponent implements OnInit {

  constructor(private headerService:HeaderService) { }

  ngOnInit(): void {
    this.headerService.setHeader('pharmacy');
  }

}
