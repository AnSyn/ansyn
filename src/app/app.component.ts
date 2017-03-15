import {Component} from '@angular/core';
import {AppDataService} from "./app-data/app-data.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(private appData:AppDataService){}
}
