/**
 * @class ui.ButtonSet
 * @extends ui.Component
 * @mixin ui.DataControl
 * 
 * A ButtonSet component used basically as a set of radio buttons, where only one can be toggled.<br><br>
 * 
 * The ButtonSet's options acts much like a Dropdown (select element), where each option has a 'text' property, and a 'value' property.
 * This is to make the changing of the displayed option robust for data management, where the 'value' is independent from 'text' and 
 * can remain the same when the 'text' is changed.
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Class, jQuery, Jux, ui */
ui.ButtonSet = Class.extend( ui.Component, {
	
	mixins : [ ui.DataControl ],
	
	/**
	 * @cfg {Array/Function} options (required) 
	 * The options for the ButtonSet, which creates the buttons based on this config. This config is required.<br><br>
	 * 
	 * If this is a flat array, the values will be used as both the value and text
	 * of the ButtonSet options.  Ex: <pre><code>[ "Yes", "No" ]</code></pre>
	 * 
	 * If you want to customize the value and text separately for each option (recommended), provide an array of objects, where the object has two
	 * properties: `text` and `value`. Ex: <pre><code>[ { "text": "Yes", "value": "yes" }, { "text": "No", "value": "no" } ]</code></pre>
	 * 
	 * If this config is specified as a function, the function will be executed, and its return will be used as the options. Its return should match one of
	 * the array forms defined above.
	 */
	
	/**
	 * @cfg {Mixed} value
	 * The initial selected value (button) for the ButtonSet. Must match an option given by the {@link #options} config. If this config is
	 * not provided, this will default to the value of the first option defined in the {@link #options} config. 
	 */	
	
	
	/**
	 * @private
	 * @property buttonSetTpl
	 * @type String
	 * The template for the HTML to create for each of the buttons.
	 */
	buttonSetTpl : '<input type="radio" id="<%=id%>_<%=num%>" name="buttonSet_<%=id%>" value="<%=value%>" title="<%=text%>" <% if( checked ) { %>checked<% } %>><label for="<%=id%>_<%=num%>"><%=text%></label>',
	
	
	/**
	 * @private
	 * @property optionsStore
	 * The OptionsStore instance used for managing the ButtonSet's options.
	 * @type ui.utils.OptionsStore
	 */

	// protected
	initComponent : function() {		
		this.addEvents( 
			/**
			 * @event change
			 * Fires when the ButtonSet's state has changed.
			 * @param {ui.ButtonSet} ButtonSet This ButtonSet instance.
			 * @param {String} value The new value of the ButtonSet.
			 */
			'change'
		);
		
		// Create the OptionsStore for managing the 'options'
		this.optionsStore = new ui.utils.OptionsStore( this.options );
		
		// Make sure that options were provided
		if( this.optionsStore.getOptions().length === 0 ) {
			throw new Error( "Error: The ButtonSet's 'options' was not configured." );
		}
		
				
		if( typeof this.value === 'undefined' ) {
			// No 'value' provided, set the value to the value of the first option
			this.value = this.optionsStore.getOptions()[ 0 ].value;
			
		} else {
			// A 'value' was provided, make sure it is in the options store. If not, 
			// set it to the value of the first option. This guarantees that the ButtonSet's
			// value is always set to a valid option
			if( this.optionsStore.getByValue( this.value ) === null ) {
				this.value = this.optionsStore.getOptions()[ 0 ].value;
			}
		}
		
		
		// Call superclass initComponent
		ui.ButtonSet.superclass.initComponent.call( this );
		
		// Call mixin class constructors
		ui.DataControl.constructor.call( this );
	},


	// protected
	onRender : function() {
		ui.ButtonSet.superclass.onRender.apply( this, arguments );
		
		// Add the 'change' handler to the element, which will be run when any of the buttons (radios) are clicked on
		this.$el.change( this.onChange.createDelegate( this ) );
		
		// Create the initial options html
		this.redrawOptions();
	},
	
	
	/**
	 * Handles a change (click) to the selected button in the button set.
	 * 
	 * @private
	 * @method onChange
	 * @param {jQuery.Event} evt
	 */
	onChange : function( evt ) {
		this.fireEvent( 'change', this, this.getValue() );
		this.onDataChange();    // call method from DataControl mixin, which will fire the datachange event for the DataControl.
	},
	
	
	// ------------------------------------------
	
	
	/**
	 * Sets the options for the ButtonSet. Normalizes the options into an array of objects, where each object
	 * has the properties 'text' and 'value'.  See the {@link #options} config for accepted formats to the `options`
	 * parameter. 
	 * 
	 * @method setOptions
	 * @param {Array/Function} options See the {@link #options} config for the accepted formats of this parameter.
	 */
	setOptions : function( options ) {
		// Store the options in the OptionsStore
		this.optionsStore.setOptions( options );
		
		// Update the ButtonSet's options based on the newly set options (if the ButtonSet field is rendered)
		this.redrawOptions();
	},
	
	
	/**
	 * Retrieves the options of the ButtonSet. This returns an array of objects, where the objects have 
	 * properties `text` and `value`. Example of a returned array:
	 * <pre><code>[ { text: "Option 1", value: "1" }, { text: "Option 2", value: "2" } ]</code></pre><br>
	 * 
	 * Note that even if the options' values are specified as numbers, they will be converted to strings
	 * (as strings are the only allowable values for the option tag).
	 *
	 * @method getOptions
	 * @return {Array}
	 */
	getOptions : function() {
		return this.optionsStore.getOptions();
	},
	
	
	/**
	 * Redraws the displayed options in the buttonset, based on the current options set by setOptions().
	 * 
	 * @private
	 * @method redrawOptions
	 */
	redrawOptions : function() {
		if( this.rendered ) {
			var options = this.getOptions(),
			    buttonSetTpl = this.buttonSetTpl,
			    $el = this.$el,
			    i, len;
			
			// Destroy the jQuery UI buttonset on the element, if it exists, and then remove all elements
			$el.buttonset( "destroy" );
			$el.empty();
			
			var markup = "";
			for( i = 0, len = options.length; i < len; i++ ) {
				var option = options[ i ],
				    tplData = {
						id      : this.id,
						num     : i,
						text    : option.text,
						value   : 'radio' + i, // NOTE: using .data() (below) to store the actual value, so that a value of any datatype can be stored (not just a string). However, the value attribute is required for radio inputs. 
						checked : ( option.value === this.value )  // the radio should be "checked" if its value matches the 'value' config/property
					};
				
				markup += Jux.Util.tmpl( buttonSetTpl, tplData );
			}
			
			// Append the new markup (radio buttons) to the div
			$el.append( markup );
			
			// Now add the data to each of the radio input elements for their value (now that they are appended and created into DOM elements).
			// Using .data() to be able to store a value of any datatype, not just a string.
			var $inputs = $el.find( 'input' );
			for( i = 0, len = $inputs.length; i < len; i++ ) {
				jQuery( $inputs[ i ] ).data( 'value', options[ i ].value );
			}
			
			// (Re)initialize the jQuery UI buttonset
			$el.buttonset();
		}
	},
	
	
	/**
	 * Sets the button that is to be selected. If the provided `value` is not an option, the ButtonSet will remain unchanged.
	 * 
	 * @method setValue
	 * @param {String} value The value of the button that is to be selected in the ButtonSet.
	 */
	setValue : function( value ) {
		if( typeof value === 'undefined' || value === null ) {
			return;
		}
		
		// If there is an option with the provided value, set it. Otherwise, we don't set anything.
		var option = this.optionsStore.getByValue( value );
		if( option !== null ) {
			// store the value regardless of if the Component has been rendered or not
			this.value = value;
			
			if( !this.rendered ) {
				// buttonset is not rendered, call onChange directly, to fire the events
				this.onChange();
				
			} else {
				// First, reset all of the radios to unchecked. Then, set the checked attribute on
				// the correct hidden input itself, and simulate a change event on it so that the buttonset is updated (if it's rendered), 
				// and the onLinkTypeChange method runs (which updates the overlay to the correct form-fields state).
				var $radios = this.$el.find( ':radio' );
				$radios.prop( 'checked', false );
				
				for( var i = 0, len = $radios.length; i < len; i++ ) {
					var $radio = jQuery( $radios[ i ] );
					
					if( $radio.data( 'value' ) === value ) {
						$radio.prop( 'checked', true );
						$radio.change();  // simulated event to get the jQuery UI buttonset to trigger a change
						
						break;
					}
				}
			}
		}
	},
	
	
	/**
	 * Retrieves the value of the currently selected button (option) in the ButtonSet.
	 * 
	 * @method getValue
	 * @return {String} The value of the button (option) that is selected in the ButtonSet.
	 */
	getValue : function() {
		if( !this.rendered ) {
			// Buttonset is not rendered, return the configured value. If there was no configured value
			// or an invalid configured value, it defaults to the value of the first option 
			return this.value;
			
		} else {
			// Buttonset is rendered, we can return the value right from the radio itself
			return this.$el.find( ':radio:checked' ).data( 'value' );
		}
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


// Register the type so it can be created by the string 'ButtonSet' in the manifest
ui.ComponentManager.registerType( 'ButtonSet', ui.ButtonSet );