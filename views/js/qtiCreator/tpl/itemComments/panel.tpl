<div class="item-comments-panel">
    <div class="item-comments-list" role="log" aria-live="polite"></div>
    <div class="item-comments-empty" hidden>{{__ 'No comments have been added.'}}</div>
    <div class="item-comments-error" hidden></div>
    <form class="item-comments-entry" autocomplete="off">
        <p class="item-comments-reminder">
            {{__ 'Do not enter personal or sensitive information unless permitted by your organisation’s data privacy policies.'}}
        </p>
        <label class="item-comments-label" for="item-comments-input">{{__ 'Add a comment'}}</label>
        <textarea
            id="item-comments-input"
            class="item-comments-input"
            name="comment"
            rows="4"
            placeholder="{{__ 'Add a comment'}}"
        ></textarea>
        <button type="submit" class="btn-info small item-comments-submit" disabled>
            {{__ 'Post comment'}}
        </button>
    </form>
</div>
