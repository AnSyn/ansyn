import { AnsynAppMetaData, AppAnsynModule } from '../app/app.module';
import { NgModule } from '@angular/core';
import { PrivateModule } from './private.module';
import { AppAnsynComponent } from '../app/app.component';

@NgModule({
	...AnsynAppMetaData,
	imports: [
		...AnsynAppMetaData.imports,
		PrivateModule
	],
	bootstrap: [AppAnsynComponent]
})
export class PrivateAnsynAppModule extends AppAnsynModule {
}
