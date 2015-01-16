<div class="panel">
    <label for="format" class="spinner">{{__ "Format"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Used to control the format of the text entered by the candidate."}}</span>
    <select name="format" class="select2" data-has-search="false">
    	{{#each formats}}
    		<option value="{{@key}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
    	{{/each}}
    </select>
</div>
<hr>
<div class="panel">
    <h3 class="full-width">{{__ "Expectations"}}</h3>

    <label>
        <input type="checkbox" name="expect-patternMask">
        <span class="icon-checkbox"></span>
        {{__ "pattern"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "If given, the pattern mask specifies a regular expression that the candidate's response must match in order to be considered valid"}}</span>
    <input type="text" name="patternMask" {{#if patternMask}}value={{patternaMast}}{{/if}}/>

    <label class="spinner">
        <input type="checkbox" name="expect-maxLength">
        <span class="icon-checkbox"></span>
        {{__ "expected length"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "The expectedLength attribute provides a hint to the candidate as to the expected overall length of the desired response measured in number of characters."}}</span>
    <input type="text" data-min="0" data-increment="1" class="incrementer" name="maxLength" value="{{#if maxLend}}{{patternaMast}}{{else}}0{{/if}}"/>

    <label class="spinner">
        <input type="checkbox" name="expect-maxWords">
        <span class="icon-checkbox"></span>
        {{__ "expected words"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "The maxStrings attribute is required when the interaction is bound to a response variable that is a container."}}</span>
    <input type="text" data-min="0" data-increment="1" class="incrementer" name="maxWords" value="{{#if patternMask}}{{patternaMast}}{{else}}0{{/if}}"/>
</div>
<hr>
<div class="panel">
    <h3>{{__ "Contraints"}}</h3>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Be carefull, this is not compliant with IMS standard and should not work on others system."}}</span>
    <label>
        <input type="checkbox" name="mandatory-maxWords">
        <span class="icon-checkbox"></span>
        {{__ "expected words as max words"}}
    </label>
</div>
