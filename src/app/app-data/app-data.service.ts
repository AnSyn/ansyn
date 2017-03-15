import { Injectable } from '@angular/core';
import {MenuService} from "../menu/menu.service";

@Injectable()
export class AppDataService {
  constructor(public menu:MenuService) { }
}



