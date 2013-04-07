/*global define, describe, beforeEach, afterEach, it, expect, JsMockito */
define( [
	'jquery',
	'spec/layout/FitFixture'
], function( jQuery, FitLayoutFixture ) {
	
	describe( 'ui.layout.Fit', function() {
		
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
				var childCmp = fixture.getChildCmp();
				JsMockito.when( childCmp ).isRendered().thenReturn( false );  // Not yet rendered
				
				var lrPadding = 1, lrMargin = 2, lrBorderWidth = 3,
				    tbPadding = 2, tbMargin = 3, tbBorderWidth = 4;
				
				JsMockito.when( childCmp ).getPadding( 'lr' ).thenReturn( lrPadding );
				JsMockito.when( childCmp ).getPadding( 'tb' ).thenReturn( tbPadding );
				JsMockito.when( childCmp ).getMargin( 'lr' ).thenReturn( lrMargin );
				JsMockito.when( childCmp ).getMargin( 'tb' ).thenReturn( tbMargin );
				JsMockito.when( childCmp ).getBorderWidth( 'lr' ).thenReturn( lrBorderWidth );
				JsMockito.when( childCmp ).getBorderWidth( 'tb' ).thenReturn( tbBorderWidth );
				
				JsMockito.when( fixture.getContainer() ).getItems().thenReturn( [ childCmp ] );
				
				var layout = fixture.getLayout();
				layout.doLayout();
				
				JsMockito.verify( childCmp ).render( fixture.getTargetEl() );
				JsMockito.verify( childCmp ).setSize( fixture.getContainerWidth() - lrPadding - lrMargin - lrBorderWidth, fixture.getContainerHeight() - tbPadding - tbMargin - tbBorderWidth );
			} );
			
			
			it( "doLayout() should move the container's child component if it is already rendered, but elsewhere", function() {
				var childCmp = fixture.getChildCmp(),
				    $cmpEl = jQuery( '<div />' ).appendTo( 'body' );
				JsMockito.when( childCmp ).isRendered().thenReturn( true );  // Already rendered
				JsMockito.when( childCmp ).getEl().thenReturn( $cmpEl );
				
				JsMockito.when( fixture.getContainer() ).getItems().thenReturn( [ childCmp ] );
				
				var layout = fixture.getLayout();
				layout.doLayout();
				
				JsMockito.verify( childCmp ).setSize( fixture.getContainerWidth(), fixture.getContainerHeight() );
				JsMockito.verify( childCmp ).render( fixture.getTargetEl() );   // Call render(), to make sure the component is in the correct place
				
				$cmpEl.remove();
			} );
			
			
			it( "doLayout() should *not* move the container's child component if it is already rendered in the FitLayout", function() {
				var childCmp = fixture.getChildCmp();
				
				// Simulate that the component's element was created and added to the $targetEl
				var $cmpEl = jQuery( '<div />' );
				fixture.getTargetEl().append( $cmpEl );
				JsMockito.when( childCmp ).isRendered().thenReturn( true );
				JsMockito.when( childCmp ).getEl().thenReturn( $cmpEl );
				
				JsMockito.when( fixture.getContainer() ).getItems().thenReturn( [ childCmp ] );
				
				var layout = fixture.getLayout();
				layout.doLayout();
				
				JsMockito.verify( childCmp, JsMockito.Verifiers.never() ).render( fixture.getTargetEl() );
			} );
			
			
			it( "doLayout() should *not* move the container's child component if it is already rendered in the FitLayout, but should fix its size if the Container's contentTargetEl's size has changed", function() {
				var childCmp = fixture.getChildCmp();
				JsMockito.when( childCmp ).isRendered().thenReturn( false );
				
				JsMockito.when( fixture.getContainer() ).getItems().thenReturn( [ childCmp ] );
				
				var layout = fixture.getLayout();
				layout.doLayout();  // initial layout
				
				// Need to pretend the component is rendered now, and change the size of the target element 
				// before running the layout again
				JsMockito.when( childCmp ).isRendered().thenReturn( true );
				JsMockito.when( childCmp ).getEl().thenReturn( jQuery( '<div />' ).appendTo( fixture.getTargetEl() ) );
				fixture.getTargetEl().width( 42 );
				fixture.getTargetEl().height( 7 );
				layout.doLayout();
				
				JsMockito.verify( childCmp, JsMockito.Verifiers.once() ).render( fixture.getTargetEl() );   // should only be rendered the first time
				
				var targetWidth = fixture.getContainerWidth(),
				    targetHeight = fixture.getContainerHeight();
				JsMockito.verify( childCmp ).setSize( targetWidth, targetHeight );   // verify that it was set to the initial size first
				JsMockito.verify( childCmp ).setSize( 42, 7 );                       // verify that it was set to the new size as well
			} );
			
		} );
		
	} );
	
} );