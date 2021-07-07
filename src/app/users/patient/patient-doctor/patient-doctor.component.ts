import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AppointmentService } from 'src/app/appointment/appointment.service';
import { SpecialityService } from 'src/app/speciality/speciality.service';
import { AppointmentPost } from 'src/model/AppointmentPost';
import { SearchDoctorDoctorPost } from 'src/model/SearchDoctorDoctorPost';
import { doctor } from 'src/model/Doctor';
import { IntegerAndStringPost } from 'src/model/IntegerAndStringPost';
import { SearchedDocGet } from 'src/model/SearchedDocGet';
import { SpecialityGet } from 'src/model/SpecialityGet';
import { DoctorService } from '../../doctor/doctor/doctor.service';
import { PatientComponent } from '../patient/patient.component';
import { PatientService } from '../patient/patient.service';
import { DoctorGet } from 'src/model/Doctorget';
import { AppointmentDocInfoGet } from 'src/model/AppointmentDocInfoGet';
import { TopRatedDoctorGet } from 'src/model/TopRatedDoctorGet';
import { ConversationService } from 'src/app/services/conversation.service';
import { AppointmentGet } from 'src/model/AppointmentGet';
import { environment } from 'src/environments/environment.prod';

declare const L: any;

@Component({
  selector: 'app-patient-doctor',
  templateUrl: './patient-doctor.component.html',
  styleUrls: ['./patient-doctor.component.css']
})
export class PatientDoctorComponent implements OnInit {

  constructor(private translate: TranslateService,
    private toastr: ToastrService,
    private doctorService: DoctorService,
    private specialityService: SpecialityService,
    private appointmentService: AppointmentService,
    private patientComponent: PatientComponent,
    private patientService: PatientService,
    private conversationService: ConversationService) { }
  medicalFilePapers: string = 'info'; losingTime: string = 'info'; appOrganize: string = 'info';
  slectedDay: boolean = true;
  monthDays: any[] = [];
  monthDaysDis: boolean[] = [];
  daysNameEn: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  daysName: string[] = [];
  daysNameDouble: string[] = [];
  date: Date = new Date();
  today: number = /*28;*/this.date.getUTCDate();
  todayName: string;
  todayNumber: number;
  year: number = this.date.getUTCFullYear();
  month: number = this.date.getUTCMonth() + 1;
  lastMonthDay: number;
  specialityDes: boolean = false;
  doctorsProfileImages: any[] = [];
  docProfileImgRes: boolean[] = [];
  getAllSpecialitiesReturn: boolean;
  specialityCode: string;
  specialityName: string = '';
  specialityGet: SpecialityGet[] = [];
  doctors: doctor[] = [];
  doctorId: number;
  topRatedPage: number = 0;
  topRatedDoctors: TopRatedDoctorGet[] = [];


  appointmentPost: AppointmentPost;
  appointmentMonth: number;
  appointmentYear: number;
  appointmentDay: number;
  appointment: boolean;
  appointmentDate: string;
  integerAndStringPost: IntegerAndStringPost;
  patientTurn: number;
  doctorCity: string = '';
  searchDocPage: number;
  specVariable: boolean = false; cityVariable: boolean = false; falseSpec: boolean = false; falseCity: boolean = false;
  cities: string[] = [this.translate.instant('wholeTunisia'), "Ariana", this.translate.instant('Beja'), "Ben Arous", "Bizerte", this.translate.instant('Gabes'), "Gafsa", "Jendouba", "Kairouan", "Kasserine", this.translate.instant('Kebili'), "Kef", "Mahdia", "Manouba", this.translate.instant('Medenine'), "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"];
  searchDoctorDoctor: SearchDoctorDoctorPost;
  searchedDoc: SearchedDocGet[] = [];
  seachDocLoading: boolean = false;
  loadMoreDoctor: boolean = false;
  searchedDocBool: boolean = false;
  docInfo: boolean = false;
  selectedDoctor: DoctorGet;
  selectedDoctorKey: number;
  appointmentDocInfo: AppointmentDocInfoGet[] = [];
  loadDoctorInfo: boolean[] = [];
  doctorApp: boolean; generateDays: boolean;
  topRatedLoadMore: boolean;
  showAppointment: boolean = true;
  doctorMap;

