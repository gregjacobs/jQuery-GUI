/**
 * @class ui.formFields.LinkTextField
 * @extends ui.formFields.TextField
 * 
 * A {@link ui.formFields.TextField TextField} implementation that also provides the ability to link the text, if desired.
 * Shows a "Link" button at the right side of the text field.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Class, jQuery, Jux, ui */
ui.formFields.LinkTextField = Class.extend( ui.formFields.TextField, {
	
	/**
	 * @cfg {String/Function} default
	 * The default value for the field. If a function is provided, then the function is called and the return
	 * value from the function is used. This should match the format of the {@link #value} config.
	 */
	
	/**
	 * @cfg {String/Object} value
	 * The initial value (data) to put into the Link Text Field. If the value is a string, it is assumed that the string
	 * is the text for the field, and it is not linked anywhere.  If the value is an object, it may have the following properties (all optional):
	 * <div class="mdetail-params">
	 *   <ul>
	 *     <li>
	 *       <b>text</b> : String
	 *       <div class="sub-desc">The text for the field (i.e. the link to show on the page).</div>
	 *     </li>
	 *     <li>
	 *       <b>pageid</b> : Int
	 *       <div class="sub-desc">
	 *         The pageid of a page within bitmix that the link points to. This is only valid for links that point to other pages within the site.
	 *         If this is defined, and not null, then the link-picker overlay will be set to "page" when it is opened.
	 *       </div>
	 *     </li>
	 *     <li>
	 *       <b>url</b> : String
	 *       <div class="sub-desc">
	 *         The url that the link points to. This is used for both "page" and "url" selections.
	 *         If this has a value, and `pageid` is either undefined or null, then the link-picker overlay will be set to "url" when it is opened.
	 *       </div>
	 *     </li>
	 *   </ul>
	 * </div>
	 */
	
	
	
	// protected
	initComponent : function() {
		// Add the 'linkTextField' css classes to this Component's element
		this.cls += ' linkTextField';
		
		// Create the popup overlay for linking the field's text
		this.linkPickerOverlay = new ui.components.LinkPickerOverlay();
		
		// Call the superclass's initComponent
		ui.formFields.LinkTextField.superclass.initComponent.call( this );
	},
	
	
	
	// protected
	onRender : function( container ) {
		// Call superclass onRender()
		ui.formFields.LinkTextField.superclass.onRender.apply( this, arguments );
		
		// Now that the field is rendered, we can set the overlay's anchor to the text field's element.
		// When it is opened, it will be positioned up against the text field.
		this.linkPickerOverlay.setAnchor( {
			element : this.$inputEl,
			offset  : "0 10"
		} );
		
		
		// Create the "link" button that goes inside the text field, which when clicked, opens up the overlay
		this.$linkButton = jQuery( '<button class="linkTextField-linkButton">Link</button>' ).button();
		this.$linkButton.appendTo( this.$inputContainerEl );
		this.$linkButton.bind( {
			'click' : function() {
				this.linkPickerOverlay.open();
			}.createDelegate( this )
		} );
	},
	
	
	
	/**
	 * Override of {@link ui.formFields.TextField#setValue} method, which sets the value to the field based
	 * on the LinkTextField's data object (instead of TextField's string). See {@link #value} for more information.
	 * 
	 * @method getValue
	 * @param {Object} value The value of the field. This is an object, with properties for the link. See {@link #value}.
	 */
	setValue : function( value ) {
		// Handle a string argument, by putting it in an object under the key 'text'
		if( typeof value === 'string' ) {
			value = { text: value };
		}
		
		
		if( !this.rendered ) {
			this.value = value;  // If the Component has not yet been rendered (i.e. the Field has not yet been created), store the value as the initial value to set.	
			
		} else {
			var dataObj = value || {},  // naming dataObj for clarity that the value is an object
			    text = dataObj.text || "";
			
			// Set the text field
			this.$inputEl.val( text );
			
			// If the value being set is the default, add the ui-hint-text class.  Not sure if this should definitely be like this, but it should work 
			// for most cases (i.e. every case except when the user saves actual data that is the default). Otherwise, make sure that the ui-hint-text class 
			// is removed on set.
			var defaultValue = this.getDefaultValue();
			if( typeof defaultValue === 'object' && text === defaultValue.text ) {
				this.$inputEl.addClass( 'ui-hint-text' );
			} else {
				this.$inputEl.removeClass( 'ui-hint-text' );
			}
			
			
			// Set the LinkPickerOverlay's state based on the url and pageid
			this.linkPickerOverlay.setState( {
				url    : dataObj.url,
				pageid : dataObj.pageid
			} );
		}
	},
	
	
	/**
	 * Implementation of {@link ui.formFields.AbstractField AbstractField}'s getValue() method, which returns the value of the field.
	 * 
	 * @method getValue
	 * @return {Object} The value of the field, which is an object with the properties outlined by the {@link #value} config.
	 */
	getValue : function() {
		var dataObj = {};
		
		if( !this.rendered ) {
			// If the value was set before the Component has been rendered (i.e. before the Field has been created), put its properties onto the return object (if any).
			Jux.apply( dataObj, typeof this.value === 'string' ? { text: this.value } : this.value );
			
		} else {
			var linkObj = this.linkPickerOverlay.getState();
			dataObj.url = linkObj.url;
			dataObj.pageid = linkObj.pageid;
			dataObj.target = linkObj.target;
			dataObj.text = this.$inputEl.val();
        }
		
		return dataObj;
	},
	
	
	/**
	 * Cleans up the LinkTextField field when it is destroyed.
	 * 
	 * @protected
	 * @method onDestroy
	 */
	onDestroy : function() {
		this.linkPickerOverlay.destroy();
		
		ui.formFields.LinkTextField.superclass.onDestroy.apply( this, arguments );
	}
	
} );


// Register the type so it can be created by the string 'Link' or 'LinkTextField' in the manifest
ui.ComponentManager.registerType( 'Link', ui.formFields.LinkTextField );
ui.ComponentManager.registerType( 'LinkTextField', ui.formFields.LinkTextField );
