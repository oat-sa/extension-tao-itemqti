
<div class="panel">
    <label for="lowerBound" class="spinner">{{__ "Lower Bound"}}</label>
    <input name="lowerBound" value="{{lowerBound}}" data-increment="1" data-min="0" type="text" />
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Lowerbound attribute"}}</span>
    <label for="upperBound" class="spinner">{{__ "Upper Bound"}}</label>
    <input name="upperBound" value="{{upperBound}}" data-increment="1" data-min="0" type="text" />
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "UpperBound attribute"}}</span>
</div>

<div class="panel">
    <label for="orientation" class="has-icon">{{__ "Orientation"}}</label>
    <select name="orientation" class="select2" data-has-search="false">
        <option value="horizontal">{{__ "Horizontal"}}</option>
        <option value="vertical">{{__ "Vertical"}}</option>
    </select>
    <br>
    <label>
        <input name="reverse" type="checkbox" {{#if reverse}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Reverse"}}
    </label>
</div>

<div class="panel">
    <label for="step" class="spinner">{{__ "Number of steps"}}</label>
    <input name="step" value="{{step}}" data-increment="1" data-min="1" type="text" />
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Make the slider pause at certain intervals"}}</span>

    <label>
        <input name="stepLabel" type="checkbox" {{#if reverse}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Display steps"}}
    </label>
</div>