import { Injectable } from '@angular/core';
import {MenuService} from "./services/menu.service";

@Injectable()
export class StoreService {
  constructor(public menu:MenuService) { }
}



