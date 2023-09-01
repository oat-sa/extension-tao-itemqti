
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
<div class="panel min-max-panel">
    <h3>{{__ "Allowed number of matches"}}</h3>
</div>

<div class="response-matchmax-info hotspot{{#unless isInfinityMatchMax}} hidden{{/unless}}">
    <p class="feedback-info">{{__ 'The MAXSCORE of this item is removed because the current interaction settings allow an infinite value to the score.'}}</p>
</div>

<div class="panel">
    <h3>{{__ "Shape position"}}</h3>

    <div class="panel">
        <label for="x">{{__ 'Left'}}</label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <div class="tooltip-content">{{__ "The left position of the shape relative to the top left corner of the background in pixels. This value may be scaled when the background image size is adapted to it's container"}}</div>
        <input name="x" value="{{x}}" type="text" readonly />
    </div>

    <div class="panel">
        <label for="y">{{__ 'Top'}}</label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <div class="tooltip-content">{{__ "The top position of the shape relative to the top left corner of the background in pixels. This value may be scaled when the background image size is adapted to it's container"}}</div>
        <input name="y" value="{{y}}" type="text" readonly />
    </div>

    <div class="panel">
        <label for="width">{{__ 'Width'}}</label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <div class="tooltip-content">{{__ "The shape width in pixels. This value may be scaled when the background image size is adapted to it's container"}}</div>
        <input name="width" value="{{width}}" type="text" readonly />
    </div>

    <div class="panel">
        <label for="height">{{__ 'Height'}}</label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <div class="tooltip-content">{{__ "The shape height in pixels. This value may be scaled when the background image size is adapted to it's container"}}</div>
        <input name="height" value="{{height}}" type="text" readonly />
    </div>
</div>

