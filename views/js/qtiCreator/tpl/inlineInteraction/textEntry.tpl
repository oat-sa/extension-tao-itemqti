<tr class="widget-textEntry" data-edit="active" data-serial="{{serial}}">
    <td class="option" contenteditable="true">{{{body}}}</td>
    <td class="mini-tlb">
        <span data-edit="question" class="icon-{{#if attributes.fixed}}pin{{else}}shuffle{{/if}}" data-role="shuffle-pin" style="{{#if interactionShuffle}}{{else}}display:none;{{/if}}"></span>
        <label data-edit="map">
            <input name="correct" type="radio" value="{{serial}}">
            <span class="icon-radio"></span>
        </label>
        <input name="score" data-edit="map" value="{{score}}" data-for="{{serial}}"/>
        <span data-edit="question" class="icon-bin" data-role="delete"></span>
    </td>
</tr>