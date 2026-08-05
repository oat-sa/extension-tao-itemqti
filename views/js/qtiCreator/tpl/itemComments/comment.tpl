<article class="item-comment{{#if resolved}} is-resolved{{/if}}" data-comment-id="{{id}}">
    <div class="item-comment-meta">
        <span class="item-comment-author">{{authorLabel}},</span>
        <time class="item-comment-time" datetime="{{createdAt}}">{{displayTime}}</time>
        {{#if edited}}
        <span class="item-comment-edited">({{__ 'edited'}})</span>
        {{/if}}
    </div>
    <div class="item-comment-body" data-role="body">{{body}}</div>
    <div class="item-comment-edit-form" data-role="edit-form" hidden>
        <label class="item-comments-label" for="item-comment-edit-{{id}}">{{__ 'Edit comment'}}</label>
        <textarea
            id="item-comment-edit-{{id}}"
            class="item-comment-edit-input"
            rows="3"
        >{{body}}</textarea>
        <div class="item-comment-edit-actions">
            <button type="button" class="btn-info small item-comment-save" data-comment-id="{{id}}">
                {{__ 'Save'}}
            </button>
            <button type="button" class="btn-default small item-comment-cancel" data-comment-id="{{id}}">
                {{__ 'Cancel'}}
            </button>
        </div>
    </div>
    <div class="item-comment-actions" data-role="actions">
        {{#if resolved}}
        <a href="#" class="item-comment-resolve-link" data-action="reopen" data-comment-id="{{id}}">
            {{__ 'Reopen'}}
        </a>
        {{else}}
        <a href="#" class="item-comment-resolve-link" data-action="resolve" data-comment-id="{{id}}">
            {{__ 'Resolve'}}
        </a>
        {{/if}}
        {{#if editable}}
        <div class="item-comment-more">
            <button
                type="button"
                class="item-comment-more-toggle"
                data-comment-id="{{id}}"
                aria-haspopup="true"
                aria-expanded="false"
                title="{{__ 'More actions'}}"
                aria-label="{{__ 'More actions'}}"
            >
                <span class="item-comment-more-dots" aria-hidden="true">...</span>
            </button>
            <ul class="item-comment-more-menu" role="menu" hidden>
                <li role="none">
                    <button type="button" class="item-comment-more-item item-comment-edit" role="menuitem" data-comment-id="{{id}}">
                        <span class="icon-edit" aria-hidden="true"></span>
                        {{__ 'Edit'}}
                    </button>
                </li>
                <li role="none">
                    <button type="button" class="item-comment-more-item item-comment-delete" role="menuitem" data-comment-id="{{id}}">
                        <span class="icon-bin" aria-hidden="true"></span>
                        {{__ 'Delete'}}
                    </button>
                </li>
            </ul>
        </div>
        {{/if}}
    </div>
</article>
