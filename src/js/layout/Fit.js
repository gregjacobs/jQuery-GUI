/*global define */
define( [
	'Class',
	'jqc/Component',
	'jqc/Container',
	'jqc/layout/Layout'
], function( Class, Component, Container, Layout ) {

	/**
	 * @class jqc.layout.Fit
	 * @extends jqc.layout.Layout
	 * @alias layout.fit
	 * 
	 * A layout that renders a {@link jqc.Container Container's} child component to full height and width of the container. 
	 * A FitLayout only renders the first {@link jqc.Container#items child component} of a {@link jqc.Container Container}.
	 * 
	 * This class is usually not meant to be instantiated directly, but created by its layout type name 'fit'.
	 */
	var FitLayout = Layout.extend( {
		
		/**
		 * @cfg {Boolean} browserManagedWidth
		 * True to have the FitLayout simply set width: 100% to size the width, false to use the exact pixel
		 * size of the $targetEl element.
		 */
		browserManagedWidth : false,
		
		/**
		 * @cfg {Boolean} browserManagedHeight
		 * True to have the FitLayout simply set height: 100% to size the height, false to use the exact pixel
		 * size of the $targetEl element.
		 */
		browserManagedHeight : false,
		
		
		/**
		 * @protected
		 * @property {jqc.Component} lastRenderedComponent
		 * 
		 * Keeps track of the last component that was rendered by the FitLayout. This has to do with caching
		 * the size (stored by {@link #lastRenderedSize}). We don't want to cache the size of another component
		 * that is no longer being shown by the FitLayout. 
		 */
		lastRenderedComponent : null,
		
		/**
		 * @protected
		 * @property {Object} lastRenderedSize
		 * 
		 * A hashmap of `width` and `height` properties that holds the last size that the {@link #lastRenderedComponent}
		 * was set to.
		 */
		
	
		/**
		 * Implementation of the FitLayout, which sizes the {@link #container container's} first {@link jqc.Container#items child component}
		 * to be the full height and width of the {@link #container container's} element.
		 * 
		 * @protected
		 * @method onLayout
		 * @param {jqc.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		onLayout : function( childComponents, $targetEl ) {
			this._super( arguments );
			
			var numChildComponents = childComponents.length;
			
			// Now render the child Component
			if( numChildComponents > 0 ) {
				var childComponent = childComponents[ 0 ],
				    targetWidth = ( this.browserManagedWidth ) ? '100%' : $targetEl.width(),
				    targetHeight = ( this.browserManagedHeight ) ? '100%' : $targetEl.height();
				
				// Detach all other child Components in the Container, just in case they are rendered into the $targetEl from another layout run,
				// or the components have been reordered in the container
				for( var i = 1; i < numChildComponents; i++ ) {
					childComponents[ i ].detach();
				}
				
				// Render the component (note: it will only be rendered if it is not yet rendered, or is not a child of the $targetEl)
				this.renderComponent( childComponent, $targetEl );
				
				if( childComponent !== this.lastRenderedComponent ) {
					this.lastRenderedSize = {};  // clear the results of the last rendered size, from any other component that was rendered by the layout, now that we have a new component being rendered / laid out
					this.lastRenderedComponent = childComponent;
				}
				
				// We can now size it, since it has been rendered. (sizeComponent needs to calculate the margin/padding/border on the child component)
				// Only size it if need be, however.
				var lastRenderedSize = this.lastRenderedSize;
				if( targetWidth !== lastRenderedSize.width || targetHeight !== lastRenderedSize.height ) {
					this.sizeComponent( childComponent, targetWidth, targetHeight );
					
					this.lastRenderedSize = { width: targetWidth, height: targetHeight };
				}
			}
		}
		
	} );
	
	
	// Register the layout type with the jqc.Container class, which is used to be able to instantiate the layout via its type name.
	Container.registerLayout( 'fit', FitLayout );

	return FitLayout;
	
} );