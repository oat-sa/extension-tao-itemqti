<div class="panel">
    <h3>{{__ 'Display mode'}}</h3>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
{{__ 'Tabular uses a table layout. Non-tabular uses choices and buckets in preview and delivery.'}}
    </span>
    <div>
        <label class="smaller-prompt">
            <input type="radio" name="displayMode" value="qti-match-tabular" {{#unless nonTabular}}checked{{/unless}} />
            <span class="icon-radio"></span>
            {{__ 'Tabular'}}
        </label>
        <br>
        <label class="smaller-prompt">
            <input type="radio" name="displayMode" value="qti-match-non-tabular" {{#if nonTabular}}checked{{/if}} />
            <span class="icon-radio"></span>
            {{__ 'Non-tabular'}}
        </label>
    </div>
</div>

<div class="feedback-info match-non-tabular-info" style="display:none;">
    {{__ 'Authoring view remains tabular. Preview and delivery use non-tabular mode.'}}
</div>

<div class="panel position-panel" style="display:none;">
    <h3>{{__ 'Choices position'}}</h3>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ 'Configures the position of the choices relative to the buckets. Columns are choices and rows are buckets.'}}
    </span>
    <div>
        <label class="smaller-prompt">
            <input type="radio" name="position" value="top" {{#equal position 'top'}}checked{{/equal}} />
            <span class="icon-radio"></span>
            {{__ 'Top'}}
        </label>
        <br>
        <label class="smaller-prompt">
            <input type="radio" name="position" value="bottom" {{#equal position 'bottom'}}checked{{/equal}} />
            <span class="icon-radio"></span>
            {{__ 'Bottom'}}
        </label>
        <br>
        <label class="smaller-prompt">
            <input type="radio" name="position" value="left" {{#equal position 'left'}}checked{{/equal}} />
            <span class="icon-radio"></span>
            {{__ 'Left'}}
        </label>
        <br>
        <label class="smaller-prompt">
            <input type="radio" name="position" value="right" {{#equal position 'right'}}checked{{/equal}} />
            <span class="icon-radio"></span>
            {{__ 'Right'}}
        </label>
    </div>
</div>

{{#if enabledFeatures.shuffleChoices}}
<hr/>
<div class="panel">
    <label>
        <input name="shuffle" type="checkbox" {{#if shuffle}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Shuffle choices"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
{{__ "If the shuffle attribute is true then the delivery engine will randomize the order in which the choices are initially presented. However each choice may be \"shuffled\" of \"fixed\" individually."}}
    </span>
</div>
{{/if}}

<div class="panel min-max-panel">
    <h3>{{__ "Number of associations"}}</h3>
</div>
