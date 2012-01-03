/**
 * @class ui.containers.SectionContainer
 * @extends ui.Container
 *  
 * Container class that renders a section for child containers.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.containers.SectionContainer = Kevlar.extend( ui.Container, {
	
	/**
	 * @cfg {String} title 
	 * The title for the section. Defaults to an empty string (for no title).
	 */
	title : "",
	
	/**
	 * @cfg {Object} titleStyle
	 * Any additional styles to apply to the title element. Should be an object where the keys are the css property names, and the values are the css values.
	 */
	
	
	/**
	 * @private
	 * @property {jQuery} $contentEl
	 * The element that holds the Section's content.
	 */
	
	
	// protected
	initComponent : function() {
		// Add the "section" class to the Component's outer element
		this.cls += ' dialog-section';
		
		ui.containers.SectionContainer.superclass.initComponent.call( this );
	},
	
	
	// protected
	onRender : function() {
		ui.containers.SectionContainer.superclass.onRender.apply( this, arguments );
		
		// Create an inner element for styling (initially detached - will append after other elements are appended)
		var $innerEl = jQuery( '<div class="dialog-section-inner" />' );
		
		// If a title was specified, add that now
		if( this.title ) {
			var $titleDiv = jQuery( '<div class="dialog-section-title">' + this.title + '</div>' ).prependTo( $innerEl );
			if( this.titleStyle ) {
				$titleDiv.css( this.titleStyle );
			}
		}
		
		// Create the element for the section's content
		this.$contentEl = jQuery( '<div class="dialog-section-content" />' ).appendTo( $innerEl );
		
		// Finally, append the $innerEl
		$innerEl.appendTo( this.$el );
	},
	
	
	/**
	 * Override of {@link ui.Component#getContentTarget} to specify where html content and child components should
	 * be rendered into.  This should be the {@link #$contentEl} for this subclass.
	 * 
	 * @method getContentTarget
	 * @return {jQuery}
	 */
	getContentTarget : function() {
		return this.$contentEl;
	}
	
} );


// Register the type so it can be created by the string 'Section' in the manifest
ui.ComponentManager.registerType( 'Section', ui.containers.SectionContainer );