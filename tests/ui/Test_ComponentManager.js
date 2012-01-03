Ext.test.Session.addTest( 'Kevlar.ui', {
                                                 
	name: 'Kevlar.ui.ComponentManager',
	
	
	setUp : function() {
		// first, store the current componentClasses hash to play nice with other tests
		this.componentClasses = ui.ComponentManager.componentClasses;
		
		// then, reset the componentClasses hash for tests
		ui.ComponentManager.componentClasses = {};
	},
	
	tearDown : function() {
		// restore the componentClasses hash
		ui.ComponentManager.componentClasses = this.componentClasses;
	},
	
	
	//////////////////////////////////////
	//       Special Instructions
	//////////////////////////////////////
	_should : {
		error : {
			"registerType() should throw an error when trying to register a type name that is already registered" : "Error: ui.ComponentManager already has a type 'someclass'",
			"create() should throw an error for an unknown type" : "ComponentManager.create(): Unknown type: 'non-existent-type'"
		} 
	},
	
	
	// ---------------------------------------------------------


	/*
	 * Test ui.ComponentManager.registerType
	 */
	test_registerType : function() {
		// Test initial state
		Y.Assert.isFalse( ui.ComponentManager.hasType( 'someClass' ), "ComponentManager should not initially have type 'someClass'." );
		
		// Test registering a new type, and that its type name is stored in all lower case (for case-insensitivity)
		var someClass = function() {};
		ui.ComponentManager.registerType( 'someClass', someClass );
		Y.Assert.isTrue( ui.ComponentManager.hasType( 'someClass' ), "ComponentManager should now have type 'someClass'." );
		Y.Assert.areSame( ui.ComponentManager.componentClasses[ 'someclass' ], someClass, "registerType did not add type name in all lowercase characters." );  // directly access the 'componentClasses' object for this test to make sure
	},
	
	
	
	"registerType() should throw an error when trying to register a type name that is already registered" : function() {
		var class1 = function() {},
		    class2 = function() {};
			
		ui.ComponentManager.registerType( 'someClass', class1 );  // register the first class
		ui.ComponentManager.registerType( 'someClass', class2 );  // try to register the second class under the same "type" name. This should throw an error
	},
	
	
	
	/*
	 * Test ui.ComponentManager.getType
	 */
	test_getType : function() {
		var someClass = function() { this.value = 1; };
		ui.ComponentManager.registerType( 'someClass', someClass );
		Y.Assert.isTrue( ui.ComponentManager.hasType( 'someClass' ), "ComponentManager should now have type 'someClass'." );
		Y.Assert.areEqual( someClass, ui.ComponentManager.getType( 'someClass' ), "getType() not returning the constructor function for 'someClass'" );
	},
	
	
	
	/*
	 * Test ui.ComponentManager.hasType
	 */
	test_hasType : function() {
		// Test initial state
		Y.Assert.isFalse( ui.ComponentManager.hasType( 'someClass' ), "ComponentManager should not initially have type 'someClass'." );
		
		// Test adding a class
		var someClass = function() { this.value = 1; };
		ui.ComponentManager.registerType( 'someClass', someClass );
		Y.Assert.isTrue( ui.ComponentManager.hasType( 'someClass' ), "ComponentManager should now have type 'someClass'." );
		
		// Make sure that hasType returns true, regardless of the casing of the type name
		Y.Assert.isTrue( ui.ComponentManager.hasType( 'SomeClass' ), "hasType should have returned true for case-insensitive type name (1)." );
		Y.Assert.isTrue( ui.ComponentManager.hasType( 'someclass' ), "hasType should have returned true for case-insensitive type name (2)." );
		Y.Assert.isTrue( ui.ComponentManager.hasType( 'sOmEClAsS' ), "hasType should have returned true for case-insensitive type name (3)." );		
		
		// Make sure the following falsy values return false, in the case of an undefined property and such
		Y.Assert.isFalse( ui.ComponentManager.hasType( undefined ), "hasType should have returned false for undefined type name." );
		Y.Assert.isFalse( ui.ComponentManager.hasType( null ), "hasType should have returned false for null type name." );
		Y.Assert.isFalse( ui.ComponentManager.hasType( false ), "hasType should have returned false for boolean false type name." );
		Y.Assert.isFalse( ui.ComponentManager.hasType( "" ), "hasType should have returned false for an empty string type name." );
	},
	
	
	
	/*
	 * Test ui.ComponentManager.create
	 */
	test_create : function() {
		// Test that already-instantiated components are returned directly
		var myComponent = new ui.Component();
		var cmp = ui.ComponentManager.create( myComponent );
		Y.Assert.areSame( myComponent, cmp, "create() did not return already-instantiated Component directly." );
		
		// Test that subclasses of Component are returned directly
		var myContainer = new ui.Container();
		var cmp = ui.ComponentManager.create( myContainer );
		Y.Assert.areSame( myContainer, cmp, "create() did not return already-instantiated subclass of Component directly." );
		
		
		// Test creating Components from config objects
		var someClass = Kevlar.extend( ui.Component, { 
			constructor : function() { this.value = 1; }
		} );
		ui.ComponentManager.registerType( 'someClass', someClass );
		
		var cmp = ui.ComponentManager.create( {
			type : 'someClass'
		} );
		Y.Assert.isInstanceOf( ui.Component, cmp, "create() did not instantiate 'someClass' via config object." );
		
		
		// Test that an ui.Container is created when no 'type' config is specified
		ui.ComponentManager.registerType( 'Container', ui.Container );  // need to re-register the Container class for this test.
		var cmp = ui.ComponentManager.create( {} );
		Y.Assert.isInstanceOf( ui.Container, cmp, "create() did not instantiate a Container via config object with no type property." );
	},
	
	
	"create() should throw an error for an unknown type" : function() {
		var cmp = ui.ComponentManager.create( {
			type : 'non-existent-type'
		} );
	}

} );