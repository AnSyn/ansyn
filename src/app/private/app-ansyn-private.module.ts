import { AnsynAppMetaData, AppAnsynModule } from '../app/app.module';
import { NgModule } from '@angular/core';
import { PrivateModule } from './private.module';
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
