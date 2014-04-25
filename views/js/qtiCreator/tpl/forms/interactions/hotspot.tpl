
<div class="panel">
    <label for="">{{__ "identifier"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">The identifier of the choice. This identifier must not be used by any other choice or item variable</div>

    <input type="text" 
           name="identifier" 
           value="{{identifier}}" 
           placeholder="choice_id" 
           data-validate="$notEmpty; $qtiIdentifier; $availableIdentifier(serial={{serial}});">
</div>

<div class="panel">
    <label>
        <input name="fixed" type="checkbox" {{#if fixed}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "fixed"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        If the shuffle attribute is true then the delivery engine will randomize the order in which the choices are initially presented.
        However each choice may be "shuffled" of "fixed" individually.
    </span>
</div>
