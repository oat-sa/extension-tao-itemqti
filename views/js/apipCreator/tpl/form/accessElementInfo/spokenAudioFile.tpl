<div class="audio-file-form">
    <span class="icon-close js-remove-audio-file-form" data-audio-file-index="{{num}}"></span>
    <div class="field">
        <label>
            <div>{{__ 'File'}}</div>
            <input class="file-uploader-field" type="text" name="audioFileInfo[{{num}}].fileHref" readonly="readonly" placeholder="Please select file" value="{{fileHref}}"/>
        </label>
    </div>
    <div class="field">
        <label>{{__ 'Start time'}}</label>
        <input name="audioFileInfo[{{num}}].startTime" value="{{startTime}}"/>
    </div>
    <div class="field">
        <label>{{__ 'Duration'}}</label>
        <input name="audioFileInfo[{{num}}].duration" value="{{duration}}"/>
    </div>
    <div class="field">
        <label>{{__ 'Voice type'}}</label>
        <select name="audioFileInfo[{{num}}].voiceType">
            <option value="synthetic">{{__ 'Synthetic'}}</option>
            <option value="human">{{__ 'Human'}}</option>
        </select>
    </div>
    <div class="field">
        <label>{{__ 'Voice speed'}}</label>
        <select name="audioFileInfo[{{num}}].voiceSpeed">
            <option value="standard">{{__ 'Standard'}}</option>
            <option value="fast">{{__ 'Fast'}}</option>
            <option value="slow">{{__ 'Slow'}}</option>
        </select>
    </div>
</div>