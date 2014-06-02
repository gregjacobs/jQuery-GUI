/*global define */
define( [
	'gui/layout/Manager',
	'gui/layout/Layout'
], function( LayoutManager, Layout ) {
	
	/**
	 * @class gui.layout.Auto
	 * @extends gui.layout.Layout
	 * @alias layout.auto
	 * 
	 * The default layout that is used for a {@link gui.Container Container}, which simply
	 * renders each child component into their own div element, and does no further sizing or formatting.
	 * 
	 * This class is usually not meant to be instantiated directly, but created by its layout type name 'auto' (or
	 * by not giving a {@link gui.Container Container} any {@link gui.Container#layout layout} config).
	 */
	var AutoLayout = Layout.extend( {
		
		/**
		 * Layout implementation for AutoLayout, which simply renders each child component directly into the 
		 * Container's layout target (see {@link gui.Container#getLayoutTarget}). 
		 * 
		 * @protected
		 * @method onLayout
		 * @param {gui.Component[]} childComponents The child components that should be rendered and laid out.
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
	
	
	LayoutManager.registerType( 'auto', AutoLayout );

	return AutoLayout;
	
} );