/**
 * @class ui.FieldSet
 * @extends ui.Container
 * 
 * Renders a FieldSet container, which has a title, and holds child Components.
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Class, jQuery, Jux, ui */
ui.FieldSet = Class.extend( ui.Container, {
	
	/**
	 * @cfg {String} title
	 * The title for the FieldSet, which may include html. Defaults to an empty string (for no title).
	 */
	title : "",
	
	
	/**
	 * @cfg {String} elType
	 * @inheritdoc
	 */
	elType : 'fieldset',
	
	
	/**
	 * @private
	 * @property $legendEl
	 * The &lt;legend&gt; element within the &lt;fieldset&gt;.
	 * @type jQuery
	 */
	
	
	// protected
	initComponent : function() {
		this.cls += ' dialog-fieldSet';
		
		ui.FieldSet.superclass.initComponent.call( this );
	},
	
	
	// protected
	onRender : function() {
		ui.FieldSet.superclass.onRender.apply( this, arguments );
		
		this.$legendEl = jQuery( '<legend>' + this.title + '</legend>' ).appendTo( this.$el );
	},
	
	
	/**
	 * Sets the title of the FieldSet.
	 * 
	 * @method setTitle
	 * @param {String} title
	 */
	setTitle : function( title ) {
		if( !this.rendered ) {
			this.title = title;
		} else {
			this.$legendEl.empty().append( title );
		}
	}
	
} );


// Register the type so it can be created by the string 'FieldSet' in the manifest
ui.ComponentManager.registerType( 'FieldSet', ui.FieldSet );