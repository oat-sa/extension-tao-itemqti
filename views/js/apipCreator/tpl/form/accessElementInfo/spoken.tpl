<div class="spoken-form-container">
    <div class="field">
        <label>{{__ 'Spoken text'}}</label>
        <textarea name="spokenText">{{spokenText}}</textarea>
    </div>
    <div class="field">
        <label>{{__ 'Text to speech pronunciation'}}</label>
        <textarea name="textToSpeechPronunciation">{{textToSpeechPronunciation}}</textarea>
    </div>
    <div class="js-audio-file-form-container">
        
    </div>
    <div class="field">
        <a class="btn-info small js-add-audio-file"><span class="icon-add"></span> {{__ 'Add audio file'}}</a>
    </div>
</div>
<script id="audio-file-template" type="text/x-handlebars-template">
<div class="audio-file-form">
    <div class="field">
        <label>
            <div>{{__ 'File'}}</div>
            <input type="text" name="{{type}}.videoFileInfo.fileHref" readonly="readonly" placeholder="Please select file" value="{{fileHref}}"/>
            <button class="selectMediaFile btn-info small block">{{__ 'Select media file'}}</button>
        </label>
    </div>
    <div class="field">
        <label>{{__ 'Start time'}}</label>
        <input name="{{type}}.videoFileInfo.startCue" value="{{startTime}}"/>
    </div>
    <div class="field">
        <label>{{__ 'Duration'}}</label>
        <input name="{{type}}.videoFileInfo.endCue" value="{{duration}}"/>
    </div>
</div>
</script>