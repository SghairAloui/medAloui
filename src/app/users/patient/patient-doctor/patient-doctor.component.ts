import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-patient-doctor',
  templateUrl: './patient-doctor.component.html',
  styleUrls: ['./patient-doctor.component.css']
})
export class PatientDoctorComponent implements OnInit {

  doctorName:string;
  medicalFilePapers:string='info';losingTime:string='info';appOrganize:string='info';

  constructor() { }

  ngOnInit(): void {
  }
  toOurMethodologySection(){
    document.getElementById("patientOurMethodologySection").scrollIntoView({behavior:"smooth"});
  }

}
