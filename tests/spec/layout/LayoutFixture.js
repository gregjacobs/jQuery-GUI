/*global define, spyOn */
define( [
	'jquery',
	'lodash',
	'Class',
	'gui/Component',
	'gui/Container',
	'gui/layout/Layout'
], function( jQuery, _, Class, Component, Container, Layout ) {
	
	/**
	 * @class spec.layout.LayoutFixture
	 * @extends Object
	 * 
	 * Fixture class for the base class {@link gui.layout.Layout} tests.
	 * 
	 * This class creates the fixture for the tests upon construction. It is usually created as part
	 * of a `beforeEach()` method. All parts of the fixture which are needed for tests are available via 
	 * accessor methods (ex: {@link #getLayout}, {@link #getTargetEl}, etc).
	 * 
	 * Upon completion of a test, the fixture should be {@link #destroy destroyed}, usually from an `afterEach()` 
	 * method.
	 */
	var LayoutFixture = Class.extend( Object, {
		
		/**
		 * @cfg {Number} targetWidth
		 * 
		 * The {@link #$targetEl target element's} reported width.
		 */
		targetWidth : 100,
		
		/**
		 * @cfg {Number} targetHeight
		 * 
		 * The {@link #$targetEl target element's} reported height.
		 */
		targetHeight : 200,
	
		
		/**
		 * @protected
		 * @property {jQuery} $targetEl
		 * 
		 * A jQuery element which is the target element of the layout. This is the parent
		 * element of what the layout is rendering/sizing things into.
		 */
		
		/**
		 * @protected
		 * @property {gui.Container} container
		 * 
		 * A mock {@link gui.Container} instance.
		 */
		
		/**
		 * @protected
		 * @property {gui.layout.Layout} layout
		 * 
		 * The layout created via {@link #createLayout} for the TestCase subclass, and configured with the
		 * mock {@link #container}.
		 */
		
		
		/**
		 * @constructor
		 */
		constructor : function( cfg ) {
			_.assign( this, cfg );
			
			// A mock layout target element
			this.$targetEl = jQuery( '<div style="width: ' + this.targetWidth + 'px; height: ' + this.targetHeight + 'px;" />' );
			
			// A mock Container, which uses the $targetEl as its layout target
			this.container = new Container();
			spyOn( this.container, 'getLayoutTarget' ).andReturn( this.$targetEl );
			spyOn( this.container, 'getCount' ).andReturn( 0 );      // initially 0. Override in tests.
			spyOn( this.container, 'getItems' ).andReturn( [] );     // initially empty. Override in tests.
			spyOn( this.container, 'getItemAt' ).andReturn( null );  // all calls to getItemAt() (with any argument) should return null by default. 
			                                                         // Specific argument values can be overridden in tests to return actual objects.
			spyOn( this.container, 'isRendered' ).andReturn( true ); // must be rendered for the layout routine to run
			
			
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
		 * @return {gui.layout.Layout} A concrete Layout subclass for use with the tests.
		 */
		createLayout : function() {
			var LayoutSubclass = Class.extend( Layout, {} );  // concrete subclass
			return new LayoutSubclass();
		},
		
		
		/**
		 * Utility method for tests to be able to create mock child components with some default implementations
		 * for common methods (such as {@link gui.Component#getPadding}, {@link gui.Component#getMargin}, and {@link gui.Component#getBorderWidth}.
		 * 
		 * @method createChildComponents
		 * @param {Number} howMany How many components to create.
		 * @return {gui.Component[]} An array of mock {@link gui.Component components}.
		 */
		createChildComponents : function( howMany ) {
			var childComponents = [],
			    childComponent;
			
			for( var i = 0; i < howMany; i++ ) {
				childComponent = childComponents[ i ] = new Component();
				
				// Note: All mock returns can be overridden
				spyOn( childComponent, 'getPadding' ).andReturn( 0 );
				spyOn( childComponent, 'getMargin' ).andReturn( 0 );
				spyOn( childComponent, 'getBorderWidth' ).andReturn( 0 );
				
				spyOn( childComponent, 'getHeight' ).andReturn( this.targetHeight );
				spyOn( childComponent, 'getInnerHeight' ).andReturn( this.targetHeight );
				spyOn( childComponent, 'getOuterHeight' ).andReturn( this.targetHeight );
				spyOn( childComponent, 'getWidth' ).andReturn( this.targetWidth );
				spyOn( childComponent, 'getInnerWidth' ).andReturn( this.targetWidth );
				spyOn( childComponent, 'getOuterWidth' ).andReturn( this.targetWidth );
			}
			return childComponents;
		},
		
		
		/**
		 * Retrieves the Fixture's {@link #container}, which is the Container that the {@link #layout}
		 * is attached to.
		 * 
		 * @return {gui.Container}
		 */
		getContainer : function() {
			return this.container;
		},
		
		
		/**
		 * Retrieves the Fixture's {@link #layout} (which is created by {@link #createLayout}).
		 * This layout is attached to the fixture's {@link #container}.
		 * 
		 * @return {gui.layout.Layout}
		 */
		getLayout : function() {
			return this.layout;
		},
		
		
		/**
		 * Retrieves the {@link #layout layout's} {@link #$targetEl target element}. This is the element where 
		 * child components' elements are placed into.
		 * 
		 * @return {jQuery}
		 */
		getTargetEl : function() {
			return this.$targetEl;
		},
		
		
		/**
		 * Retrieves the {@link #layout layout's} {@link #$targetEl target element's} width. This is how wide
		 * the target element is configured to be (in pixels).
		 * 
		 * @return {Number} The target element's width.
		 */
		getContainerWidth : function() {
			return this.targetWidth;
		},
		
		
		/**
		 * Retrieves the {@link #layout layout's} {@link #$targetEl target element's} height. This is how wide
		 * the target element is configured to be (in pixels).
		 * 
		 * @return {Number} The target element's height.
		 */
		getContainerHeight : function() {
			return this.targetHeight;
		},
		
		
		/**
		 * Destroys the LayoutFixture
		 */
		destroy : function() {
			this.layout.destroy();
			
			this.$targetEl.remove();
		}
		
	} );
	
	return LayoutFixture;
	
} );