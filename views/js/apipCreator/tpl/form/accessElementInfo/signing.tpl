<div class="signing-form-container">
    <div class="field">
        <label>
            <div>{{__ 'File'}}</div>
            <input type="text" name="{{type}}.videoFileInfo.fileHref" placeholder="Please select file" value="{{fileHref}}"/>
        </label>
    </div>
    <div class="field">
        <label>{{__ 'Start time'}}</label>
        <input type="text" name="{{type}}.videoFileInfo.startCue" value="{{startCue}}"/>
    </div>
    <div class="field">
        <label>{{__ 'End time'}}</label>
        <input type="text" name="{{type}}.videoFileInfo.endCue" value="{{endCue}}"/>
    </div>
</div>