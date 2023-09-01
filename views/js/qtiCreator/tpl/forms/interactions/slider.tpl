
<div class="panel">
    <div>
        <label for="lowerBound" class="spinner">{{__ "Lower Bound"}}</label>
        <input name="lowerBound" value="{{lowerBound}}" data-increment="1" data-min="0" type="text" />
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <span class="tooltip-content lower-bound-content">{{__ "The lower bound of the slider"}}</span>
    </div>
    <div>
        <label for="upperBound" class="spinner">{{__ "Upper Bound"}}</label>
        <input name="upperBound" value="{{upperBound}}" data-increment="1" data-min="0" type="text" />
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <span class="tooltip-content upper-bound-content">{{__ "The upper bound of the slider"}}</span>
    </div>
</div>

<div class="panel">
    <label for="step" class="spinner">{{__ "Step"}}</label>
    <input name="step" value="{{step}}" data-increment="1" data-min="0" data-max="{{upperBound}}" type="text" />
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "The number of units corresponding to a step on the slider"}}</span>
</div>
