/**
 * @abstract
 * @class ui.formFields.AbstractField
 * @extends ui.Component
 * @mixin ui.DataControl
 *  
 * Abstract base class for form fields, which lays out a label, a container for form field(s), and a container
 * for help text, while also providing the base functionality validation and other common field related tasks.
 */
/*global Kevlar, ui */
ui.formFields.AbstractField = Kevlar.extend( ui.Component, [ ui.DataControl ], {
	
	/**
	 * @cfg {String} inputId 
	 * The id that should be used for the Component's input element. The label element (if {@link #label} is specified) will be created 
	 * with a `for` attribute with this id.  Defaults to a uniquely generated id.
	 */
	
	/**
	 * @cfg {String} inputName
	 * The name to give the input. This will be set as the input's "name" attribute.  This is really only useful if
	 * the form that the component exists in is going to be submitted by a standard form submission (as opposed to just
	 * having its values retrieved, which are handled elsewhere). Defaults to the value of the 
	 * {@link #inputId} config.
	 */
	
	/**
	 * @cfg {String} label 
	 * The field's label. If empty, no space will be reserved for the field's label. Defaults to an empty string.  If 
	 * it is required that the label space be reserved, but should look empty, set to a non-breaking space (&amp;nbsp;)<br><br>
	 * 
	 * Note that setting the label at a later time using {@link #setLabel} will re-reserve the necessary label space
	 * if the label was originally empty.
	 */
	label : "",
	
	/**
	 * @cfg {String} labelPosition
	 * A string that specifies where the field's label should be placed. Valid values are:
	 * "left" and "top". Defaults to 'left'.
	 */
	labelPosition : 'left',
	
	/**
	 * @cfg {String} labelWidth
	 * A string specifying the percentage (with the trailing '%' sign) of how wide the label should be in relation to the rest
	 * of the field.  This is only valid if the {@link #labelPosition} config is set to 'left'. Defaults to "19%".<br><br>
	 * 
	 * Note that this must currently be a percentage because of limitations with div elements.  A future implementation
	 * may incorporate calculations to allow this config to be a number (specifying the number of pixels).
	 */
	labelWidth : '19%',
	
	/**
	 * @cfg {String} help 
	 * A help tip explaining the field to the user, which gets placed below the {@link #$inputContainerEl}. Defaults to an empty string.
	 */
	help : "",
	
	/** 
	 * @cfg {Function} validator 
	 * The function to use to validate the field. Function should return true if the field validates, false if it does not.
	 */
		
	/**
	 * @cfg {Mixed} value
	 * The initial value for the field, if any. If this is a function, the function will be executed and its return value used for the value.
	 */
	 
	
	/**
	 * The &lt;label&gt; element that gets filled with the label text.  Set HTML content to this element with {@link #setLabel},
	 * or retrieve the element itself for any custom implementation with {@link #getLabelEl}.
	 *
	 * @protected
	 * @property $labelEl
	 * @type jQuery
	 */
	
	/**
	 * The &lt;div&gt; element that wraps the input field.  Retrieve this element for any custom implementation 
	 * with {@link #getInputContainerEl}.
	 *
	 * @protected
	 * @property $inputContainerEl
	 * @type jQuery
	 */
	
	/**
	 * The &lt;div&gt; element that wraps the help text.  Set HTML content to this element with {@link #setHelp},
	 * or retrieve the element itself for any custom implementation with {@link #getHelpEl}.
	 *
	 * @protected
	 * @property $helpEl
	 * @type jQuery
	 */
	
	/**
	 * Stores the value that last fired the {@link #datachange} event (using the {@link #onDataChange} method). This is a workaround
	 * for {@link ui.formFields.TextField TextFields} so that the {@link #datachange} event being fired from an onkeyup event does not also
	 * cause the {@link #datachange} event to be fired again when the field is blurred.<br><br>
	 *  
	 * This also solves the problem of previously firing the {@link #datachange} event when modifier keys like shift, or ctrl, are pressed. 
	 * 
	 * @protected
	 * @property lastDataChangeValue
	 * @type String
	 */
		
	
	// protected
	initComponent : function() {
		this.addEvents(
			/**
			 * @event change
			 * Fires when the input field has been changed.
			 * @param {ui.formFields.AbstractField} field This Field object.
			 * @param {Object} newValue The new value of the field.
			 */
			'change',
			
			/**
			 * @event focus
			 * Fires when the input field has been focused.
			 * @param {ui.formFields.AbstractField} field This Field object.
			 */
			'focus',
			
			/**
			 * @event blur
			 * Fires when the input field has been blurred.
			 * @param {ui.formFields.AbstractField} field This Field object.
			 */
			'blur'
		);
		
		
		// Add the dialog-formField class, which creates a margin around form fields, and is the ancestor selector for all form field styling.
		this.cls += ' dialog-formField';
		
		
		// If the value is a function, execute it, and use its return value as the value. This is to provide a little backward compatibility for
		// some fields that use it, and need a new (i.e. different) return value for each new instance.
		if( typeof this.value === 'function' ) {
			this.value = this.value();
		}
		
		
		// Fix labelPosition to be lower case
		this.labelPosition = this.labelPosition.toLowerCase();
		
		
		// Apply other appropriate CSS classes to the outer element
		if( this.label === "" ) {
			this.cls += ' dialog-formField-noLabel';
		} else {
			this.cls += ' dialog-formField-' + this.labelPosition + 'Label';  // will add the 'dialog-formField-leftLabel' or 'dialog-formField-topLabel' css classes
		}
		
		
		// Give the input a unique ID, if one was not provided
		this.inputId = this.inputId || 'ui-cmp-input-' + Kevlar.newId();
		
		// Default the inputName to the inputId, if not provided.
		this.inputName = ( typeof this.inputName !== 'undefined' ) ? this.inputName : this.inputId;  // allowing for the possibility of providing an empty string for inputName here (so the field isn't submitted), so not using the || operator
		
		
		// Call superclass initComponent
		ui.formFields.AbstractField.superclass.initComponent.call( this );
		
		// Call mixin class constructor
		ui.DataControl.constructor.call( this );
	},
	
	
	/**
	 * Handles the basic rendering for all field subclasses. Takes care of adding a label (if specified), the
	 * containing div for the input element, and the input element itself if specified.
	 * 
	 * @protected
	 * @method onRender
	 */
	onRender : function() {
		ui.formFields.AbstractField.superclass.onRender.apply( this, arguments );
		
		var $el = this.$el,
		    renderTpl = ui.formFields.AbstractField.renderTpl,  // static property
		    labelWrapStyles = "",
		    inputContainerWrapStyles = "",
		    helpStyles = "";
		
		// Size the label and input container elements (based on the labelWidth config) if the labelPosition is 'left', and there is an actual label.
		if( this.label !== "" && this.labelPosition === 'left' ) {
			// Make the percentage label width into a number (i.e. change "15%" to 15)
			var labelWidth = parseInt( this.labelWidth, 10 );
			
			labelWrapStyles += 'width: ' + labelWidth + '%;';
			inputContainerWrapStyles += 'width: ' + ( 100 - labelWidth ) + '%;';  // the remaining width: 100% - minus the label width
			
			// Set the help element to line up with the field's input container
			helpStyles += 'padding-left: ' + labelWidth + '%;';
		}
		
		// Single DOM append of the render template
		var renderHTML = Kevlar.util.tmpl( renderTpl, {
			inputId : this.inputId,
			
			label : this.label || "",
			help  : this.help || "",
			
			labelWrapStyles          : labelWrapStyles,
			inputContainerWrapStyles : inputContainerWrapStyles,
			helpStyles               : helpStyles
		} );
		$el.append( renderHTML );
		
		// Retrieve references from generated HTML/DOM append
		this.$labelEl = $el.find( 'label.dialog-formField-label' );
		this.$inputContainerEl = $el.find( 'div.dialog-formField-inputContainer' );
		this.$helpEl = $el.find( 'div.dialog-formField-help' );
	},
	
	
	/**
	 * Sets the label text for the field.
	 * 
	 * @method setLabel
	 * @param {String} label
	 */
	setLabel : function( label ) {
		if( !this.rendered ) {
			this.label = label;
			
		} else {
			// If a label was specified, make sure the dialog-formField-noLabel class has been removed. Otherwise, add it.
			if( label !== "" ) {
				this.$el.removeClass( 'dialog-formField-noLabel' );
			} else {
				this.$el.addClass( 'dialog-formField-noLabel' );
			}
			
			this.$labelEl.empty().append( label );
		}
	},
	
	
	/**
	 * Sets the help text for the field.
	 * 
	 * @method setHelp
	 * @param {String} helpText
	 */
	setHelp : function( helpText ) {
		if( !this.rendered ) {
			this.help = helpText;
			
		} else {
			this.$helpEl.html( helpText );
		}
	},
	
	
	/**
	 * Retrieves the label element. This is useful if you want to add other HTML elements into the label element itself.
	 * Returns the element in a jQuery wrapper.
	 * 
	 * @method getLabelEl
	 * @return {jQuery}
	 */
	getLabelEl : function() {
		return this.$labelEl;
	},
	
	
	/**
	 * Retrieves the div element that is meant to wrap the input element. This is useful if you want to add other HTML elements
	 * into the input container element itself. Returns the element in a jQuery wrapper.
	 * 
	 * @method getInputContainerEl
	 * @return {jQuery}
	 */
	getInputContainerEl : function() {
		return this.$inputContainerEl;
	},
	
	
	/**
	 * Retrieves the help div element. This is useful if you want to add other HTML elements into the help element itself.
	 * Returns the element in a jQuery wrapper.
	 * 
	 * @method getHelpEl
	 * @return {jQuery}
	 */
	getHelpEl : function() {
		return this.$helpEl;
	},
	
	
	
	/**
	 * Sets the value for the field.
	 * 
	 * @abstract
	 * @method setValue
	 * @param {Mixed} value The value to set to the field.
	 */
	setValue : function( value ) {
		throw new Error( "setValue() must be implemented in AbstractField subclass" );
	},
	
	
	/**
	 * Retrieves the current value from the field.
	 * 
	 * @abstract
	 * @method getValue
	 * @return {Mixed} The value of the field.
	 */
	getValue : function() {
		throw new Error( "getValue() must be implemented in AbstractField subclass" );
	},
    
	
	/**
	 * Template method for handling a change to the field. Extensions of this method should call this superclass method
	 * after their processing is complete.
	 * 
	 * @protected
	 * @method onChange
	 * @param {Mixed} newValue The new value of the field.
	 */
	onChange : function( newValue ) {
		this.fireEvent( 'change', this, newValue );
		
		// Only fire the event if the value is different from the last value we fired the datachange event with.
		// See lastDataChangeValue property doc for details. 
		if( this.lastDataChangeValue !== newValue ) {
			this.lastDataChangeValue = newValue;  // update the lastDataChangeValue 
			this.onDataChange();  // call method in DataControl mixin to fire the datachange event
		}
	},
	
	
	/**
	 * Focuses the field.
	 * 
	 * @protected
	 * @method focus
	 */
	focus : function() {
		this.onFocus();
	},
	
	
	/**
	 * Template method for handling the input field being focused. Extensions of this method should call this superclass method
	 * after their processing is complete.
	 * 
	 * @protected
	 * @method onFocus
	 */
	onFocus : function() {
		this.fireEvent( 'focus', this );
	},
	
	
	/**
	 * Blurs the field.
	 * 
	 * @protected
	 * @method blur
	 */
	blur : function() {
		this.onBlur();
	},
	
	
	/**
	 * Template method for handling the input field being blurred. Extensions of this method should call this superclass method
	 * after their processing is complete.
	 * 
	 * @protected
	 * @method onBlur
	 */
	onBlur : function() {
		this.fireEvent( 'blur', this );
	},
	
	
	// --------------------------------
	
	
	// Implementation of ui.DataControl mixin interface
	setData : function() {
		this.setValue.apply( this, arguments );
	},
	getData : function() {
		return this.getValue();
	}
	
} );


// Add static properties
Kevlar.apply( ui.formFields.AbstractField, {
	
	/**
	 * @private
	 * @static
	 * @property renderTpl
	 * @type String
	 * The template to use to render the AbstractField's elements.
	 */
	renderTpl : [
		'<div class="dialog-formField-labelWrap" style="<%= labelWrapStyles %>">',
			'<label for="<%= inputId %>" class="dialog-formField-label"><%= label %></label>',
		'</div>',
		'<div class="dialog-formField-inputContainerWrap" style="<%= inputContainerWrapStyles %>">',
			'<div class="dialog-formField-inputContainer" style="position: relative;" />',
		'</div>',
		'<div class="dialog-formField-help" style="<%= helpStyles %>"><%= help %></div>'
	].join( "" )
	
} );
