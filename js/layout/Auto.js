/*global define */
define( [
	'Class',
	'ui/Container',
	'ui/layout/Layout'
], function( Class, Container, Layout ) {
	
	/**
	 * @class ui.layout.Auto
	 * @extends ui.layout.Layout
	 * 
	 * The default layout that is used for a {@link ui.Container Container}, which simply
	 * renders each child component into their own div element, and does no further sizing or formatting.
	 * 
	 * This class is usually not meant to be instantiated directly, but created by its layout type name 'auto' (or
	 * by not giving a {@link ui.Container Container} any {@link ui.Container#layout layout} config).
	 */
	var AutoLayout = Class.extend( Layout, {
		
		/**
		 * Layout implementation for AutoLayout, which simply renders each child component directly into the 
		 * Container's content target (see {@link ui.Component#getContentTarget}). 
		 * 
		 * @protected
		 * @method onLayout
		 * @param {ui.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		onLayout : function( childComponents, $targetEl ) {
			this._super( arguments );
			
			for( var i = 0, len = childComponents.length; i < len; i++ ) {
				// Render the child component (note: it will only be rendered if it is not yet rendered, or not in the correct position in the $targetEl)
				this.renderComponent( childComponents[ i ], $targetEl, { position: i } );
			}
		}
		
	} );
	
	
	// Register the layout type with the ui.Container class, which is used to be able to instantiate the layout via its type name.
	Container.registerLayout( 'auto', AutoLayout );

	return AutoLayout;
} );