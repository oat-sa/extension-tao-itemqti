<responseDeclaration {{{join attributes '=' ' ' '"'}}}
{{~#if empty~}}/>
{{~else~}}>
    {{~#if defaultValue.length}}
    <defaultValue>
        {{~#each defaultValue}}
        <value>{{.}}</value>
        {{/each}}
    </defaultValue>
    {{/if}}
    {{~#if correctResponse.length}}
    <correctResponse>
        {{~#each correctResponse}}
        <value>{{.}}</value>
        {{~/each}}
    </correctResponse>
    {{/if}}
    {{~#if MAP_RESPONSE}}
        {{~#if mapEntries~}}
        <mapping>
            {{~#each mapEntries}}
            <mapEntry mapKey="{{@key}}" mappedValue="{{.}}" caseSensitive="false"/>
            {{~/each}}
        </mapping>
        {{/if}}
    {{/if}}
    {{~#if MAP_RESPONSE_POINT}}
        {{~#if mapEntries~}}
        <areaMapping>
            {{~#each mapEntries}}
            <areaMapEntry{{#each mapEntries}} {{@key}}="{{.}}"{{/each}} />
            {{~/each}}
        </areaMapping>
        {{/if}}
    {{/if}}
{{~/if}}
</responseDeclaration>