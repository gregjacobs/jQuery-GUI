/**
 * @class ui.layouts.ColumnsLayout
 * @extends ui.layouts.AbstractLayout
 * 
 * A layout that renders a {@link ui.Container Container's} child components into columns. Each child component
 * in the Container should have a special property named `columnWidth`, that determines how wide the column
 * should be.  This property can either be a number, or any css width value.<br><br>
 * 
 * This class is usually not meant to be instantiated directly, but created by its layout type name 'columns'.
 * 
 * @constructor
 * @param {Object} config The configuration options for the Layout, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.layouts.ColumnsLayout = Kevlar.extend( ui.layouts.AbstractLayout, {
	
	/**
	 * Layout implementation for ColumnsLayout, which renders each child component as columns into the 
	 * Container's content target (see {@link ui.Component#getContentTarget).  Each child component in the
	 * Container should have a special property named `columnWidth`, that determines how wide the column
	 * should be.  This property can either be a number, or any css width value.
	 * 
	 * @protected
	 * @method onLayout
	 * @param {ui.Component[]} childComponents The child components that should be rendered and laid out.
	 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
	 */
	onLayout : function( childComponents, $targetEl ) {		
		ui.layouts.CardsLayout.superclass.onLayout.apply( this, arguments );
		
		// Make sure the content target element is empty, to clear out any elements that may be in there 
		// (such as from previous layouts, or any direct HTML injected in there).
		$targetEl.empty();
		
		// Note: Concatenating the markup and appending it all at once for performance. This method is faster than appending each
		// one at a time, even with the extra step it takes to jQuery the divs afterward. Appending each one at a time
		// is ~65% slower. 
		var renderHTML = "",
		    numChildComponents = childComponents.length,
		    i;
		    
		for( i = 0; i < numChildComponents; i++ ) {
			var columnWidth = childComponents[ i ].columnWidth;
			if( typeof columnWidth !== 'undefined' ) {
				// If the columnWidth doesn't have a % sign at the end, add 'px'
				if( String( columnWidth ).lastIndexOf( '%' ) === -1 ) {
					columnWidth += "px";
				}
			} else {
				columnWidth = 'auto';  // default to 'auto'
			}
			
			// Create a div element for the column content
			renderHTML += '<div style="float: left; width: ' + columnWidth + '" />';
		}
		
		// Add clearing div for anything that comes under the columns
		renderHTML += '<div style="clear: both;" />';
		
		// Now append all of the HTML at once to the target element
		$targetEl.append( renderHTML );
		
		// Finally, render each of the child components into their div containers
		var $divs = $targetEl.find( 'div' );
		for( i = 0; i < numChildComponents; i++ ) {
			childComponents[ i ].render( $divs[ i ] );
		}
	}
	
} );


// Register the layout type with the ui.Container class, which is used to be able to instantiate the layout via its type name.
ui.Container.registerLayout( 'columns', ui.layouts.ColumnsLayout );
