<div class="panel">
    <div>
        <label for="src">{{__ 'File'}}</label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <div class="tooltip-content">{{__ 'The file path to the object.'}}</div>
        <input type="text" name="src" value="{{src}}" data-validate="$notEmpty; $fileExists(baseUrl={{baseUrl}})"/>
        <button class="btn-info small block" data-role="upload-trigger">{{__ 'Select object'}}</button>
    </div>
</div>

<div class="panel size-panel">
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

<div class="panel media-size-panel">
    <h3>{{__ 'Size and position'}}</h3>
    <div class="media-sizer">
        <!-- mediaEditorComponent goes here -->
    </div>
</div>
{{#if isCompactAppearanceAvailable}}
    {{#if isAudio}}
        <div class="panel compact-appearance">
            <label>
                <input name="compactAppearance" type="checkbox" {{#if compactAppearance}}checked="checked"{{/if}}/>
                <span class="icon-checkbox"></span>
                {{__ "Compact Appearance"}}
            </label>
            <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
            <span class="tooltip-content">
               {{__ "Set the media player UI to Compact mode, displaying only the play button icon, hiding all other controls such as volume, seek bar."}}
            </span>
        </div>
    {{/if}}
{{/if}}