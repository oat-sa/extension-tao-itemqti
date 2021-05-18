{{#if mathjax}}

<div class="panel">
    <label for="display" class="has-icon">{{__ "Display"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ "How the math expression should be displayed."}}</div>

    <select name="display" class="select2" data-has-search="false">
        <option value="inline">{{__ "inline"}}</option>
        <option value="block">{{__ "block"}}</option>
    </select>
</div>

<div class="panel">
    <label for="editMode" class="has-icon">{{__ "Editing Mode"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ "How the math expression should be edited"}}.</div>

    <select name="editMode" class="select2" data-has-search="false">
        <option value="latex">{{__ "LaTeX"}}</option>
        <option value="mathml">{{__ "MathML"}}</option>
    </select>

</div>

<div class="panel" data-role="latex" style="display:none;">
    <label for="sidebar-latex-field" class="has-icon">{{__ "Latex"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ "Edit math expression using LaTex type setting system, e.g. e^{i \pi} = -1"}}</div>

    <input id="sidebar-latex-field" type="text" name="latex" value="{{latex}}" placeholder="e.g. e^{i \pi} = -1"/>

    <div class="panel">
        <button class="btn-info small block popup-btn" data-control="latex">{{__ "Large editor"}}</button>
        <button class="btn-info small block popup-btn" data-control="latexWysiwyg">{{__ "WYSIWYG editor"}}</button>
    </div>
</div>

<div class="panel" data-role="mathml" style="display:none;">
    <label for="sidebar-mathml-field" class="has-icon">{{__ "MathML"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ "Edit math expression using MathML"}}</div>

    <textarea id="sidebar-mathml-field" name="mathml">{{{mathml}}}</textarea>

    <div class="panel">
        <button class="btn-info small block popup-btn" data-control="mathml">{{__ "Large editor"}}</button>
    </div>

    <div class="math-buffer" style="visibility:hidden;"></div>
</div>

{{else}}
<div class="panel">
    {{__ "MathJax is not installed."}}
</div>
{{/if}}
