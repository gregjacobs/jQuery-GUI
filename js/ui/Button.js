/**
 * @class ui.Button
 * @extends ui.Component
 * 
 * A generic button class (which is a wrapper for a jQuery UI button) that calls its {@link #handler} when clicked.  
 * This Component's element (see {@link ui.Component#getEl}) becomes the jQuery UI button itself.
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.Button = Kevlar.extend( ui.Component, {
	
	/**
	 * @cfg {String} primaryIcon
	 * The css class name for the icon to show on the left side of the button. Defaults to undefined, for no icon. 
	 */
	
	/**
	 * @cfg {String} secondaryIcon
	 * The css class name for the icon to show on the right side of the button. Defaults to undefined, for no icon.
	 */
	
	/**
	 * @cfg {String} iconSrc
	 * The src (url) of an icon to place into the button, using an img tag. It is preferred to use the {@link #primaryIcon}
	 * config when possible however. Defaults to an empty string, which will place no icon into the button.
	 */
	iconSrc : "",
	
	/**
	 * @cfg {String} text 
	 * The text for the button.
	 */
	text : "",

	/**
	 * @cfg {String} tooltip
	 * The text to use as the button's tooltip for when the mouse is hovered over the button. Currently just sets the title 
	 * attribute of the button element.
	 */
	tooltip: "",
	
	/**
	 * @cfg {String} priority
	 * The button's visual priority in a group of buttons. Valid values are: "primary", "normal", and "secondary",
	 * which are ordered here in order of button importance.
	 */
	priority : "normal",
	 
	/**
	 * @cfg {Function} handler
	 * A function to run when the button is clicked. 
	 */
	
	/**
	 * @cfg {Object} scope
	 * The scope to run the {@link #handler} function in. Defaults to the ui.Button object.
	 */
	
	/**
	 * @cfg {Boolean} disabled
	 * Set to true to have the button be initially disabled.
	 */
	disabled : false,
	
	/**
	 * @cfg {Boolean} removeHoverStateOnClick
	 * True to have the button remove its "hover" state (the 'ui-state-hover' css class) when it is clicked.  This is useful
	 * for buttons like the 'up' and 'down' buttons in the ListManager bit, where their parent DOM elements are moved when 
	 * they are clicked, and their ui-state-hover css class is not removed because the 'mouseleave' event never fires.
	 */
	removeHoverStateOnClick : false,
	
	
	
	// Component config
	elType : 'button',
	
	
	initComponent : function() {
		// Call superclass initComponent
		ui.Button.superclass.initComponent.call( this );
		
		
		// Create the events that this class will fire
		this.addEvents(
			/**
			 * @event click
			 * Fires when the button has been clicked.
			 * @param {ui.Button} button This ui.Button instance.
			 */
			'click',
			
			/**
			 * @event mouseenter
			 * Fires when the mouse has entered (hovered over) the button. Equivalent to the jQuery mouseenter event.
			 * @param {ui.Button} button This ui.Button instance.
			 */
			'mouseenter',
			
			/**
			 * @event mouseleave
			 * Fires when the mouse has left (no longer hovered over) the button. Equivalent to the jQuery mouseleave event.
			 * @param {ui.Button} button This ui.Button instance.
			 */
			'mouseleave'
		);
		
		
		// Backward compatibility: The button's text was specified with the label config, but I am thinking that at some point, buttons
		// may be placed elsewhere where they can have a label in front of it (like the form fields), so I'm changing the property for the
		// button's text it to 'text'.
		if( this.label ) {
			this.text = this.label;
			delete this.label;
		}
			
				
		// Backward compatibility: manifests can specify an onClick function, which would shadow the prototype onClick function. 
		// Setting it to the handler config, and deleting it to unshadow the prototype's onClick.
		if( this.hasOwnProperty( 'onClick' ) ) {
			this.handler = this.onClick;
			delete this.onClick;  // delete the provided onClick to un-shadow the prototype's onClick
		}
	},
	
	
	/**
	 * Extended onRender method which implements the creation and placement of the button itself.
	 * 
	 * @protected
	 * @method onRender
	 * @param {jQuery} $containerEl
	 */
	onRender : function( $containerEl ) { 
		// Call superclass onRender() first, to render this Component's element
		ui.Button.superclass.onRender.apply( this, arguments );
				
		// Append the text to the button element before making a jQuery UI button out of it.
		if( this.text ) {  
			this.$el.append( this.text );
		}

		// Add the title attribute, which acts as its tooltip
		if( this.tooltip ) {
			this.$el.attr( 'title', this.tooltip );
		}
		
		
		// Create the jQuery UI button itself out of the Component's element
		var buttonConfig = {
			icons    : { primary: null, secondary: null },  // default for icons
			text     : ( this.text !== "" ) ? true : false,
			disabled : this.disabled
		};
		if( this.primaryIcon ) {
			buttonConfig.icons.primary = this.primaryIcon;
		}
		if( this.secondaryIcon ) {
			buttonConfig.icons.secondary = this.secondaryIcon;
		}
		
		this.$el.button( buttonConfig );  // jQuery UI Button
		if( this.priority === 'primary' ) {
			this.$el.addClass( 'ui-priority-primary' );
		} else if( this.priority === 'secondary' ) {
			this.$el.addClass( 'ui-priority-secondary' );
		}
		
		// If an icon src (url) was specified, add it as an image before the button's text
		if( this.iconSrc ) {
			var $img = jQuery( '<img src="' + this.iconSrc + '" style="margin-right: 5px; vertical-align: middle;" />' );
			this.$el.find( 'span' ).prepend( $img );  // jQuery UI Button creates a span element for the button's content
		}
		
		
		// Add Event Handlers
		this.$el.bind( {
			mouseenter : this.onMouseEnter.createDelegate( this ),
			mouseleave : this.onMouseLeave.createDelegate( this ),
			click      : this.onClick.createDelegate( this )
		} );
	},
	
	
	/**
	 * Sets the text on the button. Accepts HTML as well.
	 * 
	 * @method setText
	 * @param {String} text
	 */
	setText : function( text ) {
		if( !this.rendered ) {
			this.text = text;
		} else {
			// Update the span element that the jQuery UI Button creates for the button's content
			this.$el.find( 'span' ).empty().append( text );
		}
	},
	
	
	/**
	 * Disables the button.
	 * 
	 * @method disable
	 */
	disable : function() {
		if( !this.rendered ) {
			this.disabled = true;
		} else {
			this.$el.button( 'disable' );
		}
	},
	
	
	/**
	 * Enables the button (if it was previously disabled).
	 * 
	 * @method enable
	 */
	enable : function() {
		if( !this.rendered ) {
			this.disabled = false;
		} else {
			this.$el.button( 'enable' );
		}
	},
	
	
	/**
	 * Method for handling a click to the button.
	 * 
	 * @protected
	 * @method onClick
	 */
	onClick : function() {
		// If the "remove hover state on-click" config is true, remove the button's 'ui-state-hover' css class.
		// This is useful for when the 'mouseleave' event doesn't fire on a button (usually when its parent DOM 
		// container has been moved), and we need the hover state to be removed in this case.
		if( this.removeHoverStateOnClick ) {
			this.$el.removeClass( 'ui-state-hover' );
		}
		
		if( typeof this.handler === 'function' ) {
			this.handler.call( this.scope || this, this );  // run the handler in the scope of this Button if no scope config was provided, and provide this button instasnce as the first arg
		}
		
		this.fireEvent( 'click', this );
	},
	
	
	/**
	 * Method that is run when mouse hovers over the button.
	 * 
	 * @protected
	 * @method onMouseEnter
	 */
	onMouseEnter : function() {
		this.fireEvent( 'mouseenter', this );
	},
	
	
	/**
	 * Method that is run when mouse un-hovers the button.
	 * 
	 * @protected
	 * @method onMouseLeave
	 */
	onMouseLeave : function() {
		this.fireEvent( 'mouseleave', this );
	}
	
	
} );


// Register the type so it can be created by the string 'Button' in the manifest
// For backward compatibility, register the 'ChoiceButton' type as well
ui.ComponentManager.registerType( 'Button', ui.Button );  
ui.ComponentManager.registerType( 'ChoiceButton', ui.Button );  
