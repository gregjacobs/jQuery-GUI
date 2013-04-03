/*global define */
define( [
	'jquery',
	'lodash',
	'ui/ComponentManager',
	'ui/form/field/Text'
], function( jQuery, _, ComponentManager, TextField ) {
	
	/**
	 * @class ui.form.field.TextArea
	 * @extends ui.form.field.Text
	 * 
	 * TextArea field component.
	 */
	var TextAreaField = TextField.extend( {
		
		/**
		 * @cfg {Boolean} autoGrow
		 * True to auto-grow the text field as the user types into it. Defaults to false.
		 * 
		 * Note that if autoGrow is true, the textarea will be given the "resize: none" style for Chrome and Safari, so that
		 * the resize handle is removed. The resize handle does not make sense for auto-grow textareas because the textarea size
		 * is recalculated and applied on every key press (so if they drag it bigger, and then keep typing, it
		 * will just be resized back to its calculated height.
		 */
		autoGrow : false,
		
		
		/**
		 * @protected
		 * @property {jQuery} $inputEl
		 * 
		 * The &lt;input&gt; element; the textarea field.
		 */
		
		
		/**
		 * @private
		 * @property {String[]} autoGrowMimicStyles
		 * 
		 * An array of the CSS properties that should be applied to the div that will mimic the textarea's text when {@link #autoGrow}
		 * is true.
		 */
		autoGrowMimicStyles : [ 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'fontSize', 'lineHeight', 'fontFamily', 'width', 'fontWeight' ],
		
		/**
		 * @private
		 * @property {jQuery} $autoGrowTwinDiv
		 * 
		 * A div element that is created if the {@link #autoGrow} config is true, to be a "twin" of the textarea. The content of the textarea will be copied to
		 * this div so that it can be measured for its height, and then that height value can be applied to the textarea itself to "autogrow" it.
		 */
		
		/**
		 * @private
		 * @property {Object} autoGrowComputedStyles
		 * 
		 * An object that holds the computed styles for the {@link #autoGrow} feature.
		 */
		
		/**
		 * @private 
		 * @property {Function} autoGrowPasteHandler
		 * 
		 * A reference to the function created as the document paste handler, for when {@link #autoGrow} is true. This reference is maintained so that
		 * the document level handler can be removed when the field is destroyed.
		 */
		
		
		
		// protected
		onRender : function() {
			this._super( arguments );
			
			
			// If there was a 'height' configured on the Component, size the actual textarea element according to the heights
			// of the other elements that are part of the field.
			if( 'height' in this ) {
				var inputElHeight = this.height;
				
				// Leave room for a "top" label
				if( this.labelAlign === 'top' ) {
					inputElHeight -= this.$labelEl.outerHeight( /* includeMargin */ true );
				}
				
				// Minus off the top/bottom margin/padding of the $inputContainerWrapEl, the $inputContainerEl, and the $inputEl itself
				inputElHeight -= this.getTopBottomMarginPaddingHeight( this.$inputContainerWrapEl );
				inputElHeight -= this.getTopBottomMarginPaddingHeight( this.$inputContainerEl );
				inputElHeight -= this.getTopBottomMarginPaddingHeight( this.$inputEl );
				
				// And finally, minus off the height of the "extraMsg" element (if there is actually 'extraMsg' text)
				if( this.extraMsg ) {
					inputElHeight -= this.$extraMsgEl.outerHeight( /* includeMargin */ true );
				}
				
				this.$inputEl.css( 'height', inputElHeight + 'px' );
			}
			
			
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
				$textarea.on( 'cut paste', _.bind( function() { this.updateAutoGrowHeight(); }, this ) );
				
				
				// Attempt to catch the browser paste event.
				var me = this;  // for closure
				this.autoGrowPasteHandler = function() {   
					setTimeout( function() { me.updateAutoGrowHeight(); }, 250 );  // need timeout because the paste event fires just *before* the paste is done
				};
				$textarea.on( 'paste input', this.autoGrowPasteHandler );
				
				// Save a reference to the twin element
				this.$autoGrowTwinDiv = $twin;
				
				// Run the sizing routine now that we're all set up
				this.updateAutoGrowHeight();
			}
		},
		
		
		/**
		 * Overridden method for creating the input element for the TextAreaField. This implementation
		 * creates a &lt;textarea&gt; element. See {@link ui.form.field.Text#createInputEl} for more information.
		 * 
		 * @protected
		 * @return {jQuery}
		 */
		createInputEl : function() {
			return jQuery( '<textarea id="' + this.inputId + '" name="' + this.inputName + '">' + ( this.value || "" ) + '</textarea>' );  
		},
		
		
		// ----------------------------------------
		
		// Utility Methods
		
		/**
		 * Utility method used to support a {@link #height} being passed for the Component. Returns the total 
		 * number of pixels taken up by the top and bottom margin + the top and bottom padding of a given element.
		 * 
		 * @private
		 * @param {jQuery} $targetEl The element to get the top/bottom margin/padding.
		 * @return {Number} The number of pixels taken up by the top/bottom margin/padding.
		 */
		getTopBottomMarginPaddingHeight : function( $targetEl ) {
			return parseInt( $targetEl.css( 'margin-top' ), 10 ) + 
			       parseInt( $targetEl.css( 'padding-top' ), 10 ) + 
			       parseInt( $targetEl.css( 'padding-bottom' ), 10 ) + 
			       parseInt( $targetEl.css( 'margin-bottom' ), 10 );
		},
		
		
		// ----------------------------------------
		
		// AutoGrow Methods
		
		
		/**
		 * Utility method for the {@link #autoGrow} functionality. Sets a given `height` and `overflow` state on the textarea.
		 * 
		 * @private
		 * @param {Number} height
		 * @param {String} overflow
		 */ 
		setHeightAndOverflow : function( height, overflow ) {
			var $textarea = this.$inputEl,
			    curatedHeight = Math.floor( parseInt( height, 10 ) );
			    
			if( $textarea.height() !== curatedHeight ) {
				$textarea.css( { 'height': curatedHeight + 'px', 'overflow': overflow } );
			}
		},
		
		
		
		/**
		 * Utility method for the {@link #autoGrow} functionality. Update the height of the textarea, if necessary.
		 * 
		 * @private
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
				if( textareaContent + '&nbsp;' !== twinContent ) {
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
			this._super( arguments );
			
			// After the value is set, update the "auto grow" height
			if( this.autoGrow ) {
				this.updateAutoGrowHeight();
			}
		},
		
		
		// protected
		onChange : function() {
			this._super( arguments );
			
			if( this.autoGrow ) {
				this.updateAutoGrowHeight();
			}
		},
		
		
		// protected
		onKeyUp : function( evt ) {
			this._super( arguments );
			
			if( this.autoGrow ) {
				this.updateAutoGrowHeight();
			}
		},
		
		
		// protected
		onBlur : function() {
			this._super( arguments );
			
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
		
		
		// ----------------------------------------
		
		
		// protected
		onDestroy : function() {
			if( this.autoGrow && this.rendered ) {
				// Remove the sizing div
				this.$autoGrowTwinDiv.remove();
			}
			
			this._super( arguments );
		}
		
	} );
	
	
	// Register the class so it can be created by the type string 'textareafield'
	ComponentManager.registerType( 'textareafield', TextAreaField );
	
	return TextAreaField;
	
} );