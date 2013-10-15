/*global define */
define( [
	'jquery',
	'lodash',
	'gui/util/Html',
	'gui/ComponentManager',
	'gui/form/field/Field'
], function( jQuery, _, Html, ComponentManager, Field ) {
	
	/**
	 * @class gui.form.field.Text
	 * @extends gui.form.field.Field
	 * @alias type.textfield
	 * 
	 * Text field component.
	 */
	var TextField = Field.extend( {
		
		/**
		 * @cfg {Boolean} selectOnFocus
		 * 
		 * True to have the field's text automatically selected when the field is focused. Defaults to false. 
		 */
		selectOnFocus : false,
		
		/**
		 * @cfg {String} emptyText
		 * 
		 * The text to show in the field when the field is empty. When the user enters something into the field, this 
		 * text will be removed. If the field becomes empty again, this text will be re-shown.
		 * 
		 * The implementation of the emptyText itself is an element that is placed over the field when the field is empty.
		 * This is done instead of putting in "placeholder" text so that the emptyText can easily be styled, and so that
		 * on older browsers that don't support the HTML5 "placeholder" attribute (IE8), the field doesn't need to have a
		 * value of the {@link #emptyText}.
		 */
		emptyText : "",
		
		/**
		 * @cfg {String} value
		 * 
		 * The initial value for the field, if any.
		 */
		
		/**
		 * @cfg {Boolean} readOnly
		 * 
		 * True to mark the Field as "read only" in the HTML. This prevents the user from editing the Field.
		 */
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		componentCls : 'gui-form-field-text',
		
		
		/**
		 * @protected
		 * @property {jQuery} $inputEl
		 * 
		 * The &lt;input&gt; element; the text field. Will only be available after render.
		 */
		
		/**
		 * @protected
		 * @property {Boolean} focused
		 * 
		 * Flag which is set to `true` while the TextField is focused.
		 */
		focused : false,
		
		/**
		 * @protected
		 * @property {jQuery} $emptyTextEl
		 * 
		 * The element that holds the {@link #emptyText}, which is shown over the {@link #$inputEl}
		 * when the field is empty.
		 */
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this._super( arguments );
			
			this.addEvents(
				/**
				 * Fires when a key is pressed down in the field.
				 * 
				 * @event keydown
				 * @param {gui.form.field.Field} field This TextField object.
				 * @param {jQuery.Event} evt The jQuery event object for the event.
				 */
				'keydown',
				
				/**
				 * Fires when a key is pressed and let up in the field.
				 * 
				 * @event keyup
				 * @param {gui.form.field.Field} field This TextField object.
				 * @param {jQuery.Event} evt The jQuery event object for the event.
				 */
				'keyup',
				
				/**
				 * Fires when a key is pressed in the field.
				 * 
				 * @event keypress
				 * @param {gui.form.field.Field} field This TextField object.
				 * @param {jQuery.Event} evt The jQuery event object for the event.
				 */
				'keypress'
			);
			
			// If a value was provided, and it is not a string, convert it to one now. normalizeValue handles all datatypes.
			this.value = this.normalizeValue( this.value );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function( container ) {
			// Call superclass onRender()
			this._super( arguments );
			
			// Create the input field, and append it to the $inputContainerEl with the 'text' css class
			var $inputEl = this.$inputEl = this.createInputEl().appendTo( this.$inputContainerEl );
			
			// Add event handlers to the input element
			$inputEl.on( {
				change   : _.bind( function( evt ) { this.onChange( this.getValue() ); }, this ),  // Call onChange() with the new value
				focus    : _.bind( this.onFocus, this ),
				blur     : _.bind( this.onBlur, this ),
				keydown  : _.bind( this.onKeyDown, this ),
				keyup    : _.bind( this.onKeyUp, this ),
				keypress : _.bind( this.onKeyPress, this )
			} );
			
			// Set up the empty text element. This element is absolutely positioned in the inputContainer, and is initially hidden.
			this.$emptyTextEl = jQuery( '<div class="' + this.componentCls + '-emptyText">' + this.emptyText + '</div>' )
				.on( 'click', function() { $inputEl.focus(); } )  // when the emptyText itself is clicked, focus the text field
				.appendTo( this.$inputContainerEl );
			
			this.handleEmptyText();
		},
		
		
		/**
		 * Overridable method for creating the input element for the TextField. This may be overrided in a subclass for
		 * a different implementation than the regular &lt;input type="text"&gt; element.  The implementation should
		 * add the field's "id" ({@link #inputId}) and "name" ({@link #inputName}) properties, and populate the field's
		 * initial {@link #value}.
		 * 
		 * @protected
		 * @return {jQuery}
		 */
		createInputEl : function() {
			var value = Html.encode( this.value || "" );
			return jQuery( [ 
				'<input type="text"',
				' id="' + this.inputId + '"',
				' name="' + this.inputName + '"',
				' class="' + this.componentCls + '-input"',
				' value="' + value + '"',
				( this.readOnly ? ' readonly="readonly"' : '' ),
				'/>'
			].join( "" ) );
		},
		
		
		/**
		 * Retrieves the input element from the TextField. Use only if absolutely needed however, otherwise relying on the public
		 * interface to this class to perform common tasks such as getting/setting the value, or focusing/blurring the field.  
		 * This is mainly an accessor for the bevhavior state objects that operate on this class. The input element will not be
		 * available until the TextField has been rendered.
		 * 
		 * @return {jQuery} The input element if the component is rendered, or null if it is not.
		 */
		getInputEl : function() {
			return this.$inputEl || null;
		},
		
		
		/**
		 * Normalizes the value provided to a valid TextField value. Converts undefined/null into an empty string,
		 * and numbers/booleans/objects into their string form.
		 * 
		 * @protected
		 * @param {Mixed} value
		 * @return {String}
		 */
		normalizeValue : function( value ) {
			// Normalize undefined/null to an empty string, and numbers/booleans/objects to their string representation.
			// Otherwise, return string values unchanged.
			if( typeof value === 'undefined' || value === null ) {
				return "";
			} else if( typeof value !== 'string' ) {
				return value.toString();
			} else {
				return value;
			}
		},
		
		
		/**
		 * Implementation of {@link gui.form.field.Field Field}'s setValue() method, which sets the value to the field.
		 * 
		 * @param {String} value The value of the field.
		 */
		setValue : function( value ) {
			value = this.normalizeValue( value );
			
			if( !this.rendered ) {
				this.value = value;  // If the Component has not yet been rendered (i.e. the Field has not yet been created), store the value as the initial value to set.
				
			} else {
				this.$inputEl.val( value );
			}
			
			// Run onchange, to notify listeners of a change
			this.onChange( value );
		},
		
		
		/**
		 * Implementation of {@link gui.form.field.Field Field}'s getValue() method, which returns the value of the field.
		 * 
		 * @return {String} The value of the field.
		 */
		getValue : function() {
			if( !this.rendered ) {
				// If the value was set before the Component has been rendered (i.e. before the Field has been created), return that.
				return this.value;
				
			} else {
				return this.$inputEl.val();
			}
		},
		
		
		/**
		 * Sets the {@link #emptyText} for the Field.
		 * 
		 * @param {Mixed} emptyText The empty text to set to the Field.
		 */
		setEmptyText : function( emptyText ) {
			this.emptyText = emptyText;
			
			if( this.rendered ) {
				this.$emptyTextEl.html( emptyText );
			}
		},
		
		
		/**
		 * Retrieves the {@link #emptyText} of the Field.
		 * 
		 * @return {Mixed} The {@link #emptyText} that was specified for the Field, or set using {@link #setEmptyText}.
		 */
		getEmptyText : function() {
			return this.emptyText;
		},
		
		
		/**
		 * Selects the text in the TextField.
		 */
		select : function() {
			this.$inputEl.select();
		},
		
		
		/**
		 * Extension of onChange template method used to handle the {@link #emptyText}.
		 *
		 * @protected
		 */
		onChange : function() {
			this.handleEmptyText();
			
			this._super( arguments );
		},
		
		
		/**
		 * Focuses the text field.
		 * 
		 * @chainable
		 */
		focus : function() {
			this.$inputEl.focus();
			
			return this._super( arguments );
		},
		
		
		/**
		 * Blurs the text field.
		 * 
		 * @chainable
		 */
		blur : function() {
			this.$inputEl.blur();
			
			return this._super( arguments );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onFocus : function() {
			this.focused = true;
			this.handleEmptyText();
			
			// If the selectOnFocus config is true, select the text
			if( this.selectOnFocus ) {
				this.select();
			}
			
			this._super( arguments );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onBlur : function() {
			this.focused = false;
			this.handleEmptyText();
			
			this._super( arguments );
		},
		
		
		/**
		 * Determines if the TextField is currently focused.
		 * 
		 * @return {Boolean} `true` if the TextField is currently focused, false otherwise.
		 */
		isFocused : function() {
			return this.focused;
		},
		
		
		/**
		 * Handles a keydown event in the text field. 
		 * 
		 * @protected
		 * @param {jQuery.Event} evt The jQuery event object for the event.
		 */
		onKeyDown : function( evt ) {
			this.fireEvent( 'keydown', this, evt ); 
		},
		
		
		/**
		 * Handles a keyup event in the text field. 
		 * 
		 * @protected
		 * @param {jQuery.Event} evt The jQuery event object for the event.
		 */
		onKeyUp : function( evt ) {
			this.fireEvent( 'keyup', this, evt );
		},
		
		
		/**
		 * Handles a keypress in the text field. 
		 * 
		 * @protected
		 * @param {jQuery.Event} evt The jQuery event object for the event.
		 */
		onKeyPress : function( evt ) {
			this.fireEvent( 'keypress', this, evt ); 
		},
		
		
		// ---------------------------------------
		
		// Empty Text Handling Utility Methods
		
		/**
		 * Checks the TextField to see if it's empty, and if so shows the {@link #emptyText}.
		 * 
		 * @protected
		 */
		handleEmptyText : function() {
			if( this.rendered ) {
				// Field is not focused and its value is empty, show the empty text. Otherwise, hide it.
				this.$emptyTextEl[ ( !this.focused && this.getValue() === "" ) ? 'show' : 'hide' ]();
			}
		}
		
	} );
	
	
	ComponentManager.registerType( 'textfield', TextField );

	return TextField;
	
} );