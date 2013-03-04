/*global define, describe, beforeEach, afterEach, it, expect, JsMockito */
define( [
	'jquery',
	'ui/Component',
	'ui/Container',
	'ui/layout/Layout',
	'spec/layout/LayoutFixture'
], function( jQuery, Component, Container, Layout, LayoutFixture ) {

	describe( 'ui.layout.Layout', function() {
		var fixture;
		
		beforeEach( function() {
			fixture = new LayoutFixture();
		} );
		
		afterEach( function() {
			fixture.destroy();
		} );
		
		
		describe( 'doLayout()', function() {
			it( "should call onLayout() for subclasses", function() {
				var layout = fixture.getLayout(),
				    onLayoutCallCount = 0;
				
				layout.onLayout = function() { onLayoutCallCount++; };  // override for test
				layout.doLayout();
				
				expect( onLayoutCallCount ).toBe( 1 );
			} );
			
			
			it( "should call doLayout() on each of the container's child components, to recalculate their layout", function() {
				var childCmp1 = JsMockito.mock( Component ),
				    childCmp2 = JsMockito.mock( Component ),
				    childCmp3 = JsMockito.mock( Component );
				
				JsMockito.when( childCmp1 ).getUuid().thenReturn( 1 );
				JsMockito.when( childCmp1 ).getUuid().thenReturn( 2 );
				JsMockito.when( childCmp1 ).getUuid().thenReturn( 3 );
				JsMockito.when( fixture.getContainer() ).getItems().thenReturn( [ childCmp1, childCmp2, childCmp3 ] );
				
				var layout = fixture.getLayout();
				layout.doLayout();
				
				JsMockito.verify( childCmp1 ).doLayout();
				JsMockito.verify( childCmp2 ).doLayout();
				JsMockito.verify( childCmp3 ).doLayout();
			} );
			
			
			it( "should *not* call doLayout on a child component that is manually laid out by the layout routine implemented in a Layout subclass", function() {
				var childCmp1 = JsMockito.spy( new Container() ),  // Note: using actual
				    childCmp2 = JsMockito.spy( new Container() ),  // Containers here, because
				    childCmp3 = JsMockito.spy( new Container() );  // we need their 'afterlayout' event
				
				var container = fixture.getContainer(),
				    layout = fixture.getLayout(),
				    $targetEl = fixture.getTargetEl();
				
				$targetEl.appendTo( 'body' );
				JsMockito.when( container ).getItems().thenReturn( [ childCmp1, childCmp2, childCmp3 ] );
				
				// Overwrite onLayout for this layout, to manually lay out childCmp2
				layout.onLayout = function() {
					layout.renderComponent( childCmp1, $targetEl );
					layout.renderComponent( childCmp2, $targetEl );
					layout.renderComponent( childCmp3, $targetEl );
					
					childCmp2.doLayout();
				};
				
				layout.doLayout();
				JsMockito.verify( childCmp1 ).doLayout();
				JsMockito.verify( childCmp2 ).doLayout();  // should only happen once!
				JsMockito.verify( childCmp3 ).doLayout();
			} );
			
		} );
		
		
		describe( 'renderComponent()', function() {
			var unrenderedComponent,
			    renderedComponent,
			    $componentEl;
			
			beforeEach( function() {
				unrenderedComponent = JsMockito.mock( Component );
				JsMockito.when( unrenderedComponent ).isRendered().thenReturn( false );
				
				renderedComponent = JsMockito.mock( Component );
				$componentEl = jQuery( '<div />' );
				JsMockito.when( renderedComponent ).isRendered().thenReturn( true );
				JsMockito.when( renderedComponent ).getEl().thenReturn( $componentEl );
			} );
			
			afterEach( function() {
				$componentEl.remove();
			} );
			
			
			it( "should render the component if the component is not yet rendered", function() {
				var $targetEl = fixture.getTargetEl(),
				    layout = fixture.getLayout();
				
				layout.renderComponent( unrenderedComponent, $targetEl );
				
				JsMockito.verify( unrenderedComponent ).render();
			} );
			
			
			it( "should render the component if the component is rendered, but not a child of the $targetEl (no `position` option provided)", function() {
				var $targetEl = fixture.getTargetEl();
				
				// Pretend the component is already rendered, but not in the $targetEl
				jQuery( 'body' ).append( $componentEl );
				
				var layout = fixture.getLayout();
				layout.renderComponent( renderedComponent, $targetEl );
				
				JsMockito.verify( renderedComponent ).render();
			} );
			
			
			it( "should render the component if the component is rendered, but not in the correct position in the $targetEl (`position` provided as number)", function() {
				var $targetEl = fixture.getTargetEl(),
				    $otherCmpEl = jQuery( '<div />' );
				
				// Pretend the component is already rendered, but in the wrong position in the $targetEl
				$targetEl.append( $otherCmpEl );
				$targetEl.append( $componentEl );
				
				var layout = fixture.getLayout();
				layout.renderComponent( renderedComponent, $targetEl, { position: 0 } );  // the component is supposed to be the first element, but $otherCmpEl is
				
				JsMockito.verify( renderedComponent ).render();
			} );
			
			
			it( "should render the component if the component is rendered, but not in the correct position in the $targetEl (`position` provided as HTMLElement)", function() {
				var $targetEl = fixture.getTargetEl(),
				    $otherCmpEl = jQuery( '<div />' );
				
				// Pretend the component is already rendered, but in the wrong position in the $targetEl
				$targetEl.append( $otherCmpEl );
				$targetEl.append( $componentEl );
				
				var layout = fixture.getLayout();
				layout.renderComponent( renderedComponent, $targetEl, { position: $otherCmpEl[ 0 ] } );  // the component is supposed to be before $otherCmpEl, but it is currently after it
				
				JsMockito.verify( renderedComponent ).render();
			} );
			
			
			it( "should render the component if the component is rendered, but not in the correct position in the $targetEl (`position` provided as jQuery set)", function() {
				var $targetEl = fixture.getTargetEl(),
				    $otherCmpEl = jQuery( '<div />' );
				
				// Pretend the component is already rendered, but in the wrong position in the $targetEl
				$targetEl.append( $otherCmpEl );
				$targetEl.append( $componentEl );
				
				var layout = fixture.getLayout();
				layout.renderComponent( renderedComponent, $targetEl, { position: $otherCmpEl } );  // the component is supposed to be before $otherCmpEl, but it is currently after it
				
				JsMockito.verify( renderedComponent ).render();
			} );
			
			
			// -----------------------------------------------------
			
			
			it( "should *not* render the component if the component is rendered, and already a child of the $targetEl (no `position` option provided)", function() {
				var $targetEl = fixture.getTargetEl();
				
				// Pretend the component is already rendered, already in the $targetEl
				jQuery( $targetEl ).append( $componentEl );
				
				var layout = fixture.getLayout();
				layout.renderComponent( renderedComponent, $targetEl );
				
				JsMockito.verify( renderedComponent, JsMockito.Verifiers.never() ).render();
			} );
			
			
			it( "should *not* render the component if the component is rendered, and already in the correct position (`position` provided as number)", function() {
				var $targetEl = fixture.getTargetEl(),
				    $otherCmpEl = jQuery( '<div />' );
				
				// Pretend the component is already rendered, already in the $targetEl, in the correct position
				jQuery( $targetEl ).append( $componentEl );
				jQuery( $targetEl ).append( $otherCmpEl );
				
				var layout = fixture.getLayout();
				layout.renderComponent( renderedComponent, $targetEl, { position: 0 } );
				
				JsMockito.verify( renderedComponent, JsMockito.Verifiers.never() ).render();
			} );
			
			
			it( "should *not* render the component if the component is rendered, and already in the correct position (`position` provided as HTMLElement)", function() {
				var $targetEl = fixture.getTargetEl(),
				    $otherCmpEl = jQuery( '<div />' );
				
				// Pretend the component is already rendered, already in the $targetEl, in the correct position
				jQuery( $targetEl ).append( $componentEl );
				jQuery( $targetEl ).append( $otherCmpEl );
				
				var layout = fixture.getLayout();
				layout.renderComponent( renderedComponent, $targetEl, { position: $otherCmpEl[ 0 ] } );
				
				JsMockito.verify( renderedComponent, JsMockito.Verifiers.never() ).render();
			} );
			
			
			it( "should *not* render the component if the component is rendered, and already in the correct position (`position` provided as jQuery set)", function() {
				var $targetEl = fixture.getTargetEl(),
				    $otherCmpEl = jQuery( '<div />' );
				
				// Pretend the component is already rendered, already in the $targetEl, in the correct position
				jQuery( $targetEl ).append( $componentEl );
				jQuery( $targetEl ).append( $otherCmpEl );
				
				var layout = fixture.getLayout();
				layout.renderComponent( renderedComponent, $targetEl, { position: $otherCmpEl } );
				
				JsMockito.verify( renderedComponent, JsMockito.Verifiers.never() ).render();
			} );
		} );
	} );
	
} );