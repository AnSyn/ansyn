import { NgModule ,Type} from '@angular/core';

import { SourceFacadeContainerService } from './services/overlay-source-facade-container.service';
import { BaseDataSourceFacade } from "./models/base-data-source-facade.model";

@NgModule({
    providers: [SourceFacadeContainerService],
})
export class DataSourceFacadeModule { 

    static register(type : Type<BaseDataSourceFacade>) {
        return {
            ngModule : DataSourceFacadeModule,
            providers : [
                 { provide: BaseDataSourceFacade, useClass: type, multi: true }
            ]
        }
    }
}
