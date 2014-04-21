<div class="panel">
    <label for="">{{__ "identifier"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">Same with an input</div>

    <input type="text" 
           name="identifier" 
           value="{{identifier}}" 
           placeholder="choice_id" 
           data-validate="$notEmpty; $qtiIdentifier; $availableIdentifier(serial={{serial}});">
</div>
<div class="panel">
    <h3>{{__ "allowed number of association"}}</h3>
    <label for="minAssociations" class="spinner">Min</label>
    <input name="minAssociations" value="0" data-increment="5" data-min="0" data-max="100" type="text">
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">whatever</span>


    <label for="maxAssociations" class="spinner">Max</label>
    <input name="maxAssociations" value="0" data-increment="5" data-min="0" data-max="100" type="text">
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">whatever</span>

</div>