/**
 * @class ui.ColorPicker
 * @extends ui.Component
 * @mixin ui.DataControl
 * 
 * A ColorPicker component that uses the jQuery ColorPicker plugin behind the scenes.
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Class, jQuery, Jux, ui */
ui.ColorPicker = Class.extend( ui.Component, {
	
	mixins : [ ui.DataControl ],
	
	/**
	 * @cfg {String} color
	 * The color value (in hex) for the initial color, including the '#' sign. 
	 * Defaults to "#000000" (black).
	 */
	color : '#000000',
	

	// protected
	initComponent : function() {
		this.addEvents( 
			/**
			 * @event change
			 * Fires when the color has changed.
			 * @param {ui.ColorPicker} colorPicker This ui.ColorPicker instance.
			 * @param {String} color The new color value, in hex, including the # sign. Ex: "#0000FF"
			 */
			'change'
		);
		
		this.cls += ' ui-colorPicker';
		
		// Normalize the provided color config
		if( this.color ) {
		    this.color = this.normalizeColorValue( this.color );
		}
		
		
		// Call superclass initComponent
		ui.ColorPicker.superclass.initComponent.call( this );
		
		// Call mixin class constructors
		ui.DataControl.constructor.call( this );
	},


	// protected
	onRender : function() {
		ui.ColorPicker.superclass.onRender.apply( this, arguments );
		
		var $el = this.$el;

		// Create the "selected color" element, which shows the currently selected color
		this.$selectedColorEl = jQuery( '<div class="ui-colorPicker-selectedColor" style="background-color: ' + this.color + '" />' )
			.appendTo( $el );
	   
		
		// Create the jQuery UI ColorPicker plugin on the main (outer) element
		$el.ColorPicker( {
			color: this.color,
			
			onShow: function( colorPickerEl ) {
				jQuery( colorPickerEl ).fadeIn( 500 );
				return false;
			},
			onHide: function( colorPickerEl ) {
				jQuery( colorPickerEl ).fadeOut( 500 );
				return false;
			},
			onChange: this.onChange.createDelegate( this )
		} );
	},
	
	
	/**
	 * Handles a change to the color by the user from the colorpicker plugin itself.
	 * 
	 * @private
	 * @method onChange
	 * @param {Object} hsb The hsb value of the color, inside an object with properties 'h', 's', and 'b'.
	 * @param {String} hex The hex value of the color, without its prefixed '#' sign.
	 * @param {String} rgb The RGB value of the color, inside an object with properties 'r', 'g', and 'b'.
	 */
	onChange : function( hsb, hex, rgb ) {
		this.updateStoredColorValue( '#' + hex );
	},
	
	
	// --------------------------------------------
	
	
	/**
	 * Private helper method to normalize a color value, adding the '#' sign if it is missing, and converting shorthand
	 * colors (i.e. "#FFF") to longhand form (i.e. "#FFFFFF")
	 * 
	 * @private
	 * @method normalizeColorValue
	 * @param {String} color The color to normalize.
	 * @return {String} The normalized color value.
	 */
	normalizeColorValue : function( color ) {
	    // Add the # if it wasn't provided
        if( color.charAt( 0 ) !== '#' ) {
            color = '#' + color;
        }
        
        // If the color has been specified as the shorthand 3 hex value color (ex: "#FFF"), expand it into the 6 hex 
        // value color (i.e. "#FFFFFF") for the ColorPicker plugin
        if( color.length === 4 ) {
            var shortHexColor = color.substr( 1 );  // get the 3 hex values
            color = "#";  // reset the color string back to just its start '#' sign.
            
            // "double up" the shorthand hex color values
            for( var i = 0; i < 3; i++ ) {
                var hexVal = shortHexColor[ i ].toString();   // note: need to convert shorthand hex numbers to strings, so they get concatenated instead of added
                color += hexVal + hexVal;
            }
        }
        
        return color;
	},
	
	
	/**
	 * Private helper method which stores the color value, updates the color of the ui.ColorPicker control itself (not
	 * the colorpicker plugin; the "swatch" that the user clicks on), and notifies subscribers of the change by firing 
	 * the {@link #change} and {@link ui.DataControl#datachange} events.  This method is called when {@link #setColor} 
	 * is called, and when the user changes the color value in the colorpicker itself (via the {@link #onChange} method).
	 * 
	 * @private
	 * @method updateStoredColorValue
	 * @param {String} color The hex value of the color, including the '#' sign.
	 */
	updateStoredColorValue : function( color ) {
		this.color = color;  // Note: no need to normalize the color value here. This method is always called with the normalized value.
		
		if( this.rendered ) {
			// Update the ColorPicker's "selected color" element, if the Component is rendered
			this.$selectedColorEl.css( 'background-color', color );
		}
		
		this.fireEvent( 'change', this, color );
		this.onDataChange();  // call method in DataControl mixin, which fires its 'datachange' event
	},
	
	
	// --------------------------------------------
	
	
	/**
	 * Sets the color in the ColorPicker.
	 * 
	 * @method setColor
	 * @param {String} color The hex value of the color, including the '#' sign. Accepts shorthand colors as well (ex: "#FFF")
	 */
	setColor : function( color ) {
	    // First, normalize the color value
		color = this.normalizeColorValue( color );
		
		if( this.rendered ) {
			// Update the color picker plugin itself when this public-facing method is called
			this.$el.ColorPickerSetColor( color );
		}
		
		// Store the value, and fire the events
		this.updateStoredColorValue( color );
	},
	
	
	/**
	 * Retrieve the currently selected color, in hex.
	 * 
	 * @method getColor
	 * @return {String} The hex value of the color, including the '#' sign.
	 */
	getColor : function() {
		return this.color;
	},
	
	
	
	// protected
	onDestroy : function() {
		if( this.rendered ) {
			this.$el.ColorPickerDestroy();
		}
		
		ui.ColorPicker.superclass.onDestroy.apply( this, arguments );
	},
	
	
	// --------------------------------
	
	
	// Implementation of ui.DataControl mixin interface
	setData : function() {
		this.setColor.apply( this, arguments );
	},
	getData : function() {
		return this.getColor();
	}

} );


// Register the type so it can be created by the string 'ColorPicker' in the manifest
ui.ComponentManager.registerType( 'ColorPicker', ui.ColorPicker );