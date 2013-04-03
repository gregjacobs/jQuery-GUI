/*global define, describe, beforeEach, afterEach, it, expect */
define( [
	'jquery',
	'lodash',
	'ui/form/field/Field'
], function( jQuery, _, Field ) {
	
	describe( 'ui.form.field.Field', function() {
		
		// A Field with implemented setValue() and getValue() methods used for testing.
		var ConcreteField = Field.extend( {
			setValue : function( val ) { this.value = val; },
			getValue : function() { return this.value; }
		} );
		
		
		describe( "initialization", function() {
			
			it( "The `value` should be undefined if it was not provided", function() {
				for( var rendered = 0; rendered <= 1; rendered++ ) {
					var field = new ConcreteField( {
						renderTo: ( rendered ) ? 'body' : undefined
						// value: "my value"             -- intentionally leaving this here
					} );
					
					expect( _.isUndefined( field.getValue() ) ).toBe( true );
					
					field.destroy();  // clean up
				}
			} );
			
		} );
		
		
		describe( "rendering", function() {
			
			it( "should have the 'noLabel' CSS class if there was no `label` config provided", function() {
				var field = new ConcreteField( {
					renderTo: 'body'
				} );
				
				expect( field.hasCls( field.baseCls + '-noLabel' ) ).toBe( true );
				expect( field.hasCls( field.baseCls + '-leftLabel' ) ).toBe( false );  // make sure it doesn't have this CSS class
				expect( field.hasCls( field.baseCls + '-topLabel' ) ).toBe( false );   // make sure it doesn't have this CSS class
				
				field.destroy();  // clean up
			} );
			
			
			it( "should have the 'leftLabel' CSS class if there was a `label` config provided, and `labelAlign` is 'left'", function() {
				var field = new ConcreteField( { 
					renderTo   : 'body',
					label      : "MyLabel",
					labelAlign : 'left'
				} );
				
				expect( field.hasCls( field.baseCls + '-noLabel' ) ).toBe( false );   // make sure it doesn't have the "noLabel" CSS class
				expect( field.hasCls( field.baseCls + '-leftLabel' ) ).toBe( true );
				expect( field.hasCls( field.baseCls + '-topLabel' ) ).toBe( false );  // make sure it doesn't have this CSS class
				
				field.destroy();  // clean up
			} );
			
			
			it( "should have the 'topLabel' CSS class if there was a `label` config provided, and `labelAlign` is 'top'", function() {
				var field = new ConcreteField( { 
					renderTo   : 'body',
					label      : "MyLabel",
					labelAlign : 'top'
				} );
				
				expect( field.hasCls( field.baseCls + '-noLabel' ) ).toBe( false );   // make sure it doesn't have the "noLabel" CSS class
				expect( field.hasCls( field.baseCls + '-leftLabel' ) ).toBe( false );  // make sure it doesn't have this CSS class
				expect( field.hasCls( field.baseCls + '-topLabel' ) ).toBe( true );
				
				field.destroy();  // clean up
			} );
			
			
			it( "should have references to its own child elements once rendered", function() {
				var field = new ConcreteField();
				field.render( 'body' );
				
				expect( field.$labelEl.length ).toBe( 1 );
				expect( field.$inputContainerWrapEl.length ).toBe( 1 );
				expect( field.$inputContainerEl.length ).toBe( 1 );
				expect( field.$extraMsgEl.length ).toBe( 1 );
				
				field.destroy();  // clean up
			} );
			
		} );
		
		
		
		describe( 'focus()', function() {
			
			it( "should return a reference to the field, to allow for method chaining", function() {
				var field = new ConcreteField( { renderTo: 'body' } );
				
				expect( field.focus() ).toBe( field );
				
				field.destroy();  // clean up
			} );
			
		} );
		
		
		
		describe( 'blur()', function() {
			
			it( "should return a reference to the field, to allow for method chaining", function() {
				var field = new ConcreteField( { renderTo: 'body' } );
				
				expect( field.blur() ).toBe( field );
				
				field.destroy();  // clean up
			} );
			
		} );
		
	} );
	
} );