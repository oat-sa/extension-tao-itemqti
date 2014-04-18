<div class="widget-box widget-inline widget-textEntryInteraction" data-serial="{{serial}}" data-edit="active">
    <div class="qti-interaction qti-textEntryInteraction">
        <table>
            <colgroup>
                <col class="text">
                <col class="icon">
                <col class="icon">
            </colgroup>
            <tbody>
                <tr>
                    <td class="main-option"></td>
                    <td colspan="2"></td>
                </tr>
                {{#choices}}{{{.}}}{{/choices}}
                <tr data-edit="question">
                    <td>
                        <div class="add-option">
                            <span class="icon-add"></span>
                            {{__ "new option"}}
                        </div>
                    </td>
                    <td colspan="2"></td>
                </tr>
            </tbody>
        </table>
        <div>
            <div class="widget-response" data-edit="correct"></div>
            <div class="padding"></div>
        </div>
    </div>
</div>