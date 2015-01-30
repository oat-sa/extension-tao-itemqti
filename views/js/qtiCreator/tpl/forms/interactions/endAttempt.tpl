<div class="panel">
    <label for="" class="has-icon">{{__ "Response identifier"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'The identifier of the response identifier. This identifier must not be used by any other response or item variable. An identifier is a string of characters that must start with a Letter or an underscore ("_") and contain only Letters, underscores, hyphens ("-"), period (".", a.k.a. full-stop), Digits, CombiningChars and Extenders.'}}</div>

    <input type="text" 
           name="responseIdentifier" 
           value="{{responseIdentifier}}" 
           placeholder="e.g. END_ATTEMPT" 
           data-validate="$notEmpty; $qtiIdentifier; $availableIdentifier(serial={{responseSerial}});">
</div>

<div class="panel">
    <label for="" class="has-icon">{{__ "Label"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'The button label.'}}</div>

    <input type="text" 
           name="title" 
           value="{{title}}" 
           placeholder="e.g. End Attempt" 
           data-validate="$notEmpty;">
</div>