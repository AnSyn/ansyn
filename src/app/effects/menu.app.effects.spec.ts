import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { async, inject, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { MenuAppEffects } from './menu.app.effects';
import { MenuReducer } from '@ansyn/menu/reducers/menu.reducer';
import { AnimationEndAction } from '@ansyn/core/actions/menu.actions';
import { UpdateMapSizeAction } from '../packages/map-facade/actions/map.actions';

fdescribe('MenuAppEffects', () => {
	let menuAppEffects: MenuAppEffects;
	let effectsRunner: EffectsRunner;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [EffectsTestingModule, StoreModule.provideStore({menu : MenuReducer})],
			providers: [MenuAppEffects]

		}).compileComponents();
	}));


	beforeEach(inject([MenuAppEffects, EffectsRunner], (_menuAppEffects: MenuAppEffects, _effectsRunner: EffectsRunner) => {
		menuAppEffects = _menuAppEffects;
		effectsRunner = _effectsRunner;
	}));

	it('onAnimationEnd$ effect should dispatch UpdateMapSizeAction', () => {
		let action: AnimationEndAction = new AnimationEndAction();
		effectsRunner.queue(action);
		let result: UpdateMapSizeAction;
		menuAppEffects.onAnimationEnd$.subscribe((_result: UpdateMapSizeAction)=>{
			result = _result;
		});
		expect(result instanceof UpdateMapSizeAction).toBeTruthy();
	})


});
