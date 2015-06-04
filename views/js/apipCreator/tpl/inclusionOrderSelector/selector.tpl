<div class="inclusion-order-container">
    <label for="inclusionOrder">{{__ "Apip Feature"}}</label>
    <select name="inclusionOrder" class="select2" data-has-search="false">
    	{{#each inclusionOrders}}
    		<option value="{{@key}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
    	{{/each}}
    </select>
</div>