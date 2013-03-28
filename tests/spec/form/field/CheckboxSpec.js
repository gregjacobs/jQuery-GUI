/*global define, describe, beforeEach, afterEach, it, expect */
define( [
	'jquery',
	'lodash',
	'ui/form/field/Checkbox'
], function( jQuery, _, CheckboxField ) {
	
	describe( 'ui.form.field.Checkbox', function() {
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated, rendered, and destroyed", function() {
				var checkboxField = new CheckboxField();
				
				checkboxField.render( 'body' );
				
				checkboxField.destroy();
			} );
			
		} );
		
	} );
	
} );