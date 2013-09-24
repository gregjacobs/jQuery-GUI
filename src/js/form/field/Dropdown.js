/*global define */
define( [
	'jquery',
	'lodash',
	'jqGui/util/Css',
	'jqGui/ComponentManager',
	'jqGui/form/field/Field',
	'jqGui/template/LoDash',
	'jqGui/util/OptionsStore'
], function( jQuery, _, Css, ComponentManager, Field, LoDashTpl, OptionsStore ) {
	
	/**
	 * @class jqGui.form.field.Dropdown
	 * @extends jqGui.form.field.Field
	 * @alias type.dropdown
	 * @alias type.dropdownfield
	 * 
	 * Dropdown list where only one item may be selected.
	 */
	var DropdownField = Field.extend( {
		
		/**
		 * @cfg {Array/Function} options
		 * 
		 * The options for the dropdown. See the description of the {@link jqGui.util.OptionsStore#setOptions} method for accepted formats.
		 * 
		 * Note that along with 'text' and 'value' properties, options can have the extra properties of 'cls' and 'style', which can specify the
		 * css class name(s) to style the dropdown option with, or a hash of styles to style the dropdown option with, repectively. Ex:
		 * 
		 *     [ { text: "Option 1", value: 1, cls: "myCssClass", "style": { "font-weight": "bold", "font-size": "14px" } } ]
		 * 
		 * 
		 * A DropdownField may be instantiated with 0 options, and may have options added at a later time using the 
		 * {@link #setOptions} and {@link #addOption} methods.
		 */
		
		/**
		 * @cfg {String} menuCls
		 * 
		 * Any additional css class(es) to add to the dropdown menu itself. The dropdown menu is appended to the document body, and therefore can not be
		 * styled by regular descendant css rules. Use this config to add one or more custom css classes (separated by spaces) for the styling of the dropdown menu. 
		 */
		menuCls : "",
		
		/**
		 * @cfg {String} menuCollisionStrategy
		 * 
		 * The strategy to use to re-position the dropdown menu when it collides with the edge of the screen.  Can be one of the following values:
		 * 'flip', 'fit', or 'none'.  See the 'collision' option of jQuery UI's position utility for details. http://jqueryui.com/demos/position/  
		 * Defaults to 'flip'.
		 */
		menuCollisionStrategy : 'flip',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		componentCls : 'jqGui-form-field-dropdown',
		
		
		/**
		 * @private
		 * @property {jqGui.util.OptionsStore} optionsStore
		 * 
		 * The OptionsStore instance used for managing the DropdownField's options.
		 */
		
		/**
		 * @private
		 * @property {Boolean} optionsMenuOpen
		 * 
		 * Flag that stores whether or not the options menu is open or closed.
		 */
		optionsMenuOpen : false,
	
	
		
		statics : {
			
			/**
			 * @private
			 * @static
			 * @property {String} dropdownRenderTpl
			 * 
			 * The template to use to render the dropdown's elements. Note: The hidden input is to allow this field to be submitted
			 * as a regular form field.
			 */
			dropdownRenderTpl : new LoDashTpl( [
				'<input type="hidden" id="<%= inputId %>" name="<%= inputName %>" value="<%= initialValue %>" />',  // populated upon selection for standard form submission
				'<div id="<%= elId %>-dropdownContainer" class="<%= componentCls %>-dropdownContainer">',
					'<div id="<%= elId %>-selectText" class="<%= componentCls %>-selectText">',
						'<div class="<%= optionClass %>" style="<%= optionStyles %>"><%= optionText %></div>',
					'</div>',
					'<div id="<%= elId %>-openButton" class="<%= componentCls %>-openButton" />',
				'</div>'
			] ),
			
			
			/**
			 * @private
			 * @static
			 * @property {String} optionsMenuRenderTpl
			 * 
			 * The template to use to render the dropdown's options menu elements.
			 */
			optionsMenuRenderTpl : new LoDashTpl( [
				'<li data-elem="jqGui-form-field-dropdown-menu-item" class="<%= componentCls %>-menu-item <%= menuItemCls %>" style="<%= menuItemStyle %>">',
					'<%= text %>',
				'</li>'
			] )
			
		},
		
	
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this._super( arguments );
			
			this.options = this.options || [];  // default to an empty array
			
			// Create the OptionsStore for managing the DropdownField's options data
			this.optionsStore = new OptionsStore( this.options );
					
			// Initialize the dropdown's value
			this.initValue();
		},
		
		
		
		/**
		 * Initializes the Dropdown's {@link #value}. If the {@link #value} property is undefined, or it doesn't match any of the values in the 
		 * {@link #options} provided to the DropdownField, it is initialized to the first {@link #options option's} value.  This guarantees that 
		 * the DropdownField's initial value is always set to a valid option value. This method may be extended by subclasses for any pre/post 
		 * processing that they may need to add.
		 * 
		 * @protected
		 */
		initValue : function() {
			var optionsStore = this.optionsStore,
			    options = optionsStore.getOptions(),
			    numOptions = options.length;
			
			if( typeof this.value === 'undefined' ) {
				// No 'value' config provided, set the value to the value of the first option (if one exists).
				// Otherwise, just leave it as undefined.
				if( numOptions > 0 ) {
					this.value = options[ 0 ].value;
				}
			} else {
				// Value config was provided, make sure it is in the options store. If not, set
				// it to the value of the first option. This guarantees that the Dropdown's value
				// is always set to a valid option. If there are no options, set it back to undefined.
				if( optionsStore.getByValue( this.value ) === null ) {
					this.value = ( numOptions > 0 ) ? options[ 0 ].value : undefined;
				}
			}
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function( container ) {
			// Call superclass onRender() first, to render this Component's element
			this._super( arguments );
			
			// Note: eventually we want the custom dropdown implementation to be able to be tabbed to in the browser, which may involve creating
			// an actual dropdown field (<select> element). Leaving this (old) code here for now.  
			/*
			// Create the dropdown
			this.$inputEl = jQuery( '<select id="' + this.inputId + '" name="' + this.inputName + '" class="jqGui-corner-all dropdown"></select>' )
				.bind( {
					change : _.bind( function() { this.onChange( this.getValue() ); }, this ),  // Call onChange() with the new value
					focus  : _.bind( this.onFocus, this ),
					blur   : _.bind( this.onBlur, this )
				} )
				.appendTo( this.$inputContainerEl );  // Append the dropdown to the input container
			
			// Fill the options
			this.redrawOptions();
			*/
			
			
			var elId = this.elId,
			    inputId = this.inputId,
			    $inputContainerEl = this.$inputContainerEl,
			    dropdownRenderTpl = DropdownField.dropdownRenderTpl,
			    fieldValue = this.getValue(),
			    option = this.optionsStore.getByValue( fieldValue );
			
			var dropdownMarkup = dropdownRenderTpl.apply( {
				componentCls  : this.componentCls,
				
				elId          : elId,
				inputId       : inputId,
				inputName     : this.inputName,
				initialValue  : fieldValue,
				
				// For the initially selected option
				optionText    : ( option ) ? option.text : "",
				optionClass   : ( option && option.cls ) ? option.cls : "",
				optionStyles  : ( option && option.style ) ? Css.mapToString( option.style ) : ""
			} );
			$inputContainerEl.append( dropdownMarkup );
			
			// Assign references to created elements
			this.$inputEl = jQuery( '#' + inputId );
			this.$dropdownContainer = jQuery( '#' + elId + '-dropdownContainer' );
			this.$selectText = jQuery( '#' + elId + '-selectText' );
			this.$openButton = jQuery( '#' + elId + '-openButton' );
			
			// Apply a click handler to the dropdown's "select text" and open button, for showing the dropdownMenu
			var onDropdownClickDelegate = _.bind( this.onDropdownClick, this );
			this.$selectText.click( onDropdownClickDelegate );
			this.$openButton.click( onDropdownClickDelegate );
			
			
			// Create the dropdown menu, which is a <ul> element that holds the dropdown list. This is appended to the document body.
			this.$optionsMenu = jQuery( '<ul class="' + this.componentCls + '-menu ' + this.menuCls + '" />' ).hide().appendTo( 'body' );
			
			// TODO: Add IE iframe shim
			/*if ($.browser.msie && jQuery.browser.version < 7) {
				$select.after($('<iframe src="javascript:\'\';" class="jqGui-dropdownField-shim" marginwidth="0" marginheight="0" align="bottom" scrolling="no" tabIndex="-1" frameborder="0"></iframe>').css({ height: $select.height()+4 +'px' }));
			}*/
			
			// Now, draw the initial set of options
			this.redrawOptions();
			
			
			// Add the key listener
			/*
			$select.keydown(function(e){
				var selectedIndex = this.selectedIndex;
				switch(e.keyCode){
					case 40: // Down
						if (selectedIndex < this.options.length - 1){ selectedIndex+=1; }
						break;
					case 38: // Up
						if (selectedIndex > 0){ selectedIndex-=1; }
						break;
					default:
						return;
				}
				$('ul a', $wrapper).removeClass('selected').eq(selectedIndex).addClass('selected');
				$('span:eq(0)', $wrapper).html($('option:eq('+ selectedIndex +')', $select).attr('selected', 'selected').text());
				return false;
			}).focus(function(){ $wrapper.addClass('jNiceFocus'); }).blur(function(){ $wrapper.removeClass('jNiceFocus'); });
			*/
			
			
			// Add a handler to check for a click on the document. If the click wasn't over the dropdown's element
			// or its menu, the dropdown's menu will be hidden.
			this.documentClickHandler = _.bind( this.onDocumentClick, this );   // save a reference to the wrapped function so we can remove it later in onDestroy 
			jQuery( document ).bind( 'mousedown', this.documentClickHandler );
			
		},  // eo onRender
		
		
		
		/**
		 * Method that is run as a click handler on the document body, which tests if a click was made away
		 * from the dropdown itself or its menu, which will close the dropdown's menu if that is the case.
		 * 
		 * @private
		 * @param {jQuery.Event} evt
		 */
		onDocumentClick : function( evt ) {
			if( this.optionsMenuOpen ) {  // quick test to prevent the following (more expensive) logic from running if there is no need for it
				var parents = jQuery( evt.target ).parents().andSelf(),  // andSelf() needed to include the element that was clicked on as well, because it may be the <ul> element itself (such as when clicking on its scrollbar), and the menu should not be hidden in this case  
				    dropdownContainerEl = this.$dropdownContainer[ 0 ],
				    optionsMenuEl = this.$optionsMenu[ 0 ],
				    found = false;
					
				for( var i = 0, len = parents.length; i < len; i++ ) {
					if( parents[ i ] === dropdownContainerEl || parents[ i ] === optionsMenuEl ) {
						found = true;
						break;
					}
				}
				
				// The dropdownContainerEl was not found as a parent of the element that was clicked, hide the options menu
				if( !found ) {
					this.hideOptionsMenu();
				}
			}
		},
		
		
		/**
		 * Method that is run when the dropdown itself, or the "open" button, is clicked. This opens the dropdown's options menu.
		 * 
		 * @private
		 * @param {jQuery.Event} evt
		 */
		onDropdownClick : function( evt ) {
			evt.preventDefault();
			
			// Slide down the menu if it is not open, up if it is
			this.toggleOptionsMenu();
			
			// Scroll to the currently selected option
			var $optionsMenu = this.$optionsMenu,
			    itemOffsetTop = jQuery( 'li.' + this.componentCls + '-menu-item-selected', $optionsMenu ).offset().top,
			    offset = itemOffsetTop - $optionsMenu.offset().top;
			$optionsMenu.animate( { scrollTop: offset } );
		},
		
		
		
		/**
		 * Handles when an option is clicked in the dropdown's menu.
		 * 
		 * @private
		 * @param {jQuery.Event} evt
		 */
		onOptionClick : function( evt ) {
			evt.preventDefault();
			
			var $targetEl = jQuery( evt.target ),
			    currentValue = this.getValue(),
			    newValue = $targetEl.data( 'value' );
			
			// Only make a change if the newly selected value is different from the current value
			if( currentValue !== newValue ) {
				// Set the new value
				this.setValue( newValue );
				
				// Run onChange with the new value
				this.onChange( this.getValue() );
			}
			
			// Hide the dropdown menu
			this.hideOptionsMenu();
		},
		
		
		
		// --------------------------------------
		
		
		// Options management methods
		
		/**
		 * Sets the options for the dropdown. Normalizes the options into an array of objects, where each object
		 * has the properties 'text' and 'value'.  See the {@link #options} config for accepted formats to the `options`
		 * parameter. 
		 * 
		 * @param {Array/Function} options See the {@link #options} config for the accepted formats of this parameter.
		 */
		setOptions : function( options ) {
			// Store the options in the OptionsStore
			this.optionsStore.setOptions( options );
			
			this.onOptionsChange();
			this.redrawOptions();  // Update the dropdown's options based on the newly set options (if the dropdown field is rendered)
		},
		
		
		/**
		 * Adds an option to the DropdownField, optionally at an `index`.
		 * 
		 * @param {Object} option The option to add to the DropdownField. For the acceptable format of an option object,
		 *   see {@link #options}.
		 * @param {Number} [index] The index to add the option to in the list. Defaults to appending the new option.
		 */
		addOption : function( option, index ) {
			this.optionsStore.addOption( option, index );
			
			this.onOptionsChange();
			this.redrawOptions();  // Update the dropdown's options based on the newly set options (if the dropdown field is rendered)
		},
		
		
		/**
		 * Removes an option from the DropdownField by its value.
		 * 
		 * @param {Mixed} value The value of the option to remove.
		 */
		removeOptionByValue : function( value ) {
			this.optionsStore.removeOptionByValue( value );
			
			this.onOptionsChange();
			this.redrawOptions();  // Update the dropdown's options based on the newly set options (if the dropdown field is rendered)
		},
		
		
		/**
		 * Removes an option from the DropdownField by its text.
		 * 
		 * @param {Mixed} text The text of the option to remove.
		 */
		removeOptionByText : function( text ) {
			this.optionsStore.removeOptionByText( text );
			
			this.onOptionsChange();
			this.redrawOptions();  // Update the dropdown's options based on the newly set options (if the dropdown field is rendered)
		},
	
	
		/**
		 * Handler to react to the changing of the options/optionsStore, after the value is normalized, but
		 * before the field is redrawn.  Can be extended by subclasses.
		 * 
		 * @protected
		 */
		onOptionsChange : function() {
			var currentValue = this.getValue(),
			    optionsStore = this.optionsStore;
			
			// When the options are changed, make sure that there is at least one option left. It is an error condition to remove 
			// all of the options from the dropdown.
			if( optionsStore.getCount() === 0 ) {
				throw new Error( "Error: no 'options' remain in the DropdownField after options modification. This is an error condition." );
			}
			
			// Check if the current value still exists within the options. If it doesn't, revert the dropdown
			// to the value of the first option.
			if( optionsStore.getByValue( currentValue ) === null ) {
				this.setValue( optionsStore.getAtIndex( 0 ).value );  // because it is an error condition for no options to exist, this line is ok that it directly accesses .value from the object returned by getAtIndex(0), because it can't be null if options exist
			}
		},
		
		
		/**
		 * Retrieves the options of the dropdown. This returns an array of objects, where the objects have 
		 * properties `text` and `value`. Example of a returned array:
		 * 
		 *     [ { text: "Option 1", value: "1" }, { text: "Option 2", value: "2" } ]
		 * 
		 * Note that even if the options' values are specified as numbers, they will be converted to strings
		 * (as strings are the only allowable values for the option tag).
		 *
		 * @return {Object[]}
		 */
		getOptions : function() {
			return this.optionsStore.getOptions();
		},
		
		
		
		/**
		 * Updates the displayed options in the dropdown, based on the current options set by setOptions().
		 * 
		 * @private
		 */
		redrawOptions : function() {
			if( this.rendered ) {
				var options = this.getOptions(),
					numOptions = options.length,
				    $optionsMenu = this.$optionsMenu,
				    optionsMenuRenderTpl = DropdownField.optionsMenuRenderTpl,
					currentFieldValue = this.getValue(),
					i, option;
				
				// Populate the dropdown menu with its options
				$optionsMenu.empty();
				
				
				// Append the markup all at once (for performance, instead of one element at a time)
				var optionsMarkup = [];
				for( i = 0; i < numOptions; i++ ) {
					option = options[ i ];
					
					var menuItemCls = ( option.cls || "" );
					if( option.value === currentFieldValue ) {
						menuItemCls += ' ' + this.componentCls + '-menu-item-selected';
					}
					
					optionsMarkup.push(
						optionsMenuRenderTpl.apply( {
							componentCls  : this.componentCls,
							
							menuItemCls   : menuItemCls,
							menuItemStyle : ( option.style ) ? Css.mapToString( option.style ) : '', 
							text          : option.text
						} )
					);
				}
				$optionsMenu.append( optionsMarkup.join( "" ) );	
				
				
				// Now that the markup is appended and DOM nodes have been created, assign the values to the menu item
				// elements using .data() (so that values of any datatype may be assigned)
				var $itemEls = $optionsMenu.find( '[data-elem="jqGui-form-field-dropdown-menu-item"]' );
				for( i = 0; i < numOptions; i++ ) {
					// Add the "value" as data (instead of an attribute), so that any datatype can be stored for the value
					$itemEls.eq( i ).data( 'value', options[ i ].value );
				}
				
				// Attach a click handler to each of the menu items
				$itemEls.click( _.bind( this.onOptionClick, this ) );
			}
		},
		
		
		// --------------------------------------
		
		
		/**
		 * Expands and shows the options menu.
		 */
		showOptionsMenu : function() {
			this.optionsMenuOpen = true;
			
			this.$optionsMenu.show();
			
			// Size the width of the menu based on the width of the dropdown's elements
			this.$optionsMenu.width( this.$selectText.width() );
			
			// Position the menu against the dropdown's elements
			this.$optionsMenu.position( {
				my : 'left center',
				at : 'left center',
				of : this.$selectText,
				collision : this.menuCollisionStrategy
			} );
		},
		
		
		/**
		 * Hides the options menu.
		 */
		hideOptionsMenu : function( anim ) {
			this.optionsMenuOpen = false;
			
			this.$optionsMenu.hide();
		},
		
		
		/**
		 * Toggles the options menu. If it is currently open, it will be closed. If it is currently
		 * closed, it will be opened.
		 */
		toggleOptionsMenu : function() {
			if( this.optionsMenuOpen ) {
				this.hideOptionsMenu();
			} else {
				this.showOptionsMenu();
			}
		},
		
		
		
		
		// --------------------------------------
		
		
		/**
		 * Implementation of {@link jqGui.form.field.Field Field}'s setValue() method, which sets the value to the field.
		 * If the provided `value` is not an option, the value of the field will remain unchanged.
		 * 
		 * @param {String} value The value of the field.
		 */
		setValue : function( value ) {
			if( typeof value === 'undefined' || value === null ) {
				return;
			}
			
			// If there is an option with the provided value, set it. Otherwise, don't set anything.
			var option = this.optionsStore.getByValue( value );
			if( option ) {
				this.value = value;
				
				if( this.rendered ) {
					// Create a new element for the $selectText's html, which will be styled based on the option's cls and/or style properties.
					var $div = jQuery( '<div class="' + option.cls + '" style="' + ( option.style ? Css.mapToString( option.style ) : '' ) + '">' + option.text + '</div>' );					
					// Set the $selectText's html
					this.$selectText.html( $div );
					
					
					// Update the options menu
					var $optionsMenu = this.$optionsMenu,
					    selectedCls = this.componentCls + '-menu-item-selected';
					$optionsMenu.find( 'li.' + selectedCls ).removeClass( selectedCls );  // De-select any currently selected item in the dropdown menu
					
					// Select the item with the given value
					var $itemEls = $optionsMenu.find( 'li[data-elem="jqGui-form-field-dropdown-menu-item"]' );
					for( var i = 0, len = $itemEls.length; i < len; i++ ) {
						var $item = $itemEls.eq( i );
						if( $item.data( 'value' ) === value ) {
							$item.addClass( selectedCls );
							break;
						}
					}
					
					
					// Update the hidden field
					this.$inputEl.val( value );
				}
			}
		},
		
		
		/**
		 * Implementation of {@link jqGui.form.field.Field Field}'s getValue() method, which returns the value of the field.
		 * 
		 * @return {String} The value of the option that is selected in the dropdown.
		 */
		getValue : function() {
			// Note: If the Dropdown is not rendered, this will return the configured value. If there was no configured value
			// or an invalid configured value, it defaults to the value of the first option in initComponent().  Otherwise,
			// this property is updated when there is a new selection in the dropdown.
			return this.value;
		},
		
		
		/**
		 * Convenience method for setting the selected option in the dropdown by its text (as opposed to its value). Use {@link #setValue}
		 * to select by option value.  If the provided `text` is not an option, the field will remain unchanged.
		 * 
		 * @param {String} text The text of the option that should be selected in the dropdown.
		 */
		setText : function( text ) {
			// If there is an option with the provided text, set the value based on it. Otherwise, we don't set anything.
			var option = this.optionsStore.getByText( text );
			if( option ) {
				this.setValue( option.value );
			}
		},
		
		
		/**
		 * Convenience method for getting the text of the dropdown's selected option. Use {@link #getValue} to retrieve the selected option's value.
		 * 
		 * @return {String} The text of the selected option in the dropdown. 
		 */
		getText : function() {
			var option = this.optionsStore.getByValue( this.getValue() );
			return option.text;
		},
		
		
		/**
		 * Returns true if the dropdown has an {@link #options option} with the given value.
		 * 
		 * @param {Mixed} value The value to check for.
		 * @return {Boolean} True if the dropdown has an option with the provided `value`, false otherwise.
		 */
		hasOptionValue : function( value ) {
			var options = this.getOptions();
			for( var i = 0, len = options.length; i < len; i++ ) {
				if( options[ i ].value === value ) {
					return true;
				}
			}
			return false;
		},
		
		
		// ---------------------------------------------
		
		
		/**
		 * @inheritdoc
		 */
		onDestroy : function() {
			if( this.rendered ) {
				// Remove the document click handler, which hides the dropdown menu when its not clicked
				jQuery( document ).unbind( 'mousedown', this.documentClickHandler );
				
				// Remove the optionsMenu element from the document body
				this.$optionsMenu.remove();
			}
			
			this._super( arguments );
		}
		
	} );
	
	
	ComponentManager.registerType( 'dropdown', DropdownField );
	ComponentManager.registerType( 'dropdownfield', DropdownField );
	
	return DropdownField;
	
} );