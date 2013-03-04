/*global define, JsMockito */
define( [
	'jquery',
	'Class',
	'ui/Component',
	'ui/Container',
	'ui/layout/Layout'
], function( jQuery, Class, Component, Container, Layout ) {
	
	var LayoutFixture = Class.extend( Object, {
	
		/**
		 * @protected
		 * @property {jQuery} $targetEl
		 * 
		 * A jQuery element which is the target element of the layout. This is the parent
		 * element of what the layout is rendering/sizing things into.
		 */
		
		/**
		 * @protected
		 * @property {ui.Container} container
		 * 
		 * A mock Container instance.
		 */
		
		/**
		 * @protected
		 * @property {ui.layout.Layout} layout
		 * 
		 * The layout created via {@link #createLayout} for the TestCase subclass, and configured with the
		 * mock {@link #container}.
		 */
		
		/**
		 * @protected
		 * @property {Number} targetWidth
		 * 
		 * The {@link #$targetEl target element's} reported width.
		 */
		targetWidth : 100,
		
		/**
		 * @protected
		 * @property {Number} targetHeight
		 * 
		 * The {@link #$targetEl target element's} reported height.
		 */
		targetHeight : 200,
		
		
		/**
		 * @constructor
		 */
		constructor : function() {
			// A mock Content target element
			this.$targetEl = jQuery( '<div style="width: ' + this.targetWidth + 'px; height: ' + this.targetHeight + 'px;" />' );
			
			// A mock Container, which uses the $targetEl as its content target
			this.container = JsMockito.mock( Container );
			JsMockito.when( this.container ).getContentTarget().thenReturn( this.$targetEl );
			JsMockito.when( this.container ).getCount().thenReturn( 0 );      // initially 0. Override in tests.
			JsMockito.when( this.container ).getItems().thenReturn( [] );     // initially empty. Override in tests.
			JsMockito.when( this.container ).getItemAt().thenReturn( null );  // all calls to getItemAt() (with any argument) should return null by default. 
			                                                                  // Specific argument values can be overridden in tests to return actual objects.
			JsMockito.when( this.container ).isRendered().thenReturn( true ); // must be rendered for the layout routine to run
			
			
			// Create a layout for testing, and set its 'container' to the mock Container
			// Check the validity of the createLayout method first though, to make sure each subclass implements its own
			if( !this.constructor.prototype.hasOwnProperty( 'createLayout' ) ) {
				throw new Error( "createLayout() must be implemented in each LayoutFixture subclass" );
			}
			this.layout = this.createLayout();
			this.layout.setContainer( this.container );
		},
		
		
		/**
		 * Creates the appropriate layout for the test subclass.
		 * 
		 * This method must be overridden in each TestCase subclass.
		 * 
		 * @method createLayout
		 * @return {ui.layout.Layout} A concrete Layout subclass for use with the tests.
		 */
		createLayout : function() {
			var LayoutSubclass = Class.extend( Layout, {} );  // concrete subclass
			return new LayoutSubclass();
		},
		
		
		/**
		 * Utility method for tests to be able to create mock child components with some default implementations
		 * for common methods (such as {@link ui.Component#getPadding}, {@link ui.Component#getMargin}, and {@link ui.Component#getBorderWidth}.
		 * 
		 * @method createChildComponents
		 * @param {Number} howMany How many components to create.
		 * @return {ui.Component[]} An array of the mocked {@link ui.Component components}.
		 */
		createChildComponents : function( howMany ) {
			var childComponents = [],
			    childComponent;
			
			for( var i = 0; i < howMany; i++ ) {
				childComponent = childComponents[ i ] = JsMockito.mock( Component );
				
				// Note: All mock returns can be overridden
				JsMockito.when( childComponent ).getPadding().thenReturn( 0 );
				JsMockito.when( childComponent ).getMargin().thenReturn( 0 );
				JsMockito.when( childComponent ).getBorderWidth().thenReturn( 0 );
				
				JsMockito.when( childComponent ).getHeight().thenReturn( this.targetHeight );
				JsMockito.when( childComponent ).getInnerHeight().thenReturn( this.targetHeight );
				JsMockito.when( childComponent ).getOuterHeight().thenReturn( this.targetHeight );
				JsMockito.when( childComponent ).getWidth().thenReturn( this.targetWidth );
				JsMockito.when( childComponent ).getInnerWidth().thenReturn( this.targetWidth );
				JsMockito.when( childComponent ).getOuterWidth().thenReturn( this.targetWidth );
			}
			return childComponents;
		},
		
		
		/**
		 * Retrieves the Fixture's {@link #container}, which is the Container that the {@link #layout}
		 * is attached to.
		 * 
		 * @method getContainer
		 * @return {ui.Container}
		 */
		getContainer : function() {
			return this.container;
		},
		
		
		/**
		 * Retrieves the Fixture's {@link #layout} (which is created by {@link #createLayout}).
		 * This layout is attached to the fixture's {@link #container}.
		 * 
		 * @method getLayout
		 * @return {ui.layout.Layout}
		 */
		getLayout : function() {
			return this.layout;
		},
		
		
		/**
		 * Retrieves the {@link #layout layout's} target element. This is the element where child components'
		 * elements are placed into.
		 * 
		 * @method getTargetEl
		 * @return {jQuery}
		 */
		getTargetEl : function() {
			return this.$targetEl;
		},
		
		
		/**
		 * Destroys the LayoutFixture
		 * 
		 * @method destroy
		 */
		destroy : function() {
			this.layout.destroy();
			
			this.$targetEl.remove();
		}
		
	} );
	
	return LayoutFixture;
	
} );