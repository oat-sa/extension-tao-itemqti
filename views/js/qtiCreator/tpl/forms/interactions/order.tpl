<div class="panel">
    <div>
        <label class="smaller-prompt">
        <input type="radio" name="order" value="single" {{#if single}}checked{{/if}} />
            <span class="icon-radio"></span>
            {{__ 'Order single list'}}
        </label>
        <br>
        <label class="smaller-prompt">
            <input type="radio" name="order" value="sort" {{#unless single}}checked{{/unless}} />
            <span class="icon-radio"></span>
            {{__ 'Sort from source to target list'}}
        </label>
    </div>
</div>

<div class="panel min-max-panel">
    <h3>{{__ "Allowed choices"}}</h3>
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
        {{__ 'If the shuffle attribute is true then the delivery engine will randomize the order in which the choices are initially presented. However each choice may be "shuffled" of "fixed" individually.'}}
    </span>
</div>
{{/if}}
{{#if enabledFeatures.orientation}}
<hr/>
<div class="panel">
    <h3>{{__ 'Orientation'}}</h3>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <span class="tooltip-content">
            {{__ 'Display the choices either horizontally or vertically'}}
        </span>
    <div>
        <label class="smaller-prompt">
            <input type="radio" name="orientation" value="vertical" {{#unless horizontal}}checked{{/unless}} />
            <span class="icon-radio"></span>
            {{__ 'Vertical'}}
        </label>
        <br>
        <label class="smaller-prompt">
            <input type="radio" name="orientation" value="horizontal" {{#if horizontal}}checked{{/if}} />
            <span class="icon-radio"></span>
            {{__ 'Horizontal'}}
        </label>
    </div>
</div>
{{/if}}
{{#if enabledFeatures.position}}
<div class="panel position-panel" style="display:none;">
    <hr/>
    <h3>{{__ 'Choices position'}}</h3>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <span class="tooltip-content">
            {{__ 'Configures the position of the choices relative to the target list.'}}
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
            <input type="radio" name="position" value="left"  {{#equal position 'left'}}checked{{/equal}} />
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
{{/if}}
