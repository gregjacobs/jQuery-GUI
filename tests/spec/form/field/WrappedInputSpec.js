/*global define, describe, beforeEach, afterEach, it, expect */
define( [
	'jquery',
	'lodash',
	'ui/form/field/WrappedInput'
], function( jQuery, _, WrappedInputField ) {
	
	describe( 'ui.form.field.Hidden', function() {
		var ConcreteWrappedInputField = WrappedInputField.extend( {
			getValue : function() {},
			setValue : function() {}
		} );
		
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated, rendered, and destroyed", function() {
				var wrappedInputField = new ConcreteWrappedInputField();
				
				wrappedInputField.render( 'body' );
				
				wrappedInputField.destroy();
			} );
			
		} );
		
	} );
	
} );