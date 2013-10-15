/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
define( [
	'data/Model',
	'gui/util/ModelBindable'
], 
function( Model, ModelBindable ) {
	
	describe( 'gui.util.ModelBindable', function() {
		var TestModelBindable = ModelBindable.extend( {
			modelProp : 'myModel',  // to test this config with all methods
			
			getModelListeners : function() {
				return {
					'change' : this.onChange,
					scope : this
				};
			},
			
			// Empty handler of the model's `change` event
			onChange : function() {}
		} );
			
		
		var modelBindable,
		    model1,
		    model2;
		
		beforeEach( function() {
			modelBindable = new TestModelBindable();
			model1 = new Model();
			model2 = new Model();
			
			spyOn( modelBindable, 'onModelBind' ).andCallThrough();
			spyOn( model1, 'on' ).andCallThrough();
			spyOn( model1, 'un' ).andCallThrough();
			spyOn( model2, 'on' ).andCallThrough();
			spyOn( model2, 'un' ).andCallThrough();
		} );
		
		
		describe( "configuration options", function() {
			
			it( "The `modelProp` config should dictate what property name the model should be stored under when bound", function() {
				modelBindable.bindModel( model1 );  // this instance is configured with a `modelProp` config of 'myModel'
				
				expect( modelBindable.myModel ).toBe( model1 );
			} );
			
		} );

		
		describe( 'bindModel()', function() {
			
			it( "should bind a model, setting its reference to the object, and attaching its listeners (which are provided by getModelListeners())", function() {
				modelBindable.bindModel( model1 );
				
				// Make sure the model was stored under the correct property name
				expect( modelBindable.myModel ).toBe( model1 );
				
				// Make sure event handlers were added to the model
				expect( model1.on.calls.length ).toBe( 1 );
				expect( model1.on ).toHaveBeenCalledWith( modelBindable.getModelListeners() );
				
				// Make sure the onModelBind hook method has been called
				expect( modelBindable.onModelBind.calls.length ).toBe( 1 );
				expect( modelBindable.onModelBind ).toHaveBeenCalledWith( model1, null );
			} );
			
			
			it( "should only bind a new model if the new model is different than the currently-bound model", function() {
				modelBindable.bindModel( model1 );
				modelBindable.bindModel( model1 );  // try to bind twice
				
				// Make sure event handlers were added to the model only once
				expect( model1.on.calls.length ).toBe( 1 );
				expect( model1.on ).toHaveBeenCalledWith( modelBindable.getModelListeners() );
				
				// Make sure the onModelBind hook method has been called only once
				expect( modelBindable.onModelBind.calls.length ).toBe( 1 );
				expect( modelBindable.onModelBind ).toHaveBeenCalledWith( model1, null );
			} );
			
			
			it( "should allow an initial model bind of the same model stored in the `modelProp`. This is to support the model being passed in as a config, but not having been bound yet", function() {
				modelBindable.myModel = model1;  // as if the model has been set via config
				
				// Make sure we can still bind this model, even if the property is already set (but it's never been actually bound)
				modelBindable.bindModel( model1 );
				
				expect( model1.on.calls.length ).toBe( 1 );
				expect( model1.on ).toHaveBeenCalledWith( modelBindable.getModelListeners() );
				expect( modelBindable.onModelBind.calls.length ).toBe( 1 );
				expect( modelBindable.onModelBind ).toHaveBeenCalledWith( model1, null );  // there really is no "previously-bound" model in this case, so the second arg should be null
			} );
			
			
			it( "should unbind any previously-bound model when a new model is bound", function() {
				modelBindable.bindModel( model1 );
				expect( model1.un.calls.length ).toBe( 0 );  // initial condition
				
				// Now bind the second model and check
				modelBindable.bindModel( model2 );
				expect( model1.un.calls.length ).toBe( 1 );
				expect( model1.un ).toHaveBeenCalledWith( modelBindable.getModelListeners() );
				expect( model2.on.calls.length ).toBe( 1 );
				expect( model2.on ).toHaveBeenCalledWith( modelBindable.getModelListeners() );
				expect( modelBindable.onModelBind.calls.length ).toBe( 2 );
				expect( modelBindable.onModelBind.mostRecentCall.args ).toEqual( [ model2, model1 ] );
			} );
			
			
			it( "should unbind a previously-bound model when passed `null`", function() {
				modelBindable.bindModel( model1 );
				modelBindable.bindModel( null );
				
				expect( model1.un.calls.length ).toBe( 1 );
				expect( model1.un ).toHaveBeenCalledWith( modelBindable.getModelListeners() );
				expect( modelBindable.onModelBind.calls.length ).toBe( 2 );
				expect( modelBindable.onModelBind.mostRecentCall.args ).toEqual( [ null, model1 ] );
			} );
			
			
			it( "when `null` is passed in, it should not have an effect if there was no previously-bound model (ModelBindable assumes an `undefined` model is `null`)", function() {
				modelBindable.bindModel( null );
				
				expect( modelBindable.onModelBind.calls.length ).toBe( 0 );
			} );
			
		} );

		
		describe( 'unbindModel()', function() {
			
			it( "should unbind the currently-bound model by removing its listeners, and setting its reference to null", function() {
				modelBindable.bindModel( model1 );
				
				modelBindable.unbindModel();
				
				expect( model1.un.calls.length ).toBe( 1 );
				expect( model1.un ).toHaveBeenCalledWith( modelBindable.getModelListeners() );
				expect( modelBindable.onModelBind.calls.length ).toBe( 2 );
				expect( modelBindable.onModelBind.mostRecentCall.args ).toEqual( [ null, model1 ] );
			} );
			
			
			it( "should simply have no effect if there is no currently-bound model", function() {
				modelBindable.unbindModel();
				
				expect( modelBindable.onModelBind.calls.length ).toBe( 0 );
			} );
			
		} );

		
		describe( 'getModel()', function() {
			
			it( "should retrieve the currently-bound model", function() {
				modelBindable.bindModel( model1 );
				expect( modelBindable.getModel() ).toBe( model1 );
			} );
			
			
			it( "should return `null` if there is no currently-bound model", function() {
				expect( modelBindable.getModel() ).toBe( null );  // initial, never-bound state

				modelBindable.bindModel( model1 );
				expect( modelBindable.getModel() ).toBe( model1 );
				
				modelBindable.unbindModel();
				expect( modelBindable.getModel() ).toBe( null );
			} );
			
		} );
		
	} );
	
} );