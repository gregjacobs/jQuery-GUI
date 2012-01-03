/**
 * @class ui.layouts.ContainerLayout
 * @extends ui.layouts.AbstractLayout
 * 
 * The default layout that is used for a {@link ui.Container Container}, which simply
 * renders each child component into their own div element, and does no further sizing or formatting.<br><br>
 * 
 * This class is usually not meant to be instantiated directly, but created by its layout type name 'container' (or
 * by not giving the {@link ui.Container Container} any {@link ui.Container#layout layout} config).
 * 
 * @constructor
 * @param {Object} config The configuration options for the Layout, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.layouts.ContainerLayout = Kevlar.extend( ui.layouts.AbstractLayout, {
	
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
		ui.layouts.CardsLayout.superclass.onLayout.apply( this, arguments );
		
		for( var i = 0, len = childComponents.length; i < len; i++ ) {
			childComponents[ i ].render( $targetEl );  // render the child component into the Container's content target element
		}
	}
	
} );


// Register the layout type with the ui.Container class, which is used to be able to instantiate the layout via its type name.
ui.Container.registerLayout( 'container', ui.layouts.ContainerLayout );
