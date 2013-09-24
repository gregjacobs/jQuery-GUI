/*global define */
define( [
	'jquery',
	'lodash',
	'jqGui/ComponentManager',
	'jqGui/form/field/Field',
	'jqGui/template/LoDash',
	'jqGui/util/OptionsStore'
], function( jQuery, _, ComponentManager, Field, LoDashTpl, OptionsStore ) {
	
	/**
	 * @class jqGui.form.field.Radio
	 * @extends jqGui.form.field.Field
	 * @alias type.radio
	 * @alias type.radiofield
	 * 
	 * Set of radio buttons (buttons where only one selection can be made at a time).
	 */
	var RadioField = Field.extend( {
		
		/**
		 * @cfg {Boolean} stacked 
		 * 
		 * `true` if the radio buttons should be stacked instead of spread out horizontally across the line.
		 */
		stacked : false,
		
		/**
		 * @cfg {Array/Function} options (required)
		 * 
		 * The options for the RadioField, which creates the radio button based on this config. This config is required.
		 * 
		 * If this is a flat array, the values will be used as both the value and text
		 * of the ButtonSet options.  Ex: `[ "Yes", "No" ]`
		 * 
		 * If you want to customize the value and text separately for each option (recommended), provide an array of objects, where the object has two
		 * properties: `text` and `value`. Ex: `[ { "text": "Yes", "value": "yes" }, { "text": "No", "value": "no" } ]`
		 * 
		 * If this config is specified as a function, the function will be executed, and its return will be used as the options. Its return should match one of
		 * the array forms defined above.
		 */
		
		/**
		 * @cfg {String} inputName
		 * 
		 * The name to give the input. This will be set as the input's "name" attribute.  This is really only useful if
		 * the form that the component exists in is going to be submitted by a standard form submission (as opposed to just
		 * having its values retrieved, which are handled elsewhere). Defaults to the value of the 
		 * {@link #inputId} property.
		 * 
		 * Note that because radio fields rely on their "name" attributes being the same, this should not be set to an
		 * empty string (or another non-unique string).  If an explicit name is not needed, let this config default to the
		 * {@link #inputId} property.
		 */
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		componentCls : 'jqGui-form-field-radio',
		
		
		/**
		 * @protected
		 * @property {String} radioTpl
		 * 
		 * The HTML template to use to create the radio elements.
		 */
		radioTpl : new LoDashTpl( [
			'<input type="radio" id="<%= name %>-<%= num %>" name="<%= name %>" class="<%= componentCls %>-input" value="<%= inputValue %>" <% if( checked ) { %>checked<% } %>>',
			'<label for="<%= name %>-<%= num %>" class="<%= componentCls %>-label"><%= text %></label>'
		] ),
		
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			// Create the OptionsStore for managing the 'options'
			this.optionsStore = new OptionsStore( this.options );
			
			// Make sure that options were provided
			// <debug>
			if( this.optionsStore.getOptions().length === 0 ) {
				throw new Error( "Error: The ButtonSet's 'options' was not configured." );
			}
			// </debug>
			
			if( typeof this.value === 'undefined' ) {
				// No 'value' config provided, set the value to the value of the first option
				this.value = this.optionsStore.getOptions()[ 0 ].value;
				
			} else {
				// Value config was provided, make sure it is in the options store. If not, 
				// set it to the value of the first option. This guarantees that the RadioField's
				// value is always set to a valid option
				if( this.optionsStore.getByValue( this.value ) === null ) {
					this.value = this.optionsStore.getOptions()[ 0 ].value;
				}
			}
			
			
			// Call superclass initComponent
			this._super( arguments );
			
			
			// Make sure there is an inputName. This is needed for the radio functionality. It should have been created by Field if it wasn't provided,
			// but this will make sure just in case.
			// <debug>
			if( !this.inputName ) {
				throw new Error( "Error: RadioField must have a valid `inputName`. Make sure that the `inputName` has not been set to an empty string or other falsy value." );
			}
			// </debug>
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function( container ) {
			// Call superclass onRender() first, to render this Component's element
			this._super( arguments );
			
			var options = this.optionsStore.getOptions(),
			    radioTpl = this.radioTpl,
				inputName = this.inputName,
				$inputContainerEl = this.$inputContainerEl,
				stacked = this.stacked,
				fieldValue = this.value,
				markup = [];
			
			for( var i = 0, len = options.length; i < len; i++ ) {
				var option = options[ i ];
				
				// Append the radio
				markup.push( 
					radioTpl.apply( {
						componentCls : this.componentCls,
						
						name         : inputName,
						num          : i,
						inputValue   : option.value,
						text         : option.text,
						checked      : ( fieldValue === option.value )
					} )
				);
				if( stacked ) {
					markup.push( '<br />' );     // If the radio's are to be stacked, append a line break
				}
			}
			
			// Append the markup
			$inputContainerEl.append( markup.join( "" ) );
			
			// Assign event handler to the container element, taking advantage of event bubbling
			$inputContainerEl.on( {
				'change' : _.bind( function() { this.onChange( this.getValue() ); }, this )  // Call onChange() with the new value
			} );
		},
		
		
		
		/**
		 * Implementation of {@link jqGui.form.field.Field Field}'s setValue() method, which sets the value to the field.
		 * 
		 * @param {String} value The value of the field.
		 */
		setValue : function( value ) {
			// If there is an option with the provided value, set it. Otherwise, don't set anything.
			var option = this.optionsStore.getByValue( value );
			
			if( option !== null ) {
				if( !this.rendered ) {
					this.value = value;  // If the Component has not yet been rendered (i.e. the Field has not yet been created), store the value as the initial value to set.	
					
				} else {
					this.$inputContainerEl.find( ':radio[value=' + value + ']' ).prop( 'checked', true );
				}
			}
		},
		
		
		/**
		 * Implementation of {@link jqGui.form.field.Field Field}'s getValue() method, which returns the value of the field.
		 * 
		 * @return {String} The value of the field.
		 */
		getValue : function() {
			if( !this.rendered ) {
				return this.value;  // If the value was set before the Component has been rendered (i.e. before the Field has been created), return that.
			} else {
				return this.$inputContainerEl.find( ':radio:checked' ).val();
			}
		}
		
	} );
	
	
	ComponentManager.registerType( 'radio', RadioField );
	ComponentManager.registerType( 'radiofield', RadioField );
	
	return RadioField;
	
} );