<div class="panel">
    <label for="">{{__ "Identifier"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ "The principle identifier of the item. This identifier must have a corresponding entry in the item's metadata."}}</div>

    <input type="text" 
           name="identifier" 
           value="{{identifier}}" 
           placeholder="e.g. my-item_123456" 
           data-validate="$notEmpty; $qtiIdentifier(serial={{serial}}); $availableIdentifier(serial={{serial}});">
    
</div>

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

{{#if languagesList}}
    <div class="panel">
        <label for="xml:lang">
            {{__ "Language"}}
        </label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <span class="tooltip-content">
            {{__ "Define item language."}}
        </span>
        <select name="xml:lang" class="select2" data-has-search="false">
            {{#each languagesList}}
                <option value="{{@key}}"{{#equal @key ../xml:lang}} selected="selected"{{/equal}}>{{this}}</option>
            {{/each}}
        </select>
    </div>
{{/if}}
