import { AnsynAppMetaData, AppAnsynModule } from '../app/app.module';
import { NgModule } from '@angular/core';
import { AnsynPrivateModule } from './ansyn-private/ansyn-private.module';

@NgModule({
	...AnsynAppMetaData,
	imports: [
		...AnsynAppMetaData.imports,
		AnsynPrivateModule
	]
})
export class PrivateAnsynAppModule extends AppAnsynModule {
}
