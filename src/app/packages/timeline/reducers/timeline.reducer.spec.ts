import { reducer,initialState,IOverlayState } from './timeline.reducer';
import { SelectOverlayAction, LoadOverlaysAction, LoadOverlaysSuccessAction, LoadOverlaysFailAction, ClearFilter, SetFilter } from '../actions/timeline.actions';
import { Overlay } from '../models/overlay.model';

describe('Overlay Reducer',() => {    
   	
   	describe("Load Overlays",() => {    
		it("should activate load_overlay reducer",()=> {
			const action  = new LoadOverlaysAction();
			//expect(result.loaded).toBe(false);
			const result = reducer(initialState,action);
			expect(result.loading).toBe(true);
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
           	const result = reducer(initialState,action);
           	expect(result.overlays.size).toBe(2);
           	expect(result.loading).toBe(false);
           	expect(result.loaded).toBe(true);
		});  	
  	});
});