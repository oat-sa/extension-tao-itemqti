<div class="panel">
    <div>
        <label for="src">{{__ 'File'}}</label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <div class="tooltip-content">{{__ 'The file path to the object.'}}</div>
        <input type="text" name="src" value="{{src}}" data-validate="$notEmpty; $fileExists(baseUrl={{baseUrl}})"/>
        <button class="btn-info small block" data-role="upload-trigger">{{__ 'Select object'}}</button>
    </div>
</div>

<div class="panel">
    <div>
        <label for="width" class="spinner">Width</label>
        <input name="width" value="{{width}}" type="text" class="large" data-increment="10" data-min="10"
               data-max="1920"/>
    </div>
    <div>
        <label for="height" class="spinner">Height</label>
        <input name="height" value="{{height}}" type="text" class="large" data-increment="10" data-min="10"
               data-max="1080"/>
    </div>
</div>