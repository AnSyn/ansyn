import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ansyn-sensor-types',
  templateUrl: './sensor-types.component.html',
  styleUrls: ['./sensor-types.component.less']
})
export class SensorTypesComponent implements OnInit {
  
  types = ['rom','elor','pini','blat']
  constructor() { }

  ngOnInit(): void {
  }

}
