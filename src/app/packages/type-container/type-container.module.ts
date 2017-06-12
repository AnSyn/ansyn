import { NgModule} from '@angular/core';
import { TypeContainerService } from './services/type-container.service';
import { RegisterOptions } from "./models/register-options.model";



@NgModule({
    providers: [TypeContainerService],
})
export class TypeContainerModule { 

    static register(registerOptions : RegisterOptions) {
        return {
            ngModule : TypeContainerModule,
            providers : [
                 { provide: RegisterOptions, useValue: registerOptions , multi: true }
            ]
        }
    }
}
