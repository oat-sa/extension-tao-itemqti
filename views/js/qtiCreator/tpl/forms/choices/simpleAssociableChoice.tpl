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
    <h3>{{__ "Allowed number of usage"}}
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">
            The maximum number of choices this choice may be associated with. If matchMax is 0 there is no restriction.
        </span>
    </h3>

    <!--not supported yet-->
    <div style="display:none;">
        <label for="matchMin" class="spinner">Min</label>
        <input name="matchMin" value="{{matchMin}}" data-increment="1" data-min="0" data-max="100" type="text" />
    </div>
    
    <div>
        <label for="matchMax" class="spinner">Max</label>
        <input name="matchMax" value="{{matchMax}}" data-increment="1" data-min="0" data-max="100" type="text" />
    </div>
</div>