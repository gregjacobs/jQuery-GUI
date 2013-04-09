/*global define, describe, beforeEach, afterEach, it, expect */
define( [
	'jquery',
	'lodash',
	'jqc/form/field/Radio'
], function( jQuery, _, RadioField ) {
		
	describe( 'jqc.form.field.Radio', function() {		
		
		it( "No initial value should cause the RadioField to have the value of its first option", function() {
			for( var rendered = 0; rendered <= 1; rendered++ ) {
				var field = new RadioField( {
					renderTo: ( rendered ) ? document.body : undefined,
					options : [ 
						{ text: "Option 1", value: "value1" }, 
						{ text: "Option 2", value: "value2" }	
					]
				} );
				
				expect( field.getValue() ).toBe( "value1" );  // orig YUI Test err msg: "The initial value for the field should have been the value of the first option. rendered = " + !!rendered
				
				field.destroy();  // clean up
			}
		} );
		
		
		it( "setting a value that does not exist in the RadioField's options should leave the field unchanged", function() {
			for( var rendered = 0; rendered <= 1; rendered++ ) {
				var field = new RadioField( {
					renderTo: ( rendered ) ? document.body : undefined,
					options : [ 
						{ text: "Option 1", value: "value1" }, 
						{ text: "Option 2", value: "value2" }	
					],
					value: "value1"
				} );
				
				field.setValue( 'someValue' );
				expect( field.getValue() ).toEqual( 'value1' );  // orig YUI Test err msg: "value should *not* have been set. rendered = " + !!rendered
				
				field.destroy();  // clean up
			}
		} );
		
		
		it( "setting a value that does exist in the RadioField's options should change the field's value", function() {
			for( var rendered = 0; rendered <= 1; rendered++ ) {
				var field = new RadioField( {
					renderTo: ( rendered ) ? document.body : undefined,
					options : [ 
						{ text: "Option 1", value: "value1" }, 
						{ text: "Option 2", value: "value2" }	
					],
					value: "value1"
				} );
				
				field.setValue( 'value2' );
				expect( field.getValue() ).toEqual( 'value2' );  // orig YUI Test err msg: "value should have been set. rendered = " + !!rendered
				
				field.destroy();  // clean up
			}
		} );
		
	} );
	
} );