  ngOnInit(): void {
    this.appointment = true;
    this.getAllSpecialities();
    this.getTopRatedDoctor();
  }

  toOurMethodologySection() {
    document.getElementById("patientOurMethodologySection").scrollIntoView({ behavior: "smooth" });
  }

  getApprovedDoctorsBySpecialityIdAndCity() {
    this.seachDocLoading = true;
    this.searchedDocBool = true;
    let searchedDoc: SearchedDocGet[] = [];
    this.doctorCity = this.doctorCity.toLocaleLowerCase();
    this.doctorCity = this.doctorCity.replace('é', 'e');
    this.doctorCity = this.doctorCity.replace('è', 'e');
    this.searchDoctorDoctor = new SearchDoctorDoctorPost(this.specialityCode, this.doctorCity, this.searchDocPage, 4);
    this.doctorService.getApprovedDoctorsBySpecialityIdAndCity(this.searchDoctorDoctor).subscribe(
      res => {
        searchedDoc = res;
        for (let doc of searchedDoc) {
          doc.docIndex = this.searchedDoc.length;
          this.searchedDoc.push(doc);
          this.getDocProfileImage(doc.userId, doc.docIndex);
        }
        if (searchedDoc.length != 4)
          this.loadMoreDoctor = false;
        else if (searchedDoc.length > 0)
          this.loadMoreDoctor = true;
        this.searchDocPage += 1;
        this.seachDocLoading = false;
      },
      err => {
        this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 3500,
          positionClass: 'toast-bottom-left'
        });
        this.seachDocLoading = false;
      }
    );
  }

  getAllSpecialities() {
    this.specialityService.getSpecialities().subscribe(
      res => {
        this.specialityGet = res;
      }
    );
  }

  checkDoctorCity() {
    for (let city of this.cities) {
      if (this.doctorCity == city) {
        this.cityVariable = true;
        break;
      } else {
        this.cityVariable = false;
      }
    }
  }

  toSearchedDoctorSection() {
    document.getElementById("searchedDoctorSection").scrollIntoView({ behavior: "smooth" });
  }

  searchDoctor() {
    for (let spec of this.specialityGet) {
      if (this.specialityName.toLowerCase() == this.translate.instant(spec.specialityCode).toLowerCase()) {
        this.specialityCode = spec.specialityCode;
        this.specVariable = true;
        this.searchedDoc = [];
        break;
      } else {
        this.specVariable = false;
      }
    }
    if (this.specVariable && this.cityVariable && this.specialityName.length != 0 && this.doctorCity.length != 0) {
      this.seachDocLoading = true;
      this.searchDocPage = 0;
      this.getApprovedDoctorsBySpecialityIdAndCity();
      document.getElementById("searchedDoctorSection").scrollIntoView({ behavior: "smooth" });
    } else {
      this.toastr.warning(this.translate.instant('chooseSpecialityandCity'), this.translate.instant('info'), {
        timeOut: 5000,
        positionClass: 'toast-bottom-left'
      });
      if (!this.cityVariable)
        this.falseCity = true;
      else
        this.falseCity = false;
      if (!this.specVariable)
        this.falseSpec = true;
      else
        this.falseSpec = false;
      document.getElementById("patientFindDoctorSection").scrollIntoView({ behavior: "smooth" });
    }
  }

  getDocProfileImage(docId: number, index: number) {
    let retrieveResonse: any; let base64Data: any; let retrievedImage: any;
    this.patientService.getDoctorPofilePhoto(docId + 'profilePic').subscribe(
      res => {
        if (res != null) {
          retrieveResonse = res;
          base64Data = retrieveResonse.picByte;
          retrievedImage = 'data:image/jpeg;base64,' + base64Data;
          this.doctorsProfileImages[index] = retrievedImage;
        } else {
          this.doctorsProfileImages[index] = false;
        }
      }
    );
  }

  getMonthLastDay() {
    if (this.month == 1)
      this.lastMonthDay = 31;
    else if (this.month == 2) {
      if ((this.year % 4) == 0)
        this.lastMonthDay = 29;
      else
        this.lastMonthDay = 28;
    } else if (this.month == 3)
      this.lastMonthDay = 31;
    else if (this.month == 4)
      this.lastMonthDay = 30;
    else if (this.month == 5)
      this.lastMonthDay = 31;
    else if (this.month == 6)
      this.lastMonthDay = 30;
    else if (this.month == 7)
      this.lastMonthDay = 31;
    else if (this.month == 8)
      this.lastMonthDay = 31;
    else if (this.month == 9)
      this.lastMonthDay = 30;
    else if (this.month == 10)
      this.lastMonthDay = 31;
    else if (this.month == 11)
      this.lastMonthDay = 30;
    else if (this.month == 12)
      this.lastMonthDay = 31;
  }

  generateMonthDay() {
    this.daysName = [this.translate.instant('sun'), this.translate.instant('mon'), this.translate.instant('tue'), this.translate.instant('wed'), this.translate.instant('thu'), this.translate.instant('fri'), this.translate.instant('sat')];
    this.daysNameDouble = [this.translate.instant('sun'), this.translate.instant('mon'), this.translate.instant('tue'), this.translate.instant('wed'), this.translate.instant('thu'), this.translate.instant('fri'), this.translate.instant('sat'), this.translate.instant('sun'), this.translate.instant('mon'), this.translate.instant('tue'), this.translate.instant('wed'), this.translate.instant('thu'), this.translate.instant('fri'), this.translate.instant('sat'), this.translate.instant('sat')];
    this.getMonthLastDay();
    let day: number = 0;
    let todayNumber: number;
    this.todayName = /*'Sun';*/this.date.toString().slice(0, 3);
    let checkAppointmentMonth: number;
    let checkAppointmentYear: number;
    let appointmentDate: string;
    let integerAndStringPost: IntegerAndStringPost;
    let j1: number;
    for (let c = 0; c < 7; c++) {
      if (this.daysNameEn[c] == this.todayName) {
        todayNumber = c;
        this.todayNumber = c;
      }
    }
    for (let c = 1; c <= 7; c++) {
      this.monthDays[day] = this.daysNameDouble[todayNumber];
      todayNumber++;
      day++;
    }

    for (var i = this.today; i <= this.lastMonthDay; i++) {
      this.monthDays[day] = i;
      if (this.appointmentDocInfo[this.selectedDoctorKey].workDays.indexOf(this.daysNameEn[(this.todayNumber + i + (7 - this.todayNumber)+1) % 7]) == -1)
        this.monthDaysDis[i] = true;
      else {
        if (i == this.today)
          this.monthDaysDis[this.today] = true;
        else {
          checkAppointmentMonth = this.month;
          checkAppointmentYear = this.year;
          if (checkAppointmentMonth <= 9)
            appointmentDate = checkAppointmentYear + '/0' + checkAppointmentMonth + '/' + i;
          else
            appointmentDate = checkAppointmentYear + '/' + checkAppointmentMonth + '/' + i;
          integerAndStringPost = new IntegerAndStringPost(this.searchedDoc[this.selectedDoctorKey].userId, appointmentDate);
          this.checkIfDayAppFull(i, integerAndStringPost);
        }
      }
      day++;
    }
    for (var j = 0; j <= (this.today - this.lastMonthDay) + 26; j++) {
      this.monthDays[day + j] = j + 1;
      if (this.appointmentDocInfo[this.selectedDoctorKey].workDays.indexOf(this.daysNameEn[(this.todayNumber + day + j) % 7]) == -1)
        this.monthDaysDis[j + 1] = true;
      else {
        j1 = j + 1;
        checkAppointmentMonth = this.month + 1;
        checkAppointmentYear = this.year;
        if (checkAppointmentMonth <= 9)
          appointmentDate = checkAppointmentYear + '/0' + checkAppointmentMonth + '/' + j1;
        else {
          if (checkAppointmentMonth == 13) {
            checkAppointmentMonth = 1;
            checkAppointmentYear = checkAppointmentYear + 1;
          }
          appointmentDate = checkAppointmentYear + '/' + checkAppointmentMonth + '/' + j1;
        }
        integerAndStringPost = new IntegerAndStringPost(this.searchedDoc[this.selectedDoctorKey].userId, appointmentDate);
        this.checkIfDayAppFull(j1, integerAndStringPost);
      }
    }
  }

  checkIfDayAppFull(i: number, integerAndStringPost: IntegerAndStringPost) {
    this.appointmentService.appointmentsCountByDoctorIdAndDate(integerAndStringPost).subscribe(
      res => {
        if (res >= this.appointmentDocInfo[this.selectedDoctorKey].maxPatientPerDay)
          this.monthDaysDis[i] = true;
        else
          this.monthDaysDis[i] = false;
      }
    );
    this.generateDays = true;
    if (this.doctorApp && this.generateDays) {
      this.loadDoctorInfo[this.selectedDoctorKey] = false;
    }
  }

  daySelected(day: number) {
    this.appointmentDay = day;
    if (day > 0 && day <= 31) {
      this.slectedDay = false;
      if (day >= this.today) {
        this.appointmentMonth = this.month;
        this.appointmentYear = this.year;
      } else {
        if (this.month + 1 == 13) {
          this.appointmentMonth = 1;
          this.appointmentYear = this.year + 1;
        } else {
          this.appointmentMonth = (this.month + 1);
          this.appointmentYear = this.year;
        }
      }
    }
    else
      this.slectedDay = true;
  }

  takeAppointment() {
    if (this.slectedDay) {
      this.toastr.warning(this.translate.instant('selectDayFirst'), this.translate.instant('info'), {
        timeOut: 5000,
        positionClass: 'toast-bottom-left'
      });
    } else {
      if (this.appointmentMonth <= 9) {
        if (this.appointmentDay <= 9)
          this.appointmentDate = this.appointmentYear + '/0' + this.appointmentMonth + '/0' + this.appointmentDay;
        else
          this.appointmentDate = this.appointmentYear + '/0' + this.appointmentMonth + '/' + this.appointmentDay;
      } else {
        if (this.appointmentDay <= 9)
          this.appointmentDate = this.appointmentYear + '/' + this.appointmentMonth + '/0' + this.appointmentDay;
        else
          this.appointmentDate = this.appointmentYear + '/' + this.appointmentMonth + '/' + this.appointmentDay;
      }

      this.integerAndStringPost = new IntegerAndStringPost(this.searchedDoc[this.selectedDoctorKey].userId, this.appointmentDate);
      this.appointmentService.appointmentsCountByDoctorIdAndDate(this.integerAndStringPost).subscribe(
        res => {
          this.patientTurn = res + 1;
        }
      );
      this.appointment = false;
      document.getElementById("searchedDoctorSection").scrollIntoView({ behavior: "smooth" });
    }
  }

  cancelAppointment() {
    this.toastr.success(this.translate.instant('appointmentCanceled'), this.translate.instant('appointment'), {
      timeOut: 3500,
      positionClass: 'toast-bottom-left'
    });
    this.specialityName = "";
    this.appointment = true;
    this.searchedDoc = [];
    this.doctorsProfileImages = [];
    this.appointmentDocInfo = [];
    this.docInfo = false;
    this.doctorCity = "";
    this.searchedDoc = null;
    this.docInfo = false;
    document.getElementById("patientFindDoctorSection").scrollIntoView({ behavior: "smooth" });
  }

  confirmAppointmentFun() {
    this.appointmentPost = new AppointmentPost(this.appointmentDate, this.searchedDoc[this.selectedDoctorKey].userId, this.patientComponent.patientGet.userId, this.patientTurn);
    this.appointmentService.add(this.appointmentPost).subscribe(
      res => {
        if (!res) {
          this.toastr.warning(this.translate.instant('appointemntAlreadyTaken'), this.translate.instant('appointment'), {
            timeOut: 6000,
            positionClass: 'toast-bottom-left'
          });
          this.specialityName = "";
          this.doctorCity = "";
          this.searchedDoc = null;
          this.docInfo = false;
          this.appointment = true;
        } else {
          this.toastr.success(this.translate.instant('appointmentConfirmed'), this.translate.instant('appointment'), {
            timeOut: 3500,
            positionClass: 'toast-bottom-left'
          });
          this.specialityName = "";
          this.doctorCity = "";
          this.searchedDoc = null;
          this.docInfo = false;
          this.appointment = true;
          document.getElementById("patientFindDoctorSection").scrollIntoView({ behavior: "smooth" });
          this.patientComponent.myAppointment = [];
          this.patientComponent.appointmentPage = 0;
          this.patientComponent.getAppointments();
        }
      }, err => {
        this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 3500,
          positionClass: 'toast-bottom-left'
        });
        this.specialityName = "";
        this.doctorCity = "";
        this.searchedDoc = null;
        this.docInfo = false;
        this.appointment = true;
      }
    );
  }

  showDoctorInfo(key: number, userId: number) {
    this.showAppointment=true;
    this.loadDoctorInfo[this.selectedDoctorKey] = false;
    this.selectedDoctorKey = key;
    this.generateDays = false;
    this.doctorApp = false;
    this.loadDoctorInfo[this.selectedDoctorKey] = true;
    if (this.appointmentDocInfo[this.selectedDoctorKey]) {
      this.generateMonthDay();
      this.docInfo = true;
      this.doctorApp = true;
      if (this.doctorApp && this.generateDays) {
        this.loadDoctorInfo[this.selectedDoctorKey] = false;
      }
    } else {
      this.doctorService.getDoctorAppointmentInfoByDoctorId(userId).subscribe(
        res => {
          this.appointmentDocInfo[this.selectedDoctorKey] = res;
          this.generateMonthDay();
          this.docInfo = true;
          this.doctorApp = true;
          if (this.doctorApp && this.generateDays) {
            this.loadDoctorInfo[this.selectedDoctorKey] = false;
          }
        },
        err => {
          this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
            timeOut: 3500,
            positionClass: 'toast-bottom-left'
          });
          this.loadDoctorInfo[this.selectedDoctorKey] = false;
        }
      );
    }
  }

  getApproximationTime(startTime: string, approxTime: number, patientTurn: number): string {
    let time: number = approxTime * (patientTurn - 1);
    let startHour: number = 0; let endHour: number = 0;
    let docStartHour: number; let docStartMunite: number;
    if (startTime.length == 4) {
      docStartHour = parseInt(startTime.slice(0, 1));
      docStartMunite = parseInt(startTime.slice(2, 4));
    }
    else {
      docStartHour = parseInt(startTime.slice(0, 2));
      docStartMunite = parseInt(startTime.slice(3, 5));
    }

    time += docStartMunite;
    if (time >= 60) {
      endHour = 1;
      while (time >= 60) {
        time = time % 60;
        startHour += 1;
        endHour += 1;
      }
      time -= 30;
      if (((60 + time) % 60) <= 9)
        return (docStartHour + startHour) + 'h:0' + ((60 + time) % 60) + 'mn ' + this.translate.instant('and') + ' ' + (docStartHour + endHour) + 'h:0' + ((60 + time) % 60) + 'mn';
      else
        return (docStartHour + startHour) + 'h:' + ((60 + time) % 60) + 'mn ' + this.translate.instant('and') + ' ' + (docStartHour + endHour) + 'h:' + ((60 + time) % 60) + 'mn';
    } else {
      if ((docStartMunite + (approxTime * patientTurn) + 15) >= 60)
        endHour += 1;
      else
        endHour = 0;
      if (docStartMunite <= 9) {
        if (((docStartMunite + (approxTime * patientTurn) + 15) % 60) <= 9)
          return docStartHour + 'h:0' + docStartMunite + 'mn ' + this.translate.instant('and') + ' ' + (docStartHour + endHour) + 'h:0' + ((docStartMunite + (approxTime * patientTurn) + 15) % 60) + 'mn';
        else
          return docStartHour + 'h:0' + docStartMunite + 'mn ' + this.translate.instant('and') + ' ' + (docStartHour + endHour) + 'h:' + ((docStartMunite + (approxTime * patientTurn) + 15) % 60) + 'mn';
      }
      else {
        if (((docStartMunite + (approxTime * patientTurn) + 15) % 60) <= 9)
          return docStartHour + 'h:' + docStartMunite + 'mn ' + this.translate.instant('and') + ' ' + (docStartHour + endHour) + 'h:0' + ((docStartMunite + (approxTime * patientTurn) + 15) % 60) + 'mn';
        else
          return docStartHour + 'h:' + docStartMunite + 'mn ' + this.translate.instant('and') + ' ' + (docStartHour + endHour) + 'h:' + ((docStartMunite + (approxTime * patientTurn) + 15) % 60) + 'mn';
      }
    }
  }

  getTopRatedDoctor() {
    this.doctorService.getTopRatedDoctor(this.topRatedPage, 2).subscribe(
      res => {
        let doctors: TopRatedDoctorGet[] = [];
        doctors = res;
        for (let doc of doctors) {
          this.topRatedDoctors.push(doc);
          this.getTopRatedDocProfileImage(doc.userId, this.topRatedDoctors.length);
        }
        this.topRatedPage += 1;
        if (doctors.length == 2)
          this.topRatedLoadMore = true;
        else
          this.topRatedLoadMore = false;
      }
    );
  }

  getTopRatedDocProfileImage(docId: number, index: number) {
    let retrieveResonse: any; let base64Data: any; let retrievedImage: any;
    this.patientService.getDoctorPofilePhoto(docId + 'profilePic').subscribe(
      res => {
        if (res != null) {
          retrieveResonse = res;
          base64Data = retrieveResonse.picByte;
          retrievedImage = 'data:image/jpeg;base64,' + base64Data;
          this.topRatedDoctors[index - 1].profileImg = retrievedImage;
        } else {
          this.topRatedDoctors[index - 1].profileImg = false;
        }
      }
    );
  }

  startConversation(recipientId: number, firstName: string, lastName: string) {
    this.patientComponent.startConversation(recipientId, firstName, lastName);
  }

  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  async loadMap() {
    if (this.appointmentDocInfo[this.selectedDoctorKey].doctorLatitude) {
      let container = document.getElementById('doctorMap');
      while (!container) {
        container = document.getElementById('doctorMap');
        await this.sleep(500);
      }
      this.doctorMap = L.map('doctorMap').setView([this.appointmentDocInfo[this.selectedDoctorKey].doctorLatitude, this.appointmentDocInfo[this.selectedDoctorKey].doctorLongitude], 13);
      L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWVzc2FhZGlpIiwiYSI6ImNrbzE3ZHZwbzA1djEyb3M1bzY4cmw1ejYifQ.cisRE8KJri7O9GD3KkMCCg', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'your.mapbox.access.token'
      }).addTo(this.doctorMap);

      let marker = L.marker([this.appointmentDocInfo[this.selectedDoctorKey].doctorLatitude, this.appointmentDocInfo[this.selectedDoctorKey].doctorLongitude]).addTo(this.doctorMap);
      marker.bindPopup(this.translate.instant('helloIm') + "<br><b> Ph. " + this.searchedDoc[this.selectedDoctorKey].doctorFirstName + ' ' + this.searchedDoc[this.selectedDoctorKey].doctorLastName + + "</b>").openPopup();
    }
  }

  addRouteToMap(){
    navigator.geolocation.getCurrentPosition((position) => {
      L.Routing.control({
        waypoints: [
          L.latLng(/*position.coords.latitude*/environment.isimaLatitude,environment.isimaLongitude /*position.coords.longitude*/),
          L.latLng(this.appointmentDocInfo[this.selectedDoctorKey].doctorLatitude, this.appointmentDocInfo[this.selectedDoctorKey].doctorLongitude)
        ]
      }).addTo(this.doctorMap);
    });
  }
}
