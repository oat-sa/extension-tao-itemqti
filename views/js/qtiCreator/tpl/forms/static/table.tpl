<div class="panel">
    <div>
        <label for="src">{{__ 'File'}}</label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
        <div class="tooltip-content">{{__ 'The file path to the object.'}}</div>
        <input type="text" name="src" value="{{src}}" data-validate="$notEmpty; $fileExists(baseUrl={{baseUrl}})"/>
        <button class="btn-info small block" data-role="upload-trigger">{{__ 'Select object'}}</button>
    </div>
</div>

<div class="panel">
    <div>
        <label for="width" class="spinner">Width</label>
        <input name="width" value="{{width}}" type="text" class="large" data-increment="10" data-min="10"
               data-max="1920"/>
    </div>
    <div>
        <label for="height" class="spinner">Height</label>
        <input name="height" value="{{height}}" type="text" class="large" data-increment="10" data-min="10"
               data-max="1080"/>
    </div>
</div>

<div class="panel">
    <label for="view">Visible by</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <div class="tooltip-content">
        {{__ "A rubric block identifies part of an assessmentItem's itemBody that represents instructions to one or more of the actors that view the item. Although rubric blocks are defined as simpleBlocks they must not contain interactions."}}
    </div>
    <select name="view" class="select2" data-has-search="false">
        <option value="author">author</option>
        <option value="candidate">candidate</option>
        <option value="proctor">proctor</option>
        <option value="scorer">scorer</option>
        <option value="testConstructor">test constructor</option>
        <option value="tutor">tutor</option>
    </select>
</div>