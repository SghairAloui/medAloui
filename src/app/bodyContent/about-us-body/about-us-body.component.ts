import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about-us-body',
  templateUrl: './about-us-body.component.html',
  styleUrls: ['./about-us-body.component.css']
})
export class AboutUsBodyComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }
  toContactUsSection(){
    document.getElementById("contactUsSection").scrollIntoView({behavior:"smooth"});
  }
}
