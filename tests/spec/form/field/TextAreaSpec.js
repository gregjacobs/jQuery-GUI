/*global define, describe, beforeEach, afterEach, it, expect */
define( [
	'jquery',
	'lodash',
	'jqc/form/field/TextArea'
], function( jQuery, _, TextAreaField ) {
	
	describe( 'jqc.form.field.TextArea', function() {
		
		describe( "rendering", function() {
			
			it( "should create the inputEl with the id of the `inputId` property", function() {
				var textAreaField = new TextAreaField( {
					renderTo : 'body'
				} );
				
				expect( textAreaField.getInputEl().attr( 'id' ) ).toBe( textAreaField.inputId );
				
				textAreaField.destroy();
			} );
			
			
			it( "should create the inputEl with the name of the `inputName` config", function() {
				var textAreaField = new TextAreaField( {
					renderTo : 'body',
					inputName  : '__ui_form_field_TextArea_inputNameTest'
				} );
				
				expect( textAreaField.getInputEl().attr( 'name' ) ).toBe( "__ui_form_field_TextArea_inputNameTest" );
				
				textAreaField.destroy();
			} );
			
			
			it( "should create the inputEl with the 'readonly' attribute, if the `readOnly` config is `true`", function() {
				var textAreaField = new TextAreaField( {
					renderTo : 'body',
					readOnly : true
				} );
				
				expect( textAreaField.getInputEl().attr( 'readonly' ) ).toBe( "readonly" );
				
				textAreaField.destroy();
			} );
			
			
			it( "should create the inputEl with the value of the `value` config", function() {
				var textAreaField = new TextAreaField( {
					renderTo : 'body',
					value : "__ui_form_field_TextArea_inputValueTest"
				} );
				
				expect( textAreaField.getInputEl().val() ).toBe( "__ui_form_field_TextArea_inputValueTest" );
				
				textAreaField.destroy();
			} );
			
			
			it( "should work correctly with a height configured on the component", function() {
				var textAreaField = new TextAreaField( {
					renderTo : 'body',
					height   : 150
				} );
				
				// test should simply not error (for now).
				// TODO: Add logic to test that the height of the textarea itself is heightOfField - heightOfSurroundingElements
				
				textAreaField.destroy();
			} );
			
		} );
		
		
		describe( 'destroy()', function() {
			
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