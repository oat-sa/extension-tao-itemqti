<div class="panel">

    <div>
        <label>
            <div>{{__ 'Media file path or YouTube video address'}}</div>
            <input type="text" name="data" placeholder="Please select media file" value="{{data}}" data-validate="$notEmpty;"/>
            <div><button class='selectMediaFile btn-info small block'>{{__ 'Select media file'}}</button></div>
        </label>
    </div>

    <h3 class="media-sizer-panel-label">{{__ 'Size and position'}}</h3>
    <div class="panel media-sizer-panel">
        <!-- mediaEditorComponent goes here -->
    </div>

</div>

<div class="panel">
    <label>
        <input name="autostart" type="checkbox" {{#if autostart}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Autostart"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "The autostart attribute determines if the media object should begin as soon as the candidate starts the attempt (checked) or if the media object should be started under the control of the candidate (unchecked)."}}
    </span>
</div>

<div class="panel">
    <label>
        <input name="loop" type="checkbox" {{#if loop}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Loop"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
       {{__ "The loop attribute is used to set continuous play mode. In continuous play mode, once the media object has started to play it should play continuously (subject to maxPlays)."}}
    </span>
</div>

<div class="panel">
    <label>
        <input name="pause" type="checkbox" {{#if pause}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Pause"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
       {{__ "Enable the test taker to pause and restart the playing."}}
    </span>
</div>

<div class="panel">
    <div>
        <label for="maxPlays" class="spinner">{{__ 'Max plays count'}}</label>
        <input name="maxPlays" value="{{maxPlays}}" class="large" data-increment="1" data-min="0" data-max="1000" type="text" />
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">
            {{__ "The maxPlays attribute indicates that the media object can be played at most maxPlays times - it must not be possible for the candidate to play the media object more than maxPlay times. A value of 0 (the default) indicates that there is no limit."}}
        </span>
    </div>
</div>
