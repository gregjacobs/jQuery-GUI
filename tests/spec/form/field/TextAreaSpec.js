/*global define, describe, beforeEach, afterEach, it, expect */
define( [
	'jquery',
	'lodash',
	'ui/form/field/TextArea'
], function( jQuery, _, TextAreaField ) {
	
	describe( 'ui.form.field.TextArea', function() {
		
		describe( "Test destroy()", function() {
			
			it( "destroy() should remove the $autoGrowTwinDiv element", function() {
				var textAreaField = new TextAreaField( {
					renderTo: document.body,
					value : "test value",
					autoGrow : true
				} );
				
				var $autoGrowTwinDiv = textAreaField.$autoGrowTwinDiv;
				expect( jQuery( 'body' ).has( $autoGrowTwinDiv ).length ).toBe( 1 );  // orig YUI Test err msg: "initial condition: the element should be in the DOM"
				
				textAreaField.destroy();
				expect( jQuery( 'body' ).has( $autoGrowTwinDiv ).length ).toBe( 0 );  // orig YUI Test err msg: "the element should no longer be in the DOM"
			} );
			
			
			it( "calling destroy() should not error on an unrendered TextAreaField", function() {
				var textAreaField = new TextAreaField();
				textAreaField.destroy();
				
				// Test should not error
			} );
			
			
			it( "calling destroy() should not error on an unrendered TextAreaField, with autogrow set to true", function() {
				var textAreaField = new TextAreaField( {
					autoGrow: true
				} );
				textAreaField.destroy();
				
				// Test should not error
			} );
			
		} );
		
	} );
	
} );