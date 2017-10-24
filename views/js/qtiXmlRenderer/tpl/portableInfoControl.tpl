<infoControl {{{join attributes '=' ' ' '"'}}}>
    <portableInfoControl infoControlTypeIdentifier="{{typeIdentifier}}" hook="{{entryPoint}}" xmlns="http://www.imsglobal.org/xsd/portableInfoControl">
        <resources>
            <libraries>
                {{#each libraries}}
                <lib id="{{.}}"/>
                {{/each}}
            </libraries>
        </resources>
        {{{portableElementProperties properties ''}}}
        <markup>
            {{{markup}}}
        </markup>
    </portableInfoControl>
</infoControl>