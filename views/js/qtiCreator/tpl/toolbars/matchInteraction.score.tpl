<input value="{{score}}" cd ..
       type="text" 
       data-for="{{choiceIdentifier}}" 
       name="score" 
       class="score" 
       placeholder = "{{placeholder}}"
       data-validate="$numeric" 
       data-validate-option="$allowEmpty; $event(type=keyup)" />