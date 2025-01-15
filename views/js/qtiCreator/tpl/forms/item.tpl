{{#if showIdentifier}}
<div class="panel">
    <label for="">{{__ "Identifier"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ "The principle identifier of the item. This identifier must have a corresponding entry in the item's metadata."}}</div>

    <input type="text"
           name="identifier"
           value="{{identifier}}"
           {{#if disableIdentifier}} disabled {{/if}}
           placeholder="e.g. my-item_123456"
           data-validate="$notEmpty; $qtiIdentifier(serial={{serial}}); $availableIdentifier(serial={{serial}});">

</div>
{{/if}}

<div class="panel">
    <label for="">{{__ "Title"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ "The item of the qti item. It is currently used as a meta data only. It is required by the QTI standard."}}</div>

    <input type="text"
           name="title"
           value="{{title}}"
           placeholder="e.g. My Item A"
           data-validate="$notEmpty;">

</div>

{{#if translation}}
    <hr />
    <div class="panel">
        <h3>{{__ "Status"}}</h3>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">
            {{__ 'Define the status of the translation.'}}
        </span>
        <div>
            <label class="smaller-prompt">
                <input type="radio" name="translationStatus" value="translating" {{#equal translationStatus "translating" }}checked{{/equal}}
                    id="translationStatus-translating" />
                <span class="icon-radio"></span>
                <label for="translationStatus-translating">{{__ 'In progress'}} </label>
            </label>
            <br>
            <label class="smaller-prompt">
                <input type="radio" name="translationStatus" value="translated" {{#equal translationStatus "translated" }}checked{{/equal}}
                    id="translationStatus-translated" />
                <span class="icon-radio"></span>
                <label for="translationStatus-translated">{{__ 'Translation completed'}} </label>
            </label>
        </div>
    </div>
{{else}}
    {{#if showTimeDependent}}
    <div class="panel">
        <label>
            <input name="timeDependent" type="checkbox" {{#if timeDependent}}checked="checked"{{/if}}/>
            <span class="icon-checkbox"></span>
            {{__ "Time dependent"}}
        </label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <span class="tooltip-content">
            {{__ "Define whether the item should be time dependent on delivery."}}
        </span>
    </div>
    {{/if}}

    {{#if languagesList}}
        <div class="panel">
            <label for="xml:lang">
                {{__ "Language"}}
            </label>
            <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
            <span class="tooltip-content">
                {{__ "Define item language."}}
            </span>
            <select name="xml:lang" data-has-search="false">
                {{#each languagesList}}
                    <option value="{{code}}"{{#equal code ../xml:lang}} selected="selected"{{/equal}} class="{{orientation}}-lang">{{label}}</option>
                {{/each}}
            </select>
        </div>
        <div class="panel" style="display:none;" id="writingMode-panel">
            <label for="">{{__ "Direction of writing"}}</label>
            <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <span class="tooltip-content">{{__ "Switches the whole item's direction of writing between horizontal and vertical."}}</span>
            <div>
                <label class="no-margin">
                    <input type="radio" name="writingMode" value="horizontal" id="writingMode-radio-horizontal" />
                    <span class="icon-radio"></span>
                    <label for="writingMode-radio-horizontal">{{__ "Horizontal"}} </label>
                </label>
                <br>
                <label class="no-margin">
                    <input type="radio" name="writingMode" value="vertical" id="writingMode-radio-vertical" />
                    <span class="icon-radio"></span>
                    <label for="writingMode-radio-vertical">{{__ "Vertical"}} </label>
                </label>
            </div>
            <hr />
        </div>
    {{/if}}

    {{#if showRemoveInstructions}}
    <div class="panel">
        <label>
            <input name="removeInstructions" type="checkbox" {{#if removeInstructions}}checked="checked" {{/if}} />
            <span class="icon-checkbox"></span>
            {{__ "Remove Instructions"}}
        </label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <span class="tooltip-content">
            {{__ "Removes all instruction messages generated by the system from the interface."}}<br />
            <b>{{__ "Be aware, if you choose to remove the instructions, the system will not provide any warnings to the test takers if constraints are set."}}</b>
        </span>
    </div>
    {{/if}}
{{/if}}
