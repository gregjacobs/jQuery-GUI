/*global define */
define( [
	'jquery',
	'jqg/Component',
	'jqg/Container',
	'jqg/layout/Layout'
], function( jQuery, Component, Container, Layout ) {

	/**
	 * @class jqg.layout.HBox
	 * @extends jqg.layout.Layout
	 * @alias layout.hbox
	 * 
	 * A layout that renders its {@link #container container's} child components using a "flexbox" scheme. Each child component
	 * in the Container that should have a flexible width that proportionally should take up the remaining area of its parent
	 * element should have a special property named {@link #flex}, that determines how wide the box should be in relation to the
	 * available area.  This property is a number, relative to other children. If a {@link #flex} not provided, the layout uses 
	 * the component's width instead.
	 */
	var HBoxLayout = Layout.extend( {
		
		/**
		 * @cfg {Number} flex
		 * This config is to be placed on **child components** of the {@link #container}. The number is a ratio
		 * of how much space the child component should take up in relation to the remaining space in the target
		 * element, and based on other child components' flex values.
		 * 
		 * For example, the following configuration would make component #1 have ~33% width, and component #2 have
		 * ~67% width.
		 * 
		 *     layout : 'hbox',
		 *     items : [
		 *         {
		 *             flex : 1,
		 *             html : "I'm at 33% width"
		 *         },
		 *         {
		 *             flex : 2,
		 *             html : "I'm at 67% width"
		 *         }
		 *     ]
		 * 
		 * Other components may also exist in the {@link #container} that do not have a {@link #flex} value. These will be sized,
		 * and components *with* a {@link #flex} value will be flexed into the *remaining* space that is not taken up by the other
		 * components. Example:
		 * 
		 *     width : 100,    // not necessary, but just for example purposes
		 *     layout : 'hbox',
		 *     
		 *     items : [
		 *         {
		 *             html : "I will be sized based on my content. Let's say my width is 20px though, for argument's sake"
		 *         },
		 *         {
		 *             flex : 1,
		 *             html : "Since the previous component is 20px wide, I will take up the remaining 80px of space"
		 *         }
		 *     ]
		 */
		
		/**
		 * @protected
		 * @property {jQuery} $clearEl
		 * 
		 * The element used to clear the floats created by the layout routine.
		 */
		
		
		/**
		 * Hook method for subclasses to override to implement their layout strategy. Implements the HBoxLayout algorithm.
		 * 
		 * @protected
		 * @template
		 * @param {jqg.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		onLayout : function( childComponents, $targetEl ) {
			this._super( arguments );
			
			
			var flexedComponents = [],
			    totalFlex = 0,
			    totalUnflexedWidth = 0,
			    i, len, childComponent, numChildComponents = childComponents.length;
			
			// First, render and lay out each of the child components that don't have a 'flex' value.
			// While we're at it, we'll add up the total flex that components which *do* have a flex value have.
			for( i = 0; i < numChildComponents; i++ ) {
				childComponent = childComponents[ i ];
				
				// Add the CSS class to components to be able to place them in an HBox layout. This adds `float:left;`,
				// and a few other fixing styles.
				childComponent.addCls( 'jqg-layout-hbox-component' );
				
				// Render the component (note: it is only rendered if it is not yet rendered already, or in the wrong position in the DOM)
				this.renderComponent( childComponent, $targetEl, { position: i } );
				
				// Only process the child component if it is not hidden
				if( !childComponent.isHidden() ) {
					if( !childComponent.flex ) {
						// Not a flexed component, do its layout
						childComponent.doLayout();
						
						// Sadly, the element being measured may have a sub-pixel width, but jQuery returns the floor value of 
						// it. And in this case, we would get float wrapping because the sum of the actual widths would be greater 
						// than the container width after flex values are computed. So simply adding one pixel as a workaround
						// at this point. May have to do something different in the future, with a table layout.
						totalUnflexedWidth += Math.floor( 1 + childComponent.getOuterWidth( /* includeMargin */ true ) );
						
					} else {
						// Flexed component: push it onto the flexed components processing array for the next step
						flexedComponents.push( childComponent );
						totalFlex += childComponent.flex;
					}
				}
			}
			
			// Now go through and size the other child components based on their flex values and the remaining space.
			if( totalFlex > 0 ) {
				var targetWidth = $targetEl.width(),
				    targetHeight = $targetEl.height(),
				    remainingTargetWidth = targetWidth - totalUnflexedWidth,
				    trimmedPixels = 0;  // Stores the decimal values resulting in the division of the remainingTargetWidth divided by the flex value. 
				                        // The pixels that are trimmed off of each of the child components is added to the last item to fill the extra space.
				
				for( i = 0, len = flexedComponents.length; i < len; i++ ) {
					childComponent = flexedComponents[ i ];
					
					// Now size the flexed component based on the flex value
					var newChildWidth = ( childComponent.flex / totalFlex ) * remainingTargetWidth;
					trimmedPixels += newChildWidth % 1;            // take the decimal value from the child height. Ex: 3.25 % 1 == 0.25  (We'll use this later).
					newChildWidth = Math.floor( newChildWidth );  // and do the actual trimming off of the decimal for the new child height
					
					// If sizing the last component, add in (the smallest whole number of) the decimal value pixels that were trimmed from previous components
					if( i === len - 1 ) {
						newChildWidth += Math.floor( trimmedPixels );
						newChildWidth--;  // and take off a pixel to attempt to fix the accidental browser wrapping issue with sub-pixel widths...
					}
					
					this.sizeComponent( childComponent, newChildWidth, undefined );
				}
			}
			
			if( !this.$clearEl ) {
				this.$clearEl = jQuery( '<div class="jqg-layout-hbox-clear" />' );  // to clear the floats
			}
			$targetEl.append( this.$clearEl );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onDestroy : function() {
			if( this.$clearEl ) {
				this.$clearEl.remove();
			}
			
			this._super( arguments );
		}
		
	} );
	
	
	// Register the layout type with the jqg.Container class, which is used to be able to instantiate the layout via its type name.
	Container.registerLayout( 'hbox', HBoxLayout );
	
	return HBoxLayout;
	
} );
