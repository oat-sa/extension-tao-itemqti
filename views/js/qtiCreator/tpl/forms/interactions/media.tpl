<div class="panel">
    <div>
        <label>
            <div>{{__ 'Media file path or YouTube video address'}}</div>
            <input type="text" name="data" placeholder="Please select media file" value="{{data}}" data-validate="$notEmpty;"/>
            <div><button class='selectMediaFile btn-info small block'>{{__ 'Select media file'}}</button></div>
        </label>
    </div>

    {{#unless isAudio}}
        <h3 class="media-sizer-panel-label">{{__ 'Size and position'}}</h3>
        <div class="panel media-sizer-panel">
            <!-- mediaEditorComponent goes here -->
        </div>
    {{/unless}}
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

{{#if isFlaAvailable }}
    {{#if isAudio}}
        {{#if autostart}}
            <div class="panel autostart-subpanel">
                <div class="min-max-panel">
                    <label class="spinner">
                        {{__ 'after'}}
                        <input type="text" name="autostartDelayMs" class="incrementer {{#unless hidePlayer}}disabled{{/unless}}" value="{{autostartDelayMs}}" {{#unless hidePlayer}}disabled{{/unless}} data-increment="10" data-min="0" data-max="{{#unless hidePlayer}}0{{else}}600{{/unless}}" />
                        {{__ 'seconds'}}
                    </label>
                </div>

                <div>
                    <label>
                        <input name="hidePlayer" type="checkbox" {{#unless hidePlayer}}checked="checked"{{/unless}}/>
                        <span class="icon-checkbox"></span>
                        {{__ "Display media player"}}
                    </label>
                    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
                    <span class="tooltip-content">{{__ "This shows or hides the entire audio player from view. Test takers will not be able to play, pause, or change the volume level."}}
                    </span>
                </div>

                <div>
                    <label>
                        <input name="sequential" type="checkbox" {{#if sequential}}checked="checked"{{/if}}/>
                        <span class="icon-checkbox"></span>
                        {{__ "Sequential"}}
                    </label>
                    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
                    <span class="tooltip-content">{{__ "Indicates that the audio forms part of a sequence with other sequential interactions. The advancing of the sequence is handled by the delivery engine. Delays are also respected."}}
                    </span>
                </div>
            </div>
        {{/if}}
    {{/if}}
{{/if}}

<div class="panel">
    <label>
        <input name="loop" type="checkbox" {{#if loop}}checked="checked"{{/if}} {{#if sequential}}disabled{{/if}}/>
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
        <input name="pause" type="checkbox" {{#if pause}}checked="checked"{{/if}} {{#if hidePlayer}}disabled{{/if}}/>
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
        <input name="maxPlays" value="{{maxPlays}}" class="large" data-increment="1" data-min="0" data-max="{{#if sequential}}1{{else}}1000{{/if}}" type="text" />
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">
            {{__ "The maxPlays attribute indicates that the media object can be played at most maxPlays times - it must not be possible for the candidate to play the media object more than maxPlay times. A value of 0 (the default) indicates that there is no limit."}}
        </span>
    </div>
</div>
