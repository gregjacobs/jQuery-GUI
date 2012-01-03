/**
 * @class ui.Slider
 * @extends ui.Component
 * @mixin ui.DataControl
 * 
 * A slider component that uses jQuery UI's Slider behind the scenes.  Because jQuery UI's Slider is a very rudimentary implementation
 * which simply sets the slider position based on a 'left' position percentage from 0%-100%, it normally has styling so that the slider
 * itself overlaps the slide area. This implementation adds a helper element to account for this shortcoming, which will retain the 
 * slider within the slide area.
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global window, jQuery, Kevlar, ui */
ui.Slider = Kevlar.extend( ui.Component, [ ui.DataControl ], {

	/**
	 * @cfg {Number} min
	 * The minimum value for the slider.
	 */
	min : 0,
	
	/**
	 * @cfg {Number} max
	 * The maximum value for the slider.
	 */
	max : 100,
	
	/**
	 * @cfg {Number} step
	 * Determines the size or amount of each interval or step the slider takes between {@link #min} and {@link #max}. The full 
	 * specified value range of the slider ({@link #max} - {@link #min}) needs to be evenly divisible by the step.
	 */
	step : 1,
	
	/**
	 * @cfg {Number[]} handlePositions
	 * The position of the slider handles between the {@link #min} and the {@link #max}. If multiple slider handles, this config should be
	 * an array with multiple integer values, one for each handle position.  Defaults to a single array item with the value of the {@link #min} 
	 * config.
	 */
	
	
	/**
	 * @private
	 * @property handlePositions
	 * @type Number[]
	 * Stores the current values of the handle positions, when they are changed on the slider. Normally, {@link #getData} would ask
	 * for the slider positions directly from the jQuery UI Slider instance (using the "values" method), but for some reason, it does not always
	 * report them correctly. However, the jQuery UI Slider does report the values correctly when the event is fired (perhaps they use some timeout 
	 * to update what the .slider( "values" ) method reports?), so when the event is fired, it saves the values into this variable.
	 */
	
	/**
	 * @private
	 * @property $handleHelper
	 * @type jQuery
	 * The inner "wrapper" element that is sized to the slider width, minus the width of the handle. This element is used
	 * to make the handle itself visually remain "inside" the slider (instead of overlapping the outsides as in the original
	 * jQuery UI implementation). 
	 */
	
	/**
	 * @private
	 * @property $handles
	 * @type jQuery
	 * The handle element(s) themselves.
	 */
	

	// protected
	initComponent : function() {
		this.addEvents( 
			/**
			 * @event change
			 * Fires when a handle has been slid.
			 * @param {ui.Slider} slider This Slider instance.
			 * @param {Number[]} handlePositions The new positions of the handles in the slider.
			 */
			'change'
		);
		
		// This component's class must be named ui-sliderComponent as not to conflict with jQuery UI's ui-slider css class.
		this.cls += ' ui-sliderComponent';
		
		
		if( !this.handlePositions ) {
			// No handle positions, set to an array with one element: the configured (or default) minimum value
			this.handlePositions = [ this.min ];
			
		} else if ( !Kevlar.isArray( this.handlePositions ) ) {
			// not an array, make it one
			this.handlePositions = [ this.handlePositions ];
		}
		
		// Call superclass initComponent
		ui.Slider.superclass.initComponent.call( this );
		
		// Call mixin class constructors
		ui.DataControl.constructor.call( this );
	},


	// protected
	onRender : function() {
		ui.Slider.superclass.onRender.apply( this, arguments );
		
		var $el = this.$el,
		    $sliderEl = jQuery( '<div />' ).appendTo( $el );
		
		// Create the jQuery UI Slider
		$sliderEl.slider( {
			min  : this.min,
			max  : this.max,
			step : this.step,
			values : this.handlePositions,
			
			// Event handlers
			slide : this.onSlideChange.createDelegate( this )
		} );
		
		// After we have created the slider, add an inner wrapper element which will be sized to make the handles 
		// visually remain "inside" the slider (not overlapping the outside of it).
		$sliderEl.wrapInner( '<div class="ui-slider-handleHelper" />' );
		this.$handleHelper = $sliderEl.find( '.ui-slider-handleHelper' );  // need to find it after wrapInner() call, as wrapInner duplicates elements (i.e. we cannot create it first, and then wrap it inside the slider element)
		
		
		// -----------------------------------------
		
		// Get a reference to the handle(s) themselves.
		this.$handles = $sliderEl.find( '.ui-slider-handle' );
		
		
		// The following event handlers here are a fix for the handle "jumping" when initially grabbed while using the handleHelper (created above). The idea for this
		// was taken from the jQuery UI slider example for a scrollbar (which does not get that "jump"), which basically uses the same method of visually keeping
		// the handles of the slider "within" the slider (see the $handleHelper property description). Link: http://jqueryui.com/demos/slider/#side-scroll
		this.$handles.bind( {
			'mousedown' : function() {
				// resize the slider itself to the width of the handle helper, so they are equivalent and mouse position / slider position remains in sync
				// This must be on mousedown of the handle itself, instead of a slider 'start' handler because it does not work correctly when in a 'start' handler.
				$sliderEl.width( this.$handleHelper.width() );
			}.createDelegate( this )//,
			
			// Note: This mouseup handler doesn't always get executed, such as if the mouseup happens off of the window viewport. 
			// Executing this code instead in a 'slidestop' handler of the slider itself (below)
			//'mouseup' : function() {
			//	$sliderEl.width( "100%" );  
			//}.createDelegate( this )
		} );
		
		$sliderEl.bind( 'slidestop', function() {
			// resize back to 100% when done sliding. This re-enables the slider to be direct-clicked anywhere (other than the handle) to move the handle
			$sliderEl.width( "100%" );   
		} );
		
		
		// -----------------------------------------
		
		
		// Save reference to the slider element
		this.$sliderEl = $sliderEl;
		
		// Seems to initially need to be done in a timeout for some browsers
		window.setTimeout( function() {
			this.sizeHandleHelper();
		}.createDelegate( this ), 10 );
	},
	
	
	// protected
	onShow : function() {
		ui.Slider.superclass.onShow.apply( this, arguments );
		
		// When the component is shown from a hidden state, re-size the handle helper
		this.sizeHandleHelper();
	},
	
	
	/**
	 * Private method that sizes the slider "helper" element, which will visually "contain" the handles within the actual slider area. 
	 * The original jQuery UI implementation allows the handles to be moved "past" (overlapping) the actual slider area on the left 
	 * and right (because handles are "moved" within the slider by the css 'left' property between 0% and 100%). This extra "helper"
	 * element will be sized to the width of the slider area - the width of the handle, and centered, so that the handles look like 
	 * they ara contained within the slider area, despite this simple %-based positioning.
	 * 
	 * @private
	 * @method sizeHandleHelper
	 */
	sizeHandleHelper : function() {
		// Because this method is run in a setTimeout for the initial sizing, we want to make sure that the Slider hasn't first been destroyed
		// and its element references removed. This can happen if the Slider is (for some reason) destroyed before it initializes in the timeout.
		if( !this.destroyed ) {
			// Size the "handle helper" element so that it is the full width of the slider, minus the handle's width.  This element is centered
			// within the slider area. This way, when the handle's css 'left' property is set to 100%, it's position + 1/2 it's width will make 
			// it look like it is dragged up against the right side of the slider, and vice-versa for the left side. 
			var $sliderEl = this.$sliderEl,
			    $handleHelper = this.$handleHelper,
			    $handles = this.$handles,  // note: may be more than one handle, but they are most likely sized to all be the same width
			    handleWidth = $handles.outerWidth();  // grabs the outer width of the first handle
			
			$handles.css( 'margin-left', -handleWidth / 2 );
			$handleHelper.width( "" ).width( $sliderEl.innerWidth() - handleWidth );
		}
	},
	
	
	
	/**
	 * Method that is run when a slide position has changed. Fires the {@link #change} event.
	 * 
	 * @private
	 * @method onSlideChange
	 */
	onSlideChange : function( evt, ui ) {
		// When the slider has been changed, update the handlePositions array with the values from
		// the event. These values are accurate, as opposed to running the jQuery UI slider "values" method.
		this.handlePositions = ui.values;
		
		this.notifyOfChange();
	},
	
	
	/**
	 * Notifies listeners that the slider has changed its handle positions by firing the {@link #change}
	 * event, and running the {@link ui.DataControl#onDataChange} method of the DataControl mixin.
	 * 
	 * @private
	 * @method notifyOfChange
	 */
	notifyOfChange : function() {
		this.fireEvent( 'change', this, this.getHandlePositions() );
		this.onDataChange();  // call method in DataControl mixin, which fires its 'datachange' event
	},
	
	
	// ---------------------------------
	
	
	/**
	 * Sets the handle positions on the slider.
	 * 
	 * @method setHandlePositions
	 * @param {Number[]} An array of the handle positions. If only one handle, this should be a one element array.
	 */
	setHandlePositions : function( positions ) {
		if( !Kevlar.isArray( positions ) ) {
			positions = [ positions ];
		}
		
		// Store the new handle positions
		this.handlePositions = positions;
		
		// Update the jQuery UI slider instance itself, if it is rendered
		if( this.rendered ) { 
			this.$sliderEl.slider( 'values', positions );
		}
		
		// Notify of a change to event listeners
		this.notifyOfChange();
	},
	
	
	/**
	 * Retrieves the current handle positions on the Slider. 
	 * 
	 * @method getHandlePositions
	 * @return {Number[]} An array of the handle positions. If only one handle, it will be a one element array.
	 */
	getHandlePositions : function() {
		// Always simply return the handlePositions array. Would normally ask for the values from the slider directly using
		// this.$el.slider( 'values' ), but for some reason, it doesn't always report the correct values. So instead, the
		// handlePositions array is updated when the slider's position is changed by the user (the event fires with the correct
		// values), and this method simply returns that array.
		return this.handlePositions;
	},
	
	
	// --------------------------------
	
	// Implementation of ui.DataControl mixin interface
	setData : function() {
		this.setHandlePositions.apply( this, arguments );
	},
	getData : function() {
		return this.getHandlePositions();
	}

} );


// Register the type so it can be created by the string 'Slider' in the manifest
ui.ComponentManager.registerType( 'Slider', ui.Slider );