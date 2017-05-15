import { Config, ConfigSource } from './services/config.service';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule]
})

export class CoreModule {

  static forRoot(config: any): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [ 
        Config,
        { provide: ConfigSource, useValue: config }
      ]
    };
  }
}
