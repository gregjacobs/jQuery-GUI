/*global define, describe, beforeEach, afterEach, it, expect */
define( [
	'lodash',
	'gui/template/LoDash'
], function( _, LoDashTpl ) {
	
	describe( 'gui.template.LoDash', function() {
		
		describe( "constructor", function() {
			
			it( "should accept a string for the template", function() {
				var tpl = new LoDashTpl( "Testing <%= number %>" );
				
				expect( tpl.apply( { number: 123 } ) ).toBe( "Testing 123" );
			} );
			
			
			it( "should accept an array of strings for the template", function() {
				var tpl = new LoDashTpl( [ "Testing ", "<%= number %>" ] );
				
				expect( tpl.apply( { number: 123 } ) ).toBe( "Testing 123" );
			} );
			
			
			it( "should accept options to pass to the template as the second argument, when a string is passed for the template", function() {
				var tpl = new LoDashTpl( "Testing {{ number }}", { 
					interpolate: /\{\{(.+?)\}\}/g   // mustache template style
				} );
				
				expect( tpl.apply( { number: 123 } ) ).toBe( "Testing 123" );
			} );
			
			
			it( "should accept a precompiled Lo-Dash template function for the template", function() {
				var tplFn = _.template( "Testing <%= number %>" );
				var tpl = new LoDashTpl( tplFn );
				
				expect( tpl.apply( { number: 123 } ) ).toBe( "Testing 123" );
			} );
			
			
			it( "should accept a LoDashTpl instance, simply returning that instance", function() {
				var tpl = new LoDashTpl( "Testing <%= number %>" );
				var tpl2 = new LoDashTpl( tpl );
				
				expect( tpl ).toBe( tpl2 );  // instance should have just been returned
			} );
			
			
			it( "should accept the 'compiled' config, to pre-compile a string template by calling compile() during instantiation", function() {
				var compileCallCount = 0;
				
				var LoDashTplSubclass = LoDashTpl.extend( {
					compile : function() {
						compileCallCount++;
						
						this._super( arguments );
					}
				} );
				
				var tpl = new LoDashTplSubclass( "Testing <%= number %>", { compiled: true } );
				expect( compileCallCount ).toBe( 1 );
			} );
			
			
			it( "should throw an error if the constructor was called with an invalid argument", function() {
				var errorMsg = "Invalid `tpl` argument to LoDashTpl constructor";
				
				expect( function() {
					new LoDashTpl( /* no arg */ );
				} ).toThrow( errorMsg );
				
				expect( function() {
					new LoDashTpl( undefined );
				} ).toThrow( errorMsg );
				
				expect( function() {
					new LoDashTpl( null );
				} ).toThrow( errorMsg );
				
				expect( function() {
					new LoDashTpl( function(){} );  // just a plain function, not a compiled Lo-Dash template
				} ).toThrow( errorMsg );
			} );
			
		} );
		
	} );
	
} );