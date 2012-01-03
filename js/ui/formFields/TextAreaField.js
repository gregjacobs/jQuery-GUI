/**
 * @class ui.formFields.TextAreaField
 * @extends ui.formFields.TextField
 * 
 * Textarea field component.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.formFields.TextAreaField = Kevlar.extend( ui.formFields.TextField, {
	
	/**
	 * @cfg {Boolean} autoGrow
	 * True to auto-grow the text field as the user types into it. Defaults to false.<br><br>
	 * 
	 * Note that if autoGrow is true, the textarea will be given the "resize: none" style for Chrome and Safari, so that
	 * the resize handle is removed. The resize handle does not make sense for auto-grow textareas because the textarea size
	 * is recalculated and applied on every key press (so if they drag it bigger, and then keep typing, it
	 * will just be resized back to its calculated height.
	 */
	autoGrow : false,
	
	
	/**
	 * @protected
	 * @property $inputEl
	 * The &lt;input&gt; element; the textarea field.
	 * @type jQuery
	 */
	
	
	/**
	 * @private
	 * @property autoGrowMimicStyles
	 * @type String[]
	 * An array of the CSS properties that should be applied to the div that will mimic the textarea's text when {@link #autoGrow}
	 * is true.
	 */
	autoGrowMimicStyles : [ 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'fontSize', 'lineHeight', 'fontFamily', 'width', 'fontWeight' ],
	
	/**
	 * @private
	 * @property $autoGrowTwinDiv
	 * @type jQuery
	 * A div element that is created if the {@link #autoGrow} config is true, to be a "twin" of the textarea. The content of the textarea will be copied to
	 * this div so that it can be measured for its height, and then that height value can be applied to the textarea itself to "autogrow" it.
	 */
	
	/**
	 * @private
	 * @property autoGrowComputedStyles
	 * @type Object
	 * An object that holds the 
	 */
	
	/**
	 * @private 
	 * @property autoGrowPasteHandler
	 * @type Function
	 * A reference to the function created as the document paste handler, for when {@link #autoGrow} is true. This reference is maintained so that
	 * the document level handler can be removed when the field is destroyed.
	 */
	
	
	
	/**
	 * @protected
	 * @method onRender
	 */
	onRender : function() {
		ui.formFields.TextAreaField.superclass.onRender.apply( this, arguments );
		
		
		// Handle autogrowing textareas
		if( this.autoGrow ) {
			var mimicStyles = this.autoGrowMimicStyles,
			    $textarea   = this.$inputEl,
			    $twin       = jQuery( '<div />' ).css( { 'position': 'absolute', 'display': 'none', 'word-wrap': 'break-word' } ),
			    lineHeight  = parseInt( $textarea.css( 'line-height' ), 10 ) || parseInt( $textarea.css( 'font-size' ), 10 ),
			    minHeight   = parseInt( $textarea.css( 'height' ), 10 ) || lineHeight * 3,
			    maxHeight   = parseInt( $textarea.css( 'max-height' ), 10 ) || Number.MAX_VALUE;
			
			// Opera returns max-height of -1 if not set
			if( maxHeight < 0 ) {
				maxHeight = Number.MAX_VALUE;
			}
			
			// For Chrome and Safari, remove the browser-inserted "resize" handle. It doesn't make sense for auto-grow textareas
			// because the size is recalculated and applied on every key press (so if they drag it bigger, and then keep typing, it
			// will just be resized back to its calculated height.
			$textarea.css( 'resize', 'none' );
			
			// Store the lineHeight, minHeight, and maxHeight values
			this.autoGrowComputedStyles = {
				lineHeight : lineHeight,
				minHeight  : minHeight,
				maxHeight  : maxHeight
			};
			
			
			// Append the twin to the DOM
			// We are going to measure the height of this, not the textarea.
			$twin.appendTo( $textarea.parent() );
			
			// Copy the essential styles (mimics) from the textarea to the twin
			var i = mimicStyles.length;
			while( i-- ) {
				$twin.css( mimicStyles[ i ], $textarea.css( mimicStyles[ i ] ) );
			}
			
			
			// Hide scrollbars, but make sure that the height of the $textarea doesn't shrink when setting to overflow: hidden
			$textarea.css( 'minHeight', minHeight );
			$textarea.css( 'overflow', 'hidden' );
			
			
			
			// Update textarea size on cut and paste
			$textarea.bind( 'cut paste', function() {
				this.updateAutoGrowHeight(); 
			}.createDelegate( this ) );
			
			
			// Catch the browser paste event.
			// Save a reference to this handler, so we can remove it when the field is destroyed.
			this.autoGrowPasteHandler = function() {   
				this.updateAutoGrowHeight.defer( 250, this );
			}.createDelegate( this );
			$textarea.live( 'input', this.autoGrowPasteHandler );  // live events seem to need to 
			$textarea.live( 'paste', this.autoGrowPasteHandler );  // be separate... (i.e. not space delimited)
			
			// Save a reference to the twin element
			this.$autoGrowTwinDiv = $twin;
			
			// Run the sizing routine now that we're all set up
			this.updateAutoGrowHeight();
		}
	},
	
	
	/**
	 * Overridden method for creating the input element for the TextAreaField. This implementation
	 * creates a &lt;textarea&gt; element. See {@link ui.formFields.TextField#createInputEl} for more information.
	 * 
	 * @protected
	 * @method createInputEl
	 * @return {jQuery}
	 */
	createInputEl : function() {
		return jQuery( '<textarea id="' + this.inputId + '" name="' + this.inputName + '">' + ( this.value || "" ) + '</textarea>' );  
	},
	
	
	// ----------------------------------------
	
	
	// AutoGrow Methods
	
	
	/**
	 * Utility method for the {@link #autoGrow} functionality. Sets a given `height` and `overflow` state on the textarea.
	 * 
	 * @private
	 * @method setHeightAndOverflow
	 * @param {Number} height
	 * @param {String} overflow
	 */ 
	setHeightAndOverflow : function( height, overflow ) {
		var $textarea = this.$inputEl,
		    curatedHeight = Math.floor( parseInt( height, 10 ) );
		    
		if( $textarea.height() != curatedHeight ) {
			$textarea.css( { 'height': curatedHeight + 'px', 'overflow': overflow } );
		}
	},
	
	
	
	/**
	 * Utility method for the {@link #autoGrow} functionality. Update the height of the textarea, if necessary.
	 * 
	 * @private
	 * @method updateAutoGrowHeight
	 */
	updateAutoGrowHeight : function() {
		if( this.rendered ) {
			var $textarea = this.$inputEl,
			    $twin = this.$autoGrowTwinDiv,
			    computedStyles = this.autoGrowComputedStyles;
			
			// Get curated content from the textarea.
			var textareaContent = $textarea.val().replace( /&/g,'&amp;' ).replace( / {2}/g, '&nbsp;' ).replace( /<|>/g, '&gt;' ).replace( /\n/g, '<br />' );
			
			// Compare curated content with curated twin.
			var twinContent = $twin.html().replace( /<br>/ig, '<br />' );
			
			if( textareaContent + '&nbsp;' != twinContent ) {
				// Add an extra white space so new rows are added when you are at the end of a row.
				$twin.html( textareaContent + '&nbsp;' );
				
				// Change textarea height if twin plus the height of one line differs more than 3 pixel from textarea height
				if( Math.abs( $twin.height() + computedStyles.lineHeight - $textarea.height() ) > 3 ) {
					var goalHeight = $twin.height() + computedStyles.lineHeight;
					
					if( goalHeight >= computedStyles.maxHeight ) {
						this.setHeightAndOverflow( computedStyles.maxHeight, 'auto' );
						
					} else if( goalHeight <= computedStyles.minHeight ) {
						this.setHeightAndOverflow( computedStyles.minHeight, 'hidden' );
						
					} else {
						this.setHeightAndOverflow( goalHeight, 'hidden' );
					}
				}
			}
		}
	},
	
	
	// protected
	setValue : function() {
		ui.formFields.TextAreaField.superclass.setValue.apply( this, arguments );
		
		// After the value is set, update the "auto grow" height
		if( this.autoGrow ) {
			this.updateAutoGrowHeight();
		}
	},
	
	
	// protected
	onChange : function() {
		ui.formFields.TextAreaField.superclass.onChange.apply( this, arguments );
		
		if( this.autoGrow ) {
			this.updateAutoGrowHeight();
		}
	},
	
	
	// protected
	onKeyUp : function( evt ) {
		ui.formFields.TextAreaField.superclass.onKeyUp.apply( this, arguments );
		
		if( this.autoGrow ) {
			this.updateAutoGrowHeight();
		}
	},
	
	
	// protected
	onBlur : function() {
		ui.formFields.TextAreaField.superclass.onBlur.apply( this, arguments );
		
		// Compact textarea on blur (if the autoGrow config is true)
		if( this.autoGrow ) {
			var $textarea = this.$inputEl,
			    $twin = this.$autoGrowTwinDiv,
			    computedStyles = this.autoGrowComputedStyles;
			
			if( $twin.height() < computedStyles.maxHeight ) {
				if( $twin.height() > computedStyles.minHeight ) {
					$textarea.height( $twin.height() );
				} else {
					$textarea.height( computedStyles.minHeight );
				}
			}
		}
	},
	
	
	// protected
	onDestroy : function() {
		if( this.autoGrow && this.rendered ) {
			var $textarea = this.$inputEl;
			
			// kill the autoGrowPasteHandler live events
			$textarea.die( 'input', this.autoGrowPasteHandler );  // The call to 'die' for live events seem to need to 
			$textarea.die( 'paste', this.autoGrowPasteHandler );  // be separate... (i.e. not space delimited)
			
			// Remove the sizing div
			this.$autoGrowTwinDiv.remove();
		}
		
		ui.formFields.TextAreaField.superclass.onDestroy.apply( this, arguments );
	}
	
} );


// Register the type so it can be created by the string 'String' in the manifest
ui.ComponentManager.registerType( 'TextArea', ui.formFields.TextAreaField );