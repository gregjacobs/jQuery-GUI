/*global define, describe, beforeEach, afterEach, it, expect */
define( [
	'ui/form/field/Date'
], function( DateField ) {
	describe( "unit.DateField", function() {
		var thisSuite = {};
		
		beforeEach( function() {
			
		} );
		
		
		it( "The emptyText value of the field should accept the string 'now', which should set it to the current date", function() {
			for( var rendered = 0; rendered <= 1; rendered++ ) {
				// Test initializing the value to the special value "now", which should be replaced by the current date in mm/dd/yyyy format.
				var field = new DateField( { 
					renderTo: ( rendered ) ? document.body : undefined,
					emptyText : 'now'
				} );
				
				expect( field.getEmptyText() ).toBe( jQuery.datepicker.formatDate( 'mm/dd/yy', new Date() ) );  // orig YUI Test err msg: "rendered = " + !!rendered
				
				field.destroy();  // clean up
			}
		} );
		
		
		it( "The emptyText value of the field should accept the string 'now' when set using setEmptyText(), which should set it to the current date", function() {
			for( var rendered = 0; rendered <= 1; rendered++ ) {
				// Test initializing the value to the special value "now", which should be replaced by the current date in mm/dd/yyyy format.
				var field = new DateField( { 
					renderTo: ( rendered ) ? document.body : undefined
				} );
				
				field.setEmptyText( "now" );
				expect( field.getEmptyText() ).toBe( jQuery.datepicker.formatDate( 'mm/dd/yy', new Date() ) );  // orig YUI Test err msg: "rendered = " + !!rendered
				
				field.destroy();  // clean up
			}
		} );
		
		
		it( "The initial value of the field should accept the string 'now', which should set it to the current date", function() {
			for( var rendered = 0; rendered <= 1; rendered++ ) {
				// Test initializing the value to the special value "now", which should be replaced by the current date in mm/dd/yyyy format.
				var field = new DateField( { 
					renderTo: ( rendered ) ? document.body : undefined,
					value : 'now'
				} );
				
				expect( field.getValue() ).toBe( jQuery.datepicker.formatDate( 'mm/dd/yy', new Date() ) );  // orig YUI Test err msg: "The field should have had its value set to the current date in mm/dd/yyyy format when set to the special string 'now'. rendered = " + !!rendered
				
				field.destroy();  // clean up
			}
		} );
		
		
		it( "setValue() should accept the special string 'now', which should set it to the current date", function() {
			for( var rendered = 0; rendered <= 1; rendered++ ) {
				// Test setting the special value "now", which should be replaced by the current date in mm/dd/yyyy format.
				var field = new DateField( {
					renderTo: ( rendered ) ? document.body : undefined
				} );
				
				field.setValue( "now" );
				expect( field.getValue() ).toBe( jQuery.datepicker.formatDate( 'mm/dd/yy', new Date() ) );  // orig YUI Test err msg: "The field should have had its value set to the current date in mm/dd/yyyy format when set to the special string 'now'. rendered = " + !!rendered
				
				field.destroy();  // clean up
			}
		} );
		
	} );
	
} );