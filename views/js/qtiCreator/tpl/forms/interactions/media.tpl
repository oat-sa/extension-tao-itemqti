<div class="panel">
      TO BE COMPLETED : add "object" editor (see : http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10173)
</div>

<div class="panel">
    <label>
        <input name="autostart" type="checkbox" {{#if autostart}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "autostart"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        The autostart attribute determines if the media object should begin as soon as the candidate starts the attempt (checked) or if the media object should be started under the control of the candidate (unchecked).
    </span>
</div>
    
<div class="panel">
    <label>
        <input name="loop" type="checkbox" {{#if loop}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "loop"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        The loop attribute is used to set continuous play mode. In continuous play mode, once the media object has started to play it should play continuously (subject to maxPlays).
    </span>
</div>

<div class="panel">
    <h3>{{__ "Allowed number of choices"}}
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">
            The minPlays attribute indicates that the media object should be played a minimum number of times by the candidate. 
            The maxPlays attribute indicates that the media object can be played at most maxPlays times - it must not be possible for the candidate to play the media object more than maxPlay times. A value of 0 (the default) indicates that there is no limit.
        </span>
    </h3>

    <div>
        <label for="minPlays" class="spinner">Min</label>
        <input name="minPlays" value="{{minPlays}}" data-increment="1" data-min="0" data-max="1000" type="text" />
    </div>
    <div>
        <label for="maxPlays" class="spinner">Max</label>
        <input name="maxPlays" value="{{maxPlays}}" data-increment="1" data-min="0" data-max="1000" type="text" />
    </div>
</div>