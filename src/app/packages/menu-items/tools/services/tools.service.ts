import { Injectable, InjectionToken } from '@angular/core';
import { ToolsConfig } from '../models/tools-config';

export const toolsConfig: InjectionToken<ToolsConfig> = new InjectionToken('toolsConfig');

@Injectable()
export class ToolsService {


  constructor() { }

}
