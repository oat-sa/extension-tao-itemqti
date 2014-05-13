<div class="panel">
    <label for="" class="has-icon">{{__ "Response identifier"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ "The identifier of the response. This identifier must not be assigned to any other response or item variable"}}</div>

    <input type="text" 
           name="identifier" 
           value="{{identifier}}" 
           placeholder="RESPONSE" 
           data-validate="$notEmpty; $qtiIdentifier; $availableIdentifier(serial={{serial}});">
</div>

<div class="panel">
    <label for="" class="has-icon">{{__ "Response processing template"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ "Select the way the response of your interaction should be processed"}}</div>

    <select name="template" class="select2" data-has-search="false">
        {{#each templates}}
        <option value="{{@key}}">{{.}}</option>
        {{/each}}
    </select>
</div>

{{#equal template "MATCH_CORRECT"}}
{{else}}
<hr/>

<div class="panel" data-edit="map">
    <h3>{{__ "Score range"}}
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">{{__ "Define the minimal and maximal score for te interaction."}}</span>
    </h3>
    <div>
        <label for="lowerBound" class="spinner short">Min</label>
        <input name="lowerBound" value="{{lowerBound}}" class="score" type="text" data-validate="$numeric" data-validate-option="$allowEmpty; $event(type=keyup)" />
    </div>
    <div>
        <label for="upperBound" class="spinner short">Max</label>
        <input name="upperBound" value="{{upperBound}}" class="score" type="text" data-validate="$numeric" data-validate-option="$allowEmpty; $event(type=keyup)" />
    </div>
</div>

<div class="panel" data-edit="map">
    <label for="defaultValue" class="spinner">{{__ "Score mapping default value"}}
        <input name="defaultValue" value="{{defaultValue}}" class="score" type="text" data-validate="$notEmpty; $numeric;" data-validate-option="$lazy; $event(type=keyup)" />
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "The default value from the target set to be used when no explicit mapping for a source value is given."}}</span>
</div>

<div class="panel" data-edit="map">
    <label>
        <input name="defineCorrect" type="checkbox" data-role="defineCorrect"{{#if defineCorrect}} checked="checked"{{/if}} />
        <span class="icon-checkbox"></span>
        {{__ "define correct response"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Define the correct response."}}</span>
</div>
{{/equal}}

<hr/>

<div class="panel feedbackRule-panel"></div>