/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
define( [
	'jquery',
	'data/Model',
	'gui/view/Model',
	'gui/template/LoDash'
], function( jQuery, Model, ModelView, LoDashTpl ) {
	
	describe( 'gui.view.Model', function() {
		
		// A simple Model subclass to use for the tests
		var UserModel = Model.extend( {
			attributes : [
				{ name : 'id',        type: 'int' },
				{ name : 'firstName', type: 'string' },
				{ name : 'lastName',  type: 'string' }
			]
		} );
		var TestModel = UserModel;
		
		// A properly-configured Model View which is used to test functionality
		var ConfiguredModelView = ModelView.extend( {
			tpl : new LoDashTpl( [
				'<div>',
					'<%= model.get( "lastName" ) %>, <%= model.get( "firstName" ) %>',
				'</div>'
			] )
		} );
		
		
		describe( "config options", function() {
			
			describe( "`tpl` config", function() {
				
				it( "should be required", function() {
					expect( function() {
						var modelView = new ModelView( {
							// no tpl config
						} );
					} ).toThrow( "`tpl` config required" );
				} );
				
			} );
			
			
			describe( "`model` config", function() {				
				
				it( "should not render anything with no `model` bound", function() {
					var modelView = new ConfiguredModelView( {
						renderTo : 'body'
						// note: no `model` config
					} );
					
					expect( modelView.getEl().html() ).toBe( "" );  // no innerHTML
					
					modelView.destroy();  // clean up
				} );
				
				
				it( "should render the `tpl` with a `model` bound", function() {
					var modelView = new ConfiguredModelView( {
						renderTo : 'body',
						
						model : new UserModel( { id: 1, firstName: "John", lastName: "Smith" } )
					} );
					
					expect( modelView.getEl().html() ).toBe( "<div>Smith, John</div>" );
					
					modelView.destroy();  // clean up
				} );
				
			} );
			
			
			describe( "`modelVar` config", function() {
				var ModelVarModelView = ModelView.extend( {
					tpl : new LoDashTpl( [
						'<div><%= user.get( "lastName" ) %>, <%= user.get( "firstName" ) %></div>'
					] )
				} );
				
				it( "should change the name of the variable provided to the template which has the models to render", function() {
					var modelView = new ModelVarModelView( {
						renderTo : 'body',
						modelVar : 'user',
						
						model : new UserModel( { id: 1, firstName: "John", lastName: "Smith" } )
					} );
					
					expect( modelView.getEl().html() ).toBe( "<div>Smith, John</div>" );
					
					modelView.destroy();  // clean up
				} );
				
			} );
			
			
			describe( "`maskOnLoad` config", function() {
				var model,
				    modelView;
				
				beforeEach( function() {
					model = new TestModel();
				} );
				
				afterEach( function() {
					modelView.destroy();  // note: modelView is instantiated in each test
					modelView = null;     // remove before next test
				} );
				
				
				
				it( "when set to `true`, should mask the ModelView when the model starts loading, and unmask it when finished", function() {
					modelView = new ConfiguredModelView( {
						model : model,
						maskOnLoad: true
					} );
					
					expect( modelView.isMasked() ).toBe( false );
					
					// Now start loading
					spyOn( model, 'isLoading' ).andReturn( true );
					model.fireEvent( 'loadbegin', model );
					
					expect( modelView.isMasked() ).toBe( true );
					
					
					// Now finish loading
					model.isLoading.andReturn( false );
					model.fireEvent( 'load', model );
					
					expect( modelView.isMasked() ).toBe( false );
				} );
				
				
				it( "when set to `false`, should *not* mask the ModelView when the model starts loading", function() {
					modelView = new ConfiguredModelView( {
						model : model,
						maskOnLoad: false
					} );
					
					expect( modelView.isMasked() ).toBe( false );
					
					// Now start loading
					spyOn( model, 'isLoading' ).andReturn( true );
					model.fireEvent( 'loadbegin', model );
					
					expect( modelView.isMasked() ).toBe( false );
					
					
					// Now finish loading - just double checking no errors, and that it is still unmasked
					model.isLoading.andReturn( false );
					model.fireEvent( 'load', model );
					
					expect( modelView.isMasked() ).toBe( false );
				} );
				
				
				it( "when set to `true`, should cause the ModelView to be instantiated and render with the mask shown if the model has started loading before the ModelView is instantiated", function() {
					// "Start" loading
					spyOn( model, 'isLoading' ).andReturn( true );
					model.fireEvent( 'loadbegin', model );  // no need for this here, but keeping just to be clear
					
					modelView = new ConfiguredModelView( {
						model : model,
						maskOnLoad: true
					} );
					
					expect( modelView.isMasked() ).toBe( true );
					
					// Render, and check again
					modelView.render( 'body' );
					expect( modelView.isMasked() ).toBe( true );
				} );
				
				
				it( "when set to `false`, should *not* cause the ModelView to be instantiated and render with the mask shown if the model has started loading before the ModelView is instantiated", function() {
					// "Start" loading
					spyOn( model, 'isLoading' ).andReturn( true );
					model.fireEvent( 'loadbegin', model );  // no need for this here, but keeping just to be clear
					
					modelView = new ConfiguredModelView( {
						model : model,
						maskOnLoad: false
					} );
					
					expect( modelView.isMasked() ).toBe( false );
					
					// Render, and check again
					modelView.render( 'body' );
					expect( modelView.isMasked() ).toBe( false );
				} );
				
				
				it( "when set to `true`, should cause the ModelView to show the mask if an already-loading model is bound to it", function() {
					modelView = new ConfiguredModelView( {
						maskOnLoad: true
					} );
					expect( modelView.isMasked() ).toBe( false );  // initial condition
					
					
					spyOn( model, 'isLoading' ).andReturn( true );  // pretend it's loading
					modelView.bindModel( model );
					
					expect( modelView.isMasked() ).toBe( true ); 
				} );
				
				
				it( "when set to `true`, should cause the ModelView to hide the mask if unbinding an already-loading model, while binding a new, non-loading model", function() {
					spyOn( model, 'isLoading' ).andReturn( true );
					
					modelView = new ConfiguredModelView( {
						model : model,  // this model is already loading
						maskOnLoad: true
					} );
					expect( modelView.isMasked() ).toBe( true );  // initial condition - due to the model already loading
					
					
					var model2 = new TestModel();
					spyOn( model2, 'isLoading' ).andReturn( false );  // this one is *not* loading
					modelView.bindModel( model2 );
					
					expect( modelView.isMasked() ).toBe( false ); // no longer masked, since new model is *not* loading 
				} );
				
				
				it( "when set to `true`, should cause the ModelView to hide the mask if unbinding an already-loading model, when not binding any new model", function() {
					spyOn( model, 'isLoading' ).andReturn( true );
					
					modelView = new ConfiguredModelView( {
						model : model,  // this model is already loading
						maskOnLoad: true
					} );
					expect( modelView.isMasked() ).toBe( true );  // initial condition - due to the model already loading
					
					
					// Unbind the current series model
					modelView.bindModel( null );
					expect( modelView.isMasked() ).toBe( false ); // no longer masked, since there is no new model 
				} );
				
				
				it( "when set to `false`, shouldn't change the masked state of the ModelView when binding a model that is loading", function() {
					modelView = new ConfiguredModelView( {
						maskOnLoad: false
					} );
					expect( modelView.isMasked() ).toBe( false );  // initial condition
					
					
					// Bind a loading series model
					spyOn( model, 'isLoading' ).andReturn( true );
					modelView.bindModel( model );
					
					expect( modelView.isMasked() ).toBe( false ); // should still not be masked, since `maskOnLoad` is false 
				} );
				
				
				it( "when set to `false`, shouldn't change the masked state of the ModelView when binding a model that is not loading, even if the ModelView has been manually masked", function() {
					modelView = new ConfiguredModelView( {
						maskOnLoad: false
					} );
					modelView.mask( { msg: "Loading..." } );      // *** manually mask the ModelView ***
					expect( modelView.isMasked() ).toBe( true );  // initial condition
					
					
					// Bind a series model that is *not* loading
					spyOn( model, 'isLoading' ).andReturn( false );
					modelView.bindModel( model );
					
					expect( modelView.isMasked() ).toBe( true ); // should still be masked, since `maskOnLoad` is false. The mask which was manually applied in this case should not be touched.
				} );
				
			} );
			
			
			describe( "`loadingHeight` config", function() {
				var model,
				    modelView;
				
				beforeEach( function() {
					model = new TestModel();
					
					modelView = new ModelView( {
						model : model,
						
						maskOnLoad : true,
						loadingHeight : 100,
						
						tpl: "<div></div>"
					} );
				} );
				
				afterEach( function() {
					modelView.destroy();
				} );
				
				
				it( "should not apply any `loadingHeight` if it is not configured", function() {
					// Make a new ModelView (not the one on the test level)
					var modelView = new ModelView( {
						renderTo : 'body',
						model : model,
						
						maskOnLoad : true,
						// loadingHeight : 100  -- not applying
						
						tpl: "<div></div>"
					} );
					expect( modelView.getHeight() ).toBe( 0 );  // initial condition
					
					// Now start loading
					spyOn( model, 'isLoading' ).andReturn( true );
					model.fireEvent( 'loadbegin', model );
					
					expect( modelView.getHeight() ).toBe( 0 );  // still 0 - no loading height applied
					
					modelView.destroy();  // clean up the local modelView
				} );
				
				
				it( "should apply the `loadingHeight` if the ModelView is first rendered while the `model` is loading", function() {
					spyOn( model, 'isLoading' ).andReturn( true );
					
					modelView.render( 'body' );
					expect( modelView.getHeight() ).toBe( 100 );
					
					// Now pretend loading is complete
					model.isLoading.andReturn( false );
					model.fireEvent( 'load', model );
					expect( modelView.getHeight() ).toBe( 0 );  // no content
				} );
				
				
				it( "should apply the `loadingHeight` if the ModelView is currently rendered, and then the `model` starts loading", function() {
					modelView.render( 'body' );
					expect( modelView.getHeight() ).toBe( 0 );
					
					// Now start loading
					spyOn( model, 'isLoading' ).andReturn( true );
					model.fireEvent( 'loadbegin', model );
					
					expect( modelView.getHeight() ).toBe( 100 );
					
					// Now pretend loading is complete
					model.isLoading.andReturn( false );
					model.fireEvent( 'load', model );
					expect( modelView.getHeight() ).toBe( 0 );  // no content
				} );
				
				
				it( "should re-apply the configured `minHeight` after loading is complete", function() {
					var minHeight = 25;
					
					modelView.minHeight = minHeight;
					modelView.render( 'body' );
					expect( modelView.getHeight() ).toBe( minHeight );
					
					// Now start loading
					spyOn( model, 'isLoading' ).andReturn( true );
					model.fireEvent( 'loadbegin', model );
					
					expect( modelView.getHeight() ).toBe( 100 );  // the loading height
					
					// Now pretend loading is complete
					model.isLoading.andReturn( false );
					model.fireEvent( 'load', model );
					expect( modelView.getHeight() ).toBe( minHeight );  // `minHeight` re-applied
				} );
				
			} );
			
		} );
		
		
		describe( 'getModel()', function() {
			
			it( "should return null if there is no currently-bound Model", function() {
				var modelView = new ConfiguredModelView();
				
				expect( modelView.getModel() ).toBe( null );
				
				modelView.destroy();  // clean up
			} );
			
			
			it( "should return the bound Model that was configured with the ModelView", function() {
				var model = new UserModel(),
				    modelView = new ConfiguredModelView( { model: model } );
				
				expect( modelView.getModel() ).toBe( model );
				
				modelView.destroy();  // clean up
			} );
			
			
			it( "should return the currently-bound Model, bound by `bindModel()`", function() {
				var model = new UserModel(),
				    modelView = new ConfiguredModelView();
				
				modelView.bindModel( model );
				
				expect( modelView.getModel() ).toBe( model );
				
				modelView.destroy();  // clean up
			} );
			
		} );
		
		
		describe( 'bindModel()', function() {
			var SimpleModelView = ModelView.extend( {
				tpl : '<span>Testing 123</span>'
			} );
			
			var model1,
			    model2,
			    modelView;  // note: instantiated in tests
			
			beforeEach( function() {
				model1 = new UserModel();
				spyOn( model1, 'on' ).andCallThrough();
				spyOn( model1, 'un' ).andCallThrough();
				
				model2 = new UserModel();
				spyOn( model2, 'on' ).andCallThrough();
				spyOn( model2, 'un' ).andCallThrough();
			} );
			
			
			afterEach( function() {
				modelView.destroy();  // clean up
				modelView = null;     // remove reference before next test
			} );
			
			
			it( "should bind a model to be listened to", function() {
				modelView = new SimpleModelView();
				
				modelView.bindModel( model1 );
				expect( model1.on.calls.length ).toBe( 1 );
			} );
			
			
			it( "should unbind the previously-bound model", function() {
				modelView = new SimpleModelView();
				
				modelView.bindModel( model1 );
				expect( model1.on.calls.length ).toBe( 1 );
				expect( model1.un.calls.length ).toBe( 0 );
				
				modelView.bindModel( null );
				expect( model1.on.calls.length ).toBe( 1 );  // not called again since initial bind
				expect( model1.un.calls.length ).toBe( 1 );  // should now be unbound
			} );
			
			
			it( "should unbind the previously-bound model when binding a new model", function() {
				modelView = new SimpleModelView();
				
				modelView.bindModel( model1 );
				expect( model1.on.calls.length ).toBe( 1 );
				expect( model1.un.calls.length ).toBe( 0 );
				
				modelView.bindModel( model2 );
				expect( model1.on.calls.length ).toBe( 1 );  // not called again since initial bind
				expect( model1.un.calls.length ).toBe( 1 );  // should now be unbound
				expect( model2.on.calls.length ).toBe( 1 );  // model2 now bound
				expect( model2.un.calls.length ).toBe( 0 );  // not unbound yet
			} );
			
			
			it( "should not re-bind the already-bound model", function() {
				modelView = new SimpleModelView();
				
				modelView.bindModel( model1 );
				expect( model1.on.calls.length ).toBe( 1 );
				expect( model1.un.calls.length ).toBe( 0 );
				
				// Attempt to bind the model again
				modelView.bindModel( model1 );
				expect( model1.on.calls.length ).toBe( 1 );  // not called again since initial bind
				expect( model1.un.calls.length ).toBe( 0 );  // should not have been unbound
			} );
			
		} );
		
		
		
		describe( "refresh functionality", function() {
			var modelView;
			
			beforeEach( function() {
				modelView = new ConfiguredModelView( {
					renderTo : 'body'
				} );
			} );
			
			afterEach( function() {
				modelView.destroy();
			} );
			
			
			it( "should refresh the view when an attribute in the model is changed", function() {
				var model = new UserModel( { id: 1, firstName: "John", lastName: "Smith" } );
				modelView.bindModel( model );
				
				expect( modelView.getEl().html() ).toBe( "<div>Smith, John</div>" );  // initial condition
				
				model.set( 'firstName', "Whosie-whatsit" );
				expect( modelView.getEl().html() ).toBe( "<div>Smith, Whosie-whatsit</div>" );
			} );
			
			
			it( "should refresh the view when the model is rolled back", function() {
				var model = new UserModel( { id: 1, firstName: "John", lastName: "Smith" } );
				model.set( 'firstName', "Whosie-whatsit" );
				modelView.bindModel( model );
				
				expect( modelView.getEl().html() ).toBe( "<div>Smith, Whosie-whatsit</div>" );  // initial condition
				
				model.rollback();
				expect( modelView.getEl().html() ).toBe( "<div>Smith, John</div>" );
			} );
			
			
			it( "should refresh the view when a new model is bound", function() {
				var model1 = new UserModel( { id: 1, firstName: "John", lastName: "Smith" } ),
				    model2 = new UserModel( { id: 2, firstName: "Bob", lastName: "Jones" } );
				
				modelView.bindModel( model1 );
				expect( modelView.getEl().html() ).toBe( "<div>Smith, John</div>" );  // initial condition
				
				modelView.bindModel( model2 );
				expect( modelView.getEl().html() ).toBe( "<div>Jones, Bob</div>" );
			} );
			
		} );
		
	} );
	
} );