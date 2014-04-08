<div class="panel">
    <label for="">{{__ "identifier"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">Same with an input</div>

    <input type="text" value="{{identifier}}" placeholder="choice_id">
</div>
<div class="panel">
    <h3>{{__ "allowed number of association"}}</h3>
    <label for="a-number" class="spinner">Min</label>
    <input name="a-number" value="0" data-increment="5" data-min="0" data-max="100" type="text">
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content"
          data-tooltip-theme="info"></span>
    <span class="tooltip-content">whatever</span>


    <label for="a-number" class="spinner">Max</label>
    <input name="a-number" value="0" data-increment="5" data-min="0" data-max="100" type="text">
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content"
          data-tooltip-theme="info"></span>
    <span class="tooltip-content">whatever</span>

</div>