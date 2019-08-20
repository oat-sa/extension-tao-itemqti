<div class="mini-tlb" data-edit="answer" data-for="{{choiceSerial}}">
    <label class="tlb-button right" title="Score of this answer" data-edit="map">
        <input value="{{score}}" 
       title="{{__ 'The value of this field must be numeric'}}"
       type="text" 
       data-for="{{choiceIdentifier}}" 
       name="score" 
       class="score" 
       placeholder = "{{placeholder}}"
       data-validate="$numeric" 
       data-validate-option="$allowEmpty; $event(type=keyup)" />
    </label>
</div>