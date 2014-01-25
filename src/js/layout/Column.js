/*global define */
define( [
	'Class',
	'gui/Component',
	'gui/Container',
	'gui/layout/Layout'
], function( Class, Component, Container, Layout ) {

	/**
	 * @class gui.layout.Column
	 * @extends gui.layout.Layout
	 * @alias layout.column
	 * 
	 * A layout that renders a {@link gui.Container Container's} child components into columns. Each child component
	 * in the Container should have a special property named `columnWidth`, that determines how wide the column
	 * should be.  This property can either be a number, or any css width value.
	 * 
	 * This class is usually not meant to be instantiated directly, but created by its layout type name 'column'.
	 */
	var ColumnLayout = Layout.extend( {
		
		/**
		 * @protected
		 * @property {jQuery} $columnDivEls
		 * 
		 * The set of the divs created to place each of the child components into.
		 */
		
		/**
		 * @protected
		 * @property {Boolean} columnsLayoutInitialized
		 * 
		 * True if the columns layout has been initialized from a first layout run.
		 */
		
		
		/**
		 * Layout implementation for ColumnsLayout, which renders each child component as columns into the 
		 * Container's layout target (see {@link gui.Component#getLayoutTarget).  Each child component in the
		 * Container should have a special property named `columnWidth`, that determines how wide the column
		 * should be.  This property can either be a number, or any css width value.
		 * 
		 * @protected
		 * @method onLayout
		 * @param {gui.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		onLayout : function( childComponents, $targetEl ) {		
			this._super( arguments );
			
			if( !this.columnsLayoutInitialized ) {
				this.initColumnsLayout( childComponents, $targetEl );
				this.columnsLayoutInitialized = true;
			} else {
				this.updateColumnsLayout( childComponents, $targetEl );
			}
		},
		
		
		/**
		 * Initializes the ColumnsLayout for its first layout run.  Subsequent layout runs
		 * are handled by {@link #updateColumnsLayout}.
		 * 
		 * @method initColumnsLayout
		 * @param {gui.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		initColumnsLayout : function( childComponents, $targetEl ) {
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
			var $divs = this.$columnDivEls = $targetEl.find( 'div' );
			for( i = 0; i < numChildComponents; i++ ) {
				this.renderComponent( childComponents[ i ], $divs[ i ] );
			}
		},
		
		
		
		/**
		 * Updates the ColumnsLayout for each layout run after the first (which is handled by {@link #initColumnsLayout}.
		 * 
		 * @method updateColumnsLayout
		 * @param {gui.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		updateColumnsLayout : function( childComponents, $targetEl ) {
			// TODO: Implement when needed
		},
		
		
		// -----------------------------
		
		
		// protected
		onDestroy : function() {
			if( this.columnsLayoutInitialized ) {
				this.$columnDivEls.remove();
			}
			
			this._super( arguments );
		}
		
	} );
	
	
	// Register the layout type with the gui.Container class, which is used to be able to instantiate the layout via its type name.
	Container.registerLayout( 'column', ColumnLayout );
	
	return ColumnLayout;
	
} );