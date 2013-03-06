tests.unit.ui.add( new Ext.test.Case( {
                                                 
    name: 'ui.ButtonSet',
	
	
	setUp : function() {
		
	},
	
	
	_should : {
		error : {
			"ButtonSet should error if not provided any options" : "Error: The ButtonSet's 'options' was not configured."
		}
	},
	
	
	
	// -------------------------
	
	// Initialization
	
	"ButtonSet should error if not provided any options" : function() {
		var buttonSet = new ui.ButtonSet();  // no "options" provided. Should error.
	},
	
	
	"A ButtonSet with no initial value should have the value of its first option" : function() {
		for( var rendered = 0; rendered <= 1; rendered++ ) {
			var buttonSet = new ui.ButtonSet( {
				renderTo : ( !rendered ) ? undefined : document.body,
				
				options : [
					{ text: "text1", value: "value1" },
					{ text: "text2", value: "value2" }
				]
			} );
			
			Y.Assert.areSame( "value1", buttonSet.getValue(), "rendered = " + !!rendered );
			buttonSet.destroy();
		}
	},
	
	
	"A ButtonSet with an initial value should use that value" : function() {
		for( var rendered = 0; rendered <= 1; rendered++ ) {
			var buttonSet = new ui.ButtonSet( {
				renderTo : ( !rendered ) ? undefined : document.body,
				
				value: "value2",
				options : [
					{ text: "text1", value: "value1" },
					{ text: "text2", value: "value2" }
				]
			} );
			
			Y.Assert.areSame( "value2", buttonSet.getValue(), "rendered = " + !!rendered );
			buttonSet.destroy();
		}
	},
	
	
	"A ButtonSet with an invalid initial value should use the value of its first option" : function() {
		for( var rendered = 0; rendered <= 1; rendered++ ) {
			var buttonSet = new ui.ButtonSet( {
				renderTo : ( !rendered ) ? undefined : document.body,
				
				value: "Invalid-Value",
				options : [
					{ text: "text1", value: "value1" },
					{ text: "text2", value: "value2" }
				]
			} );
			
			Y.Assert.areSame( "value1", buttonSet.getValue(), "rendered = " + !!rendered );
			buttonSet.destroy();
		}
	},
	
	
	// -------------------------
	
	// 'change' event tests
	
	"Setting the initial value of the ButtonSet should *not* fire the 'change' event" : function() {
		for( var rendered = 0; rendered <= 1; rendered++ ) {
			var eventFired = false;
			
			var buttonSet = new ui.ButtonSet( {
				renderTo : ( !rendered ) ? undefined : document.body,
				
				value: "value2",
				options : [
					{ text: "text1", value: "value1" },
					{ text: "text2", value: "value2" }
				],
				listeners : { 'change' : function() { eventFired = true; } } 
			} );
			
			Y.Assert.isFalse( eventFired, "rendered = " + !!rendered );
			
			buttonSet.destroy();  // clean up
		}
	},
	
	
	"Setting the value after instantiation time should fire the 'change' event exactly once" : function() {
		for( var rendered = 0; rendered <= 1; rendered++ ) {
			var eventFiredCount = 0;
			
			var buttonSet = new ui.ButtonSet( {
				renderTo : ( !rendered ) ? undefined : document.body,
				
				options : [
					{ text: "text1", value: "value1" },
					{ text: "text2", value: "value2" }
				],
				listeners : { 'change' : function() { eventFiredCount++; } }
			} );
			
			buttonSet.setValue( "value2" );
			Y.Assert.areSame( 1, eventFiredCount, "rendered = " + !!rendered );
			
			buttonSet.destroy();  // clean up
		}
	},
	
	
	
	// -------------------------
	
	// Getting / Setting
	
	"ButtonSet should accept options with values with datatypes other than strings, and use them to compare values against with the identity operator (===)" : function() {		
		for( var rendered = 0; rendered <= 1; rendered++ ) {
			var buttonSet = new ui.ButtonSet( {
				renderTo : ( !rendered ) ? undefined : document.body,
				
				options : [
					{ text: "boolean1", value: true },
					{ text: "boolean2", value: false },
					{ text: "string1", value: "" },
					{ text: "string2", value: "hi" },
					{ text: "number1", value: 0 },
					{ text: "number2", value: 1 }
				]
			} );
			
			// Initial value
			Y.Assert.isTrue( buttonSet.getValue(), "Initial value should be true. rendered = " + !!rendered );
			
			// Set booleans
			buttonSet.setValue( false );
			Y.Assert.isFalse( buttonSet.getValue(), "ButtonSet should be able to be set to false. rendered = " + !!rendered );
			buttonSet.setValue( true );
			Y.Assert.isTrue( buttonSet.getValue(), "ButtonSet should be able to be set to true. rendered = " + !!rendered );
			
			// Set strings
			buttonSet.setValue( "" );
			Y.Assert.areSame( "", buttonSet.getValue(), "ButtonSet should be able to be set to an empty string. rendered = " + !!rendered );
			buttonSet.setValue( "hi" );
			Y.Assert.areSame( "hi", buttonSet.getValue(), "ButtonSet should be able to be set to 'hi'. rendered = " + !!rendered );
			
			// Set numbers
			buttonSet.setValue( 0 );
			Y.Assert.areSame( 0, buttonSet.getValue(), "ButtonSet should be able to be set to the number 0. rendered = " + !!rendered );
			buttonSet.setValue( 1 );
			Y.Assert.areSame( 1, buttonSet.getValue(), "ButtonSet should be able to be set to the number 1. rendered = " + !!rendered );
			
			buttonSet.destroy();
		}
	}
	
	
} ) );