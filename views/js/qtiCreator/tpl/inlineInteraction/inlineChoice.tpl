<tr class="widget-inlineChoice" data-edit="active" data-serial="{{serial}}">
    <td contenteditable="true">{{{body}}}</td>
    <td class="mini-tlb" colspan="2">
        <span class="icon-{{#if attributes.fixed}}pin{{else}}shuffle{{/if}}" data-role="shuffle-pin" style="{{#if interactionShuffle}}{{else}}display:none;{{/if}}"></span>
        <span class="icon-bin" data-role="delete"></span>
    </td>
</tr>