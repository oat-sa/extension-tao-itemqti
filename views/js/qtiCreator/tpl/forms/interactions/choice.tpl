<div class="panel">
    <label class="smaller-prompt">
        <input type="radio" name="type" value="single" {{#equal type "single"}}checked{{/equal}} />
        <span class="icon-radio"></span>
        {{__ 'Single choice'}}
    </label>
    <br>
    <label class="smaller-prompt">
        <input type="radio" name="type" value="multiple" {{#equal type "multiple"}}checked{{/equal}} />
        <span class="icon-radio"></span>
        {{__ 'Multiple choices'}}
    </label>
</div>
<div class="panel">
    <h3>{{__ "Constraints"}}</h3>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ 'Define constraints on the number of choices required to form a valid response. None: define no additional constraints. Answer required: require the test taker to select at least one choice. Other constraints: define custom minimum and/or maximum constraints (only available for multiple choices)'}}
    </span>
    <div>
        <label class="smaller-prompt">
            <input type="radio" name="constraints" value="none" {{#equal constraints "none"}}checked{{/equal}} />
            <span class="icon-radio"></span>
            {{__ 'None'}}
        </label>
        <br>
        <label class="smaller-prompt">
            <input type="radio" name="constraints" value="required" {{#equal constraints "required"}}checked{{/equal}} />
            <span class="icon-radio"></span>
            {{__ 'Answer required'}}
        </label>
        <br>
        <label class="smaller-prompt">
            <input type="radio" name="constraints" value="other" {{#equal constraints "other"}}checked{{/equal}} {{#equal type "single"}}disabled{{/equal}} />
            <span class="icon-radio"></span>
            {{__ 'Other constraints'}}
        </label>
    </div>
</div>
<div class="panel min-max-panel choice-min-max"></div>
<hr/>
<div class="panel">
    <label>
        <input name="eliminable" type="checkbox" {{#if eliminable}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Allow elimination"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ 'If this box is checked the student will be able to eliminate choices.'}}
    </span>
</div>
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
<hr/>
<div class="panel">
    <h3>{{__ "List Style"}}</h3>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <span class="tooltip-content">
            {{__ 'Use this if you want the list of choices to be prefixed (e.g. 1,2,3 a,b,c)'}}
        </span>

    <select data-list-style/>
</div>


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
