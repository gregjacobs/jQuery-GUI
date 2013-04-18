/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
define( [
	'jquery',
	'data/Model',
	'jqc/view/Model',
	'jqc/template/LoDash'
], function( jQuery, Model, ModelView, LoDashTpl ) {
	
	describe( 'jqc.view.Model', function() {
		
		// A simple Model subclass to use for the tests
		var UserModel = Model.extend( {
			attributes : [
				{ name : 'id',        type: 'int' },
				{ name : 'firstName', type: 'string' },
				{ name : 'lastName',  type: 'string' }
			]
		} );
		
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
			
		} );
		
		
		describe( 'bindModel()', function() {
			var SimpleModelView = ModelView.extend( {
				tpl : '<span>Testing 123</span>'
			} );
			
			var model1,
			    model2;
			
			beforeEach( function() {
				model1 = new UserModel();
				spyOn( model1, 'on' ).andCallThrough();
				spyOn( model1, 'un' ).andCallThrough();
				
				model2 = new UserModel();
				spyOn( model2, 'on' ).andCallThrough();
				spyOn( model2, 'un' ).andCallThrough();
			} );
			
			
			it( "should bind a model to be listened to", function() {
				var modelView = new SimpleModelView();
				
				modelView.bindModel( model1 );
				expect( model1.on.calls.length ).toBe( 1 );
			} );
			
			
			it( "should unbind the previously-bound model", function() {
				var modelView = new SimpleModelView();
				
				modelView.bindModel( model1 );
				expect( model1.on.calls.length ).toBe( 1 );
				expect( model1.un.calls.length ).toBe( 0 );
				
				modelView.bindModel( null );
				expect( model1.on.calls.length ).toBe( 1 );  // not called again since initial bind
				expect( model1.un.calls.length ).toBe( 1 );  // should now be unbound
			} );
			
			
			it( "should unbind the previously-bound model when binding a new model", function() {
				var modelView = new SimpleModelView();
				
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
				var modelView = new SimpleModelView();
				
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