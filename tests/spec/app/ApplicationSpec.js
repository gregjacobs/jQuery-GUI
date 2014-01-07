/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
define( [
	'lodash',
	
	'gui/app/Application',
	'gui/app/Controller',
	'gui/Viewport'
], function( _, Application, Controller, Viewport ) {
	
	describe( 'gui.app.Application', function() {
		var viewport,
		    ConcreteApplication;  // a concrete subclass for testing
		
		
		beforeEach( function() {
			viewport = new Viewport();
			
			ConcreteApplication = Application.extend( {
				createViewport : function() { return viewport; }
			} );
		} );
		
		
		describe( 'constructor', function() {
			
			describe( "`listeners` config", function() {
				
				it( "should be able to accept the `listeners` config for Observable (the superclass)", function() {
					var testEventCallCount = 0;
					
					var app = new ConcreteApplication( {
						listeners : {
							'testEvent' : function() { testEventCallCount++; }
						}
					} );
					
					expect( testEventCallCount ).toBe( 0 );  // initial condition
					
					app.fireEvent( 'testEvent' );  // manually firing an event just for testing
					expect( testEventCallCount ).toBe( 1 );
				} );
				
			} );
			
			
			describe( "viewport functionality", function() {
			
				it( "should throw an error if a Viewport is not returned from createViewport()", function() {
					var MyApplication = Application.extend( {
						createViewport : function() {}  // note: no return value
					} );
					
					expect( function() {
						var app = new MyApplication();
					} ).toThrow( "Error: No viewport returned by createViewport() method" );
				} );
				
				
				it( "should store the Viewport which is returned from createViewport() as the `viewport` property", function() {
					var viewport = new Viewport();
					var MyApplication = Application.extend( {
						createViewport : function() { return viewport; }
					} );
					
					var app = new MyApplication();
					expect( app.viewport ).toBe( viewport );
				} );
				
			} );
			
			
			describe( "controller functionality", function() {
				
				it( "should provide the `viewport` instance to the createControllers() method", function() {
					var viewport = new Viewport(),
					    argProvidedViewport;
					
					var MyApplication = Application.extend( {
						createViewport : function() { return viewport; },
						createControllers : function( viewport ) {
							argProvidedViewport = viewport;
							
							return this._super( arguments );
						}
					} );
					
					var application = new MyApplication();
					expect( argProvidedViewport ).toBe( viewport );
				} );
				

				it( "should throw an error if no Object (map) is returned from the createControllers() method", function() {
					var TestApplication = ConcreteApplication.extend( {
						createControllers : function() {}  // note: no return Object (map)
					} );
					
					var application;
					expect( function() {
						application = new TestApplication();
					} ).toThrow( "Error: No Object (map) returned by the createControllers() method" );
				} );
				
				
				it( "should not error if an empty Object (map) is returned from the createControllers() method", function() {
					var TestApplication = ConcreteApplication.extend( {
						createControllers : function() {
							return {};
						}
					} );
					
					var application;
					expect( function() {
						application = new TestApplication();
					} ).not.toThrow();
					
					expect( application.getController( 'nonExistent' ) ).toBe( null );
				} );
				
				
				it( "should store controllers returned in the map, which should be accessible via getController()", function() {
					var controller1 = new Controller( { view: viewport } ),
					    controller2 = new Controller( { view: viewport } );
					
					var TestApplication = ConcreteApplication.extend( {
						createControllers : function() {
							return {
								controller1: controller1,
								controller2: controller2
							};
						}
					} );
					
					var application = new TestApplication();

					expect( application.getController( 'controller1' ) ).toBe( controller1 );
					expect( application.getController( 'controller2' ) ).toBe( controller2 );
					expect( application.getController( 'controller3' ) ).toBe( null );
				} );
				
			} );
			
		} );
		
		
		describe( 'destroy', function() {
			var viewport,
			    controller1,
			    controller2,
			    application;
			
			beforeEach( function() {
				viewport = new Viewport();
				controller1 = new Controller( { view: viewport } );
				controller2 = new Controller( { view: viewport } );
				
				var MyApplication = Application.extend( {
					createViewport : function() { 
						return viewport; 
					},
					
					createControllers : function( viewport ) {
						return {
							controller1: controller1,
							controller2: controller2
						};
					}
				} );
				application = new MyApplication();
			} );
			
			
			it( "should fire the 'destroy' event", function() {
				var destroyCallCount = 0;
				
				application.on( 'destroy', function( app ) {
					destroyCallCount++;
					
					expect( app ).toBe( application );  // make sure the event is called with the correct argument
				} );
				
				application.destroy();
				expect( destroyCallCount ).toBe( 1 );
			} );
			
			
			it( "should destroy the Viewport", function() {
				expect( viewport.isDestroyed() ).toBe( false );  // initial condition
				
				application.destroy();
				expect( viewport.isDestroyed() ).toBe( true );
			} );
			
			
			it( "should destroy each of the Controllers", function() {
				expect( controller1.isDestroyed() ).toBe( false );  // initial condition
				expect( controller2.isDestroyed() ).toBe( false );  // initial condition
				
				application.destroy();
				expect( controller1.isDestroyed() ).toBe( true );
				expect( controller2.isDestroyed() ).toBe( true );
			} );
			
			
			it( "should only be able to be destroyed once", function() {
				spyOn( application, 'onDestroy' ).andCallThrough();      // testing via the onDestroy() hook method
				
				expect( application.onDestroy.calls.length ).toBe( 0 );  // initial condition

				application.destroy();
				expect( application.onDestroy.calls.length ).toBe( 1 );
				
				application.destroy();
				expect( application.onDestroy.calls.length ).toBe( 1 );  // should still be 1 (i.e. shouldn't have been called again)
			} );
			
		} );
		
	} );
	
} );