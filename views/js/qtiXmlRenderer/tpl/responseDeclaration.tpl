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
        <value><![CDATA[{{{.}}}]]></value>
        {{~/each}}
    </correctResponse>
    {{/if}}
    {{~#if isAreaMapping}}
        {{~#if hasMapEntries~}}
        <areaMapping{{#each mappingAttributes}} {{@key}}="{{.}}"{{/each}}>
            {{~#each mapEntries}}
            <areaMapEntry shape="{{shape}}" coords="{{coords}}" mappedValue="{{mappedValue}}" />
            {{~/each}}
        </areaMapping>
        {{/if}}
    {{~else~}}
        {{~#if hasMapEntries~}}
        <mapping{{#each mappingAttributes}} {{@key}}="{{.}}"{{/each}}>
            {{~#each mapEntries}}
            <mapEntry mapKey="{{@key}}" mappedValue="{{.}}" caseSensitive="false"/>
            {{~/each}}
        </mapping>
        {{/if}}
    {{/if}}
    </responseDeclaration>
{{~/if}}
