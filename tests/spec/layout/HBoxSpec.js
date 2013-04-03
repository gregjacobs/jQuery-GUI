/*global define, describe, beforeEach, afterEach, it, expect, JsMockito */
define( [
	'spec/layout/HBoxFixture'
], function( HBoxLayoutFixture ) {
	
	describe( 'ui.layout.HBox', function() {
		
		describe( "Test doLayout()", function() {
			var fixture;
		
			beforeEach( function() {
				fixture = new HBoxLayoutFixture();
			} );
			
			afterEach( function() {
				fixture.destroy();
			} );
			
			
			it( "doLayout() should properly lay out 2 child components, one regularly sized, and the other flexed", function() {
				var childComponents = fixture.createChildComponents( 2 );
				JsMockito.when( fixture.getContainer() ).getItems().thenReturn( childComponents );
				
				var cmp0Width = 20;
				JsMockito.when( childComponents[ 0 ] ).getOuterWidth().thenReturn( cmp0Width );
				childComponents[ 1 ].flex = 1;  // Set the flex config on the 2nd component
				
				var layout = fixture.getLayout();
				layout.doLayout();
				
				JsMockito.verify( childComponents[ 1 ] ).setSize( fixture.getTargetElWidth() - cmp0Width, undefined );
			} );
			
			
			it( "doLayout() should properly lay out 4 child components, all flexed", function() {
				var childComponents = fixture.createChildComponents( 4 );
				JsMockito.when( fixture.getContainer() ).getItems().thenReturn( childComponents );
				
				// Set the flex configs
				childComponents[ 0 ].flex = 1;  // 1/6 * 200 = 33.33 ~= 33 and .33 remainder
				childComponents[ 1 ].flex = 2;  // 2/6 * 200 = 66.66 ~= 66 and .66 remainder
				childComponents[ 2 ].flex = 1;  // 1/6 * 200 = 33.33 ~= 33 and .33 remainder
				childComponents[ 3 ].flex = 2;  // 2/6 * 200 = 66.66 ~= 66 and .66 remainder
				                                // Remainder pixel = Math.floor( 1.98 ) = 1 total pixel trimmed from other components, which will be added to the last component
				
				var layout = fixture.getLayout();
				layout.doLayout();
				
				// Note: Changed implementation to always use width: 100% to allow the browser to resize the components
				JsMockito.verify( childComponents[ 0 ] ).setSize( Math.floor( 1/6 * fixture.getTargetElWidth() ), undefined );
				JsMockito.verify( childComponents[ 1 ] ).setSize( Math.floor( 2/6 * fixture.getTargetElWidth() ), undefined );
				JsMockito.verify( childComponents[ 2 ] ).setSize( Math.floor( 1/6 * fixture.getTargetElWidth() ), undefined );
				JsMockito.verify( childComponents[ 3 ] ).setSize( Math.floor( 2/6 * fixture.getTargetElWidth() ) + 1, undefined );  // the + 1 is the floored sum of the trimmed off decimal remainders from flexing other components
			} );
			
		} );
		
	} );
	
} );