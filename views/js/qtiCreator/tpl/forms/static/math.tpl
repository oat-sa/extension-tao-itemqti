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
        <option value="latex">LaTex</option>
        <option value="mathml">MathML</option>
    </select>

    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <div class="tooltip-content">How the math expression should be edited.</div>
</div>

<div class="panel" data-role="latex" style="display:none;">
    <label for="">{{__ "Latex"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">Edit math expression using LaTex typesetting system, e.g. e^{i \pi} = -1</div>

    <input type="text" name="latex" value="{{latex}}" placeholder="e.g. e^{i \pi} = -1"/>
</div>

<div class="panel" data-role="mathml" style="display:none;">
    <label for="">{{__ "MathML"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">Edit math expression using MathML</div>

    <textarea name="mathml">{{{mathml}}}</textarea>
    <div class="math-buffer" style="visibility:hidden;"></div>
</div>