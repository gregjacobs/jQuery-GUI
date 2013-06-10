/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
define( [
	'jquery',
	'jqc/Component',
	'jqc/Container',
	'jqc/layout/Layout',
	'spec/layout/LayoutFixture'
], function( jQuery, Component, Container, Layout, LayoutFixture ) {

	describe( 'jqc.layout.Layout', function() {
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
				var childCmp1 = new Component(),
				    childCmp2 = new Component(),
				    childCmp3 = new Component(),
				    container = fixture.getContainer();
				
				spyOn( childCmp1, 'getUuid' ).andReturn( 1 );
				spyOn( childCmp2, 'getUuid' ).andReturn( 2 );
				spyOn( childCmp3, 'getUuid' ).andReturn( 3 );
				spyOn( childCmp1, 'doLayout' );
				spyOn( childCmp2, 'doLayout' );
				spyOn( childCmp3, 'doLayout' );
				container.getItems.andReturn( [ childCmp1, childCmp2, childCmp3 ] );
				
				var layout = fixture.getLayout();
				layout.doLayout();
				
				expect( childCmp1.doLayout.callCount ).toBe( 1 );
				expect( childCmp2.doLayout.callCount ).toBe( 1 );
				expect( childCmp3.doLayout.callCount ).toBe( 1 );
			} );
			
			
			it( "should *not* call doLayout on a child component that is manually laid out by the layout routine implemented in a Layout subclass", function() {
				var childCmp1 = new Container(),  // Note: using actual
				    childCmp2 = new Container(),  // Containers here, because
				    childCmp3 = new Container();  // we need their 'afterlayout' event

				spyOn( childCmp1, 'doLayout' ).andCallThrough();
				spyOn( childCmp2, 'doLayout' ).andCallThrough();
				spyOn( childCmp3, 'doLayout' ).andCallThrough();
				
				var container = fixture.getContainer(),
				    layout = fixture.getLayout(),
				    $targetEl = fixture.getTargetEl();
				
				$targetEl.appendTo( 'body' );
				container.getItems.andReturn( [ childCmp1, childCmp2, childCmp3 ] );
				
				// Overwrite onLayout for this layout, to manually lay out childCmp2
				layout.onLayout = function() {
					layout.renderComponent( childCmp1, $targetEl );
					layout.renderComponent( childCmp2, $targetEl );
					layout.renderComponent( childCmp3, $targetEl );
					
					childCmp2.doLayout();
				};
				
				layout.doLayout();
				expect( childCmp1.doLayout.callCount ).toBe( 1 );
				expect( childCmp2.doLayout.callCount ).toBe( 1 );  // should only happen once!
				expect( childCmp3.doLayout.callCount ).toBe( 1 );
			} );
			
		} );
		
		
		describe( 'renderComponent()', function() {
			var unrenderedComponent,
			    renderedComponent,
			    $componentEl;
			
			beforeEach( function() {
				unrenderedComponent = new Component();
				spyOn( unrenderedComponent, 'render' );
				spyOn( unrenderedComponent, 'isRendered' ).andReturn( false );
				
				renderedComponent = new Component();
				$componentEl = jQuery( '<div />' );
				spyOn( renderedComponent, 'render' );
				spyOn( renderedComponent, 'isRendered' ).andReturn( true );
				spyOn( renderedComponent, 'getEl' ).andReturn( $componentEl );
			} );
			
			afterEach( function() {
				$componentEl.remove();
			} );
			
			
			it( "should render the component if the component is not yet rendered", function() {
				var $targetEl = fixture.getTargetEl(),
				    layout = fixture.getLayout();
				
				layout.renderComponent( unrenderedComponent, $targetEl );
				
				expect( unrenderedComponent.render.callCount ).toBe( 1 );
			} );
			
			
			it( "should render the component if the component is rendered, but not a child of the $targetEl (no `position` option provided)", function() {
				var $targetEl = fixture.getTargetEl();
				
				// Pretend the component is already rendered, but not in the $targetEl
				jQuery( 'body' ).append( $componentEl );
				
				var layout = fixture.getLayout();
				layout.renderComponent( renderedComponent, $targetEl );
				
				expect( renderedComponent.render.calls.length ).toBe( 1 );
			} );
			
			
			it( "should render the component if the component is rendered, but not in the correct position in the $targetEl (`position` provided as number)", function() {
				var $targetEl = fixture.getTargetEl(),
				    $otherCmpEl = jQuery( '<div />' );
				
				// Pretend the component is already rendered, but in the wrong position in the $targetEl
				$targetEl.append( $otherCmpEl );
				$targetEl.append( $componentEl );
				
				var layout = fixture.getLayout();
				layout.renderComponent( renderedComponent, $targetEl, { position: 0 } );  // the component is supposed to be the first element, but $otherCmpEl is
				
				expect( renderedComponent.render.calls.length ).toBe( 1 );
			} );
			
			
			it( "should render the component if the component is rendered, but not in the correct position in the $targetEl (`position` provided as HTMLElement)", function() {
				var $targetEl = fixture.getTargetEl(),
				    $otherCmpEl = jQuery( '<div />' );
				
				// Pretend the component is already rendered, but in the wrong position in the $targetEl
				$targetEl.append( $otherCmpEl );
				$targetEl.append( $componentEl );
				
				var layout = fixture.getLayout();
				layout.renderComponent( renderedComponent, $targetEl, { position: $otherCmpEl[ 0 ] } );  // the component is supposed to be before $otherCmpEl, but it is currently after it
				
				expect( renderedComponent.render.calls.length ).toBe( 1 );
			} );
			
			
			it( "should render the component if the component is rendered, but not in the correct position in the $targetEl (`position` provided as jQuery set)", function() {
				var $targetEl = fixture.getTargetEl(),
				    $otherCmpEl = jQuery( '<div />' );
				
				// Pretend the component is already rendered, but in the wrong position in the $targetEl
				$targetEl.append( $otherCmpEl );
				$targetEl.append( $componentEl );
				
				var layout = fixture.getLayout();
				layout.renderComponent( renderedComponent, $targetEl, { position: $otherCmpEl } );  // the component is supposed to be before $otherCmpEl, but it is currently after it
				
				expect( renderedComponent.render.calls.length ).toBe( 1 );
			} );
			
			
			// -----------------------------------------------------
			
			
			it( "should *not* render the component if the component is rendered, and already a child of the $targetEl (no `position` option provided)", function() {
				var $targetEl = fixture.getTargetEl();
				
				// Pretend the component is already rendered, already in the $targetEl
				jQuery( $targetEl ).append( $componentEl );
				
				var layout = fixture.getLayout();
				layout.renderComponent( renderedComponent, $targetEl );
				
				expect( renderedComponent.render ).not.toHaveBeenCalled();
			} );
			
			
			it( "should *not* render the component if the component is rendered, and already in the correct position (`position` provided as number)", function() {
				var $targetEl = fixture.getTargetEl(),
				    $otherCmpEl = jQuery( '<div />' );
				
				// Pretend the component is already rendered, already in the $targetEl, in the correct position
				jQuery( $targetEl ).append( $componentEl );
				jQuery( $targetEl ).append( $otherCmpEl );
				
				var layout = fixture.getLayout();
				layout.renderComponent( renderedComponent, $targetEl, { position: 0 } );
				
				expect( renderedComponent.render ).not.toHaveBeenCalled();
			} );
			
			
			it( "should *not* render the component if the component is rendered, and already in the correct position (`position` provided as HTMLElement)", function() {
				var $targetEl = fixture.getTargetEl(),
				    $otherCmpEl = jQuery( '<div />' );
				
				// Pretend the component is already rendered, already in the $targetEl, in the correct position
				jQuery( $targetEl ).append( $componentEl );
				jQuery( $targetEl ).append( $otherCmpEl );
				
				var layout = fixture.getLayout();
				layout.renderComponent( renderedComponent, $targetEl, { position: $otherCmpEl[ 0 ] } );
				
				expect( renderedComponent.render ).not.toHaveBeenCalled();
			} );
			
			
			it( "should *not* render the component if the component is rendered, and already in the correct position (`position` provided as jQuery set)", function() {
				var $targetEl = fixture.getTargetEl(),
				    $otherCmpEl = jQuery( '<div />' );
				
				// Pretend the component is already rendered, already in the $targetEl, in the correct position
				jQuery( $targetEl ).append( $componentEl );
				jQuery( $targetEl ).append( $otherCmpEl );
				
				var layout = fixture.getLayout();
				layout.renderComponent( renderedComponent, $targetEl, { position: $otherCmpEl } );
				
				expect( renderedComponent.render ).not.toHaveBeenCalled();
			} );
		} );
	} );
	
} );