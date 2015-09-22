<div class="spoken-form-container">
    <div class="field">
        <label>{{__ 'Spoken text'}}</label>
        <textarea data-validate="$notEmpty(message='This field is required');" name="spokenText">{{spokenText}}</textarea>
    </div>
    <div class="field">
        <label>{{__ 'Text to speech pronunciation'}}</label>
        <textarea name="textToSpeechPronunciation">{{textToSpeechPronunciation}}</textarea>
    </div>
    <div class="audio-file-form-container js-audio-file-form-container" style="display: none;">
        
    </div>
    <div class="field">
        <a class="btn-info small js-add-audio-file"><span class="icon-add"></span> {{__ 'Add audio file'}}</a>
    </div>
</div>