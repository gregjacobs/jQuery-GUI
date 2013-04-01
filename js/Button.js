/*global define */
define( [
	'jquery',
	'lodash',
	'ui/Component',
	'ui/ComponentManager',
	'ui/util/LoDashTpl'
], function( jQuery, _, Component, ComponentManager, LoDashTpl ) {

	/**
	 * @class ui.Button
	 * @extends ui.Component
	 * 
	 * A generic button that calls its {@link #handler} when clicked.
	 */
	var Button = Component.extend( {
		
		/**
		 * @cfg {String} text
		 *  
		 * The text for the button.
		 */
		text : "",
	
		/**
		 * @cfg {String} tooltip
		 * 
		 * The text to use as the button's tooltip for when the mouse is hovered over the button. Currently just sets the title 
		 * attribute of the button element.
		 */
		tooltip: "",
		
		/**
		 * @cfg {Function} handler
		 * 
		 * A function to run when the button is clicked. Alternatively, one can listen to the {@link #click} event. 
		 */
		
		/**
		 * @cfg {Object} scope
		 * 
		 * The scope to run the {@link #handler} function in. Defaults to the Button object.
		 */
		
		/**
		 * @cfg {Boolean} disabled
		 * 
		 * Set to `true` to have the button be initially disabled.
		 */
		disabled : false,
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		elType : 'button',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		renderTpl : new LoDashTpl( [
			'<span id="<%= elId %>-text" class="ui-Button-text" title="<%= tooltip %>">',
				'<%= text %>',
			'</span>'
		] ),
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this.addCls( 'ui-Button' );
			
			this.addEvents(
				/**
				 * Fires when the button has been clicked.
				 * 
				 * @event click
				 * @param {ui.Button} button This ui.Button instance.
				 */
				'click',
				
				/**
				 * Fires when the mouse has entered (hovered over) the button. Equivalent to the jQuery mouseenter event.
				 * 
				 * @event mouseenter
				 * @param {ui.Button} button This ui.Button instance.
				 */
				'mouseenter',
				
				/**
				 * Fires when the mouse has left (no longer hovered over) the button. Equivalent to the jQuery mouseleave event.
				 * 
				 * @event mouseleave
				 * @param {ui.Button} button This ui.Button instance.
				 */
				'mouseleave'
			);
			
			this._super( arguments );
		},
		
		
		/**
		 * Override of superclass method used to build the {@link #renderTplData} object.
		 * 
		 * @protected
		 * @return {Object}
		 */
		getRenderTplData : function() {
			return _.defaults( this._super( arguments ), {
				text     : this.text,
				tooltip  : this.tooltip
			} );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			if( this.disabled ) {
				this.disable();
			}
			
			// Store a reference to the text element
			this.$textEl = jQuery( '#' + this.elId + '-text' );
			
			// Add Event Handlers
			this.$el.on( {
				'mouseenter' : _.bind( this.onMouseEnter, this ),
				'mouseleave' : _.bind( this.onMouseLeave, this ),
				'click'      : _.bind( this.onClick, this )
			} );
		},
		
		
		/**
		 * Sets the text on the button. Accepts HTML as well.
		 * 
		 * @param {String} text
		 */
		setText : function( text ) {
			this.text = text;
			
			if( this.rendered ) {
				this.$textEl.html( text );
			}
		},
		
		
		/**
		 * Disables the button.
		 * 
		 * @method disable
		 */
		disable : function() {
			this.disabled = true;
			
			if( this.rendered ) {
				this.$el.prop( 'disabled', true );
			}
		},
		
		
		/**
		 * Enables the button (if it was previously {@link #disable disabled}).
		 * 
		 * @method enable
		 */
		enable : function() {
			this.disabled = false;
			
			if( this.rendered ) {
				this.$el.prop( 'disabled', false );
			}
		},
		
		
		/**
		 * Sets the disabled/enabled state of the Button based on the provided `disabled` flag.
		 * 
		 * @param {Boolean} disabled True to disable the Button, false to enable the Button.
		 */
		setDisabled : function( disabled ) {
			this[ disabled ? 'disable' : 'enable' ]();
		},
		
		
		/**
		 * Handles a click to the button.
		 * 
		 * @protected
		 * @param {jQuery.Event} evt
		 */
		onClick : function( evt ) {
			if( this.handler ) {
				this.handler.call( this.scope || this, this );  // run the handler in the scope of this Button if no scope config was provided, and provide this button instasnce as the first arg
			}
			
			this.fireEvent( 'click', this );
		},
		
		
		/**
		 * Method that is run when mouse hovers over the button.
		 * 
		 * @protected
		 */
		onMouseEnter : function() {
			this.fireEvent( 'mouseenter', this );
		},
		
		
		/**
		 * Method that is run when mouse un-hovers the button.
		 * 
		 * @protected
		 */
		onMouseLeave : function() {
			this.fireEvent( 'mouseleave', this );
		}
		
	} );
	
	
	// Register the type so it can be created by the type string 'button'
	ComponentManager.registerType( 'button', Button );
	
	return Button;
	
} );
