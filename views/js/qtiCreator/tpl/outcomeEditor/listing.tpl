{{#each outcomes}}
<div class="outcome-container panel subpanel{{#if readonly}} readonly{{else}} editable deletable{{/if}}" data-serial="{{serial}}">
    <div class="identifier-label" title="{{interpretation}}">
        <span class="label">{{identifier}}</span>
        <input class="identifier"
               name="identifier"
               value="{{identifier}}"
               type="text"
               placeholder="e.g. CONTENT"
               data-validate="$notEmpty; $qtiIdentifier; $availableVariableIdentifier(serial={{serial}});">
    </div>
    <span class="trigger icon-bin" title="{{titleDelete}}" data-role="delete"></span>
    <span class="trigger icon-edit sidebar-popup-trigger" data-popup="~ .sidebar-popup" title="{{titleEdit}}" data-role="edit"></span>
    <div class="outcome-properties-form">
        <div class="panel">
            <label for="interpretation" class="has-icon">{{__ "Interpretation"}}</label>
            <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
            <div class="tooltip-content">{{__ "A human interpretation of the variable's value."}}</div>
            <input name="interpretation" value="{{interpretation}}" type="text">
        </div>
        <div class="panel minimum-maximum">
            <label class="has-icon">{{__ "Value"}}</label>
            <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
            <div class="tooltip-content">{{__ "Defines the maximum magnitude of numeric outcome variables, the maximum must be a positive value and the minimum may be negative."}}</div>
            <input name="normalMinimum" value="{{normalMinimum}}" data-increment=".1" type="text" />
            <label for="normalMaximum" class="spinner">{{__ "to"}}</label>
            <input name="normalMaximum" value="{{normalMaximum}}" data-increment=".1" data-min="0" type="text" />
        </div>
    </div>
</div>
{{/each}}