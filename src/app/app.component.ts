import {Component} from '@angular/core';
import {StoreService} from "../packages/core/store.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(private store:StoreService){}
}
