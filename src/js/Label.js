/*global define */
define( [
	'jqc/ComponentManager',
	'jqc/Component'
], function( ComponentManager, Component ) {
	
	/**
	 * @class jqc.Label
	 * @extends jqc.Component
	 * 
	 * Creates a label (piece of text).
	 */
	var Label = Component.extend( {
	
		/**
		 * @cfg {String/HTMLElement/jQuery} text
		 * 
		 * The label's text. Accepts HTML, DOM nodes, and jQuery wrapped sets as well.
		 */
		text : "",
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'jqc-Label',
		
	
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			this.$el.append( this.text || "" );
			delete this.text;  // no longer needed
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
				this.$el.html( text );
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
				return this.text || "";
			} else {
				return this.getEl().html();  // in case DOM nodes were provided as the `text`, return the html
			}
		}
	
	} );
	
	
	// Register the class so it can be created by the type string 'label'
	ComponentManager.registerType( 'label', Label );
	
	return Label;
	
} );