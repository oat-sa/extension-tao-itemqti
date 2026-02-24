<div class="panel">

    <h3>{{__ "Interaction Background"}}</h3>

    <div class="panel">
        <label for="data">{{__ 'File'}}</label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <div class="tooltip-content">{{__ 'The file path to the image.'}}</div>
        <input type="text" name="data" value="{{data}}" data-validate="$notEmpty; $fileExists(baseUrl={{baseUrl}})"/>
        <button class="btn-info small block" data-role="upload-trigger">{{__ 'Select image'}}</button>
    </div>

    <div class="panel media-sizer-panel">
        <!-- media sizer goes here -->
    </div>
    <input name="width" value="{{width}}" type="hidden" />
    <input name="height" value="{{height}}" type="hidden" />


    <input name="type" value="{{type}}" type="hidden" readonly />

</div>
<div class="panel min-max-panel">

    <h3>{{__ "Allowed associations"}}</h3>
</div>

<div class="panel">
    <h3>{{__ "Association mode"}}</h3>

    <div class="panel">
        <label for="data-interaction-subtype">{{__ "Arrow mode"}}</label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <div class="tooltip-content">{{__ "Enable directional associations (start to end). Disable to keep classic undirected associations."}}</div>
        <input type="checkbox" name="data-interaction-subtype"{{#if arrowMode}} checked{{/if}} />
    </div>
</div>
