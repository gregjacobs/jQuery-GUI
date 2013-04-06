Ext.data.JsonP.ui_form_field_Text_EmptyTextBehavior({"tagname":"class","name":"ui.form.field.Text.EmptyTextBehavior","extends":"ui.form.field.Text.Behavior","mixins":[],"alternateClassNames":[],"aliases":{},"singleton":false,"requires":[],"uses":[],"enum":null,"override":null,"inheritable":null,"inheritdoc":null,"meta":{},"private":null,"id":"class-ui.form.field.Text.EmptyTextBehavior","members":{"cfg":[],"property":[{"name":"emptyTextCls","tagname":"property","owner":"ui.form.field.Text.EmptyTextBehavior","meta":{"private":true},"id":"property-emptyTextCls"}],"method":[{"name":"onBlur","tagname":"method","owner":"ui.form.field.Text.EmptyTextBehavior","meta":{},"id":"method-onBlur"},{"name":"onChange","tagname":"method","owner":"ui.form.field.Text.Behavior","meta":{"abstract":true},"id":"method-onChange"},{"name":"onFocus","tagname":"method","owner":"ui.form.field.Text.EmptyTextBehavior","meta":{},"id":"method-onFocus"},{"name":"onKeyDown","tagname":"method","owner":"ui.form.field.Text.Behavior","meta":{"abstract":true},"id":"method-onKeyDown"},{"name":"onKeyPress","tagname":"method","owner":"ui.form.field.Text.Behavior","meta":{"abstract":true},"id":"method-onKeyPress"},{"name":"onKeyUp","tagname":"method","owner":"ui.form.field.Text.Behavior","meta":{"abstract":true},"id":"method-onKeyUp"},{"name":"onRender","tagname":"method","owner":"ui.form.field.Text.Behavior","meta":{"abstract":true},"id":"method-onRender"},{"name":"onSetValue","tagname":"method","owner":"ui.form.field.Text.EmptyTextBehavior","meta":{},"id":"method-onSetValue"}],"event":[],"css_var":[],"css_mixin":[]},"linenr":8,"files":[{"filename":"Text.EmptyTextBehavior.js","href":"Text.EmptyTextBehavior.html#ui-form-field-Text-EmptyTextBehavior"}],"html_meta":{},"statics":{"cfg":[],"property":[],"method":[],"event":[],"css_var":[],"css_mixin":[]},"component":false,"superclasses":["ui.form.field.Text.Behavior"],"subclasses":[],"mixedInto":[],"parentMixins":[],"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'><a href='#!/api/ui.form.field.Text.Behavior' rel='ui.form.field.Text.Behavior' class='docClass'>ui.form.field.Text.Behavior</a><div class='subclass '><strong>ui.form.field.Text.EmptyTextBehavior</strong></div></div><h4>Files</h4><div class='dependency'><a href='source/Text.EmptyTextBehavior.html#ui-form-field-Text-EmptyTextBehavior' target='_blank'>Text.EmptyTextBehavior.js</a></div></pre><div class='doc-contents'><p>Handles a {<a href=\"#!/api/ui.form.field.Text\" rel=\"ui.form.field.Text\" class=\"docClass\">ui.form.field.Text</a> TextField} when it is in the \"default\" state (i.e. it is displaying a default value\nwhen empty).  This is opposed to when it is using the <a href=\"#!/api/ui.form.field.Text.InfieldLabelBehavior\" rel=\"ui.form.field.Text.InfieldLabelBehavior\" class=\"docClass\">InfieldLabelBehavior</a>,\nwhich is incompatible with the field having emptyText.</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-emptyTextCls' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='ui.form.field.Text.EmptyTextBehavior'>ui.form.field.Text.EmptyTextBehavior</span><br/><a href='source/Text.EmptyTextBehavior.html#ui-form-field-Text-EmptyTextBehavior-property-emptyTextCls' target='_blank' class='view-source'>view source</a></div><a href='#!/api/ui.form.field.Text.EmptyTextBehavior-property-emptyTextCls' class='name expandable'>emptyTextCls</a><span> : String</span><strong class='private signature' >private</strong></div><div class='description'><div class='short'>The CSS class that should be applied when showing the emptyText. ...</div><div class='long'><p>The CSS class that should be applied when showing the <a href=\"#!/api/ui.form.field.Text-cfg-emptyText\" rel=\"ui.form.field.Text-cfg-emptyText\" class=\"docClass\">emptyText</a>.</p>\n<p>Defaults to: <code>'ui-hint-text'</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-onBlur' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='ui.form.field.Text.EmptyTextBehavior'>ui.form.field.Text.EmptyTextBehavior</span><br/><a href='source/Text.EmptyTextBehavior.html#ui-form-field-Text-EmptyTextBehavior-method-onBlur' target='_blank' class='view-source'>view source</a></div><a href='#!/api/ui.form.field.Text.EmptyTextBehavior-method-onBlur' class='name expandable'>onBlur</a>( <span class='pre'>textField</span> )</div><div class='description'><div class='short'>Called when the TextField has been blurred, to set the emptyText\nback into the field if the field has been left empty. ...</div><div class='long'><p>Called when the TextField has been blurred, to set the <a href=\"#!/api/ui.form.field.Text-cfg-emptyText\" rel=\"ui.form.field.Text-cfg-emptyText\" class=\"docClass\">emptyText</a>\nback into the field if the field has been left empty. This action is only performed however if the\n<a href=\"#!/api/ui.form.field.Text-cfg-restoreEmptyText\" rel=\"ui.form.field.Text-cfg-restoreEmptyText\" class=\"docClass\">restoreEmptyText</a> config is true on the\n<a href=\"#!/api/ui.form.field.Text\" rel=\"ui.form.field.Text\" class=\"docClass\">TextField</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>textField</span> : <a href=\"#!/api/ui.form.field.Text\" rel=\"ui.form.field.Text\" class=\"docClass\">ui.form.field.Text</a><div class='sub-desc'>\n</div></li></ul><p>Overrides: <a href='#!/api/ui.form.field.Text.Behavior-method-onBlur' rel='ui.form.field.Text.Behavior-method-onBlur' class='docClass'>ui.form.field.Text.Behavior.onBlur</a></p></div></div></div><div id='method-onChange' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/ui.form.field.Text.Behavior' rel='ui.form.field.Text.Behavior' class='defined-in docClass'>ui.form.field.Text.Behavior</a><br/><a href='source/Text.Behavior.html#ui-form-field-Text-Behavior-method-onChange' target='_blank' class='view-source'>view source</a></div><a href='#!/api/ui.form.field.Text.Behavior-method-onChange' class='name expandable'>onChange</a>( <span class='pre'>textField</span> )<strong class='abstract signature' >abstract</strong></div><div class='description'><div class='short'>Called when the TextField has been changed. ...</div><div class='long'><p>Called when the TextField has been changed.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>textField</span> : <a href=\"#!/api/ui.form.field.Text\" rel=\"ui.form.field.Text\" class=\"docClass\">ui.form.field.Text</a><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-onFocus' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='ui.form.field.Text.EmptyTextBehavior'>ui.form.field.Text.EmptyTextBehavior</span><br/><a href='source/Text.EmptyTextBehavior.html#ui-form-field-Text-EmptyTextBehavior-method-onFocus' target='_blank' class='view-source'>view source</a></div><a href='#!/api/ui.form.field.Text.EmptyTextBehavior-method-onFocus' class='name expandable'>onFocus</a>( <span class='pre'>textField</span> )</div><div class='description'><div class='short'>Called when the TextField has been focused, which removes the emptyText in the TextField\nif that is what is currently...</div><div class='long'><p>Called when the TextField has been focused, which removes the <a href=\"#!/api/ui.form.field.Text-cfg-emptyText\" rel=\"ui.form.field.Text-cfg-emptyText\" class=\"docClass\">emptyText</a> in the TextField\nif that is what is currently set.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>textField</span> : <a href=\"#!/api/ui.form.field.Text\" rel=\"ui.form.field.Text\" class=\"docClass\">ui.form.field.Text</a><div class='sub-desc'>\n</div></li></ul><p>Overrides: <a href='#!/api/ui.form.field.Text.Behavior-method-onFocus' rel='ui.form.field.Text.Behavior-method-onFocus' class='docClass'>ui.form.field.Text.Behavior.onFocus</a></p></div></div></div><div id='method-onKeyDown' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/ui.form.field.Text.Behavior' rel='ui.form.field.Text.Behavior' class='defined-in docClass'>ui.form.field.Text.Behavior</a><br/><a href='source/Text.Behavior.html#ui-form-field-Text-Behavior-method-onKeyDown' target='_blank' class='view-source'>view source</a></div><a href='#!/api/ui.form.field.Text.Behavior-method-onKeyDown' class='name expandable'>onKeyDown</a>( <span class='pre'>textField, evt</span> )<strong class='abstract signature' >abstract</strong></div><div class='description'><div class='short'>Called when the TextField gets a keydown event. ...</div><div class='long'><p>Called when the TextField gets a keydown event.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>textField</span> : <a href=\"#!/api/ui.form.field.Text\" rel=\"ui.form.field.Text\" class=\"docClass\">ui.form.field.Text</a><div class='sub-desc'>\n</div></li><li><span class='pre'>evt</span> : jQuery.Event<div class='sub-desc'><p>The jQuery event object for the event.</p>\n</div></li></ul></div></div></div><div id='method-onKeyPress' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/ui.form.field.Text.Behavior' rel='ui.form.field.Text.Behavior' class='defined-in docClass'>ui.form.field.Text.Behavior</a><br/><a href='source/Text.Behavior.html#ui-form-field-Text-Behavior-method-onKeyPress' target='_blank' class='view-source'>view source</a></div><a href='#!/api/ui.form.field.Text.Behavior-method-onKeyPress' class='name expandable'>onKeyPress</a>( <span class='pre'>textField, evt</span> )<strong class='abstract signature' >abstract</strong></div><div class='description'><div class='short'>Called when the TextField gets a keypress event. ...</div><div class='long'><p>Called when the TextField gets a keypress event.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>textField</span> : <a href=\"#!/api/ui.form.field.Text\" rel=\"ui.form.field.Text\" class=\"docClass\">ui.form.field.Text</a><div class='sub-desc'>\n</div></li><li><span class='pre'>evt</span> : jQuery.Event<div class='sub-desc'><p>The jQuery event object for the event.</p>\n</div></li></ul></div></div></div><div id='method-onKeyUp' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/ui.form.field.Text.Behavior' rel='ui.form.field.Text.Behavior' class='defined-in docClass'>ui.form.field.Text.Behavior</a><br/><a href='source/Text.Behavior.html#ui-form-field-Text-Behavior-method-onKeyUp' target='_blank' class='view-source'>view source</a></div><a href='#!/api/ui.form.field.Text.Behavior-method-onKeyUp' class='name expandable'>onKeyUp</a>( <span class='pre'>textField, evt</span> )<strong class='abstract signature' >abstract</strong></div><div class='description'><div class='short'>Called when the TextField gets a keyup event. ...</div><div class='long'><p>Called when the TextField gets a keyup event.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>textField</span> : <a href=\"#!/api/ui.form.field.Text\" rel=\"ui.form.field.Text\" class=\"docClass\">ui.form.field.Text</a><div class='sub-desc'>\n</div></li><li><span class='pre'>evt</span> : jQuery.Event<div class='sub-desc'><p>The jQuery event object for the event.</p>\n</div></li></ul></div></div></div><div id='method-onRender' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/ui.form.field.Text.Behavior' rel='ui.form.field.Text.Behavior' class='defined-in docClass'>ui.form.field.Text.Behavior</a><br/><a href='source/Text.Behavior.html#ui-form-field-Text-Behavior-method-onRender' target='_blank' class='view-source'>view source</a></div><a href='#!/api/ui.form.field.Text.Behavior-method-onRender' class='name expandable'>onRender</a>( <span class='pre'>textField</span> )<strong class='abstract signature' >abstract</strong></div><div class='description'><div class='short'>Called when the TextField is rendered. ...</div><div class='long'><p>Called when the TextField is rendered.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>textField</span> : <a href=\"#!/api/ui.form.field.Text\" rel=\"ui.form.field.Text\" class=\"docClass\">ui.form.field.Text</a><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-onSetValue' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='ui.form.field.Text.EmptyTextBehavior'>ui.form.field.Text.EmptyTextBehavior</span><br/><a href='source/Text.EmptyTextBehavior.html#ui-form-field-Text-EmptyTextBehavior-method-onSetValue' target='_blank' class='view-source'>view source</a></div><a href='#!/api/ui.form.field.Text.EmptyTextBehavior-method-onSetValue' class='name expandable'>onSetValue</a>( <span class='pre'>textField, value</span> )</div><div class='description'><div class='short'>Called when the TextField's setValue() method is called (if the TextField is rendered), which handles\nthe emptyText. ...</div><div class='long'><p>Called when the TextField's setValue() method is called (if the TextField is rendered), which handles\nthe <a href=\"#!/api/ui.form.field.Text-cfg-emptyText\" rel=\"ui.form.field.Text-cfg-emptyText\" class=\"docClass\">emptyText</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>textField</span> : <a href=\"#!/api/ui.form.field.Text\" rel=\"ui.form.field.Text\" class=\"docClass\">ui.form.field.Text</a><div class='sub-desc'>\n</div></li><li><span class='pre'>value</span> : String<div class='sub-desc'>\n</div></li></ul><p>Overrides: <a href='#!/api/ui.form.field.Text.Behavior-method-onSetValue' rel='ui.form.field.Text.Behavior-method-onSetValue' class='docClass'>ui.form.field.Text.Behavior.onSetValue</a></p></div></div></div></div></div></div></div>"});