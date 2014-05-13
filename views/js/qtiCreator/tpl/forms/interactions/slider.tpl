<div class="panel">
	<div>
        <label for="lowerBound" class="spinner">{{__ "Lower Bound"}}</label>
        <input name="lowerBound" value="{{lowerBound}}" data-increment="1" data-min="0" type="text" />
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
		<span class="tooltip-content">{{__ "Lowerbound attribute"}}</span>
    </div>
    
    <div>
        <label for="upperBound" class="spinner">{{__ "Upper Bound"}}</label>
        <input name="upperBound" value="{{upperBound}}" data-increment="1" data-min="0" type="text" />
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
		<span class="tooltip-content">{{__ "UpperBound attribute"}}</span>
    </div>
    
    <div>
        <label for="orientation" class="spinner">{{__ "Orientation"}}</label>
        <select name="orientation" class="select2" data-has-search="false">
    		<option value="horizontal">{{__ "Horizontal"}}</option>
    		<option value="vertical">{{__ "Vertical"}}</option>
    	</select>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
		<span class="tooltip-content">{{__ "Orientation attribute"}}</span>
    </div>
    
    <div>
    	<label>
        	<input name="reverse" type="checkbox" {{#if reverse}}checked="checked"{{/if}}/>
        	<span class="icon-checkbox"></span>
        	{{__ "Reverse"}}
    	</label>
    	<span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    	<span class="tooltip-content">{{__ "Reverse Attribute"}}</span>
    </div>
    
    <div>
        <label for="step" class="spinner">{{__ "Step"}}</label>
        <input name="step" value="{{step}}" data-increment="1" data-min="1" type="text" />
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
		<span class="tooltip-content">{{__ "Step Attribute"}}</span>
    </div>
    
    <div>
        <label>
        	<input name="stepLabel" type="checkbox" {{#if reverse}}checked="checked"{{/if}}/>
        	<span class="icon-checkbox"></span>
        	{{__ "StepLabel"}}
    	</label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
		<span class="tooltip-content">{{__ "StepLabel Attribute"}}</span>
    </div>
</div>