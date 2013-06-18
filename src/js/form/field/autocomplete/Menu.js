/*global define */
define( [
	'jqc/Overlay'
], function( Overlay ) {
	
	/**
	 * @abstract
	 * @class jqc.form.field.autocomplete.Menu
	 * @extends jqc.Overlay
	 * 
	 * Base class for the actual menu that is displayed to the user as they type, in the 
	 * {@link jqc.form.field.autocomplete.Autocomplete Autocomplete} field.
	 */
	var AutocompleteMenu = Overlay.extend( {
		abstractClass : true,
		
		/**
		 * @cfg {data.Collection} collection (required)
		 * 
		 * The Collection which is used to provide the suggestions.
		 */
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this.addEvents(
				/**
				 * Fires when an item has been selected. This event is listened to by the {@link jqc.form.field.autocomplete.Autocomplete Autocomplete}
				 * field, for its own {@link jqc.form.field.autocomplete.Autocomplete#select select} event, and select actions.
				 * 
				 * @event select
				 * @param {jqc.form.field.autocomplete.Menu} menu This Menu instance.
				 */
				'select'
			);
			
			this._super( arguments );
		}
		
	} );
	
	
	return AutocompleteMenu;
	
} );