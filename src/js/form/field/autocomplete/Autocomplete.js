/*global define */
define( [
	'jqc/form/field/Text',
	'jqc/form/field/autocomplete/Menu',
	'jqc/form/field/autocomplete/ListMenu'  // the default implementation
], function( TextField, AutocompleteMenu, AutocompleteListMenu ) {
	
	/**
	 * @class jqc.form.field.autocomplete.Autocomplete
	 * @extends jqc.form.field.Text
	 * 
	 * Field which allows a user to begin typing in a value, and then is presented with suggestions in an 
	 * overlay that appears below the field.
	 */
	var Autocomplete = TextField.extend( {
		
		/**
		 * @cfg {data.Collection} collection (required)
		 * 
		 * The Collection which is used to provide the suggestions. This may be used with local data that is already
		 * populated in the collection, or it may be loaded from a remote data source using the Collection's configured
		 * {@link data.Collection#proxy proxy}.
		 */
		
		/**
		 * @cfg {Object/jqc.form.field.autocomplete.Menu} menu
		 * 
		 * The Autocomplete Menu that displays the suggestions to the user while he/she types.
		 * 
		 * This may be either a configuration object for the {@link jqc.form.field.autocomplete.Menu} that will be internally 
		 * instantiated, or a {@link jqc.form.field.autocomplete.Menu Menu} instance. 
		 */
		
		/**
		 * @cfg {Number} minChars
		 * 
		 * The minimum number of characters that must be typed before the Autocomplete's suggestion {@link #menu} is shown.
		 */
		
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this._super( arguments );
			
			this.addEvents(
				/**
				 * Fires when an item has been selected in the Autocomplete's {@link #menu}.
				 * 
				 * @event select
				 * @param {jqc.form.field.autocomplete.Autocomplete} autocomplete This Autocomplete instance.
				 */
				'select'
			);
			
			// If the `menu` provided was an anonymous configuration object, instantiate a ListMenu
			if( !this.menu instanceof AutocompleteMenu ) {
				this.menu = new AutocompleteListMenu( this.menu );
			}
		}
		
	} );
	
	return Autocomplete;
	
} );