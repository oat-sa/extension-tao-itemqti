<div class="panel">
    <label for="display">{{__ "Display"}}</label>

    <select name="display" class="select2 short" data-has-search="false">
        <option value="inline">inline</option>
        <option value="block">block</option>
    </select>

    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <div class="tooltip-content">How the math expression should be displayed.</div>
</div>

<div class="panel">
    <label for="editMode">{{__ "Editing Mode"}}</label>

    <select name="editMode" class="select2 short" data-has-search="false">
        <option value="latex">LaTex (math)</option>
        <option value="mathml">MathML</option>
    </select>

    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <div class="tooltip-content">How the math expression should be edited.</div>
</div>

<div class="panel" data-role="latex">
    <label for="">{{__ "Latex"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">The identifier of the choice. This identifier must not be used by any other choice or item variable</div>

    <input type="text" 
           name="latex" 
           value="{{latex}}" 
           placeholder="x = {-b \pm \sqrt{b^2-4ac} \over 2a}" />
</div>

<div class="panel" data-role="mathml">
    <label for="">{{__ "MathML"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">The identifier of the choice. This identifier must not be used by any other choice or item variable</div>

    <textarea name="mathml">{{{mathML}}}</textarea>
</div>