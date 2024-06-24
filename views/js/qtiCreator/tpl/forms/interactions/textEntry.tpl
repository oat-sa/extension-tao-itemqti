{{#if baseAvailable}}
<div class="panel">
    <label for="base" class="spinner">{{__ "Base"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <input name="base" value="{{base}}" data-increment="1" data-min="1" data-max="100" type="text" />
    <span class="tooltip-content">
        {{__ "If the string interaction is bound to a numeric response variable then the base attribute must be used to set the number base in which to interpret the value entered by the candidate."}}
    </span>
</div>
{{/if}}

<div class="panel">
    <label for="placeholderText" class="spinner">{{__ "Placeholder Text"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <input name="placeholderText" value="{{placeholderText}}" type="text" />
    <span class="tooltip-content">
        {{__ "In visual environments, string interactions are typically represented by empty boxes into which the candidate writes or types.  Delivery engines should use the value of this attribute (if provided) instead of their default placeholder text when this is required."}}
    </span>
</div>

<hr>

{{#if constraintsAvailable}}
<div class="panel">
    <h3 class="full-width">{{__ "Constraints"}}</h3>
    <select name="constraint" class="select2" data-has-search="false">
        {{#each constraints}}
        <option value="{{@key}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
        {{/each}}
    </select>
</div>
{{/if}}

<div class="panel extendedText">
    {{!-- Let the user enter his own pattern --}}
    <div class="constraint constraint-pattern" {{#unless constraints.pattern.selected}}style="display:none"{{/unless}}>
        <label>
            {{__ "Pattern"}}
        </label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <span class="tooltip-content">{{__ "If given, the pattern mask specifies a regular expression that the candidate's response must match in order to be considered valid"}}</span>
        <input type="text" name="patternMask" value="{{#if patternMask}}{{patternMask}}{{/if}}"/>
    </div>
    {{!-- Use the patternMask w/ a regex controlled by thoses UI components --}}
    <div class="constraint constraint-maxLength" {{#unless constraints.maxLength.selected}}style="display:none"{{/unless}}>
        <label class="spinner">
            {{__ "Max length"}}
        </label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <span class="tooltip-content">{{__ "We will use the patternMask to do this, to be compliant with the IMS standard"}}</span>
        <input type="text" data-min="0" data-increment="1" class="incrementer" name="maxLength" {{#if maxLength}}value="{{maxLength}}"{{/if}} />
    </div>
</div>

<hr>

{{#if recommendationsAvailable}}
<div class="panel extendedText">
    <h3 class="full-width">{{__ "Recommendations"}}</h3>
    <div class="panel">
        <label for="expectedLength" class="spinner">{{__ 'Length'}}</label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <input name="expectedLength" value="{{#if expectedLength}}{{expectedLength}}{{/if}}" data-increment="1" data-min="1" data-max="100" type="text" />
        <span class="tooltip-content">
            {{__ "Provides a hint to the candidate as to the expected overall length of the desired response measured in number of characters. This is not a validity constraint."}}
        </span>
    </div>
</div>
{{/if}}