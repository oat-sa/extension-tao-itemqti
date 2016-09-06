<div class="panel">
    <div>
        <label for="src">
            <div>{{__ 'File'}}</div>
            <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
            <div class="tooltip-content">{{__ 'The file path to the object.'}}</div>
            <input type="text" name="src" value="{{src}}" data-validate="$notEmpty; $fileExists(baseUrl={{baseUrl}})"/>
            <div><button class="btn-info small block" data-role="upload-trigger">{{__ 'Select object'}}</button></div>
        </label>
    </div>

    <div>
        <label for="width" class="spinner">Width</label>
        <input name="width" value="{{width}}" type="text"   data-increment="1" data-min="0" data-max="1920" style='min-width: 55px!important;' />
    </div>

    <div>
        <label for="height" class="spinner">Height</label>
        <input name="height" value="{{height}}" type="text"  data-increment="1" data-min="0" data-max="1080" style='min-width: 55px!important;' />
    </div>

</div>