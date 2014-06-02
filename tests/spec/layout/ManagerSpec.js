/*global define, describe, it, beforeEach, afterEach, expect */
/*jshint sub: true */
define( [
	'gui/layout/Manager',
	'gui/layout/Layout',
	'gui/layout/Auto'
], function( LayoutManager, Layout, AutoLayout ) {
	
	describe( 'gui.layout.LayoutManager', function() {
		var layoutClasses;   // for restoring the previous list of layout classes that have been registered, after the tests
		
		var ConcreteLayout = Layout.extend( {} );
		
		beforeEach( function() {
			// first, store the current layoutClasses hash to play nice with other tests
			layoutClasses = LayoutManager.layoutClasses;
			
			// then, reset the layoutClasses map for tests
			LayoutManager.layoutClasses = {};
		} );
		
		afterEach( function() {
			// restore the layoutClasses map
			LayoutManager.layoutClasses = layoutClasses;
		} );
		
		
		// ---------------------------------------------------------
	
		describe( 'registerType()', function() {
			
			it( "should register a layout subclass", function() {
				// Test initial state
				expect( LayoutManager.hasType( 'someClass' ) ).toBe( false );  // LayoutManager should not initially have type 'someClass'.
				
				// Test registering a new type, and that its type name is stored in all lower case (for case-insensitivity)
				var someClass = function() {};
				LayoutManager.registerType( 'someClass', someClass );
				expect( LayoutManager.hasType( 'someClass' ) ).toBe( true );  // LayoutManager should now have type 'someClass'.
				expect( someClass ).toBe( LayoutManager.layoutClasses[ 'someclass' ] );  // registerType did not add type name in all lowercase characters.  // directly access the 'layoutClasses' object for this test to make sure
			} );
		
		
			it( "should throw an error when trying to register a type name that is already registered", function() {
				var class1 = function() {},
				    class2 = function() {};
					
				LayoutManager.registerType( 'someClass', class1 );  // register the first class
				
				expect( function() {
					LayoutManager.registerType( 'someClass', class2 );  // try to register the second class under the same "type" name. This should throw an error
					
				} ).toThrow( "Error: gui.layout.Manager already has a type 'someclass'" );
			} );
		
		} );
		
		
		describe( 'getType()', function() {
			
			it( "should throw an error when trying to retrieve an unregistered layout `type`", function() {
				expect( function() {
					LayoutManager.getType( "nonExistentType" );
				} ).toThrow( "The layout class with type name 'nonexistenttype' has not been registered. Make sure that the layout " +
				             "exists, and has been 'required' by a RequireJS require() or define() call" );
			} );
			
			
			it( "should retrieve a Component subclass based on its type name", function() {
				var someClass = function() { this.value = 1; };
				LayoutManager.registerType( 'someClass', someClass );
				
				expect( LayoutManager.hasType( 'someClass' ) ).toBe( true );       // LayoutManager should now have type 'someClass'.
				expect( LayoutManager.getType( 'someClass' ) ).toBe( someClass );  // getType() not returning the constructor function for 'someClass'
				expect( LayoutManager.getType( 'SoMeClaSS' ) ).toBe( someClass );  // test mixed case
			} );
			
		} );
		
		
		describe( 'hasType()', function() {
			
			it( "should determine if a class with the given type name is registered or not", function() {
				// Test initial state
				expect( LayoutManager.hasType( 'someClass' ) ).toBe( false );  // LayoutManager should not initially have type 'someClass'.
				
				// Test adding a class
				var someClass = function() { this.value = 1; };
				LayoutManager.registerType( 'someClass', someClass );
				expect( LayoutManager.hasType( 'someClass' ) ).toBe( true );  // LayoutManager should now have type 'someClass'.
				
				// Make sure that hasType returns true, regardless of the casing of the type name
				expect( LayoutManager.hasType( 'SomeClass' ) ).toBe( true );  // hasType should have returned true for case-insensitive type name (1).
				expect( LayoutManager.hasType( 'someclass' ) ).toBe( true );  // hasType should have returned true for case-insensitive type name (2).
				expect( LayoutManager.hasType( 'sOmEClAsS' ) ).toBe( true );  // hasType should have returned true for case-insensitive type name (3).		
				
				// Make sure the following falsy values return false, in the case of an undefined property and such
				expect( LayoutManager.hasType( undefined ) ).toBe( false );  // hasType should have returned false for undefined type name.
				expect( LayoutManager.hasType( null ) ).toBe( false );       // hasType should have returned false for null type name.
				expect( LayoutManager.hasType( false ) ).toBe( false );      // hasType should have returned false for boolean false type name.
				expect( LayoutManager.hasType( "" ) ).toBe( false );         // hasType should have returned false for an empty string type name.
			} );
			
		} );
			
			
		describe( 'create()', function() {
			
			it( "should simply return an already-instantiated layout", function() {
				var myLayout = new ConcreteLayout();
				var layout = LayoutManager.create( myLayout );
				
				expect( layout ).toBe( myLayout );  // create() returned already-instantiated Layout directly.
			} );
			
			
			it( "should simply return an already-instantiated layout, if the layout is a subclass of gui.layout.Layout", function() {
				// Test that subclasses of Layout are returned directly
				var MyLayoutSubclass = Layout.extend( {} );
				LayoutManager.registerType( 'mylayoutsubclass', MyLayoutSubclass );
				
				var myLayoutSubclass = new MyLayoutSubclass();
				var layout = LayoutManager.create( myLayoutSubclass );
				
				expect( layout ).toBe( myLayoutSubclass );  // create() returned already-instantiated subclass of Layout directly.
			} );
			
			
			it( "should create an instance of a Layout from an anonymous config object with a given type name", function() {
				var SomeLayoutClass = Layout.extend( {} );
				LayoutManager.registerType( 'someLayoutClass', SomeLayoutClass );
				
				var layout = LayoutManager.create( {
					type : 'someLayoutClass'
				} );
				expect( layout instanceof SomeLayoutClass ).toBe( true );
			} );
			
			
			it( "should create the type `gui.layout.Auto` when no 'type' config is specified in the anonymous config object", function() { 
				LayoutManager.registerType( 'auto', AutoLayout );  // need to re-register the AutoLayout class for this test.
				
				var layout = LayoutManager.create( {} );
				expect( layout instanceof AutoLayout ).toBe( true );
			} );
			
		
			it( "should throw an error for an unknown type name", function() {
				expect( function() {
					var layout = LayoutManager.create( {
						type : 'non-existent-type'
					} );
					
				} ).toThrow( "The layout class with type name 'non-existent-type' has not been registered. Make sure that the layout " +
                             "exists, and has been 'required' by a RequireJS require() or define() call" );
			} );
			
		} );
	} );
} );