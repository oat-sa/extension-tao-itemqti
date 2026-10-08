<div class="panel">
    <label for="">{{__ "Identifier"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'The identifier of the choice. This identifier must not be used by any other choice or item variable. An identifier is a string of characters that must start with a Letter or an underscore ("_") and contain only Letters, underscores, hyphens ("-"), period (".", a.k.a. full-stop), Digits, CombiningChars and Extenders.'}}</div>

    <input type="text"
           name="identifier"
           value="{{identifier}}"
           placeholder="e.g. my-gaptext_1"
           data-validate="$notEmpty; $qtiIdentifier; $availableIdentifier(serial={{serial}});">
</div>
<div class="panel">
    <label for="gapTextLabel">{{__ "Label"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'The text displayed on this draggable gap choice.'}}</div>
    <input type="text"
           id="gapTextLabel"
           name="gapTextLabel"
           value="{{label}}"
           placeholder="{{__ 'Enter label text'}}"
           data-validate="$notEmpty;">
</div>
