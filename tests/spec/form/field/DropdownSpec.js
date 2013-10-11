/*global define, describe, beforeEach, afterEach, it, expect */
define( [
	'jquery',
	'lodash',
	'jqg/form/field/Dropdown'
], function( jQuery, _, DropdownField ) {
	
	describe( 'jqg.form.field.Dropdown', function() {
		
		describe( "Test Initialization", function() {
			it( "The initial value for the field with no 'value' config, and no options, should be undefined", function() {
				for( var rendered = 0; rendered <= 1; rendered++ ) {
					var field = new DropdownField( {
						renderTo : ( rendered === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						options : []
					} );
					
					expect( _.isUndefined( field.getValue() ) ).toBe( true );  // orig YUI Test err msg: "The value should be undefined. testMode = " + thisSuite.testModes[ rendered ]			
					field.destroy();  // clean up
				}
			} );
			
			
			it( "The initial value for the field with a 'value' config, but no options, should be undefined", function() {
				for( var rendered = 0; rendered <= 1; rendered++ ) {
					var field = new DropdownField( {
						renderTo : ( rendered === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						options : [],
						
						value: 42
					} );
					
					expect( _.isUndefined( field.getValue() ) ).toBe( true );  // orig YUI Test err msg: "The value should be undefined. testMode = " + thisSuite.testModes[ rendered ]			
					field.destroy();  // clean up
				}
			} );
			
			
			it( "The initial value for the field with no 'value' config, but which has options, should be the value of the first option", function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with no initial value config
					var field = new DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						options : [
							{ text: "Option 1", value: "value1" }, 
							{ text: "Option 2", value: "value2" }, 
							{ text: "Option 3", value: "value3" }, 
							{ text: "Option 4", value: "value4" }, 
							{ text: "Option 5", value: "value5" }
						]
					} );
					
					expect( field.getValue() ).toBe( "value1" );  // orig YUI Test err msg: "The initial value for the field with no 'value' config should have been the value of the first option ('value1'). testMode = " + thisSuite.testModes[ testNum ]			
					field.destroy();  // clean up
				}
			} );
			
			
			it( "The initial value for the field with a 'value' config that does not exist should have the value of the first option", function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with a non-existent value config
					var field = new DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						
						value : 'non-existent',
						options : [ 
							{ text: "Option 1", value: "value1" }, 
							{ text: "Option 2", value: "value2" }	
						]
					} );
					
					expect( field.getValue() ).toBe( "value1" );  // orig YUI Test err msg: "The initial value for the field with a 'value' config that does not exist should have been the value of the first option ('value1'). testMode = " + thisSuite.testModes[ testNum ]
					field.destroy();  // clean up
				}
			} );
			
			
			it( "The initial value for the field with a 'value' config of 'value1' should have the value of the first option", function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with a valid value config of the first option
					var field = new DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						
						value : 'value1',
						options : [ 
							{ text: "Option 1", value: "value1" }, 
							{ text: "Option 2", value: "value2" }	
						]
					} );
					
					expect( field.getValue() ).toBe( "value1" );  // orig YUI Test err msg: "The initial value for the field with a 'value' config of 'value1' should have been the value of the first option ('value1'). testMode = " + thisSuite.testModes[ testNum ]
					field.destroy();  // clean up
				}
			} );
			
			
			it( "The initial value for the field with a 'value' config of 'value2' should have the value of the second option", function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with a valid value config of the second option
					var field = new DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						
						value : 'value2',
						options : [ 
							{ text: "Option 1", value: "value1" }, 
							{ text: "Option 2", value: "value2" }	
						]
					} );
					
					expect( field.getValue() ).toBe( "value2" );  // orig YUI Test err msg: "The initial value for the field with a 'value' config of 'value2' should have been the value of the second option ('value2'). testMode = " + thisSuite.testModes[ testNum ]
					field.destroy();  // clean up
				}
			} );
			
			
			it( "The initial value for the field with a 'value' config of (as a Number) 2 should have the value of the second option (2)", function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with a valid value config that is a number, and the dropdown option is a number.
					var field = new DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						
						value : 2,
						options : [ 
							{ text: "Option 1", value: 1 }, 
							{ text: "Option 2", value: 2 }
						]
					} );
					
					expect( field.getValue() ).toBe( 2 );  // orig YUI Test err msg: "The initial value for the field with a 'value' config of (as a number) 2 should have been the value of the second option (2). testMode = " + thisSuite.testModes[ testNum ]
					field.destroy();  // clean up
				}
			} );
			
			
			it( "The initial value for the field with a 'value' config of (as a String) '2' should have the value of the second option ('2').", function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with a valid value config that is a number, and the dropdown option is a string that holds the same number.
					var field = new DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						
						value : "2",
						options : [ 
							{ text: "Option 1", value: "1" }, 
							{ text: "Option 2", value: "2" }
						]
					} );
					
					expect( field.getValue() ).toBe( "2" );  // orig YUI Test err msg: "The initial value for the field with a 'value' config of \"2\" should have been the value of the second option (\"2\"). The comparison should have matched the string of the number. testMode = " + thisSuite.testModes[ testNum ]
					field.destroy();  // clean up
				}
			} );
			
			
			it( "The initial value for the field with a 'value' config of '2' should have the value of the second option", function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with a valid value config that is a string, and the dropdown option is a number.
					var field = new DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						
						value : 2,
						options : [ 
							{ text: "Option 1", value: 1 }, 
							{ text: "Option 2", value: 2 }
						]
					} );
					
					expect( field.getValue() ).toBe( 2 );  // orig YUI Test err msg: "The initial value for the field with a 'value' config of 2 should have been the value of the second option (2). testMode = " + thisSuite.testModes[ testNum ]
					field.destroy();  // clean up
				}
			} );
			
		} );
		
		
		describe( "rendering", function() {
			
			it( "should have references to its own child elements once rendered", function() {
				var field = new DropdownField( {
					renderTo : 'body',
					options : [
						{ text: "Option 1", value: "value1" }, 
						{ text: "Option 2", value: "value2" }	
					]
				} );
				
				expect( field.$inputEl.length ).toBe( 1 );
				expect( field.$dropdownContainer.length ).toBe( 1 );
				expect( field.$selectText.length ).toBe( 1 );
				expect( field.$expandButton.length ).toBe( 1 );
				
				field.destroy();  // clean up
			} );
			
		} );
		
		
		describe( "Test setValue()", function() {
			it( "The value should not be set with 'non-existent' value.", function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with no initial value config, and trying to set to a non-existent value
					var field = new DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						options : [
							{ text: "Option 1", value: "value1" }, 
							{ text: "Option 2", value: "value2" }	
						]
					} );
					
					field.setValue( 'non-existent' );
					expect( field.getValue() ).toBe( "value1" );  // orig YUI Test err msg: "The value should not have been set with 'non-existent' value. getValue() should have returned the value of the first option ('value1'). testMode = " + thisSuite.testModes[ testNum ]			
					field.destroy();  // clean up
				}
			} );
			
			
			it( "The value should be set to the second option ('value2') with no initial value.", function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with no initial value config, and trying to set to "value2"
					var field = new DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						options : [
							{ text: "Option 1", value: "value1" }, 
							{ text: "Option 2", value: "value2" }	
						]
					} );
					
					field.setValue( 'value2' );
					expect( field.getValue() ).toBe( "value2" );  // orig YUI Test err msg: "The value should have been set to the second option ('value2') with no initial value. testMode = " + thisSuite.testModes[ testNum ]			
					field.destroy();  // clean up
				}
			} );
			
			
			it( "The value should be set to the first option ('value1') when the initial option was 'value2'.", function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with an initial value of "value2", and trying to set to "value1"
					var field = new DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						
						value : "value2",
						options : [
							{ text: "Option 1", value: "value1" }, 
							{ text: "Option 2", value: "value2" }	
						]
					} );
					
					field.setValue( 'value1' );
					expect( field.getValue() ).toBe( "value1" );  // orig YUI Test err msg: "The value should have been set to the first option ('value1') when the initial option was 'value2'. testMode = " + thisSuite.testModes[ testNum ]			
					field.destroy();  // clean up
				}
			} );
			
			
			it( "The value should still be the second option ('value2') after setting to 'value2', and then setting to 'non-existent'.", function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test with an initial value of "value1", and trying to set to "value2", and then setting to a non-existent value
					var field = new DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						
						value : "value1",
						options : [
							{ text: "Option 1", value: "value1" }, 
							{ text: "Option 2", value: "value2" }	
						]
					} );
					
					field.setValue( 'value2' );
					field.setValue( 'non-existent' ); // now set to non-existent
					expect( field.getValue() ).toBe( "value2" );  // orig YUI Test err msg: "The value should still be the second option ('value2') after setting to 'value2', and then setting to 'non-existent'. testMode = " + thisSuite.testModes[ testNum ]			
					field.destroy();  // clean up
				}
			} );
			
			
			it( "The value should be set to the option with value '2', given a number to be set to.", function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test setting to a number, when the values are strings
					var field = new DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						
						options : [
							{ text: "Option 1", value: "1" }, 
							{ text: "Option 2", value: "2" }	
						]
					} );
					
					field.setValue( '2' );
					expect( field.getValue() ).toBe( "2" );  // orig YUI Test err msg: "The value should have been set to the option with value '2', given a string of the number to be set to. testMode = " + thisSuite.testModes[ testNum ]			
					field.destroy();  // clean up
				}
			} );
			
			
			it( "The value should be set to the option with value 2, given a string to be set to, and the values are numbers.", function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test setting to a string, when the values are numbers
					var field = new DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						
						options : [
							{ text: "Option 1", value: 1 }, 
							{ text: "Option 2", value: 2 }	
						]
					} );
					
					field.setValue( 2 );
					expect( field.getValue() ).toBe( 2 );  // orig YUI Test err msg: "The value should have been set to the option with value 2, given a number to be set to, and the values are numbers. testMode = " + thisSuite.testModes[ testNum ]			
					field.destroy();  // clean up
				}
			} );
			
			
			it( "The value should remain unchanged when providing undefined as the value.", function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test setting to undefined.  The value should remain unchanged.
					var field = new DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						value : 2,
						
						options : [
							{ text: "Option 1", value: 1 }, 
							{ text: "Option 2", value: 2 }
						]
					} );
					
					field.setValue( undefined );
					expect( field.getValue() ).toBe( 2 );  // orig YUI Test err msg: "The value should remain unchanged when providing undefined as the value. testMode = " + thisSuite.testModes[ testNum ]			
					field.destroy();  // clean up
				}
			} );
			
			
			it( "The value should remain unchanged when providing null as the value.", function() {
				for( var testNum = 0; testNum <= 1; testNum++ ) {
					// Test setting to mull.  The value should remain unchanged.
					var field = new DropdownField( {
						renderTo : ( testNum === 0 ) ? undefined : jQuery( 'body' ),  // render to the document.body on the second loop iteration
						value : 2,
						
						options : [
							{ text: "Option 1", value: 1 }, 
							{ text: "Option 2", value: 2 }	
						]
					} );
					
					field.setValue( null );
					expect( field.getValue() ).toBe( 2 );  // orig YUI Test err msg: "The value should remain unchanged when providing null as the value. testMode = " + thisSuite.testModes[ testNum ]			
					field.destroy();  // clean up
				}
			} );
			
		} );
		
	} );
	
} );