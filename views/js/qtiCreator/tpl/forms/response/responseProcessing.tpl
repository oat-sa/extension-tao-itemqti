<h2>Response Processing</h2>
<div>
    <h3 data-in-place="#response-identifier" data-role="identifier">{{identifier}}</h3>
    <input id="response-identifier" type="hidden">
</div>
<div>
    <label>
        <input name="template" type="radio" value="correct" data-role="template">
        <span class="icon-radio"></span>
        {{__ "correct"}}
    </label>
    <label>
        <input name="template" type="radio" value="map" data-role="template">
        <span class="icon-radio"></span>
        {{__ "map"}}
    </label>
    <label>
        <input name="template" type="radio" value="custom" data-role="template">
        <span class="icon-radio"></span>
        {{__ "custom"}}
    </label>
</div>