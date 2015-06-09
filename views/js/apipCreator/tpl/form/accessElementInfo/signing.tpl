<div class="signing-form-container">
    <div class="field">
        <label>
            <div>{{__ 'File'}}</div>
            <input type="text" name="{{type}}.videoFileInfo.fileHref" placeholder="Please select file" value="{{fileHref}}"/>
            <button class="selectMediaFile btn-info small block">{{__ 'Select media file'}}</button>
        </label>
    </div>
    <div class="field">
        <label>{{__ 'Start time'}}</label>
        <input name="{{type}}.videoFileInfo.startCue" value="{{startCue}}"/>
    </div>
    <div class="field">
        <label>{{__ 'End time'}}</label>
        <input name="{{type}}.videoFileInfo.endCue" value="{{endCue}}"/>
    </div>
</div>