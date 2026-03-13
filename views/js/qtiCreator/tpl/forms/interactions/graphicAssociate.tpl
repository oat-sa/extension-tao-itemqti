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
    <h3>{{__ "Association display"}}</h3>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ "Controls the visual style of association links. Line shows non-directional links. Arrow adds an arrowhead to indicate direction and works together with Start/End hotspot settings."}}</div>

    <div>
        <label class="smaller-prompt">
            <input type="radio" name="data-interaction-subtype" value="arrow" {{#if arrowMode}}checked{{/if}} />
            <span class="icon-radio"></span>
            {{__ "Arrow"}}
        </label>
        <br>
        <label class="smaller-prompt">
            <input type="radio" name="data-interaction-subtype" value="line" {{#unless arrowMode}}checked{{/unless}} />
            <span class="icon-radio"></span>
            {{__ "Line"}}
        </label>
    </div>
</div>
