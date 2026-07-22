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

    <input type="hidden" name="type" value="{{type}}" />
</div>
<hr/>
<div class="panel position-panel">
    <h3>{{__ 'Choices position'}}</h3>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ 'Configures the position of the choices relative to the image.'}}
    </span>
    <div>
        <label class="smaller-prompt">
            <input type="radio" name="position" value="top" {{#equal position 'top'}}checked{{/equal}} />
            <span class="icon-radio"></span>
            {{__ 'Top'}}
        </label>
        <br>
        <label class="smaller-prompt">
            <input type="radio" name="position" value="bottom" {{#equal position 'bottom'}}checked{{/equal}} />
            <span class="icon-radio"></span>
            {{__ 'Bottom'}}
        </label>
        <br>
        <label class="smaller-prompt">
            <input type="radio" name="position" value="left" {{#equal position 'left'}}checked{{/equal}} />
            <span class="icon-radio"></span>
            {{__ 'Left'}}
        </label>
        <br>
        <label class="smaller-prompt">
            <input type="radio" name="position" value="right" {{#equal position 'right'}}checked{{/equal}} />
            <span class="icon-radio"></span>
            {{__ 'Right'}}
        </label>
    </div>
</div>
