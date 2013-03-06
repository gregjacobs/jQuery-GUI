/**
 * @class ui.layout.CardsLayout.SlideTransition
 * @extends ui.layout.CardsLayout.AbstractTransition
 * 
 * {@link ui.layout.CardsLayout} transition strategy for switching cards by sliding the currently active item out, while sliding the newly active item in.
 */
/*global Class, window, jQuery, Jux, ui */
ui.layout.CardsLayout.SlideTransition = Class.extend( ui.layout.CardsLayout.AbstractTransition, {
	
	/**
	 * @private
	 * @property animRunning
	 * @type Boolean
	 * Flag to store if the animation is currently running.
	 */
	animRunning : false,
	
	
	/**
	 * @private
	 * @property $viewportEl
	 * @type jQuery
	 * The element created to manage the size of the "viewport" for the cards. This element always starts at the currentItem's size,
	 * and is animated to the newItem's size, while the items are slid in.  This element is lazily created by {@link #setActiveItem}.
	 */
	
	/**
	 * @private
	 * @property $slideEl
	 * @type jQuery
	 * The element created to slide the currentItem out, while sliding the newItem in. This element is attached to the
	 * {@link #$viewportEl}, and is lazily created by {@link #setActiveItem}.  Both the currentItem and newItem get attached
	 * to this element, side by side, and then just the 
	 */
	
	
	/**
	 * Sets the active item that should be transitioned to.
	 * 
	 * @method setActiveItem
	 * @param {ui.layout.CardsLayout} cardsLayout The CardsLayout instance that is using this transition strategy.
	 * @param {ui.Component} currentItem The currently active item. This may be null if the CardsLayout does not currently have an active item.
	 * @param {ui.Component} newItem The item to activate. This may be null if there is no new item to activate (for just hiding the currentItem).
	 * @param {Object} [options] An object which may contain the following properties:
	 * @param {String} [options.direction] The direction to slide the new item in from. Can be either 'right' or 'left'. Defaults to 'right'.
	 * @param {Number} [options.duration] The time to take, in milliseconds, to slide the new item into view. Defaults to 600.
	 * @param {Function} [options.onStep] A function to run after each step of the animation. This function is called with one argument: the fx
	 *   object that jQuery provides to the 'step' callback function on its animate() method.  
	 *   See http://api.jquery.com/animate/#step for more information.  Some properties of interest however are:
	 *   <div class="mdetail-params">
	 *     <ul>
	 *       <li>elem</li> : HTMLElement<div class="sub-desc">The HTML element being animated.</div>
	 *       <li>prop</li> : String<div class="sub-desc">The name of the css property on the HTML element (`elem`) that is currently being modified.</div>
	 *       <li>start</li> : String<div class="sub-desc">The starting value of the css property (`prop`) being modified. It's original value.</div>
	 *       <li>end</li> : String<div class="sub-desc">The final value of the css property (`prop`) being modified. The value that will be reached at the end of the animation.</div>
	 *       <li>now</li> : String<div class="sub-desc">The current value of the css property (`prop`) being modified, at the current point in the animation.</div>
	 *       <li>pos</li> : String<div class="sub-desc">The decimal percentage of how far along the animation is complete. Will be a number between 0 and 1.</div>
	 *     <ul>
	 *   </div>
	 * @param {Function} onComplete A function to run when the animation has completed. This function is guaranteed to run, even if the animation is stopped
	 *   early by another request to set the active item.
	 * @param {Object} scope The scope to run the onStep and onComplete callbacks in. Defaults to window.
	 */
	setActiveItem : function( cardsLayout, currentItem, newItem, options ) {		
		if( this.animRunning ) {
			// If the animation is currently running, and this method is called again, skip the previous animation to the end
			// in preparation for another animation. Can possibly implement some sort of transition in the future, but that
			// will be fairly complex.
			this.endAnimation();
		}
		
		// Handle conditions that cannot (or at least should not) be animated
		if( !currentItem && newItem ) {
			// No current item, just show the new item. No transition. This is for the initial card setting.
			newItem.show();
			return;
			
		} else if( currentItem && !newItem ) {
			// No new item, just hide the current item. No transition.
			currentItem.hide();
			return;
			
		} else if( !currentItem && !newItem ) {
			// neither a currentItem nor a newItem, can't do anything. Just return out.
			return;
		}
		
		
		// ---------------------------------------
		
		options = options || {};
		options.direction = options.direction || 'right';
		options.duration = ( typeof options.duration !== 'undefined' ) ? options.duration : 600; // default to 600, but allow 0
		
		// Lazily create the elements needed to implement the transition the first time the transition is run
		if( !this.$viewportEl ) {
			this.$viewportEl = jQuery( '<div style="margin: 0; padding: 0; border: 0; white-space: nowrap;" />' );
			this.$slideEl = jQuery( '<div style="margin: 0; padding: 0; border: 0; white-space: nowrap;" />' ).appendTo( this.$viewportEl );
		}
		
		
		// Get quick references to the elements
		var $viewportEl = this.$viewportEl;
		var $slideEl = this.$slideEl;
		
		
		var container = cardsLayout.getContainer(),
		    $containerEl = container.getEl();
		    
		// Vars to use for the initial, and target size of the element after it is finished animating
		var initialSize = {
			height      : 0,
			width       : 0,
			outerHeight : 0,
			outerWidth  : 0
		};
		var targetSize = {
			height      : 0,
			width       : 0,
			outerHeight : 0,
			outerWidth  : 0
		};
		
		
		// First, get the size of the currentItem. This will be used for the initial size of the viewport div.
		var $currentItemEl = currentItem.getEl();
		initialSize.height = $currentItemEl.height();
		initialSize.width = $currentItemEl.width();
		initialSize.outerHeight = $currentItemEl.outerHeight( /* include margin */ true );
		initialSize.outerWidth = $currentItemEl.outerWidth( /* include margin */ true );
		
		
		// Now get the size of the newItem. This will be used for the target size of the viewport div.
		var $newItemEl = newItem.getEl(),
		    originalPositionStyle = $newItemEl[ 0 ].style.position;  // save the original position style. We're going to apply position: absolute; for measuring 
		
		// NOTE: The $newItemEl should still be hidden at this point (display: none), because it is not the active item
		// in the CardsLayout. Using the display:none/position:absolute technique to measure the item while it's hidden,
		// so as not to get a flicker from showing it.
		$newItemEl.css( 'position', 'absolute' );  // set its position to absolute so we can measure its actual size while 1) it's hidden, and 2) without any bounds put on it by its current parent element's size
		
		// Make sure the element to "slide" to is shown and laid out, so that we can get its size
		newItem.show();
		newItem.doLayout();
		
		// Get the dimensions of the newItem
		targetSize.height = $newItemEl.height();
		targetSize.width = $newItemEl.width();
		targetSize.outerHeight = $newItemEl.outerHeight( /* include margin */ true );
		targetSize.outerWidth = $newItemEl.outerWidth( /* include margin */ true );
		
		// Restore the $newItemEl's original 'position' style (the 'position' style before we set it to position: absolute;) 
		$newItemEl.css( 'position', originalPositionStyle );
		
		// For debugging:
		//console.log( 'using slide transition. container: ', container, '  currentItem: ', currentItem, '  newItem: ', newItem );
		//console.log( 'initialSize: ', initialSize, '   targetSize: ', targetSize );
		
		
		// --------------------------------------------
		
		
		// Add the viewport element to the container's element itself, and set its size to the size of the currentItem.
		// This element will animate from the size of the currentItem to the size of the newItem.
		$viewportEl
			.css( {
				height   : initialSize.outerHeight + "px",
				width    : initialSize.outerWidth + "px",
				overflow : 'visible'
			} )
			.appendTo( $containerEl );
		
		
		
		// Set the slide element's original left margin, based on the direction the sliding will be taking place.
		$slideEl.css( {
			'margin-left' : ( options.direction === 'left' ) ? -targetSize.outerWidth : 0
		} );
		
		
		
		// Add the currently active item into the slide div, show it, and set its styles
		$slideEl.append( $currentItemEl );
		
		// Create an object to store the currentItem's original styles, so that we can re-apply them after the animation.
		var currentItemElStyle = $currentItemEl[ 0 ].style;
		var currentItemElOriginalStyles = {
			display : currentItemElStyle.display,
			width : currentItemElStyle.width,
			height : currentItemElStyle.height,
			verticalAlign : currentItemElStyle.verticalAlign,
			overflow : currentItemElStyle.overflow
		};
		$currentItemEl.css( 'display', 'inline-block' );   // make sure its set to inline-block first, before its other styles. Otherwise, the width and height could be set while it is still 'display: block'
		$currentItemEl.css( {
			'width' : initialSize.width + "px",    // force the element to stay at its
			'height' : initialSize.height + "px",  // current size
			'vertical-align' : 'top',
			'overflow' : 'visible'
		} );
		
		
		
		// Add the newly active item to the slide div. The slide div is the element that will be animated from left
		// to right, or right to left, to show the actual "slide" animation (as opposed to the viewport div, which handles the sizing).
		if( options.direction === 'left' ) {
			$slideEl.prepend( $newItemEl );
		} else {
			$slideEl.append( $newItemEl );
		}
		
		
		// Show the item in the $slideEl. This is to give the element its original 'display' style back, so we can save it to be re-applied later.
		// TODO: Possibly read the olddisplay property directly from the jQuery object that is stored on the element as data.  jQuery puts this object on
		// the element under a key starting with 'jQuery', but that ends up looking something like this: jQuery1604248712578. I guess they don't want
		// people accessing the object, as perhaps its properties are subject to change between versions? Still, might be the most efficient way to get
		// the old display property, without actually showing the newItem until its display: inline-block; property is set.  Could possibly access
		// this object with:
		// var data = $newItemEl.data(), olddisplay;
		// for( var prop in data ) {
		//     if( prop.indexOf( 'jQuery' ) === 0 ) {
		//         olddisplay = data[ prop ].olddisplay;
		//         break;
		//     }
		// }
		// If this is added, we should add a unit test for "Assumptions" under the "Global" tests, that makes sure that jQuery still stores the 'olddisplay'
		// property like this as we upgrade jQuery versions, to know immediately if the read of this property ever stops working.
		newItem.show();

		// Create an object to store the newItem's original styles, so that we can re-apply them after the animation.
		var newItemElStyle = $newItemEl[ 0 ].style;
		var newItemElOriginalStyles = {
			display : newItemElStyle.display,   // this is available now because we have shown the newItem (above)
			width : newItemElStyle.width,
			height : newItemElStyle.height,
			verticalAlign : newItemElStyle.verticalAlign,
			overflow : newItemElStyle.overflow
		};
		$newItemEl.css( 'display', 'inline-block' );       // make sure its set to inline-block first, before its other styles. Otherwise, the width and height could be set while it is still 'display: block'
		$newItemEl.css( {
			'width' : targetSize.width,     // force the element to stay at its current size (the
			'height' : targetSize.height,   // size we measured the $viewportEl's transition to animate to)
			'vertical-align' : 'top'
		} );
		
		
		// ----------------------------------------------
		
		
		this.animRunning = true;
		
		// Animate the $viewportEl, keeping the $slideEl in sync
		$viewportEl.animate( {
			height : targetSize.outerHeight + "px",
			width  : targetSize.outerWidth + "px"
		}, {
			duration: options.duration,
			
			// The 'step' function here is to synchronize the "slide" itself with the sizing of the viewport's height and width
			step : function( now, fx ) {
				if( fx.prop === 'width' ) {   // only do the calculation when the width has changed (not the height)
					if( options.direction === 'left' ) {
						// Going left, we start at a negative value (ex: -300), and need to move toward 0.
						// fx.pos is the percentage (in decimal between 0 and 1) of how far along the animation is
						// So for example, going from -300 to 0, at 10% we need it to be 270, so we make fx.pos 90% (1-fx.pos)
						$slideEl.css( 'margin-left', -targetSize.outerWidth * ( 1 - fx.pos ) );
					} else {
						// Going right, we start at 0, and move toward the negative value. So if we're starting at 0,
						// and have a target of -300, at 10% we need it to be -30px.  -300 * .1 == -30
						$slideEl.css( 'margin-left', -initialSize.outerWidth * fx.pos );
					}
				}
				
				// Call any provided onStep callback given in the options to the setActiveItem method
				if( typeof options.onStep === 'function' ) {
					options.onStep.call( options.scope || window, fx );
				}
			},
			
			complete : function() {
				// When complete, restore the elements to their original state, and back into their original locations in the DOM
				$viewportEl.detach();   // take out the viewportEl (and subsequently the slideEl), as we are now replacing the original elements in its place
				
				// Append the current item back to the container, and reset its css properties that we changed.
				$currentItemEl.appendTo( $containerEl );
				$currentItemEl.css( {
					'display' : currentItemElOriginalStyles.display,
					'width' : currentItemElOriginalStyles.width,
					'height' : currentItemElOriginalStyles.height,
					'vertical-align' : currentItemElOriginalStyles.verticalAlign,
					'overflow' : currentItemElOriginalStyles.overflow
				} );
				currentItem.hide();
				
				// Append the new item back to the container, and reset its css properties that we changed.
				$newItemEl.css( {
					'display' : newItemElOriginalStyles.display,
					'width' : newItemElOriginalStyles.width,
					'height' : newItemElOriginalStyles.height,
					'vertical-align' : newItemElOriginalStyles.verticalAlign,
					'overflow' : newItemElOriginalStyles.overflow
				} );
				$newItemEl.appendTo( $containerEl );
				
				// Reset the animating flag
				this.animRunning = false;
				
				// Call any provided onComplete callback given in the options to the setActiveItem method
				if( typeof options.onComplete === 'function' ) {
					options.onComplete.call( options.scope || window );
				}
			}.createDelegate( this )
		} );
	},
	
	
	
	/**
	 * Ends the current animation which is in progress (if any). This is used for if {@link #setActiveItem} is called again while
	 * a previous animation is running, or if the {@link #onDestroy} method is run while the animation is running.
	 * 
	 * @private
	 * @method endAnimation
	 */
	endAnimation : function() {
		if( this.$viewportEl ) {
			// This line will skip the animation to its end, and run its 'complete' function. 
			this.$viewportEl.stop( /* clearQueue */ true, /* jumpToEnd */ true );
			this.animRunning = false;
		}
	},
	
	
	
	/**
	 * Extended onDestroy method for the SlideTransition to clean up the elements it creates.
	 * 
	 * @protected
	 * @method onDestroy
	 */
	onDestroy : function() {
		if( this.animRunning ) {
			this.endAnimation();
		}
		
		// The viewport element (and the slide element) have been created, remove them.
		if( this.$viewportEl ) {
			this.$viewportEl.remove();
			this.$slideEl.remove();
		}
		
		this._super( arguments );
	}
	
} );