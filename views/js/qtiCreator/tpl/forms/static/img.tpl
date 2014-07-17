<div class="panel">
    <label for="src">{{__ 'File'}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'The file path to the image.'}}</div>
    <input type="text" name="src" value="{{src}}" data-validate="$notEmpty; $fileExists(baseUrl={{baseUrl}})"/>
    <button class="btn-info small block" data-role="upload-trigger">{{__ 'Select image'}}</button>
</div>

<div class="panel">
    <label for="alt">{{__ "Label"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'The text to be displayed if the image is not available.'}}</div>
    <input type="text" name="alt" value="{{alt}}" data-validate="$notEmpty" placeholder="e.g. House with a garden"/>
</div>


<div data-role="advanced" style="display:none">
    <div class="panel">
        <h3>{{__ 'Size'}}</h3>

        <div class="media-sizer media-sizer-synced">

            <label>
                <input type="checkbox" checked="checked" class="media-mode-switch"/>
                <span class="icon-checkbox"></span>
                {{__ 'Responsive mode'}}
            </label>
            <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
            <div class="tooltip-content">{{__ 'The image resizes along with its container.'}}</div>


            <div class="media-sizer-percent">
                <label for="">{{__ 'Size'}}</label>
                <span class="item-editor-unit-input-box">
                    <input type="text" name="width" value="{{width}}" data-validate="$numeric" data-validate-option="$allowEmpty;" />
                </span>

                <div class="media-sizer-slider-box">
                    <div class="media-sizer-slider"></div>
                </div>
            </div>

            <div class="media-sizer-pixel" style="display:block">
                <label for="">{{__ 'Width'}}</label>
                <span class="item-editor-unit-input-box">
                    <input type="text" name="width" value="{{width}}" data-validate="$numeric" data-validate-option="$allowEmpty;" />
                </span>

                <label for="">{{__ 'Height'}}</label>
                <span class="item-editor-unit-input-box">
                    <input type="text" name="height" value="{{height}}" data-validate="$numeric" data-validate-option="$allowEmpty;" />
                </span>

                <div class="media-sizer-link">
                    <span class="icon-link"></span>
                </div>

                <div class="media-sizer-slider-box">
                    <div class="media-sizer-slider"></div>
                    <div class="media-sizer-cover"></div>
                </div>
            </div>
        </div>


        <div><br><br>legacy stuff</div>

        <!--not available yet-->
        <!--    <label>
        <input name="responsive" type="checkbox" />
        <span class="icon-checkbox"></span>
        {{__ 'Adapt to item size'}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        Recommended.
        Define whether the image size should automatically adapt to item size.
        If this option is active, the image width and height will be a percentage of its text container.
    </span>-->


        <label for="height">{{__ 'Height'}}</label>
        <span id="item-editor-font-size-manual-input" class="item-editor-unit-input-box">
            <input type="text" name="height" value="{{height}}" data-validate="$numeric" data-validate-option="$allowEmpty;"/>
            <span class="unit-indicator">px</span>
        </span>
    </div>
    <div class="panel">

        <label for="width">{{__ 'Width'}}</label>
        <span id="item-editor-font-size-manual-input" class="item-editor-unit-input-box">
            <input type="text" name="width" value="{{width}}" data-validate="$numeric" data-validate-option="$allowEmpty;"/>
            <span class="unit-indicator">px</span>
        </span>
    </div>
    <div class="panel">

        <label for="align">{{__ "Alignmentx"}}</label>
        <select name="align" class="select2" data-has-search="false">
            <option value="default">{{__ 'default'}}</option>
            <option value="left">{{__ 'left'}}</option>
            <option value="right">{{__ 'right'}}</option>
        </select>
    </div>
</div>
