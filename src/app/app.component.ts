import { Component, ElementRef, ViewChild, OnInit} from '@angular/core';
import { StoreService } from '@ansyn/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent {
  constructor(private store: StoreService) {}

}
