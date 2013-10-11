/*global define */
define( [
	'require',
	'jqg/layout/Layout',
	'jqg/Container'
], function( require, Layout ) {
	
	/**
	 * @class jqg.layout.Auto
	 * @extends jqg.layout.Layout
	 * @alias layout.auto
	 * 
	 * The default layout that is used for a {@link jqg.Container Container}, which simply
	 * renders each child component into their own div element, and does no further sizing or formatting.
	 * 
	 * This class is usually not meant to be instantiated directly, but created by its layout type name 'auto' (or
	 * by not giving a {@link jqg.Container Container} any {@link jqg.Container#layout layout} config).
	 */
	var AutoLayout = Layout.extend( {
		
		/**
		 * Layout implementation for AutoLayout, which simply renders each child component directly into the 
		 * Container's content target (see {@link jqg.Component#getContentTarget}). 
		 * 
		 * @protected
		 * @method onLayout
		 * @param {jqg.Component[]} childComponents The child components that should be rendered and laid out.
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
	
	// Register the layout type with the jqg.Container class, which is used to be able to instantiate the layout via its type name.
	// NOTE: Due to circular dependency issues with RequireJS, jqg.Container automatically considers this class as "registered" with
	// the type string 'auto'. Leaving below line commented as a reminder. Even if we add an async require() call here,
	// it is possible that the AutoLayout class is still not registered in time for use.
	//Container.registerLayout( 'auto', AutoLayout );   -- leave as reminder

	return AutoLayout;
} );