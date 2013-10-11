/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
define( [
	'spec/layout/HBoxFixture'
], function( HBoxLayoutFixture ) {
	
	describe( 'jqg.layout.HBox', function() {
		
		describe( "Test doLayout()", function() {
			var fixture;
		
			beforeEach( function() {
				fixture = new HBoxLayoutFixture();
			} );
			
			afterEach( function() {
				fixture.destroy();
			} );
			
			
			it( "should properly lay out 2 child components, one regularly sized, and the other flexed", function() {
				var childComponents = fixture.createChildComponents( 2 ),
				    container = fixture.getContainer();
				
				container.getItems.andReturn( childComponents );
				spyOn( childComponents[ 1 ], 'setSize' );
				
				var cmp0Width = 19;  // using 19 instead of 20, because HBox adds a pixel as a workaround for the cases that browsers are computing sub-pixel widths, and so we don't get float wrapping in these cases
				childComponents[ 0 ].getOuterWidth.andReturn( cmp0Width );
				childComponents[ 1 ].flex = 1;  // Set the flex config on the 2nd component
				
				var layout = fixture.getLayout();
				layout.doLayout();
				
				expect( childComponents[ 1 ].setSize.callCount ).toBe( 1 );
				expect( childComponents[ 1 ].setSize ).toHaveBeenCalledWith( fixture.getContainerWidth() - (cmp0Width+1) - 1, undefined );  // +1 for HBox floats workaround w/ browser sub-pixel widths, and another -1 for the same issue on flexed components
			} );
			
			
			it( "should properly lay out 4 child components, all flexed", function() {
				var childComponents = fixture.createChildComponents( 4 ),
				    container = fixture.getContainer();
				
				container.getItems.andReturn( childComponents );
				spyOn( childComponents[ 0 ], 'setSize' );
				spyOn( childComponents[ 1 ], 'setSize' );
				spyOn( childComponents[ 2 ], 'setSize' );
				spyOn( childComponents[ 3 ], 'setSize' );
				
				// Set the flex configs
				childComponents[ 0 ].flex = 1;  // 1/6 * 200 = 33.33 ~= 33 and .33 remainder
				childComponents[ 1 ].flex = 2;  // 2/6 * 200 = 66.66 ~= 66 and .66 remainder
				childComponents[ 2 ].flex = 1;  // 1/6 * 200 = 33.33 ~= 33 and .33 remainder
				childComponents[ 3 ].flex = 2;  // 2/6 * 200 = 66.66 ~= 66 and .66 remainder
				                                // Remainder pixel = Math.floor( 1.98 ) = 1 total pixel trimmed from other components, which will be added to the last component
				
				var layout = fixture.getLayout();
				layout.doLayout();
				
				// Note: Changed implementation to always use width: 100% to allow the browser to resize the components
				expect( childComponents[ 0 ].setSize.callCount ).toBe( 1 );
				expect( childComponents[ 1 ].setSize.callCount ).toBe( 1 );
				expect( childComponents[ 2 ].setSize.callCount ).toBe( 1 );
				expect( childComponents[ 3 ].setSize.callCount ).toBe( 1 );
				expect( childComponents[ 0 ].setSize ).toHaveBeenCalledWith( Math.floor( 1/6 * fixture.getContainerWidth() ), undefined );
				expect( childComponents[ 1 ].setSize ).toHaveBeenCalledWith( Math.floor( 2/6 * fixture.getContainerWidth() ), undefined );
				expect( childComponents[ 2 ].setSize ).toHaveBeenCalledWith( Math.floor( 1/6 * fixture.getContainerWidth() ), undefined );
				expect( childComponents[ 3 ].setSize ).toHaveBeenCalledWith( Math.floor( 2/6 * fixture.getContainerWidth() ) + 1 - 1, undefined );  // the + 1 is the floored sum of the trimmed off decimal remainders from flexing other components, but then minus one to work around the sub-pixel width problem. Leaving this explicit here as a reminder.
			} );
			
			
			it( "should properly lay out child components, ignoring hidden ones that don't have a flex value", function() {
				var childComponents = fixture.createChildComponents( 2 ),
				    container = fixture.getContainer();
				
				container.getItems.andReturn( childComponents );
				spyOn( childComponents[ 0 ], 'setSize' );
				
				// Set the flex config
				childComponents[ 0 ].flex = 1;
				
				// Hide the other component
				spyOn( childComponents[ 1 ], 'isHidden' ).andReturn( true );
				
				var layout = fixture.getLayout();
				layout.doLayout();
				expect( childComponents[ 0 ].setSize.callCount ).toBe( 1 );
				expect( childComponents[ 0 ].setSize ).toHaveBeenCalledWith( fixture.getContainerWidth() - 1, undefined );  // -1 to work around the sub-pixel width float wrapping issue
			} );
			
			
			it( "should properly lay out child components, ignoring hidden ones that do have a flex value", function() {
				var childComponents = fixture.createChildComponents( 2 ),
				    container = fixture.getContainer();
				
				container.getItems.andReturn( childComponents );
				spyOn( childComponents[ 0 ], 'setSize' );
				
				// Set the flex configs
				childComponents[ 0 ].flex = 1;
				childComponents[ 1 ].flex = 1;
				
				// Hide the second component
				spyOn( childComponents[ 1 ], 'isHidden' ).andReturn( true );
				
				var layout = fixture.getLayout();
				layout.doLayout();
				expect( childComponents[ 0 ].setSize.callCount ).toBe( 1 );
				expect( childComponents[ 0 ].setSize ).toHaveBeenCalledWith( fixture.getContainerWidth() - 1, undefined );  // -1 to work around the sub-pixel width float wrapping issue
			} );
			
		} );
		
	} );
	
} );