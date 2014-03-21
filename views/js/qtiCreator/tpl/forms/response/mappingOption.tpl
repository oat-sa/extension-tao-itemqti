<h2>Response Mapping Options</h2>
<label>
    {{__ "Define Correct Response"}}
    <input type="checkbox" {{#if defineCorrect}}checked="checked"{{/if}}>
    <span class="icon-checkbox"></span>
</label>
<label for="default">Score mapping default value</label><input name="default" value="{{default}}" data-increment="1.00" type="text">
<label for="lowerBound">Score lower bound</label><input name="lowerBound" value="{{lowerBound}}" data-increment="1.00" type="text">
<label for="upperBound">Score upper bound</label><input name="upperBound" value="{{upperBound}}" data-increment="1.00" type="text">