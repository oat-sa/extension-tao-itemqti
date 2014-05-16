<div class="panel">
    <h3>{{__ "Allowed number of choices"}}
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">
            The minimum number of choices that the candidate is required to select to form a valid response.
            The maximum number of choices that the candidate is allowed to select.
        </span>
    </h3>

    <div>
        <label for="minChoices" class="spinner">Min</label>
        <input name="minChoices" value="{{minChoices}}" data-increment="1" data-min="0" data-max="{{choicesCount}}" type="text" />
    </div>
    <div>
        <label for="maxChoices" class="spinner">Max</label>
        <input name="maxChoices" value="{{maxChoices}}" data-increment="1" data-min="0" data-max="{{choicesCount}}" type="text" />
    </div>
</div>
