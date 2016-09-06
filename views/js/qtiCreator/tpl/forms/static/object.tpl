<div class="panel">
    <label for="src">{{__ 'File'}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'The file path to the object.'}}</div>
    <input type="text" name="src" value="{{src}}" data-validate="$notEmpty; $fileExists(baseUrl={{baseUrl}})"/>
    <button class="btn-info small block" data-role="upload-trigger">{{__ 'Select object'}}</button>
</div>

<hr/>

<div data-role="advanced" style="display:none">
    <h3>{{__ 'Size and position'}}</h3>
    <div class="panel img-resizer"></div>
</div>