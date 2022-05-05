<div class="panel">
    <label for="">{{__ "identifier"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'The identifier of the choice. This identifier must not be used by any other choice or item variable. An identifier is a string of characters that must start with a Letter or an underscore ("_") and contain only Letters, underscores, hyphens ("-"), period (".", a.k.a. full-stop), Digits, CombiningChars and Extenders.'}}</div>

    <input type="text"
            name="identifier"
            value="{{identifier}}"
            placeholder="e.g. my-hotspot_1"
            data-validate="$notEmpty; $qtiIdentifier; $availableIdentifier(serial={{serial}});">
</div>
<div class="panel">
    <h3>{{__ "Choice Image"}}</h3>

    <div class="panel">
        <label for="data">{{__ 'File'}}</label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <div class="tooltip-content">{{__ 'The file path to the image.'}}</div>
        <input type="text" name="data" value="{{data}}" data-validate="$notEmpty; $fileExists(baseUrl={{baseUrl}})"/>
        <button class="btn-info small block" data-role="upload-trigger">{{__ 'Select image'}}</button>
    </div>

    <div class="panel media-sizer-panel">
        <!-- media sizer goes here -->
    </div>

    <input name="type" type="hidden" value="{{type}}" type="text" />
</div>
<div class="panel min-max-panel">
    <h3>{{__ "Max. number of matches"}} </h3>
</div>
<div class="response-matchmax-info gapImg{{#unless isInfinityMatchMax}} hidden{{/unless}}">
    <p class="feedback-info">{{__ 'The MAXSCORE of this item is removed because the current interaction settings allow an infinite value to the score.'}}</p>
</div>
