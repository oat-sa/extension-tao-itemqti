<div class="panel">
    <label for="responseIdentifier" class="has-icon">{{__ "Response identifier"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'The identifier of the choice. This identifier must not be used by any other response or item variable. An identifier is a string of characters that must start with a Letter or an underscore ("_") and contain only Letters, underscores, hyphens ("-"), period (".", a.k.a. full-stop), Digits, CombiningChars and Extenders.'}}</div>

    <input id="responseIdentifier"
           type="text"
           name="identifier"
           value="{{identifier}}"
           placeholder="e.g. RESPONSE"
           data-validate="$notEmpty; $qtiResponseIdentifier(serial={{serial}}); $availableIdentifier(serial={{serial}});">
</div>

<div class="panel">
    <label for="responseProcessing" class="has-icon">{{__ "Response processing"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ "Select the way the response of your interaction should be processed"}}</div>

    <select id="responseProcessing" name="template" class="select2" data-has-search="false">
        {{#each templates}}
        <option value="{{@key}}">{{.}}</option>
        {{/each}}
    </select>
</div>

{{#if textEntryInteraction}}
<div class="panel">
    <label for="responseBaseType" class="has-icon">{{__ "Response base type"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ "Select the expected input value type that will define the way the response of your interaction will be processed."}}</div>

    <select id="responseBaseType" name="listOfBaseType" class="select2" data-has-search="false">
        {{#each listOfBaseTypes}}
        <option value="{{value}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
        {{/each}}
    </select>
</div>
{{/if}}

{{#if editMapping}}
<hr/>

<div class="response-mapping-attributes{{#if mappingDisabled}} hidden{{/if}}">
    <div class="panel min-max-panel" data-editx="map">
        <h3>{{__ "Score range"}}</h3>
    </div>

    <div class="panel" data-editx="map">
        <label for="defaultValue" class="spinner">{{__ "Mapping default"}}</label>
        <input name="defaultValue" value="{{defaultValue}}"{{#if mappingDisabled}} disabled="true"{{/if}} class="score" type="text" data-validate="$notEmpty; $numeric;" data-validate-option="$lazy; $event(type=keyup)" />
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <span class="tooltip-content">{{__ "The default value from the target set to be used when no explicit mapping for a source value is given."}}</span>
    </div>
</div>
<div class="response-mapping-info{{#unless mappingDisabled}} hidden{{/unless}}">
    <p class="feedback-info">{{__ 'The mapping options are available when at least one map entry is defined.'}}</p>
</div>
<div class="response-matchmax-info response{{#unless isInfinityMatchMax}} hidden{{/unless}}">
    <p class="feedback-info">{{__ 'The MAXSCORE of this item is removed because the current interaction settings allow an infinite value to the score.'}}</p>
</div>

<div class="panel" data-editx="map">
    <label>
        <input name="defineCorrect" type="checkbox" data-role="defineCorrect"{{#if defineCorrect}} checked="checked"{{/if}} />
        <span class="icon-checkbox"></span>
        {{__ "Define correct response"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Define the correct response."}}</span>
</div>
{{/if}}

{{#if editFeedbacks}}
<hr/>

<div class="panel feedbackRule-panel"></div>
{{/if}}
