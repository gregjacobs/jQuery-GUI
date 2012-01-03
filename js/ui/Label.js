/**
 * @class ui.Label
 * @extends ui.Component
 * 
 * Creates a label (piece of text) in a UI hierarchy. This class is used for the legacy type "Introduction" as well.
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.Label = Kevlar.extend( ui.Component, {

	/**
	 * @cfg {String/HTMLElement/jQuery} text
	 * The label's text. Accepts HTML, DOM nodes, and jQuery wrapper objects as well.
	 */
	text : "",
	

	// protected
	initComponent : function() {
		this.cls += ' ui-label';
		
		ui.Label.superclass.initComponent.call( this );
		
		// Backward compatibility: accept 'help' config as the label's text
		if( this.help ) {
			this.text = this.help;
		}
		// Backward compatibility: accept 'label' config as the label's text
		if( this.label ) {
			this.text = this.label;
		}
	},


	// protected
	onRender : function() {
		ui.Label.superclass.onRender.apply( this, arguments );
		
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
// For backward compatibility, register the 'Introduction' type as well.
ui.ComponentManager.registerType( 'Label', ui.Label );  
ui.ComponentManager.registerType( 'Introduction', ui.Label );  