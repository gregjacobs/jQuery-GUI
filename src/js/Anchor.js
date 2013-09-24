/*global define */
/*jshint scripturl:true */
define( [
	'jquery',
	'lodash',
	'jqGui/ComponentManager',
	'jqGui/Component'
], function( jQuery, _, ComponentManager, Component ) {
	
	/**
	 * @class jqGui.Anchor
	 * @extends jqGui.Component
	 * @alias type.anchor
	 *
	 * A simple anchor component. This component can be used as a standard anchor (&lt;a&gt; tag) by setting
	 * the {@link #href} config, or clicks can be responded to dynamically by listening for the {@link #click} 
	 * event.
	 * 
	 *     @example
	 *     require( [
	 *         'jqGui/Anchor'
	 *     ], function( Anchor ) {
	 *     
	 *         var standardAnchor = new Anchor( {
	 *             renderTo : 'body'
	 *             
	 *             text : "Google.com",
	 *             href : "http://www.google.com",
	 *             target : "_blank"
	 *         } );
	 *         
	 *         var listenerAnchor = new Anchor( {
	 *             renderTo : 'body'
	 *             
	 *             text : "Click Me",
	 *             listeners : {
	 *                 'click' : function( anchor ) {
	 *                     alert( "You clicked the anchor!" );
	 *                 }
	 *             }
	 *         } );
	 *     } );
	 */
	var Anchor = Component.extend( {
		
		/**
		 * @cfg {String} href
		 * 
		 * The href for the anchor tag. Defaults to 'javascript:;' so that the anchor takes no action.
		 * In this case, listen to the {@link #click} event to respond to the click in a custom manner.
		 */
		
		/**
		 * @cfg {String} target
		 * 
		 * The HTML `target` attribute for the anchor. This can be, for example, set to "_blank" to have
		 * the anchor open its {@link #href} in a new window.
		 */
		
		/**
		 * @cfg {String} text
		 * 
		 * The text (or html) to put inside the anchor. (Synonymous to the {@link #html} config in this case).
		 */
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		elType : 'a',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'jqGui-anchor',
	
	
		// protected
		initComponent : function() {
			this.addEvents(
				/**
				 * Fires before the Anchor is clicked. Handlers may return false to cancel the action of the anchor.
				 * 
				 * @event beforeclick
				 * @param {jqGui.Anchor} anchor This Anchor instance.
				 * @preventable
				 */
				'beforeclick',
				
				/**
				 * Fires when the Anchor is clicked.
				 * 
				 * @event click
				 * @param {jqGui.Anchor} anchor This Anchor instance.
				 */
				'click'
			);
			
			this.setAttr( 'href', this.normalizeHref( this.href ) );
			if( this.target ) {
				this.setAttr( 'target', this.target );
			}
			this.html = this.html || this.text;
			
			this._super( arguments );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			this.getEl().on( 'click', _.bind( this.onClick, this ) );
		},
	
	
		// -------------------------------------
		
		/**
		 * Normalizes the provided `href` to 'javascript:;' if an empty string
		 * or only whitespace is provided.
		 *
		 * @param {String} href
		 * @return {String} The normalized href.
		 */
		normalizeHref : function( href ) {
			return jQuery.trim( href ) || 'javascript:;';
		},


		/**
		 * Sets the anchor's {@link #href}.
		 *
		 * @param {String} href
		 * @chainable
		 */
		setHref : function( href ) {
			this.setAttr( 'href', this.normalizeHref( href ) );
			return this;
		},


		/**
		 * Sets the anchor's text (or html). Internally calls {@link #update}.
		 *
		 * @param {String} text The text for the anchor.
		 * @chainable
		 */
		setText : function( text ) {
			this.update( text );
			return this;
		},


		// -----------------------------------


		/**
		 * Handler for when the anchor is clicked.
		 *
		 * @protected
		 * @param {jQuery.Event} evt
		 */
		onClick : function( evt ) {
			// If the Anchor has a 'beforeclick' handler that returns false, prevent the default browser behavior
			// and do not fire the 'click' event
			if( this.fireEvent( 'beforeclick', this ) === false ) {
				evt.stopPropagation();
				evt.preventDefault();
				return false;
			} else {
				this.fireEvent( 'click', this );
			}
		}
	
	} );
	
	
	ComponentManager.registerType( 'anchor', Anchor );
	
	return Anchor;
	
} );