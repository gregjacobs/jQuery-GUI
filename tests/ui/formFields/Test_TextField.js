Ext.test.Session.addSuite( 'ui.formFields', {
                                                 
    name: 'Kevlar.ui.formFields.TextField',
	
	
	setUp : function() {
		
	},
	

	// ---------------------------------
	
	
	items : [
		/*
		 * Test the 'change' Event
		 */
		{
			name : "Test the 'change' Event",
			
			"Setting the initial value to the field should *not* fire the 'change' event" : function() {
				for( var rendered = 0; rendered <= 1; rendered++ ) {
					var eventFired = false;
					
					var textField = new ui.formFields.TextField( {
						renderTo: ( rendered ) ? document.body : undefined,
						value : "test value",
						listeners : { 'change' : function() { eventFired = true; } } 
					} );
					
					Y.Assert.isFalse( eventFired, "rendered = " + !!rendered );
					
					textField.destroy();  // clean up
				}
			},
			
			
			"Setting the value after instantiation time should fire the 'change' event exactly once" : function() {
				for( var rendered = 0; rendered <= 1; rendered++ ) {
					var eventFiredCount = 0;
					
					var textField = new ui.formFields.TextField( {
						renderTo: ( rendered ) ? document.body : undefined,
						listeners : { 'change' : function() { eventFiredCount++; } }
					} );
					
					textField.setValue( "test value" );
					Y.Assert.areSame( 1, eventFiredCount, "rendered = " + !!rendered );
					
					textField.destroy();  // clean up
				}
			}
		},
					
		
		
		/*
		 * Test the Setting of the Initial Value
		 */
		{
			name : "Test the Setting of the Initial Value",
			
			
			"The initial value should be normalized into a string, even if its a non-string value" : function() {
				for( var rendered = 0; rendered <= 1; rendered++ ) {
					var textField = new ui.formFields.TextField( {
						renderTo: ( rendered ) ? document.body : undefined,
						value : undefined
					} );
					Y.Assert.areSame( "", textField.getValue(), "undefined should convert to empty string. rendered = " + !!rendered );
					textField.destroy();  // clean up
					
					
					var textField = new ui.formFields.TextField( {
						renderTo: ( rendered ) ? document.body : undefined,
						value : null
					} );
					Y.Assert.areSame( "", textField.getValue(), "null should convert to empty string. rendered = " + !!rendered );
					textField.destroy();  // clean up
					
					
					var textField = new ui.formFields.TextField( {
						renderTo: ( rendered ) ? document.body : undefined,
						value : 0
					} );
					Y.Assert.areSame( "0", textField.getValue(), "The number 0 should convert to its string representation. rendered = " + !!rendered ); 
					textField.destroy();  // clean up
					
					
					var textField = new ui.formFields.TextField( {
						renderTo: ( rendered ) ? document.body : undefined,
						value : 1
					} );
					Y.Assert.areSame( "1", textField.getValue(), "The number 1 should convert to its string representation. rendered = " + !!rendered );
					textField.destroy();  // clean up
					
					
					var textField = new ui.formFields.TextField( {
						renderTo: ( rendered ) ? document.body : undefined,
						value : true
					} );
					Y.Assert.areSame( "true", textField.getValue(), "The boolean true should convert to its string representation. rendered = " + !!rendered );
					textField.destroy();  // clean up
					
					
					var textField = new ui.formFields.TextField( {
						renderTo: ( rendered ) ? document.body : undefined,
						value : false
					} );
					Y.Assert.areSame( "false", textField.getValue(), "The boolean false should convert to its string representation. rendered = " + !!rendered );
					textField.destroy();  // clean up
					
					
					var textField = new ui.formFields.TextField( {
						renderTo: ( rendered ) ? document.body : undefined,
						value : ""
					} );
					Y.Assert.areSame( "", textField.getValue(), "A empty string value should have remained an empty string value. rendered = " + !!rendered );
					textField.destroy();  // clean up
					
					
					var textField = new ui.formFields.TextField( {
						renderTo: ( rendered ) ? document.body : undefined,
						value : "asdf"
					} );
					Y.Assert.areSame( "asdf", textField.getValue(), "A string value should have remained a string value. rendered = " + !!rendered );
					textField.destroy();  // clean up
					
					
					var textField = new ui.formFields.TextField( {
						renderTo: ( rendered ) ? document.body : undefined,
						value : {}
					} );
					Y.Assert.areSame( "[object Object]", textField.getValue(), "An object should have been converted to its string value (toString() called). rendered = " + !!rendered );
					textField.destroy();  // clean up
					
					
					var textField = new ui.formFields.TextField( {
						renderTo: ( rendered ) ? document.body : undefined,
						value : { toString: function() { return "my object"; } }
					} );
					Y.Assert.areSame( "my object", textField.getValue(), "An object should have been converted to its string value (toString() called). rendered = " + !!rendered );
					textField.destroy();  // clean up
				}
			},
			
			
			"Setting the initial value to characters that are HTML entities should work correctly" : function() {
				for( var rendered = 0; rendered <= 1; rendered++ ) {
					var textField = new ui.formFields.TextField( {
						renderTo : ( rendered ) ? document.body : undefined,
						value : "\"quoted\". stuff&stuff. this<that>those"
					} );
					
					Y.Assert.areSame( "\"quoted\". stuff&stuff. this<that>those", textField.getValue(), "rendered = " + !!rendered );
					
					textField.destroy();  // clean up
				}
			}
		},
			
		
		/*
		 * Test setValue()
		 */
		{
			name : "Test setValue()",
			
			
			"setValue() should normalize non-strings into strings" : function() {
				for( var rendered = 0; rendered <= 1; rendered++ ) {
					var textField = new ui.formFields.TextField( {
						renderTo: ( rendered ) ? document.body : undefined
					} );
					
					textField.setValue( undefined );
					Y.Assert.areSame( "", textField.getValue(), "undefined should have been converted into an empty string. rendered = " + !!rendered );
					
					textField.setValue( null );
					Y.Assert.areSame( "", textField.getValue(), "null should have been converted into an empty string. rendered = " + !!rendered );
					
					textField.setValue( 0 );
					Y.Assert.areSame( "0", textField.getValue(), "the number 0 should have been converted into its string form. rendered = " + !!rendered );
					
					textField.setValue( 1 );
					Y.Assert.areSame( "1", textField.getValue(), "the number 1 should have been converted into its string form. rendered = " + !!rendered );
					
					textField.setValue( true );
					Y.Assert.areSame( "true", textField.getValue(), "boolean true should have been converted into its string form. rendered = " + !!rendered );
					
					textField.setValue( false );
					Y.Assert.areSame( "false", textField.getValue(), "boolean false should have been converted into its string form. rendered = " + !!rendered );
					
					textField.setValue( "" );
					Y.Assert.areSame( "", textField.getValue(), "an empty string should have remained an empty string. rendered = " + !!rendered );
					
					textField.setValue( "asdf" );
					Y.Assert.areSame( "asdf", textField.getValue(), "any actual string should have remained the same. rendered = " + !!rendered );
					
					textField.setValue( {} );
					Y.Assert.areSame( "[object Object]", textField.getValue(), "an object should have been converted to its string form '[object Object]'. rendered = " + !!rendered );
					
					textField.setValue( { toString: function() { return "my object"; } } );
					Y.Assert.areSame( "my object", textField.getValue(), "an object with a toString() method should have been converted to its return value from its toString() method. rendered = " + !!rendered );
					
					// clean up
					textField.destroy(); 
				}
			}
		},
			
			
		/*
		 * Test normalizeValue()
		 */	
		{
			name : "Test normalizeValue()",
			
			"normalizeValue() should handle all datatypes" : function() {
				var normalizeValue = ui.formFields.TextField.prototype.normalizeValue;
				
				Y.Assert.areSame( "", normalizeValue( undefined ), "undefined should have been converted into an empty string" );
				Y.Assert.areSame( "", normalizeValue( null ), "null should have been converted into an empty string" );
				Y.Assert.areSame( "0", normalizeValue( 0 ), "the number 0 should have been converted into its string form" );
				Y.Assert.areSame( "1", normalizeValue( 1 ), "the number 1 should have been converted into its string form" );
				Y.Assert.areSame( "true", normalizeValue( true ), "boolean true should have been converted into its string form" );
				Y.Assert.areSame( "false", normalizeValue( false ), "boolean false should have been converted into its string form" );
				Y.Assert.areSame( "", normalizeValue( "" ), "an empty string should have remained an empty string" );
				Y.Assert.areSame( "asdf", normalizeValue( "asdf" ), "any actual string should have remained the same" );
				Y.Assert.areSame( "[object Object]", normalizeValue( {} ), "an object should have been converted to its string form '[object Object]'" );
				Y.Assert.areSame( "my object", normalizeValue( { toString: function() { return "my object"; } } ), "an object with a toString() method should have been converted to its return value from its toString() method" );
			}
		},
			
			
		
		/*
		 * Test the emptyText functionality
		 */
		{
			name : "Test the emptyText functionality",
			
			"A TextField with emptyText and no initial value should initially have the value of the emptyText" : function() {
				for( var rendered = 0; rendered <= 1; rendered++ ) {
					var textField = new ui.formFields.TextField( {
						renderTo: ( rendered ) ? document.body : undefined,
						emptyText : "test empty text"
					} );
					
					Y.Assert.areSame( "test empty text", textField.getValue(), "rendered = " + !!rendered );
					
					textField.destroy();  // clean up
				}
			},
			
			
			"A TextField which has emptyText and restoreEmptyText=false, and then is set to empty string afterward should return empty string" : function() {
				for( var rendered = 0; rendered <= 1; rendered++ ) {
					var textField = new ui.formFields.TextField( {
						renderTo: ( rendered ) ? document.body : undefined,
						emptyText : "test empty text",
						restoreEmptyText: false
					} );
					
					// Set to empty string after initialization
					textField.setValue( "" );
					Y.Assert.areSame( "", textField.getValue(), "rendered = " + !!rendered );
					
					textField.destroy();  // clean up
				}
			}
		}
	]
	
} );