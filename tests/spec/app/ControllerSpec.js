/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
/*jshint sub:true */
define( [
	'lodash',
	'jqGui/ComponentQuery',
	'jqGui/app/Controller',
	
	'jqGui/Component',     // type: 'component'
	'jqGui/Container',     // type: 'container'
	'jqGui/panel/Panel'    // type: 'panel'
], function( _, ComponentQuery, Controller, Component, Container, Panel ) {
	
	describe( 'jqGui.app.Controller', function() {
		
		describe( "configuration options", function() {
			var view, controller;
			
			beforeEach( function() {
				view = new Component();
			} );
			
			afterEach( function() {
				view.destroy();
			} );
			
			describe( "refs", function() {
				
				it( "should leave the internal `refs` map empty when no `refs` config is provided", function() {
					var controller = new Controller( {
						view : view
						// note: no `refs` config
					} );
					
					expect( controller.refs ).toEqual( {} );  // check the internal `refs` map
					
					controller.destroy();  // clean up
				} );
				
				
				it( "should accept `refs` on the prototype", function() {
					var TestController = Controller.extend( {
						refs : {
							'myComponent1' : '#myComponent1',  // shorthand use with just a selector
							'myComponent2' : { selector: '#myComponent2' },
							'myTextFields' : { selector: 'textfield', multiple: true },  // matches all TextField components
							'myButtons'    : { selector: 'button', multiple: true, noCache: true }
						}
					} );
					
					var controller = new TestController( {
						view : view
					} );
					expect( controller.refs ).toEqual( {
						'myComponent1' : { selector: '#myComponent1', multiple: false, noCache: false },
						'myComponent2' : { selector: '#myComponent2', multiple: false, noCache: false },
						'myTextFields' : { selector: 'textfield',     multiple: true,  noCache: false },
						'myButtons'    : { selector: 'button',        multiple: true,  noCache: true }
					} );
					
					controller.destroy();  // clean up
				} );
				
				
				it( "should accept the `refs` config of Controller subclasses, combining those `refs` with the `refs` of its superclasses", function() {
					var TestController1 = Controller.extend( {
						refs : {
							'ref1' : '#selector1',
							'ref2' : '#selector2'
						}
					} );
					
					var TestController2 = TestController1.extend( {
						refs : {
							'ref2' : '#selector2_new',
							'ref3' : '#selector3'
						}
					} );
					
					var TestController3 = TestController2.extend( {
						refs : {
							'ref3' : '#selector3_new',
							'ref4' : '#selector4'
						}
					} );
					
					var TestController4 = TestController3.extend( {
						// Note: no `refs` of its own
					} );
					
					var TestController5 = TestController4.extend( {
						refs : {
							'ref4' : '#selector4_new',
							'ref5' : '#selector5'
						}
					} );

					
					var controller1 = new TestController1( { view: view } );
					expect( controller1.refs ).toEqual( {
						'ref1' : { selector: '#selector1',     multiple: false, noCache: false },
						'ref2' : { selector: '#selector2',     multiple: false, noCache: false }
					} );
					
					var controller2 = new TestController2( { view: view } );
					expect( controller2.refs ).toEqual( {
						'ref1' : { selector: '#selector1',     multiple: false, noCache: false },
						'ref2' : { selector: '#selector2_new', multiple: false, noCache: false },
						'ref3' : { selector: '#selector3',     multiple: false, noCache: false }
					} );
					
					var controller3 = new TestController3( { view: view } );
					expect( controller3.refs ).toEqual( {
						'ref1' : { selector: '#selector1',     multiple: false, noCache: false },
						'ref2' : { selector: '#selector2_new', multiple: false, noCache: false },
						'ref3' : { selector: '#selector3_new', multiple: false, noCache: false },
						'ref4' : { selector: '#selector4',     multiple: false, noCache: false }
					} );
					
					var controller4 = new TestController4( { view: view } );
					expect( controller4.refs ).toEqual( {
						'ref1' : { selector: '#selector1',     multiple: false, noCache: false },
						'ref2' : { selector: '#selector2_new', multiple: false, noCache: false },
						'ref3' : { selector: '#selector3_new', multiple: false, noCache: false },
						'ref4' : { selector: '#selector4',     multiple: false, noCache: false }
					} );
					
					var controller5 = new TestController5( { view: view } );
					expect( controller5.refs ).toEqual( {
						'ref1' : { selector: '#selector1',     multiple: false, noCache: false },
						'ref2' : { selector: '#selector2_new', multiple: false, noCache: false },
						'ref3' : { selector: '#selector3_new', multiple: false, noCache: false },
						'ref4' : { selector: '#selector4_new', multiple: false, noCache: false },
						'ref5' : { selector: '#selector5',     multiple: false, noCache: false }
					} );

					controller1.destroy();
					controller2.destroy();
					controller3.destroy();
					controller4.destroy();
					controller5.destroy();
				} );
				
				
				it( "should accept the `refs` config of Controller subclasses, working correctly even if its superclasses do not have refs of their own", function() {
					var TestController1 = Controller.extend( {
						// Note: no refs of its own
					} );
					
					var TestController2 = TestController1.extend( {
						// Note: no refs of its own
					} );
					
					var TestController3 = TestController2.extend( {
						refs : {
							'ref1' : '#selector1',
							'ref2' : '#selector2'
						}
					} );

					var controller1 = new TestController1( { view: view } );
					expect( controller1.refs ).toEqual( {} );  // no refs

					var controller2 = new TestController2( { view: view } );
					expect( controller2.refs ).toEqual( {} );  // no refs
					
					var controller3 = new TestController3( { view: view } );
					expect( controller3.refs ).toEqual( {
						'ref1' : { selector: '#selector1', multiple: false, noCache: false },
						'ref2' : { selector: '#selector2', multiple: false, noCache: false }
					} );

					controller1.destroy();
					controller2.destroy();
					controller3.destroy();
				} );
				
			} );
			
		} );
		
		// ------------------------------------
		
		// References (Refs) Functionality
		
		
		describe( 'addRef()', function() {
			var view, controller;
			
			beforeEach( function() {
				view = new Component();
				controller = new Controller( {
					view : view
				} );
			} );
			
			afterEach( function() {
				view.destroy();
				controller.destroy();
			} );
			
			
			it( "should add a reference with no `options` argument, providing the defaults", function() {
				controller.addRef( 'myRef', '#myComponent' );
				expect( controller.refs[ 'myRef' ] ).toEqual( {
					selector : '#myComponent',
					multiple : false,
					noCache  : false
				} );
			} );
			
			
			it( "should add a reference with the provided `options`", function() {
				controller.addRef( 'myRef', '#myComponent', { multiple: true, noCache: true } );
				expect( controller.refs[ 'myRef' ] ).toEqual( {
					selector : '#myComponent',
					multiple : true,
					noCache  : true
				} );
			} );
			
			
			it( "should add a single reference when passed a `refs` configuration object", function() {
				controller.addRef( { 
					'myRef' : { selector: '#myComponent', multiple: true, noCache: true }
				} );
				
				expect( controller.refs[ 'myRef' ] ).toEqual( {
					selector : '#myComponent',
					multiple : true,
					noCache  : true
				} );
			} );
			
			
			it( "should add multiple references when passed a `refs` configuration object", function() {
				controller.addRef( {
					'myRef1' : '#myComponent1',
					'myRef2' : { selector: '#myComponent2' },
					'myRef3' : { selector: 'component', multiple: true, noCache: true }
				} );
				
				expect( controller.refs ).toEqual( {
					'myRef1' : { selector: '#myComponent1', multiple: false, noCache: false },
					'myRef2' : { selector: '#myComponent2', multiple: false, noCache: false },
					'myRef3' : { selector: 'component', multiple: true, noCache: true }
				} );
			} );
			
		} );
		
		
		
		describe( 'getRef()', function() {
			var view, cmps;
			
			beforeEach( function() {
				// Spy on the ComponentQuery singleton, to determine when the query() method is called
				// from the Controller, and when the cache is used
				spyOn( ComponentQuery, 'query' ).andCallThrough();
				
				cmps = [
					new Component( { id: 'cmp1' } ),
				    new Container( { id: 'cmp2' } ),
				    new Panel( { id: 'cmp3' } )
				];
				
				view = new Container( {
					items : cmps
				} );
			} );
			
			afterEach( function() {
				view.destroy();  // note: will destroy the child components
			} );
			
			
			it( "should return `null` for a 'singlular' reference when the selector does not match any components", function() {
				var controller = new Controller( { view: view } );
				controller.addRef( 'myCmp', '#nonExistentCmp' );
				
				expect( controller.getRef( 'myCmp' ) ).toBe( null );
				expect( ComponentQuery.query.calls.length ).toBe( 1 );
				
				// Check that another getRef() call uses the cache (i.e. doesn't call ComponentQuery.query() again)
				expect( controller.getRef( 'myCmp' ) ).toBe( null );
				expect( ComponentQuery.query.calls.length ).toBe( 1 );  // check that ComponentQuery.query() was still only called once, using the cache to return the reference
				
				controller.destroy();
			} );
			
			
			it( "should retrieve a 'singlular' reference to a component when the selector matches", function() {
				var controller = new Controller( { view: view } );
				controller.addRef( 'myCmp', '#cmp1' );
				
				expect( controller.getRef( 'myCmp' ) ).toBe( cmps[ 0 ] );
				expect( ComponentQuery.query.calls.length ).toBe( 1 );
				
				// Check that another getRef() call uses the cache (i.e. doesn't call ComponentQuery.query() again)
				expect( controller.getRef( 'myCmp' ) ).toBe( cmps[ 0 ] );
				expect( ComponentQuery.query.calls.length ).toBe( 1 );  // check that ComponentQuery.query() was still only called once, using the cache to return the reference
				
				controller.destroy();
			} );
			
			
			it( "should return an empty array for a 'multiple' reference when the selector does not match any components", function() {
				var controller = new Controller( { view: view } );
				controller.addRef( 'myCmp', '#nonExistentCmp', { multiple: true } );
				
				expect( controller.getRef( 'myCmp' ) ).toEqual( [] );
				expect( ComponentQuery.query.calls.length ).toBe( 1 );
				
				// Check that another getRef() call uses the cache (i.e. doesn't call ComponentQuery.query() again)
				expect( controller.getRef( 'myCmp' ) ).toEqual( [] );
				expect( ComponentQuery.query.calls.length ).toBe( 1 );  // check that ComponentQuery.query() was still only called once, using the cache to return the reference
				
				controller.destroy();
			} );
			
			
			it( "should retrieve a 'multiple' reference to components (an array) when the selector matches one or more components", function() {
				var controller = new Controller( { view: view } );
				controller.addRef( 'myContainers', 'container', { multiple: true } );  // look for all Containers
				
				expect( controller.getRef( 'myContainers' ) ).toEqual( [ view, cmps[ 1 ], cmps[ 2 ] ] );  // the view is also a Container, and hence is included
				expect( ComponentQuery.query.calls.length ).toBe( 1 );
				
				// Check that another getRef() call uses the cache (i.e. doesn't call ComponentQuery.query() again)
				expect( controller.getRef( 'myContainers' ) ).toEqual( [ view, cmps[ 1 ], cmps[ 2 ] ] );  // the view is also a Container, and hence is included
				expect( ComponentQuery.query.calls.length ).toBe( 1 );  // check that ComponentQuery.query() was still only called once, using the cache to return the reference
				
				controller.destroy();
			} );
			
		} );
		
		
		// ------------------------------------
		
		// Event Listening Functionality
		
		
		describe( 'listen()', function() {
			var view,
			    controller;
			
			beforeEach( function() {
				view = new Container();
				controller = new Controller( { view: view } );
			} );
			
			afterEach( function() {
				view.destroy();
				controller.destroy();
			} );
			
			
			it( "should add the listeners provided to the `listeners` map", function() {
				function doSomethingHandler( cmp ) {}
				function doSomethingElseHandler( cmp ) {}
				function cmpClickHandler( cmp ) {}
				function anchorClickHandler( anchor ) {}
				
				controller.listen( {
					'component' : {
						'dosomething'     : doSomethingHandler,
						'dosomethingelse' : doSomethingElseHandler,
						'click' : cmpClickHandler
					},
					'#myAnchor' : {
						'click' : anchorClickHandler
					}
				} );
				
				expect( controller.listeners ).toEqual( {
					'click' : [
						{ selector: 'component', handlerFn: cmpClickHandler },
						{ selector: '#myAnchor', handlerFn: anchorClickHandler }
					],
					'dosomething' : [
						{ selector: 'component', handlerFn: doSomethingHandler }
					],
					'dosomethingelse' : [
						{ selector: 'component', handlerFn: doSomethingElseHandler }
					]
				} );
			} );
			
		} );
		
		
		describe( 'onComponentEvent()', function() {
			var view,
			    component,
			    container,
			    panel,
			    controller;
			
			beforeEach( function() {
				component = new Component( { id: 'cmp1' } );
				container = new Container( { id: 'cmp2' } );
				panel = new Panel( { id: 'cmp3' } );
				
				view = new Container( {
					id : 'cmp0',
					
					items : [
						component,
						container,
						panel
					]
				} );
				
				controller = new Controller( { view: view } );
			} );
			
			afterEach( function() {
				view.destroy();  // note: will destroy the child components
				controller.destroy();
			} );
			
			
			it( "should call the appropriate handler function based on the listeners that have been set up, and the event that is fired", function() {
				var componentClickCount = 0,
				    panelClickCount = 0,
				    cmp2SomethingCount = 0;
				
				function componentClickHandler( component, arg1, arg2, arg3 ) {
					componentClickCount++;
					
					// Make sure args are passed correctly
					expect( component instanceof Component ).toBe( true );
					expect( arg1 ).toBe( 1 );
					expect( arg2 ).toBe( 2 );
					expect( arg3 ).toBe( 3 );
				}
				function panelClickHandler( panel ) {
					panelClickCount++;
					
					expect( panel instanceof Panel ).toBe( true );
				}
				function cmp2SomethingHandler( container, arg1, arg2, arg3 ) {
					cmp2SomethingCount++;
					
					// Make sure args are passed correctly
					expect( container instanceof Container ).toBe( true );
					expect( arg1 ).toBe( 1 );
					expect( arg2 ).toBe( 2 );
					expect( arg3 ).toBe( 3 );
				}
				
				controller.listen( {
					'component' : {
						'click' : componentClickHandler
					},
					'panel' : {
						'click' : panelClickHandler
					},
					'#cmp2' : {
						'something' : cmp2SomethingHandler
					}
				} );
				
				
				// Simulate 'click' on component
				component.fireEvent( 'click', component, 1, 2, 3 );
				expect( componentClickCount ).toBe( 1 );  // Component is a Panel superclass, so its selector matches
				
				// Simulate 'click' on panel
				panel.fireEvent( 'click', panel, 1, 2, 3 );
				expect( componentClickCount ).toBe( 2 );  // Component is a Panel superclass, so its selector matches, and its count increased
				expect( panelClickCount ).toBe( 1 );     
				expect( cmp2SomethingCount ).toBe( 0 );
				
				// Simulate 'something' event on #cmp2 (the Container)
				container.fireEvent( 'something', container, 1, 2, 3 );
				expect( componentClickCount ).toBe( 2 );  // remains unchanged
				expect( panelClickCount ).toBe( 1 );      // remains unchanged
				expect( cmp2SomethingCount ).toBe( 1 );
			} );
			
			
			it( "should return false if any handler returns false", function() {
				var componentClickCount = 0,
				    containerClickCount = 0,
				    panelClickCount = 0;
				
				controller.listen( {
					'component' : {
						'click' : function() {
							componentClickCount++;
						}
					},
					'container' : {
						'click' : function() {
							containerClickCount++;
							return false;
						}
					},
					'panel' : {
						'click' : function() {
							panelClickCount++;
						}
					}
				} );
				
				// Simulate 'click' on panel. All handlers should be fired, as the others match Panel superclasses.
				// The second handler (the 'container' handler) returns false, but all handlers should be called (as
				// order of handler registration should not matter).
				var returnVal = panel.fireEvent( 'click', panel );
				expect( componentClickCount ).toBe( 1 );
				expect( containerClickCount ).toBe( 1 );
				expect( panelClickCount ).toBe( 1 );
				expect( returnVal ).toBe( false );
			} );
			
			
			it( "should only call the handler function for a Component that matches a selector, *and* is either the `view` that the Controller is working with, or a descendant of it", function() {
				var componentClickCount = 0;
				
				var randomOtherComponent = new Component();
				
				controller.listen( {
					'component' : {
						'click' : function() {
							componentClickCount++;
						}
					}
				} );
				
				
				// Simulate 'click' event on the outer container; the `view` itself
				view.fireEvent( 'click' );
				expect( componentClickCount ).toBe( 1 );
				
				// Simulate 'click' event on the child component
				component.fireEvent( 'click' );
				expect( componentClickCount ).toBe( 2 );
				
				// Simulate 'click' event on the random "other" component
				randomOtherComponent.fireEvent( 'click' );
				expect( componentClickCount ).toBe( 2 );  // should not have changed; `randomOtherComponent` is not a component in the scope of the Controller's `view`
			} );
			
		} );
		
	} );
	
	
} );
		