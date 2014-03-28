<tr class="widget-inlineChoice" data-edit="active" data-serial="{{serial}}">
    <td contenteditable="true">{{{body}}}</td>
    <td class="mini-tlb" style="text-align: center;">
        <span class="icon-{{#if attributes.fixed}}pin{{else}}shuffle{{/if}}" data-role="shuffle-pin" style="{{#if interactionShuffle}}{{else}}display:none;{{/if}}"></span>
    </td>
    <td style="text-align: center;">
        <span class="icon-bin" data-role="delete"></span>
    </td>
</tr>