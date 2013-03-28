/*global define, describe, beforeEach, afterEach, it, expect */
define( [
	'jquery',
	'lodash',
	'ui/form/field/Field'
], function( jQuery, _, Field ) {
	
	describe( 'ui.form.field.Field', function() {
		
		// A Field with implemented setValue() and getValue() methods used for testing.
		var TestField = Field.extend( {
			setValue : function( val ) { this.value = val; },
			getValue : function() { return this.value; }
		} );
		
		it( "The 'value' should be undefined if it was not provided", function() {
			for( var rendered = 0; rendered <= 1; rendered++ ) {
				var field = new TestField( {
					renderTo: ( rendered ) ? document.body : undefined
					// value: "my value"             -- intentionally leaving this here
				} );
				
				expect( _.isUndefined( field.getValue() ) ).toBe( true );  // orig YUI Test err msg: "the initial value should be undefined. rendered = " + !!rendered
				
				field.destroy();  // clean up
			}
		} );
		
	} );
	
} );