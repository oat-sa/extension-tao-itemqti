<input name="stuff" type="text" data-validate="$notEmpty; $pattern(pattern=[A-Z][a-z]{5,})"/>
<input name="other-stuff" type="text" />

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
    <h3>{{__ "Score value range"}}
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">whatever</span>
    </h3>
    <div>
        <label for="lowerBound" class="spinner short">Min</label>
        <input name="lowerBound" value="{{lowerBound}}" data-increment="0.10" data-min="-100" data-max="100" type="text" data-role="lowerBound">
    </div>
    <div>
        <label for="upperBound" class="spinner short">Max</label>
        <input name="upperBound" value="{{upperBound}}" data-increment="0.10" data-min="-100" data-max="100" type="text" data-role="upperBound">
    </div>
</div>

<div class="panel">
    <label for="defaultValue" class="spinner">{{__ "Score mapping default value"}}
        <input name="defaultValue" value="{{defaultValue}}" data-increment="1" data-min="0" data-max="100" type="text" data-role="defaultValue">
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