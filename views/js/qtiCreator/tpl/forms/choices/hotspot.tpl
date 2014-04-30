
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
