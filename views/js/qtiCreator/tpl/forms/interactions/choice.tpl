<div class="panel">
    <label>
        <input name="shuffle" type="checkbox" data-role="shuffle">
        <span class="icon-checkbox"></span>
        {{__ "shuffle choices"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">Regular checkbox</span>
</div>

<div class="panel">
    <h3>{{__ "Allowed number of choices"}}
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">whatever</span>
    </h3>

    <div>
        <label for="minChoices" class="spinner">Min</label>
        <input name="minChoices" value="0" data-increment="1" data-min="0" data-max="100" type="text" data-role="minChoices">
    </div>
    <div>
        <label for="maxChoices" class="spinner">Max</label>
        <input name="maxChoices" value="0" data-increment="1" data-min="0" data-max="100" type="text" data-role="maxChoices">
    </div>
</div>

<div class="panel panel-row">
    <label for="">Response processing template</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">The help text if any</div>

    <select class="select2" data-has-search="false">
        <option>Correct</option>
        <option>Map</option>
        <option>Custom</option>
    </select>
</div>
<hr/>

<div class="panel">
    <h3>{{__ "Score value range"}}
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">whatever</span>
    </h3>

    <div>
        <label for="lowerBound" class="spinner">Min</label>
        <input name="lowerBound" value="0" data-increment="1" data-min="0" data-max="100" type="text" data-role="lowerBound">
    </div>
    <div>
        <label for="upperBound" class="spinner">Max</label>
        <input name="upperBound" value="0" data-increment="1" data-min="0" data-max="100" type="text" data-role="upperBound">
    </div>
</div>

<div class="panel">
    <label for="defaultValue" class="spinner">Score mapping default value</label>
    <input name="defaultValue" value="0" data-increment="1" data-min="0" data-max="100" type="text" data-role="defaultValue">
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">default value?</span>
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