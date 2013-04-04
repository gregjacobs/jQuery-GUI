/*global define */
define( [
	'jquery',
	'lodash',
	'ui/util/Html',
	'ui/ComponentManager',
	'ui/form/field/Field',
	'ui/form/field/Text.EmptyTextBehavior',
	'ui/form/field/Text.InfieldLabelBehavior'
], function( jQuery, _, Html, ComponentManager, Field, EmptyTextBehavior, InfieldLabelBehavior ) {
	
	/**
	 * @class ui.form.field.Text
	 * @extends ui.form.field.Field
	 * 
	 * Text (string) field component for the editor.
	 */
	var TextField = Field.extend( {
		
		/**
		 * @cfg {Boolean} selectOnFocus
		 * True to have the field's text automatically selected when the field is focused. Defaults to false. 
		 */
		selectOnFocus : false,
		
		/**
		 * @cfg {String} labelAlign
		 * A string that specifies where the field's label should be placed. Valid values are: "left", "top", 
		 * and "infield". The "infield" label position places the label inside the text field itself, which 
		 * is then hidden when the user starts typing into the field. Defaults to 'left'.
		 * 
		 * Note that a labelAlign set to "infield" is not compatible with the {@link #emptyText} 
		 * config. The provided {@link #emptyText} will not be used in this case. 
		 */
		
		/**
		 * @cfg {String} emptyText
		 * The text to show in the field when the field is empty. When the user focuses the field, this text
		 * will be removed, allowing the user to type their value. If provided, and no {@link #value} is provided,
		 * the {@link #value} will be set to this.
		 * 
		 * Note that this is not compatible with the {@link #labelAlign} config set to "infield". See the description of {@link #labelAlign}.
		 */
		
		/**
		 * @cfg {Boolean} restoreEmptyText
		 * True to enable the restoration of the {@link #emptyText} (if any) when the field loses focus (is blurred), and is empty.
		 * If this is true, the {@link #emptyText} will be re-applied to the field when it has no value (i.e. it's an
		 * empty string).  If this is false, the {@link #emptyText} will not be re-applied to the field when it loses 
		 * focus. Defaults to true.
		 * 
		 * Note: This only applies when the {@link #labelAlign} config is not "infield". Infield labels cannot have
		 * an {@link #emptyText} value.
		 */
		restoreEmptyText : true,
		
		/**
		 * @cfg {String} value
		 * The initial value for the field, if any.
		 */
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		componentCls : 'ui-form-TextField',
		
		
		/**
		 * @protected
		 * @property {jQuery} $inputEl
		 * 
		 * The &lt;input&gt; element; the text field. Will only be available after render.
		 */
		
		/**
		 * @private
		 * @property {ui.form.field.Text.Behavior} behaviorState
		 * 
		 * The {@link ui.form.field.Text.Behavior} object that governs the TextField's behavior.
		 * This currently applies to either the TextField having an {@link #emptyText} value, 
		 * or the TextField having an "infield" {@link #labelAlign}.
		 */
		
		
		// protected
		initComponent : function() {
			this._super( arguments );
			
			this.addEvents(
				/**
				 * Fires when a key is pressed down in the field.
				 * 
				 * @event keydown
				 * @param {ui.form.field.Field} field This TextField object.
				 * @param {jQuery.Event} evt The jQuery event object for the event.
				 */
				'keydown',
				
				/**
				 * Fires when a key is pressed and let up in the field.
				 * 
				 * @event keyup
				 * @param {ui.form.field.Field} field This TextField object.
				 * @param {jQuery.Event} evt The jQuery event object for the event.
				 */
				'keyup',
				
				/**
				 * Fires when a key is pressed in the field.
				 * 
				 * @event keypress
				 * @param {ui.form.field.Field} field This TextField object.
				 * @param {jQuery.Event} evt The jQuery event object for the event.
				 */
				'keypress'
			);
			
			// Set the TextField's behavior "state", based on if it is set to have an "infield" label or not.
			// "infield" labels are incompatible with having a regular default value (i.e. the default showing on top
			// of the "infield" label does not look right), and thus are mutually exclusive behaviors.
			if( this.labelAlign === 'infield' ) {
				this.behaviorState = new InfieldLabelBehavior();
			} else {
				this.behaviorState = new EmptyTextBehavior();
			}
			
			// If a value was provided, and it is not a string, convert it to one now. normalizeValue handles all datatypes.
			this.value = this.normalizeValue( this.value );
			
			// If the value is an empty string, and there was emptyText provided, initialize it to the emptyText.
			// That is what will be displayed in the field (with the appropriate CSS class to make it look like the emptyText).
			if( this.value === "" && this.emptyText ) {
				this.value = this.emptyText;
			}
		},
		
		
		
		// protected
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
			
			// Call state object's onRender to allow it to implement whatever processing is necessary
			this.behaviorState.onRender( this );
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
			return jQuery( '<input type="text" class="' + this.componentCls + '-input" id="' + this.inputId + '" name="' + this.inputName + '" value="' + value + '" />' );  
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
		 * Implementation of {@link ui.form.field.Field Field}'s setValue() method, which sets the value to the field.
		 * 
		 * @param {String} value The value of the field.
		 */
		setValue : function( value ) {
			value = this.normalizeValue( value );
			
			if( !this.rendered ) {
				this.value = value;  // If the Component has not yet been rendered (i.e. the Field has not yet been created), store the value as the initial value to set.
				
			} else {
				this.$inputEl.val( value );
				
				// Allow the TextField's behaviorState to handle the value being set
				this.behaviorState.onSetValue( this, value );
			}
			
			// Run onchange, to notify listeners of a change
			this.onChange( value );
		},
		
		
		/**
		 * Implementation of {@link ui.form.field.Field Field}'s getValue() method, which returns the value of the field.
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
		 * Extension of onChange template method used to allow the {@link #behaviorState} to handle
		 * the change event.
		 *
		 * @protected
		 */
		onChange : function() {
			// Allow the TextField's behaviorState to handle the change event
			this.behaviorState.onChange( this );
			
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
			// Allow the TextField's behaviorState to handle the focus event
			this.behaviorState.onFocus( this );
			
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
			// Allow the TextField's behaviorState to handle the blur event
			this.behaviorState.onBlur( this );
			
			this._super( arguments );
		},
		
		
		/**
		 * Handles a keydown event in the text field. 
		 * 
		 * @protected
		 * @param {jQuery.Event} evt The jQuery event object for the event.
		 */
		onKeyDown : function( evt ) {
			// Allow the TextField's behaviorState to handle the keydown event
			this.behaviorState.onKeyDown( this, evt );
			
			this.fireEvent( 'keydown', this, evt ); 
		},
		
		
		/**
		 * Handles a keyup event in the text field. 
		 * 
		 * @protected
		 * @param {jQuery.Event} evt The jQuery event object for the event.
		 */
		onKeyUp : function( evt ) {
			// Allow the TextField's behaviorState to handle the keyup event
			this.behaviorState.onKeyUp( this, evt );
			
			this.fireEvent( 'keyup', this, evt );
		},
		
		
		/**
		 * Handles a keypress in the text field. 
		 * 
		 * @protected
		 * @param {jQuery.Event} evt The jQuery event object for the event.
		 */
		onKeyPress : function( evt ) {
			// Allow the TextField's behaviorState to handle the keypress event
			this.behaviorState.onKeyPress( this, evt );
			
			this.fireEvent( 'keypress', this, evt ); 
		}
		
	} );
	
	
	// Register the class so it can be created by the type string 'textfield'
	ComponentManager.registerType( 'textfield', TextField );

	return TextField;
	
} );