/*global define, describe, beforeEach, afterEach, it, expect, JsMockito */
define( [
	'spec/layout/VBoxFixture'
], function( VBoxLayoutFixture ) {
	
	describe( 'jqc.layout.VBox', function() {
		
		describe( "Test doLayout()", function() {
			var fixture;
		
			beforeEach( function() {
				fixture = new VBoxLayoutFixture();
			} );
			
			afterEach( function() {
				fixture.destroy();
			} );
			
			
			it( "doLayout() should properly lay out 2 child components, one regularly sized, and the other flexed", function() {
				var childComponents = fixture.createChildComponents( 2 );
				JsMockito.when( fixture.getContainer() ).getItems().thenReturn( childComponents );
				
				var cmp0Height = 20;
				JsMockito.when( childComponents[ 0 ] ).getOuterHeight().thenReturn( cmp0Height );
				childComponents[ 1 ].flex = 1;  // Set the flex config on the 2nd component
				
				var layout = fixture.getLayout();
				layout.doLayout();
				
				// Note: Changed implementation to always use width: 100% to allow the browser to resize the components
				JsMockito.verify( childComponents[ 1 ] ).setSize( /*thisSuite.targetWidth*/ '100%', fixture.getContainerHeight() - cmp0Height );
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
				JsMockito.verify( childComponents[ 0 ] ).setSize( /*thisSuite.targetWidth*/ '100%', Math.floor( 1/6 * fixture.getContainerHeight() ) );
				JsMockito.verify( childComponents[ 1 ] ).setSize( /*thisSuite.targetWidth*/ '100%', Math.floor( 2/6 * fixture.getContainerHeight() ) );
				JsMockito.verify( childComponents[ 2 ] ).setSize( /*thisSuite.targetWidth*/ '100%', Math.floor( 1/6 * fixture.getContainerHeight() ) );
				JsMockito.verify( childComponents[ 3 ] ).setSize( /*thisSuite.targetWidth*/ '100%', Math.floor( 2/6 * fixture.getContainerHeight() ) + 1 );  // the + 1 is the floored sum of the trimmed off decimal remainders from flexing other components
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
				JsMockito.verify( childComponents[ 0 ] ).setSize( '100%', fixture.getContainerHeight() );
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
				JsMockito.verify( childComponents[ 0 ] ).setSize( '100%', fixture.getContainerHeight() );
			} );
			
		} );
		
	} );
	
} );