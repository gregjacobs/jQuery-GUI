/**
 * @class ui.formFields.TextField.InfieldLabelBehavior
 * @extends ui.formFields.TextField.AbstractBehavior
 * 
 * Handles a {@link ui.formFields.TextField TextField} when it is in the "infield label" state (i.e. it is displaying a label that
 * is shown inside the field itself).  This is opposed to when it is using the {@link ui.formFields.TextField.EmptyTextBehavior EmptyTextBehavior}, 
 * which is incompatible with the field having an "infield" label.<br><br>
 * 
 * This implementation is based off of the jquery.infield labels plugin. http://fuelyourcoding.com/scripts/infield/
 *
 * @constructor
 */
/*global Kevlar, ui */
ui.formFields.TextField.InfieldLabelBehavior = Kevlar.extend( ui.formFields.TextField.AbstractBehavior, {
	
	/**
	 * @cfg {Number} fadeOpacity
	 * Once the field has focus, how transparent should the label be.
	 * Should be a number between 0 and 1. Defaults to 0.5.
	 */
	fadeOpacity : 0.5, 
	
	/**
	 * @cfg {Number} fadeDuration
	 * The duration (in milliseconds) to fade the label element. Defaults to 300.
	 */
	fadeDuration : 300,
	
	
	/**
	 * Flag to store whether the label is currently shown or not.
	 *
	 * @private 
	 * @property labelShown
	 * @type Boolean
	 */
	labelShown : true,
	
	
	/**
	 * Called when the TextField is rendered.
	 * 
	 * @method onRender
	 * @param {ui.formFields.TextField} textField
	 */
	onRender : function( textField ) {
		// "infield" labels move the label element into the input container. It is absolutely positioned from there.
		textField.getInputContainerEl().append( textField.getLabelEl() );
		textField.getInputEl().attr( 'autocomplete', 'false' );  // set autocomplete="false" on the field to fix issues with browser autocomplete and "infield" labels
		
		this.checkForEmpty( textField );
	},
	
	
	/**
	 * Called when the TextField's setValue() method is called (if the TextField is rendered)
	 * 
	 * @method onSetValue
	 * @param {ui.formFields.TextField} textField
	 * @param {String} value
	 */
	onSetValue : function( textField, value ) {
		if( textField.rendered ) {
			this.checkForEmpty( textField );
		}
	},
	
	
	/**
	 * Called when the TextField has been changed.
	 * 
	 * @abstract
	 * @method onChange
	 * @param {ui.formFields.TextField} textField
	 */
	onChange : function( textField ) {
		if( textField.rendered ) {
			this.checkForEmpty( textField );
		}
	},
	
	
	/**
	 * Called when the TextField has been focused.
	 * 
	 * @method onFocus
	 * @param {ui.formFields.TextField} textField
	 */
	onFocus : function( textField ) {
		// If the label is currently shown, fade it to the fadeOpacity config
		if( textField.rendered && this.labelShown ) {
			this.setLabelOpacity( textField.getLabelEl(), this.fadeOpacity ); 
		}
	},
	
	
	/**
	 * Called when the TextField has been blurred.
	 * 
	 * @method onBlur
	 * @param {ui.formFields.TextField} textField
	 */
	onBlur : function( textField ) {
		if( textField.rendered ) {
			this.checkForEmpty( textField );
		}
	},
	
	
	/**
	 * Called when the TextField gets a keydown event.
	 * 
	 * @method onKeyDown
	 * @param {ui.formFields.TextField} textField
	 * @param {jQuery.Event} evt The jQuery event object for the event.
	 */
	onKeyDown : function( textField, evt ) {
		if( textField.rendered ) {
			// Skip Shift and Tab keydowns
			if( evt.keyCode === 16 || evt.keyCode === 9 ) {
				return;
			}
			
			if( this.labelShown ) {
				textField.getLabelEl().hide();
				this.labelShown = false;
			}
		}
	},
	
	
	// ------------------------------
	
	
	/**
	 * Animates the label element's opacity of the TextField to the provided `opacity`.
	 * 
	 * @private
	 * @method setLabelOpacity
	 * @param {jQuery} $labelEl The label element.
	 * @param {Number} opacity
	 */
	setLabelOpacity : function( $labelEl, opacity ) {
		$labelEl.stop().animate( { opacity: opacity }, this.fadeDuration );
		this.labelShown = ( opacity > 0.0 );
	},
	
	
	/**
	 * @private
	 * @method prepLabelForShow
	 * @param {jQuery} $labelEl The label element.
	 */
	prepLabelForShow : function( $labelEl ) {
		if( !this.labelShown ) {
			$labelEl.css( { opacity: 0.0 } ).show();
		}
	},
	
	
	/**
	 * Checks the TextField to see if it's empty, and if so shows the infield label.
	 * If it's not empty, 
	 * 
	 * @private
	 * @method checkForEmpty
	 * @param {ui.formFields.TextField} textField
	 */
	checkForEmpty : function( textField ) {
		var $labelEl = textField.getLabelEl();
		
		if( textField.getValue() === "" ) {
			this.prepLabelForShow( $labelEl );
			this.setLabelOpacity( $labelEl, 1.0 );
		} else {
			this.setLabelOpacity( $labelEl, 0.0 );
		}
	}

} );
