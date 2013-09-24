/*global define */
define( [
	'jquery',
	'lodash',
	'jqGui/Component',
	'jqGui/ComponentManager',
	'jqGui/template/LoDash'
], function( jQuery, _, Component, ComponentManager, LoDashTpl ) {

	/**
	 * @class jqGui.button.Button
	 * @extends jqGui.Component
	 * @alias type.button
	 * 
	 * A generic button that calls its {@link #handler} when clicked.
	 */
	var Button = Component.extend( {
		
		/**
		 * @cfg {String} iconCls
		 * 
		 * A CSS class to use for the icon.
		 */
		
		/**
		 * @cfg {String} iconAlign
		 * 
		 * Which side to put the icon on. Accepts 'left' or 'right'.
		 */
		iconAlign : 'left',
		
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
		baseCls : 'jqGui-button',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		renderTpl : new LoDashTpl( [
			'<span class="<%= baseCls %>-icon <%= baseCls %>-icon-left <%= leftIconElCls %>"></span>',
			'<a id="<%= elId %>-text" class="<%= baseCls %>-text <%= textElCls %>" href="javascript:;" title="<%= tooltip %>">',
				'<%= text %>',
			'</a>',
			'<span class="<%= baseCls %>-icon <%= baseCls %>-icon-right <%= rightIconElCls %>"></span>'
		] ),
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this.addEvents(
				/**
				 * Fires when the button has been clicked.
				 * 
				 * @event click
				 * @param {jqGui.button.Button} button This jqGui.Button instance.
				 */
				'click',
				
				/**
				 * Fires when the mouse has entered (hovered over) the button. Equivalent to the jQuery mouseenter event.
				 * 
				 * @event mouseenter
				 * @param {jqGui.button.Button} button This jqGui.Button instance.
				 */
				'mouseenter',
				
				/**
				 * Fires when the mouse has left (no longer hovered over) the button. Equivalent to the jQuery mouseleave event.
				 * 
				 * @event mouseleave
				 * @param {jqGui.button.Button} button This jqGui.Button instance.
				 */
				'mouseleave'
			);
			
			this._super( arguments );
		},
		
		
		/**
		 * Override of superclass method used to add the {@link #tooltip} config as the "title" attribute.
		 * 
		 * @protected
		 * @return {Object}
		 */
		getRenderAttributes : function() {
			var attributes = this._super( arguments );
			
			if( this.tooltip ) {
				attributes.title = this.tooltip;
			}
			return attributes;
		},
		
		
		/**
		 * Override of superclass method used to build the {@link #renderTplData} object.
		 * 
		 * @protected
		 * @return {Object}
		 */
		getRenderTplData : function() {
			var leftIconElCls = "",
			    rightIconElCls = "",
			    textElCls = "",
			    iconCls = this.iconCls,
			    hiddenCls = this.baseCls + '-hiddenEl';
			
			if( !iconCls ) {
				leftIconElCls = rightIconElCls = hiddenCls;
			} else if( this.iconAlign === 'left' ) {
				leftIconElCls = iconCls;
				rightIconElCls = hiddenCls;
			} else {
				leftIconElCls = hiddenCls;
				rightIconElCls = iconCls;
			}
			
			return _.defaults( this._super( arguments ), {
				text     : this.text,
				tooltip  : this.tooltip,
				
				leftIconElCls  : leftIconElCls,
				rightIconElCls : rightIconElCls,
				textElCls      : textElCls
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
				'mousedown'  : _.bind( this.onMouseDown, this ),
				'mouseup'    : _.bind( this.onMouseUp, this ),
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
		 * Handles a click to the Button.
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
		 * Method that is run when mouse hovers over the Button.
		 * 
		 * @protected
		 * @param {jQuery.Event} evt
		 */
		onMouseEnter : function() {
			this.addCls( this.baseCls + '-hover' );
			
			this.fireEvent( 'mouseenter', this );
		},
		
		
		/**
		 * Method that is run when mouse un-hovers the Button.
		 * 
		 * @protected
		 * @param {jQuery.Event} evt
		 */
		onMouseLeave : function() {
			this.removeCls( this.baseCls + '-hover' );
			
			this.fireEvent( 'mouseleave', this );
		},
		
		
		/**
		 * Method that is run when mouse is pressed down on the Button.
		 * 
		 * @protected
		 * @param {jQuery.Event} evt
		 */
		onMouseDown : function() {
			this.addCls( this.baseCls + '-active' );
		},
		
		
		/**
		 * Method that is run when mouse is release on the Button.
		 * 
		 * @protected
		 * @param {jQuery.Event} evt
		 */
		onMouseUp : function() {
			this.removeCls( this.baseCls + '-active' );
		}
		
	} );
	
	
	ComponentManager.registerType( 'button', Button );
	
	return Button;
	
} );
