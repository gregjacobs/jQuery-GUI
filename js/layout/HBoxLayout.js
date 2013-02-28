/**
 * @class ui.layout.HBoxLayout
 * @extends ui.layout.Layout
 * 
 * A layout that renders its {@link #container container's} child components using a "flexbox" scheme. Each child component
 * in the Container that should have a flexible width that proportionally should take up the remaining area of its parent
 * element should have a special property named {@link #flex}, that determines how wide the box should be in relation to the
 * available area.  This property is a number, relative to other children. If a {@link #flex} not provided, the layout uses 
 * the component's width instead.
 */
/*global _, Class, ui */
ui.layout.HBoxLayout = Class.extend( ui.layout.Layout, {
	
	
	
	// NOTE: This layout may not work correctly yet (totally untested). Try it out and fix if need be though ;-)
	
	
	
	
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
	 * Hook method for subclasses to override to implement their layout strategy. Implements the HBoxLayout algorithm.
	 * 
	 * @protected
	 * @template
	 * @method onLayout
	 * @param {ui.Component[]} childComponents The child components that should be rendered and laid out.
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
			
			// Render the component (note: it is only rendered if it is not yet rendered already, or in the wrong position in the DOM)
			this.renderComponent( childComponent, $targetEl, { position: i } );
			
			if( !childComponent.flex ) {
				// Not a flexed component, do its layout, and take note of its height
				childComponent.doLayout();
				totalUnflexedWidth += childComponent.getOuterWidth( /* includeMargin */ true );
				
			} else {
				flexedComponents.push( childComponent );
				totalFlex += childComponent.flex;
			}
		}
		
		// Now go through and size the other child components based on their flex values and the remaining space.
		// For this implementation, 
		if( totalFlex > 0 ) {
			var targetWidth = $targetEl.width(),
			    targetHeight = $targetEl.height(),
			    remainingTargetWidthPercent = ( targetWidth - totalUnflexedWidth ) / 100,
			    trimmedPercentagePoints = 0;  // Stores the decimal values resulting in the division of the remainingTargetWidthPercent divided by the flex value. 
			                                  // The percentage points that are trimmed off of each of the child components is added to the last item to fill the extra space.
			
			for( i = 0, len = flexedComponents.length; i < len; i++ ) {
				childComponent = flexedComponents[ i ];
				
				// Now size the flexed component based on the flex value
				var newChildWidth = ( childComponent.flex / totalFlex ) * remainingTargetWidthPercent;
				trimmedPercentagePoints += newChildWidth % 1;   // take the decimal value from the child width. Ex: 3.25 % 1 == 0.25  (We'll use this later).
				newChildWidth = Math.floor( newChildWidth );    // and do the actual trimming off of the decimal for the new child width
				
				// If sizing the last component, add in (the smallest whole number of) the decimal value percentage points that were trimmed from previous components
				if( i === len - 1 ) {
					newChildWidth += Math.floor( trimmedPercentagePoints );
				}
				this.sizeComponent( childComponent, newChildWidth + '%', targetHeight );
			}
		}
	}
	
} );


// Register the layout type with the ui.Container class, which is used to be able to instantiate the layout via its type name.
ui.Container.registerLayout( 'hbox', ui.layout.HBoxLayout );
