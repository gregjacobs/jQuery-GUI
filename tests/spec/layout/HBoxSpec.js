/*global define, describe, beforeEach, afterEach, it, expect, JsMockito */
define( [
	'spec/layout/HBoxFixture'
], function( HBoxLayoutFixture ) {
	
	describe( 'jqc.layout.HBox', function() {
		
		describe( "Test doLayout()", function() {
			var fixture;
		
			beforeEach( function() {
				fixture = new HBoxLayoutFixture();
			} );
			
			afterEach( function() {
				fixture.destroy();
			} );
			
			
			it( "should properly lay out 2 child components, one regularly sized, and the other flexed", function() {
				var childComponents = fixture.createChildComponents( 2 );
				JsMockito.when( fixture.getContainer() ).getItems().thenReturn( childComponents );
				
				var cmp0Width = 19;  // using 19 instead of 20, because HBox adds a pixel as a workaround for the cases that browsers are computing sub-pixel widths, and so we don't get float wrapping in these cases
				JsMockito.when( childComponents[ 0 ] ).getOuterWidth().thenReturn( cmp0Width );
				childComponents[ 1 ].flex = 1;  // Set the flex config on the 2nd component
				
				var layout = fixture.getLayout();
				layout.doLayout();
				
				JsMockito.verify( childComponents[ 1 ] ).setSize( fixture.getContainerWidth() - (cmp0Width+1), undefined );  // +1 for HBox floats workaround w/ browser sub-pixel widths
			} );
			
			
			it( "should properly lay out 4 child components, all flexed", function() {
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
				JsMockito.verify( childComponents[ 0 ] ).setSize( Math.floor( 1/6 * fixture.getContainerWidth() ), undefined );
				JsMockito.verify( childComponents[ 1 ] ).setSize( Math.floor( 2/6 * fixture.getContainerWidth() ), undefined );
				JsMockito.verify( childComponents[ 2 ] ).setSize( Math.floor( 1/6 * fixture.getContainerWidth() ), undefined );
				JsMockito.verify( childComponents[ 3 ] ).setSize( Math.floor( 2/6 * fixture.getContainerWidth() ) + 1, undefined );  // the + 1 is the floored sum of the trimmed off decimal remainders from flexing other components
			} );
			
			
			it( "should properly lay out child components, ignoring hidden ones that don't have a flex value", function() {
				var childComponents = fixture.createChildComponents( 2 );
				JsMockito.when( fixture.getContainer() ).getItems().thenReturn( childComponents );
				
				// Set the flex config
				childComponents[ 0 ].flex = 1;
				
				// Hide the other component
				JsMockito.when( childComponents[ 1 ] ).isHidden().thenReturn( true );
				
				var layout = fixture.getLayout();
				layout.doLayout();
				JsMockito.verify( childComponents[ 0 ] ).setSize( fixture.getContainerWidth(), undefined );
			} );
			
			
			it( "should properly lay out child components, ignoring hidden ones that do have a flex value", function() {
				var childComponents = fixture.createChildComponents( 2 );
				JsMockito.when( fixture.getContainer() ).getItems().thenReturn( childComponents );
				
				// Set the flex configs
				childComponents[ 0 ].flex = 1;
				childComponents[ 1 ].flex = 1;
				
				// Hide the second component
				JsMockito.when( childComponents[ 1 ] ).isHidden().thenReturn( true );
				
				var layout = fixture.getLayout();
				layout.doLayout();
				JsMockito.verify( childComponents[ 0 ] ).setSize( fixture.getContainerWidth(), undefined );
			} );
			
		} );
		
	} );
	
} );