/*global define */
define( [
	'jqc/form/field/autocomplete/Menu'
], function( AutocompleteMenu ) {
	
	/**
	 * @class jqc.form.field.autocomplete.Menu
	 * @extends jqc.Overlay
	 * 
	 * Implements a list-style menu for the {@link jqc.form.field.autocomplete.Autocomplete Autocomplete} field.
	 * This is the default class that will be instantiated for an Autocomplete field, if no other instance is provided
	 * to the Autocomplete's {@link jqc.form.field.autocomplete.Autocomplete#menu} config.
	 */
	var AutocompleteListMenu = AutocompleteMenu.extend( {
		
		
		
	} );
	
	
	return AutocompleteListMenu;
	
} );