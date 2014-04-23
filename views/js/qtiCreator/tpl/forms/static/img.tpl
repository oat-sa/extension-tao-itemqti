<div class="panel">
    <label for="src">{{__ "file"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">The file path to the image.</div>
    <input type="text" name="src" value="{{src}}" />file mgr
</div>

<div class="panel">
    <label for="alt">{{__ "label"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">The text to be displayed if the image is not available.</div>
    <input type="text" name="alt" value="{{alt}}" data-validate="$notEmpty"/>
</div>

<div class="panel">
    <label for="longdesc">{{__ "description"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">A longer description of what the image represents.</div>
    <input type="text" name="longdesc" value="{{longdesc}}" data-validate="$notEmpty"/>
</div>

<div class="panel">
    <label for="size">{{__ "size"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">Size of the image</div>
    
    <label>
        <input name="responsive" type="checkbox" />
        <span class="icon-checkbox"></span>
        {{__ "adapt to item size"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        Recommended.
        Define whether the image size should automatically adapt to item size. 
        If this option is active, the image width and height will be a percentage of its text container.
    </span>
    
    <p class="img-resizer-slider"></p>
    <div class="to-src clearfix">
        <a href="#" data-hide-text="{{__ 'less'}}" data-toggle="~ .lightBlueGrey" class="toggler closed">more</a>
        <div class="toggled" style="display: none;">
            
            <label for="height">{{__ "height"}}</label><input type="text" name="height" value="{{height}}" data-validate="$integer"/>
            <label for="width">{{__ "width"}}</label><input type="text" name="width" value="{{width}}" data-validate="$integer"/>
            
            <label for="align">Positioning</label>
            <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <div class="tooltip-content">Define whether the image should be align to left of right</div>
            <select name="align" class="select2">
                <option value="none">default</option>
                <option value="left">left</option>
                <option value="right">right</option>
            </select>
        </div>
    </div>
</div>