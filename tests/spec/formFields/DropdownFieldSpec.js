/*global tests, Ext, Y, jQuery, Jux, ui */
ui.formFields.DropdownFieldTest = Jux.extend( Ext.test.Case, {
	
	setUp : function() {
		
	},
	
	
	// "enum" for the two checks that each test performs
	testModes : [ 'unrendered', 'rendered' ]
	
} );


tests.unit.ui.formFields.add( new Ext.test.Suite( {
                                                 
    name: 'DropdownField',
	
	
	items : [
		
		/*
		 * Test Initialization
		 */
		new ui.formFields.DropdownFieldTest( {
			name : "Test Initialization",
			
			
			// Tests with no options
			
			"The initial value for the field with no 'value' config, and no options, should be undefined" : function() {				
				for( var rendered = 0; rendered <= 1; rendered++ ) {
					var field = new ui.formFields.DropdownField( {
						renderTo : ( rendered === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						options : []
					} );
					
					Y.Assert.isUndefined( field.getValue(), "The value should be undefined. testMode = " + this.testModes[ rendered ] );			
					field.destroy();  // clean up
				}
			},
			
			
			"The initial value for the field with a 'value' config, but no options, should be undefined" : function() {
				for( var rendered = 0; rendered <= 1; rendered++ ) {
					var field = new ui.formFields.DropdownField( {
						renderTo : ( rendered === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						options : [],
						
						value: 42
					} );
					
					Y.Assert.isUndefined( field.getValue(), "The value should be undefined. testMode = " + this.testModes[ rendered ] );			
					field.destroy();  // clean up
				}
			},
			
			
			// ---------------------------
			
			// Tests with options
			
			
			"The initial value for the field with no 'value' config, but which has options, should be the value of the first option" : function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with no initial value config
					var field = new ui.formFields.DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						options : [
							{ text: "Option 1", value: "value1" }, 
							{ text: "Option 2", value: "value2" }, 
							{ text: "Option 3", value: "value3" }, 
							{ text: "Option 4", value: "value4" }, 
							{ text: "Option 5", value: "value5" }
						]
					} );
					
					Y.Assert.areSame( "value1", field.getValue(), "The initial value for the field with no 'value' config should have been the value of the first option ('value1'). testMode = " + this.testModes[ testNum ] );			
					field.destroy();  // clean up
				}
			},
			
			
			"The initial value for the field with a 'value' config that does not exist should have the value of the first option" : function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with a non-existent value config
					var field = new ui.formFields.DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						
						value : 'non-existent',
						options : [ 
							{ text: "Option 1", value: "value1" }, 
							{ text: "Option 2", value: "value2" }	
						]
					} );
					
					Y.Assert.areSame( "value1", field.getValue(), "The initial value for the field with a 'value' config that does not exist should have been the value of the first option ('value1'). testMode = " + this.testModes[ testNum ] );
					field.destroy();  // clean up
				}
			},
			
			
			"The initial value for the field with a 'value' config of 'value1' should have the value of the first option" : function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with a valid value config of the first option
					var field = new ui.formFields.DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						
						value : 'value1',
						options : [ 
							{ text: "Option 1", value: "value1" }, 
							{ text: "Option 2", value: "value2" }	
						]
					} );
					
					Y.Assert.areSame( "value1", field.getValue(), "The initial value for the field with a 'value' config of 'value1' should have been the value of the first option ('value1'). testMode = " + this.testModes[ testNum ] );
					field.destroy();  // clean up
				}
			},
			
			
			"The initial value for the field with a 'value' config of 'value2' should have the value of the second option" : function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with a valid value config of the second option
					var field = new ui.formFields.DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						
						value : 'value2',
						options : [ 
							{ text: "Option 1", value: "value1" }, 
							{ text: "Option 2", value: "value2" }	
						]
					} );
					
					Y.Assert.areSame( "value2", field.getValue(), "The initial value for the field with a 'value' config of 'value2' should have been the value of the second option ('value2'). testMode = " + this.testModes[ testNum ] );
					field.destroy();  // clean up
				}
			},
			
			
			"The initial value for the field with a 'value' config of (as a Number) 2 should have the value of the second option (2)" : function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with a valid value config that is a number, and the dropdown option is a number.
					var field = new ui.formFields.DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						
						value : 2,
						options : [ 
							{ text: "Option 1", value: 1 }, 
							{ text: "Option 2", value: 2 }
						]
					} );
					
					Y.Assert.areSame( 2, field.getValue(), "The initial value for the field with a 'value' config of (as a number) 2 should have been the value of the second option (2). testMode = " + this.testModes[ testNum ] );
					field.destroy();  // clean up
				}
			},
			
			
			"The initial value for the field with a 'value' config of (as a String) '2' should have the value of the second option ('2')." : function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with a valid value config that is a number, and the dropdown option is a string that holds the same number.
					var field = new ui.formFields.DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						
						value : "2",
						options : [ 
							{ text: "Option 1", value: "1" }, 
							{ text: "Option 2", value: "2" }
						]
					} );
					
					Y.Assert.areSame( "2", field.getValue(), "The initial value for the field with a 'value' config of \"2\" should have been the value of the second option (\"2\"). The comparison should have matched the string of the number. testMode = " + this.testModes[ testNum ] );
					field.destroy();  // clean up
				}
			},
			
			
			"The initial value for the field with a 'value' config of '2' should have the value of the second option" : function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with a valid value config that is a string, and the dropdown option is a number.
					var field = new ui.formFields.DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						
						value : 2,
						options : [ 
							{ text: "Option 1", value: 1 }, 
							{ text: "Option 2", value: 2 }
						]
					} );
					
					Y.Assert.areSame( 2, field.getValue(), "The initial value for the field with a 'value' config of 2 should have been the value of the second option (2). testMode = " + this.testModes[ testNum ] );
					field.destroy();  // clean up
				}
			}
		} ),
		
		
		
		/*
		 * Test setValue()
		 */
		new ui.formFields.DropdownFieldTest( {
			name : "Test setValue()",
			
			
			"The value should not be set with 'non-existent' value." : function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with no initial value config, and trying to set to a non-existent value
					var field = new ui.formFields.DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						options : [
							{ text: "Option 1", value: "value1" }, 
							{ text: "Option 2", value: "value2" }	
						]
					} );
					
					field.setValue( 'non-existent' );
					Y.Assert.areSame( "value1", field.getValue(), "The value should not have been set with 'non-existent' value. getValue() should have returned the value of the first option ('value1'). testMode = " + this.testModes[ testNum ] );			
					field.destroy();  // clean up
				}
			},
			
			
			"The value should be set to the second option ('value2') with no initial value." : function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with no initial value config, and trying to set to "value2"
					var field = new ui.formFields.DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						options : [
							{ text: "Option 1", value: "value1" }, 
							{ text: "Option 2", value: "value2" }	
						]
					} );
					
					field.setValue( 'value2' );
					Y.Assert.areSame( "value2", field.getValue(), "The value should have been set to the second option ('value2') with no initial value. testMode = " + this.testModes[ testNum ] );			
					field.destroy();  // clean up
				}
			},
			
			
			"The value should be set to the first option ('value1') when the initial option was 'value2'." : function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with an initial value of "value2", and trying to set to "value1"
					var field = new ui.formFields.DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						
						value : "value2",
						options : [
							{ text: "Option 1", value: "value1" }, 
							{ text: "Option 2", value: "value2" }	
						]
					} );
					
					field.setValue( 'value1' );
					Y.Assert.areSame( "value1", field.getValue(), "The value should have been set to the first option ('value1') when the initial option was 'value2'. testMode = " + this.testModes[ testNum ] );			
					field.destroy();  // clean up
				}
			},
			
			
			"The value should still be the second option ('value2') after setting to 'value2', and then setting to 'non-existent'." : function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with an initial value of "value1", and trying to set to "value2", and then setting to a non-existent value
					var field = new ui.formFields.DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						
						value : "value1",
						options : [
							{ text: "Option 1", value: "value1" }, 
							{ text: "Option 2", value: "value2" }	
						]
					} );
					
					field.setValue( 'value2' );
					field.setValue( 'non-existent' ); // now set to non-existent
					Y.Assert.areSame( "value2", field.getValue(), "The value should still be the second option ('value2') after setting to 'value2', and then setting to 'non-existent'. testMode = " + this.testModes[ testNum ] );			
					field.destroy();  // clean up
				}
			},
			
			
			
			"The value should be set to the option with value '2', given a number to be set to." : function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test setting to a number, when the values are strings
					var field = new ui.formFields.DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						
						options : [
							{ text: "Option 1", value: "1" }, 
							{ text: "Option 2", value: "2" }	
						]
					} );
					
					field.setValue( '2' );
					Y.Assert.areSame( "2", field.getValue(), "The value should have been set to the option with value '2', given a string of the number to be set to. testMode = " + this.testModes[ testNum ] );			
					field.destroy();  // clean up
				}
			},
			
			
			
			"The value should be set to the option with value 2, given a string to be set to, and the values are numbers." : function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test setting to a string, when the values are numbers
					var field = new ui.formFields.DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						
						options : [
							{ text: "Option 1", value: 1 }, 
							{ text: "Option 2", value: 2 }	
						]
					} );
					
					field.setValue( 2 );
					Y.Assert.areSame( 2, field.getValue(), "The value should have been set to the option with value 2, given a number to be set to, and the values are numbers. testMode = " + this.testModes[ testNum ] );			
					field.destroy();  // clean up
				}
			},
			
			
			
			"The value should remain unchanged when providing undefined as the value." : function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test setting to undefined.  The value should remain unchanged.
					var field = new ui.formFields.DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						value : 2,
						
						options : [
							{ text: "Option 1", value: 1 }, 
							{ text: "Option 2", value: 2 }
						]
					} );
					
					field.setValue( undefined );
					Y.Assert.areSame( 2, field.getValue(), "The value should remain unchanged when providing undefined as the value. testMode = " + this.testModes[ testNum ] );			
					field.destroy();  // clean up
				}
			},
			
			
			
			"The value should remain unchanged when providing null as the value." : function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test setting to mull.  The value should remain unchanged.
					var field = new ui.formFields.DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						value : 2,
						
						options : [
							{ text: "Option 1", value: 1 }, 
							{ text: "Option 2", value: 2 }	
						]
					} );
					
					field.setValue( null );
					Y.Assert.areSame( 2, field.getValue(), "The value should remain unchanged when providing null as the value. testMode = " + this.testModes[ testNum ] );			
					field.destroy();  // clean up
				}
			}
		} )
	]
	
} ) );