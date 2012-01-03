Ext.test.Session.addTest( 'Kevlar.data', {
												 
	name: 'Kevlar.data.Field',
	
	
	setUp : function() {
		
	},
	
	
	// --------------------------------
	//        Special Instructions
	// --------------------------------
	_should : {
		error : {
			"Instantiating a Field without a 'name' should throw an error" : "no 'name' property provided to Kevlar.data.Field constructor",
			"Instantiating a Field with an undefined 'name' argument should throw an error" : "no 'name' property provided to Kevlar.data.Field constructor",
			"Instantiating a Field with an undefined 'name' property should throw an error" : "no 'name' property provided to Kevlar.data.Field constructor",
			"Instantiating a Field with a null 'name' argument should throw an error" : "no 'name' property provided to Kevlar.data.Field constructor",
			"Instantiating a Field with a null 'name' property should throw an error" : "no 'name' property provided to Kevlar.data.Field constructor",
			"Instantiating a Field with an empty 'name' argument should throw an error" : "no 'name' property provided to Kevlar.data.Field constructor",
			"Instantiating a Field with an empty 'name' property should throw an error" : "no 'name' property provided to Kevlar.data.Field constructor"
		}
	},
	
	
	
	// --------------------------------
	//             Tests
	// --------------------------------
	
	
	// Check that the name property was provided
	
	"Instantiating a Field without a 'name' should throw an error" : function() {
		var field = new Kevlar.data.Field();
	},
	
	
	"Instantiating a Field with an undefined 'name' argument should throw an error" : function() {
		var field = new Kevlar.data.Field( undefined );
	},
	
	
	"Instantiating a Field with an undefined 'name' property should throw an error" : function() {
		var field = new Kevlar.data.Field( {
			name : undefined
		} );
	},
	
	
	"Instantiating a Field with a null 'name' argument should throw an error" : function() {
		var field = new Kevlar.data.Field( null );
	},
	
	
	"Instantiating a Field with a null 'name' property should throw an error" : function() {
		var field = new Kevlar.data.Field( {
			name : null
		} );
	},
	
	
	"Instantiating a Field with an empty 'name' argument should throw an error" : function() {
		var field = new Kevlar.data.Field( "" );
	},
	
	
	"Instantiating a Field with an empty 'name' property should throw an error" : function() {
		var field = new Kevlar.data.Field( {
			name : ""
		} );
	},
	
	
	
	// Check that the 'name' property can be retrieved by getName()
	
	"The name property should be retrievable by getName()" : function() {
		var field1 = new Kevlar.data.Field( { name: 'testName' } );
		Y.Assert.areSame( 'testName', field1.getName(), "getName() not properly retriving Field's name. Was looking for 'testName'." );
		
		var field2 = new Kevlar.data.Field( { name: '_' } );
		Y.Assert.areSame( '_', field2.getName(), "getName() not properly retriving Field's name. Was looking for '_'." );
		
		var field3 = new Kevlar.data.Field( { name: "abc" } );
		Y.Assert.areSame( "abc", field3.getName(), "getName() not properly retriving Field's name. Was looking for 'abc'." );
	},
	
	
	// Make sure a number provided to the constructor as the 'name' is converted to a string datatype
	
	"Providing the field name as a number directly to the constructor argument should be converted to a string for the field's name" : function() {
		var field = new Kevlar.data.Field( 0 );
		Y.Assert.areSame( "0", field.getName(), "the field name should have been converted to a string" );
	},
	
	"Providing the field name as a property on the config should be converted to a string for the field's name" : function() {
		var field = new Kevlar.data.Field( {
			name : 0
		} );
		Y.Assert.areSame( "0", field.getName(), "the field name should have been converted to a string" );
	},
	
	
	// --------------------------------------
	
	
	// Check that defaultValue is handled correctly
	
	"A default provided as the keyword 'default' should be accepted properly as defaultValue" : function() {
		var field = new Kevlar.data.Field( {
			name : "TestField",
			'default' : 1
		} );
		
		Y.Assert.areSame( 1, field.defaultValue );
	},
	
	
	"A default provided as the keyword 'default' that is a function should be executed and set properly to defaultValue" : function() {
		var field = new Kevlar.data.Field( {
			name : "TestField",
			'default' : function() { return 1; }
		} );
		
		Y.Assert.areSame( 1, field.defaultValue );
	},
	
	
	"A default provided as defaultValue should be accepted properly" : function() {
		var field = new Kevlar.data.Field( {
			name : "TestField",
			defaultValue : 1
		} );
		
		Y.Assert.areSame( 1, field.defaultValue );
	},
	
	
	"A default provided as defaultValue that is a function should be executed and set properly to defaultValue" : function() {
		var field = new Kevlar.data.Field( {
			name : "TestField",
			defaultValue : function() { return 1; }
		} );
		
		Y.Assert.areSame( 1, field.defaultValue );
	},
	
	
	"A defaultValue provided as an object should be recursed for functions, and those functions' return values should be used in the default" : function() {
		var field = new Kevlar.data.Field( {
			name : 'TestField',
			'default' : { 
				a : "A",
				b : {
					innerB1 : function() {
						return "B1";
					},
					innerB2 : "B2"
				},
				c : {
					innerC1 : "C",
					innerC2 : function() {
						return "C2";
					}
				}
			}
		} );
		var defaultData = field.defaultValue;
		Y.Assert.areSame( "A", defaultData.a, "The 'default' config provided as an object should have had the value 'A' for property 'a'." );
		Y.Assert.areSame( "B1", defaultData.b.innerB1, "The 'default' config provided as an object should have been recursed for functions, and their return values used as the properties." );
		Y.Assert.areSame( "C2", defaultData.c.innerC2, "The 'default' config provided as an object should have been recursed for functions, and their return values used as the properties." );
	}
	
} );
