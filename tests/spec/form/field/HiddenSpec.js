/*global define, describe, beforeEach, afterEach, it, expect */
define( [
	'jquery',
	'lodash',
	'jqc/form/field/Hidden'
], function( jQuery, _, HiddenField ) {
	
	describe( 'jqc.form.field.Hidden', function() {
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated, rendered, and destroyed", function() {
				var hiddenField = new HiddenField();
				
				hiddenField.render( 'body' );
				
				hiddenField.destroy();
			} );
			
		} );
		
	} );
	
} );