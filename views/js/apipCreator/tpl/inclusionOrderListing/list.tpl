<ol class="plain order-list">
    {{#each elements}}
        <li class="order-element" data-order="{{order}}" data-id="{{id}}" data-qti="{{qti}}">
            <span class="information">
                <span class="order">{{order}}</span>
            </span>
            <div class="content truncate">
                {{content}}
            </div>
        </li>
    {{/each}}
</ol>