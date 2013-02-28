/**
 * @class ui.layout.ContainerLayout
 * @extends ui.layout.Layout
 * 
 * The default layout that is used for a {@link ui.Container Container}, which simply
 * renders each child component into their own div element, and does no further sizing or formatting.
 * 
 * This class is usually not meant to be instantiated directly, but created by its layout type name 'container' (or
 * by not giving the {@link ui.Container Container} any {@link ui.Container#layout layout} config).
 * 
 * @constructor
 * @param {Object} config The configuration options for the Layout, specified in an object (hash).
 */
/*global Class, Jux, ui */
ui.layout.ContainerLayout = Class.extend( ui.layout.Layout, {
	
	/**
	 * Layout implementation for ContainerLayout, which simply renders each child component directly into the 
	 * Container's content target (see {@link ui.Component#getContentTarget). 
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
ui.Container.registerLayout( 'container', ui.layout.ContainerLayout );
