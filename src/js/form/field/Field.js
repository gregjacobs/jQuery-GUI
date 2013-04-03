/*global define */
define( [
	'jquery',
	'lodash',
	'Class',
	'ui/Component',
	'ui/template/LoDash'
], function( jQuery, _, Class, Component, LoDashTpl ) {
	
	/**
	 * @abstract
	 * @class ui.form.field.Field
	 * @extends ui.Component
	 * 
	 * Abstract base class for form fields, which lays out a label and a container for form field(s), while also 
	 * providing the base functionality and other common field related tasks.
	 * 
	 * Each concrete subclass must implement the {@link #setValue} and {@link #getValue} methods.
	 */
	var Field = Component.extend( {
		abstractClass : true,
		
		/**
		 * @cfg {String} inputId
		 * 
		 * The id that should be used for the Component's input element. The label element (if {@link #label} is specified) 
		 * will be created with a `for` attribute with this id. Defaults to a uniquely generated id.
		 */
		
		/**
		 * @cfg {String} inputName
		 * 
		 * The name to give the input. This will be set as the input's "name" attribute. This is really only useful if
		 * the form that the component exists in is going to be submitted by a standard form submission (as opposed to just
		 * having its values retrieved, which are handled elsewhere). Defaults to the value of the {@link #inputId} config.
		 */
		
		/**
		 * @cfg {String} label
		 * 
		 * The field's label. If empty, no space will be reserved for the field's label. Defaults to an empty string.  If 
		 * it is required that the label space be reserved, but should look empty, set to a non-breaking space (&amp;nbsp;)
		 * 
		 * Note that setting the label at a later time using {@link #setLabel} will re-reserve the necessary label space
		 * if the label was originally empty.
		 */
		label : "",
		
		/**
		 * @cfg {String} labelAlign
		 * 
		 * A string that specifies where the field's label should be placed. Valid values are:
		 * "left" and "top". Defaults to 'left'.
		 */
		labelAlign : 'left',
		
		/**
		 * @cfg {String} labelWidth
		 * 
		 * A string specifying the percentage (with the trailing '%' sign) of how wide the label should be in relation to the rest
		 * of the field.  This is only valid if the {@link #labelAlign} config is set to 'left'. Defaults to "19%".
		 * 
		 * Note that this must currently be a percentage because of limitations with div elements.  A future implementation
		 * may incorporate calculations to allow this config to be a number (specifying the number of pixels).
		 */
		labelWidth : '19%',
		
		/**
		 * @cfg {String} extraMsg 
		 * 
		 * A tip explaining the field to the user, or provides an example, which gets placed below the {@link #$inputContainerEl}. Defaults to an empty string.
		 */
		extraMsg : "",
		
		/**
		 * @cfg {Mixed} value
		 * 
		 * The initial value for the field, if any.
		 */
		 
		
		/**
		 * @protected
		 * @property {jQuery} $labelEl
		 * 
		 * The &lt;label&gt; element that gets filled with the label text.  Set HTML content to this element with {@link #setLabel},
		 * or retrieve the element itself for any custom implementation with {@link #getLabelEl}.
		 */
		
		/**
		 * @protected
		 * @property {jQuery} $inputContainerWrapEl
		 * 
		 * The &lt;div&gt; element that wraps the {@link #getInputContainerEl}.
		 */
		
		/**
		 * @protected
		 * @property {jQuery} $inputContainerEl
		 * 
		 * The &lt;div&gt; element that wraps the input field.  Retrieve this element for any custom implementation 
		 * with {@link #getInputContainerEl}.
		 */
		
		/**
		 * @protected
		 * @property {jQuery} $extraMsgEl
		 * 
		 * The &lt;div&gt; element that wraps the "extra message" text.  Set HTML content to this element with {@link #setExtraMsg}.
		 */
		
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'ui-form-Field',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		renderTpl : new LoDashTpl( [
			'<div class="<%= baseCls %>-labelWrap" style="<%= labelWrapStyles %>">',
				'<label id="<%= elId %>-label" for="<%= inputId %>" class="<%= baseCls %>-label"><%= label %></label>',
			'</div>',
			'<div id="<%= elId %>-inputContainerWrap" class="<%= baseCls %>-inputContainerWrap" style="<%= inputContainerWrapStyles %>">',
				'<div id="<%= elId %>-inputContainer" class="<%= baseCls %>-inputContainer" style="position: relative;" />',
			'</div>',
			'<div id="<%= elId %>-extraMsg" class="<%= baseCls %>-extraMsg" style="<%= extraMsgStyles %>"><%= extraMsg %></div>'
		] ),
		
		
		// protected
		initComponent : function() {
			this.addEvents(
				/**
				 * Fires when the input field has been changed.
				 * 
				 * @event change
				 * @param {ui.form.field.Field} field This Field object.
				 * @param {Object} newValue The new value of the field.
				 */
				'change',
				
				/**
				 * Fires when the input field has been focused.
				 * 
				 * @event focus
				 * @param {ui.form.field.Field} field This Field object.
				 */
				'focus',
				
				/**
				 * Fires when the input field has been blurred.
				 * 
				 * @event blur
				 * @param {ui.form.field.Field} field This Field object.
				 */
				'blur'
			);
			
			
			// Fix labelAlign to be lowercase for use with setting the class name (just in case),
			// and apply the appropriate CSS class for the label state
			var labelAlign = this.labelAlign = this.labelAlign.toLowerCase(),
			    labelCls = this.baseCls + '-' + ( !this.label ? 'noLabel' : labelAlign + 'Label' );  // ex: 'ui-form-Field-noLabel' if there is no label, or 'ui-form-Field-leftLabel' or 'ui-form-Field-topLabel' if there is one
			this.addCls( labelCls );
			
			// Give the input a unique ID, if one was not provided
			this.inputId = this.inputId || 'ui-cmp-input-' + _.uniqueId();
			
			// Default the inputName to the inputId, if not provided.
			this.inputName = ( typeof this.inputName !== 'undefined' ) ? this.inputName : this.inputId;  // allowing for the possibility of providing an empty string for inputName here (so the field isn't submitted), so not using the || operator
			
			
			// Call superclass initComponent
			this._super( arguments );
		},
		
		
		/**
		 * @inheritdoc
		 */
		getRenderTplData : function() {
			var labelWrapStyles = "",
			    inputContainerWrapStyles = "",
			    extraMsgStyles = "";
			
			// Size the label and input container elements (based on the labelWidth config) if the labelAlign is 'left', and there is an actual label.
			if( this.label !== "" && this.labelAlign === 'left' ) {
				// Make the percentage label width into a number (i.e. change "15%" to 15)
				var labelWidth = parseInt( this.labelWidth, 10 );
				
				labelWrapStyles += 'width: ' + labelWidth + '%;';
				inputContainerWrapStyles += 'width: ' + ( 100 - labelWidth ) + '%;';  // the remaining width: 100% - minus the label width
				
				// Set the extraMsg element to line up with the field's input container
				extraMsgStyles += 'padding-left: ' + labelWidth + '%;';
			}
			
			
			// Add properties to the object provided by the superclass, and return
			return _.assign( this._super( arguments ), {
				inputId   : this.inputId,
				inputName : this.inputName,
				
				label    : this.label    || "",
				extraMsg : this.extraMsg || "",
				
				labelWrapStyles          : labelWrapStyles,
				inputContainerWrapStyles : inputContainerWrapStyles,
				extraMsgStyles           : extraMsgStyles
			} );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			// Retrieve references from generated HTML/DOM append
			var elId = this.elId;
			this.$labelEl = jQuery( '#' + elId + '-label' );
			this.$inputContainerWrapEl = jQuery( '#' + elId + '-inputContainerWrap' );
			this.$inputContainerEl = jQuery( '#' + elId + '-inputContainer' );
			this.$extraMsgEl = jQuery( '#' + elId + '-extraMsg' );
		},
		
		
		// --------------------------------------
		
		
		/**
		 * Sets the {@link #label} for the field.
		 * 
		 * @param {String} label
		 * @chainable
		 */
		setLabel : function( label ) {
			this.label = label;
				
			if( this.rendered ) {
				// If a label was specified, make sure the "noLabel" class has been removed. Otherwise, add it.
				this.$el[ !label ? 'addClass' : 'removeClass' ]( this.baseCls + '-noLabel' );
				this.$labelEl.html( label );
			}
			return this;
		},
		
		
		/**
		 * Retrieves the current {@link #label}.
		 * 
		 * @return {String}
		 */
		getLabel : function() {
			return this.label;
		},
		
		
		/**
		 * Sets the {@link #extraMsg "extra message"} text for the Field.
		 * 
		 * @param {String} extraMsg
		 * @chainable
		 */
		setExtraMsg : function( extraMsg ) {
			this.extraMsg = extraMsg;
				
			if( this.rendered ) {
				this.$extraMsgEl.html( extraMsg );
			}
			return this;
		},
		
		
		/**
		 * Retrieves the current {@link #extraMsg "extra message"} text.
		 * 
		 * @return {String}
		 */
		getExtraMsg : function() {
			return this.extraMsg;
		},
		
		
		/**
		 * Retrieves the label element. This is useful if you want to add other HTML elements into the label element itself
		 * in a Field subclass.
		 * 
		 * @protected
		 * @return {jQuery} The element, in a jQuery wrapped set.
		 */
		getLabelEl : function() {
			return this.$labelEl;
		},
		
		
		/**
		 * Retrieves the div element that is meant to wrap the input element. This is useful if you want to add other HTML 
		 * elements into the input container element itself in a Field subclass.
		 * 
		 * @protected
		 * @return {jQuery} The element, in a jQuery wrapped set.
		 */
		getInputContainerEl : function() {
			return this.$inputContainerEl;
		},
		
		
		
		/**
		 * Sets the value for the field.
		 * 
		 * @abstract
		 * @method setValue
		 * @param {Mixed} value The value to set to the field.
		 */
		setValue : Class.abstractMethod,
		
		
		/**
		 * Retrieves the current value from the field.
		 * 
		 * @abstract
		 * @method getValue
		 * @return {Mixed} The value of the field.
		 */
		getValue : Class.abstractMethod,
	    
		
		/**
		 * Template method for handling a change to the field. Extensions of this method should call this superclass method
		 * after their processing is complete.
		 * 
		 * @protected
		 * @param {Mixed} newValue The new value of the field.
		 */
		onChange : function( newValue ) {
			this.fireEvent( 'change', this, newValue );
		},
		
		
		/**
		 * Focuses the field.
		 * 
		 * @chainable
		 */
		focus : function() {
			this.onFocus();
			
			return this;
		},
		
		
		/**
		 * Hook method for handling the input field being focused. Extensions of this method should call this superclass 
		 * method after their processing is complete.
		 * 
		 * @protected
		 * @template
		 */
		onFocus : function() {
			this.addCls( this.baseCls + '-focused' );
			
			this.fireEvent( 'focus', this );
		},
		
		
		/**
		 * Blurs the field.
		 * 
		 * @chainable
		 */
		blur : function() {
			this.onBlur();
			
			return this;
		},
		
		
		/**
		 * Hook method for handling the input field being blurred. Extensions of this method should call this superclass 
		 * method after their processing is complete.
		 * 
		 * @protected
		 * @template
		 */
		onBlur : function() {
			this.removeCls( this.baseCls + '-focused' );
			
			this.fireEvent( 'blur', this );
		}
		
	} );

	return Field;
	
} );