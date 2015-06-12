<div class="spoken-form-container">
    <div class="field">
        <label>{{__ 'Spoken text'}}</label>
        <textarea name="spokenText">{{spokenText}}</textarea>
    </div>
    <div class="field">
        <label>{{__ 'Text to speech pronunciation'}}</label>
        <textarea name="textToSpeechPronunciation">{{textToSpeechPronunciation}}</textarea>
    </div>
    <div class="audio-file-form-container js-audio-file-form-container">
        
    </div>
    <div class="field">
        <a class="btn-info small js-add-audio-file"><span class="icon-add"></span> {{__ 'Add audio file'}}</a>
    </div>
</div>
<script id="audio-file-template" type="text/x-handlebars-template">
<div class="audio-file-form">
    <span class="icon-close js-remove-audio-file-form" data-audio-file-index="\{{num}}"></span>
    <div class="field">
        <label>
            <div>{{__ 'File'}}</div>
            <input class="file-uploader-field" type="text" name="audioFileInfo[\{{num}}].fileHref" readonly="readonly" placeholder="Please select file" value="\{{fileHref}}"/>
        </label>
    </div>
    <div class="field">
        <label>{{__ 'Start time'}}</label>
        <input name="audioFileInfo[\{{num}}].startTime" value="\{{startTime}}"/>
    </div>
    <div class="field">
        <label>{{__ 'Duration'}}</label>
        <input name="audioFileInfo[\{{num}}].duration" value="\{{duration}}"/>
    </div>
</div>
</script>