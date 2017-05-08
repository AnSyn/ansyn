import { OverlayReducer,overlayInitialState,IOverlayState } from './overlays.reducer';
import { UnSelectOverlayAction, SelectOverlayAction, LoadOverlaysAction, LoadOverlaysSuccessAction, LoadOverlaysFailAction, ClearFilter, SetFilter } from '../actions/overlays.actions';
import { Overlay } from '../models/overlay.model';

describe('Overlay Reducer',() => {

   	describe("Load Overlays",() => {
		it("should activate load_overlay reducer",()=> {
			const action  = new LoadOverlaysAction();
			//expect(result.loaded).toBe(false);
			const result = OverlayReducer(overlayInitialState,action);
			expect(result.loading).toBe(true);
		});
	});

   	describe("Selected Overlay",() => {
   		it('should add overaly id to seleced overlays array\'s',() => {
   			const fakeId:string = 'iu34-2322'
   			const action = new SelectOverlayAction(fakeId);

   			const result:IOverlayState = OverlayReducer(overlayInitialState,action);
   			expect(result.selectedOverlays.indexOf(fakeId)).toBeGreaterThan(-1);

   		});
   	});

   	describe("UnSelected Overlay",() => {
   		it('should remove overaly id from the seleced overlays array\'s',() => {
   			const fakeId:string = 'iu34-2322'
   			const action = new SelectOverlayAction(fakeId);

   			let result:IOverlayState = OverlayReducer(overlayInitialState,action);

   			expect(result.selectedOverlays.indexOf(fakeId)).toBeGreaterThan(-1);

   			const unSelectAction = new UnSelectOverlayAction(fakeId);

   			result = OverlayReducer(result,unSelectAction);

   			expect(result.selectedOverlays.length).toBe(0);
   		});
   	});

	describe("Load Overlays Success",()=>{
		it('should load all overlays',() => {
			const overlays =  <Overlay[]>[
				{
	         		id: '12',
	         		name: 'tmp12',
	         		photoTime: new Date(Date.now()),
	         		azimuth: 10
	         	},
	         	{
	         		id: '13',
	         		name: 'tmp13',
	         		photoTime: new Date(Date.now()),
	         		azimuth: 10
	           	}
           	]

           	const action = new LoadOverlaysSuccessAction(overlays);
           	const result = OverlayReducer(overlayInitialState,action);
           	expect(result.overlays.size).toBe(2);
           	expect(result.loading).toBe(false);
           	expect(result.loaded).toBe(true);
		});
  	});
});
