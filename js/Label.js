/*global define */
define( [
	'Class',
	'ui/ComponentManager',
	'ui/Component'
], function( Class, ComponentManager, Component ) {
	
	/**
	 * @class ui.Label
	 * @extends ui.Component
	 * 
	 * Creates a label (piece of text) in a UI hierarchy. This class is used for the legacy type "Introduction" as well.
	 * 
	 * @constructor
	 * @param {Object} config The configuration options for this Component, specified in an object (hash).
	 */
	var Label = Class.extend( Component, {
	
		/**
		 * @cfg {String/HTMLElement/jQuery} text
		 * The label's text. Accepts HTML, DOM nodes, and jQuery wrapper objects as well.
		 */
		text : "",
		
	
		// protected
		initComponent : function() {
			this.cls += ' ui-label';
			
			this._super( arguments );
		},
	
	
		// protected
		onRender : function() {
			this._super( arguments );
			
			this.$el.append( this.text || "" );
		},
		
		
		/**
		 * Sets the label's text.  Accepts HTML, DOM nodes, and jQuery wrapper objects as well.
		 * 
		 * @method setText
		 * @param {String/HTMLElement/jQuery} text The text, HTML, or DOM element to set to the label. 
		 */
		setText : function( text ) {
			if( !this.rendered ) {
				this.text = text;  // set the config. will be used when rendered
			} else {
				this.$el.empty().append( text );
			}
		},
		
		
		/**
		 * Gets the label's text.  Will return the HTML of the label if it has any.
		 * 
		 * @method getText
		 * @return {String}
		 */
		getText : function() {
			if( !this.rendered ) {
				return this.text || "";  // return the current value of the config
			} else {
				return this.$el.html();
			}
		}
	
	} );
	
	
	// Register the type so it can be created by the string 'Label' in the manifest
	ComponentManager.registerType( 'label', Label );
	
	return Label;
} );