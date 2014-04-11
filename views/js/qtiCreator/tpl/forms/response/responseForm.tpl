<div class="panel panel-row">
    <label for="">Response processing template</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">Select the way the response of your interaction should be processed</div>

    <select name="template" class="select2" data-has-search="false">
        <option value="MATCH_CORRECT">Correct</option>
        <option value="MAP_RESPONSE">Map</option>
        <option value="CUSTOM">Custom</option>
    </select>
</div>
<hr/>

<div class="panel">
    <h3>{{__ "Score range"}}
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">whatever</span>
    </h3>
    <div>
        <label for="lowerBound" class="spinner short">Min</label>
        <input name="lowerBound" value="{{lowerBound}}" class="score" type="text" data-role="lowerBound" data-validate="$numeric" data-validate-option="$event(type=keyup)" />
    </div>
    <div>
        <label for="upperBound" class="spinner short">Max</label>
        <input name="upperBound" value="{{upperBound}}" class="score" type="text" data-role="upperBound" data-validate="$numeric" data-validate-option="$event(type=keyup)" />
    </div>
</div>

<div class="panel">
    <label for="defaultValue" class="spinner">{{__ "Score mapping default value"}}
        <input name="defaultValue" value="{{defaultValue}}" class="score" type="text" data-role="defaultValue" data-validate="$numeric" data-validate-option="$event(type=keyup)" />
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">The default value from the target set to be used when no explicit mapping for a source value is given.</span>
</div>

<div class="panel">
    <label>
        <input name="defineCorrect" type="checkbox" data-role="defineCorrect">
        <span class="icon-checkbox"></span>
        {{__ "define correct response"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">Optionally optional</span>
</div>


<div class="panel feedbackRule-panel">
    <div class="feedbackRules">
    {{#if feedbackRules}}
        {{#feedbackRules}}{{{.}}}{{/feedbackRules}}
    {{else}}
        <p>No modal feedback defined yet.</p>
    {{/if}}
    </div>
    <a title="add else feedback" href="#" class="adder feedbackRule-add">Add a modal feedback</a>
</div>