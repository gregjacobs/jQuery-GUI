/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
/*jshint sub:true */
define( [
	'lodash',
	'jqc/ComponentQuery',
	'jqc/app/Controller',
	
	'jqc/Component',     // type: 'component'
	'jqc/Container',     // type: 'container'
	'jqc/panel/Panel'   // type: 'panel
], function( _, ComponentQuery, Controller, Component, Container, Panel ) {
	
	describe( 'jqc.app.Controller', function() {
		
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
		
	} );
	
	
} );
		