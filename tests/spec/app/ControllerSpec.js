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
		
		describe( 'addRef()', function() {
			var view;
			
			beforeEach( function() {
				view = new Component();
			} );
			
			afterEach( function() {
				view.destroy();
			} );
			
			
			it( "should add a reference with no `options` argument, providing the defaults", function() {
				var controller = new Controller( {
					view : view
				} );
				
				controller.addRef( 'myRef', '#myComponent' );
				expect( controller.refs[ 'myRef' ] ).toEqual( {
					selector : '#myComponent',
					multiple : false,
					noCache  : false
				} );
				
				controller.destroy();  // clean up
			} );
			
			
			it( "should add a reference with the provided `options`", function() {
				var controller = new Controller( {
					view : view
				} );
				
				controller.addRef( 'myRef', '#myComponent', { multiple: true, noCache: true } );
				expect( controller.refs[ 'myRef' ] ).toEqual( {
					selector : '#myComponent',
					multiple : true,
					noCache  : true
				} );
				
				controller.destroy();  // clean up
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
		