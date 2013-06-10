/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
define( [
	'jquery',
	'spec/layout/FitFixture'
], function( jQuery, FitLayoutFixture ) {
	
	describe( 'jqc.layout.Fit', function() {
		
		describe( "Test doLayout()", function() {
			var fixture;
		
			beforeEach( function() {
				fixture = new FitLayoutFixture();
			} );
			
			afterEach( function() {
				fixture.destroy();
			} );
			
			
			it( "When there are no child components, doLayout() should simply return out", function() {
				var layout = fixture.getLayout();
				layout.doLayout();
				
				// Test should simply not error
			} );
			
			
			it( "doLayout() should do an initial render of the container's child component with the correct size, taking into account margin/border/padding", function() {
				var childCmp = fixture.getChildCmp(),
				    container = fixture.getContainer();

				spyOn( childCmp, 'render' );
				spyOn( childCmp, 'setSize' );
				spyOn( childCmp, 'isRendered' ).andReturn( false );  // Not yet rendered
				
				var lrPadding = 1, lrMargin = 2, lrBorderWidth = 3,
				    tbPadding = 2, tbMargin = 3, tbBorderWidth = 4;

				childCmp.getPadding.andCallFake( function( sides ) {
					if( sides === 'lr' ) return lrPadding;
					if( sides === 'tb' ) return tbPadding;
				} );
				childCmp.getMargin.andCallFake( function( sides ) {
					if( sides === 'lr' ) return lrMargin;
					if( sides === 'tb' ) return tbMargin;
				} );
				childCmp.getBorderWidth.andCallFake( function( sides ) {
					if( sides === 'lr' ) return lrBorderWidth;
					if( sides === 'tb' ) return tbBorderWidth;
				} );
				
				container.getItems.andReturn( [ childCmp ] );
				
				var layout = fixture.getLayout();
				layout.doLayout();
				
				expect( childCmp.render.callCount ).toBe( 1 );
				expect( childCmp.render.calls[ 0 ].args[ 0 ] ).toBe( fixture.getTargetEl() );
				expect( childCmp.setSize.callCount ).toBe( 1 );
				expect( childCmp.setSize ).toHaveBeenCalledWith( fixture.getContainerWidth() - lrPadding - lrMargin - lrBorderWidth, fixture.getContainerHeight() - tbPadding - tbMargin - tbBorderWidth );
			} );
			
			
			it( "doLayout() should move the container's child component if it is already rendered, but elsewhere", function() {
				var childCmp = fixture.getChildCmp(),
				    container = fixture.getContainer(),
				    $cmpEl = jQuery( '<div />' ).appendTo( 'body' );
				
				spyOn( childCmp, 'render' );
				spyOn( childCmp, 'setSize' );
				spyOn( childCmp, 'isRendered' ).andReturn( true );  // Already rendered
				spyOn( childCmp, 'getEl' ).andReturn( $cmpEl );
				
				container.getItems.andReturn( [ childCmp ] );
				
				var layout = fixture.getLayout();
				layout.doLayout();
				
				expect( childCmp.setSize.callCount ).toBe( 1 );
				expect( childCmp.setSize ).toHaveBeenCalledWith( fixture.getContainerWidth(), fixture.getContainerHeight() );
				expect( childCmp.render.callCount ).toBe( 1 );
				expect( childCmp.render ).toHaveBeenCalledWith( fixture.getTargetEl(), { deferLayout: true } );   // Call render(), to make sure the component is in the correct place
				
				$cmpEl.remove();
			} );
			
			
			it( "doLayout() should *not* move the container's child component if it is already rendered in the FitLayout", function() {
				var childCmp = fixture.getChildCmp(),
				    container = fixture.getContainer();
				
				// Simulate that the component's element was created and added to the $targetEl
				var $cmpEl = jQuery( '<div />' );
				fixture.getTargetEl().append( $cmpEl );
				spyOn( childCmp, 'render' );
				spyOn( childCmp, 'isRendered' ).andReturn( true );
				spyOn( childCmp, 'getEl' ).andReturn( $cmpEl );
				
				container.getItems.andReturn( [ childCmp ] );
				
				var layout = fixture.getLayout();
				layout.doLayout();
				
				expect( childCmp.render ).not.toHaveBeenCalled();  // original tested that it wasn't called with `fixture.getTargetEl()`
			} );
			
			
			it( "doLayout() should *not* move the container's child component if it is already rendered in the FitLayout, but should fix its size if the Container's contentTargetEl's size has changed", function() {
				var childCmp = fixture.getChildCmp(),
				    container = fixture.getContainer();
				spyOn( childCmp, 'render' );
				spyOn( childCmp, 'setSize' );
				spyOn( childCmp, 'isRendered' ).andReturn( false );
				
				container.getItems.andReturn( [ childCmp ] );
				
				var layout = fixture.getLayout();
				layout.doLayout();  // initial layout
				
				// Need to pretend the component is rendered now, and change the size of the target element 
				// before running the layout again
				childCmp.isRendered.andReturn( true );
				spyOn( childCmp, 'getEl' ).andReturn( jQuery( '<div />' ).appendTo( fixture.getTargetEl() ) );
				fixture.getTargetEl().width( 42 );
				fixture.getTargetEl().height( 7 );
				layout.doLayout();
				
				expect( childCmp.render.callCount ).toBe( 1 );
				expect( childCmp.render ).toHaveBeenCalledWith( fixture.getTargetEl(), { deferLayout: true } );   // should only be rendered the first time
				
				var targetWidth = fixture.getContainerWidth(),
				    targetHeight = fixture.getContainerHeight();
				expect( childCmp.setSize.callCount ).toBe( 2 );
				expect( childCmp.setSize ).toHaveBeenCalledWith( targetWidth, targetHeight );   // verify that it was set to the initial size first
				expect( childCmp.setSize ).toHaveBeenCalledWith( 42, 7 );                       // verify that it was set to the new size as well
			} );
			
		} );
		
	} );
	
} );