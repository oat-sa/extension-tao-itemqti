/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA
 **/
import _ from 'lodash';
import $ from 'jquery';
import util from 'taoQtiItem/qtiItem/helper/util';
import Loader from 'taoQtiItem/qtiItem/core/Loader';

const _parsableElements = ['img', 'object', 'printedVariable'];
const _qtiClassNames = {
    rubricblock: 'rubricBlock',
    printedvariable: 'printedVariable'
};
const _qtiAttributesNames = {
    powerform: 'powerForm',
    mappingindicator: 'mappingIndicator'
};

const _defaultOptions = {
    ns: {
        math: '',
        include: 'xi',
        table: 'table',
        image: 'img',
        object: '',
        figure: 'qh5',
        figcaption: 'qh5'
    },
    loaded: null,
    model: null
};

let parser;

function _getElementSelector(qtiClass, ns) {
    return ns ? ns + '\\:' + qtiClass + ',' + qtiClass : qtiClass;
}

function getQtiClassFromXmlDom($node) {
    let qtiClass = $node.prop('tagName').toLowerCase();

    //remove ns :
    qtiClass = qtiClass.replace(/.*:/, '');

    return _qtiClassNames[qtiClass] ? _qtiClassNames[qtiClass] : qtiClass;
}

function buildElement($elt) {
    const qtiClass = getQtiClassFromXmlDom($elt);

    const elt = {
        qtiClass: qtiClass,
        serial: util.buildSerial(qtiClass + '_'),
        attributes: {}
    };

    $.each($elt[0].attributes, function () {
        let attrName;
        if (this.specified) {
            attrName = _qtiAttributesNames[this.name] || this.name;
            elt.attributes[attrName] = this.value;
        }
    });

    return elt;
}

function buildMath($elt, options) {
    const elt = buildElement($elt);

    //set annotations:
    elt.annotations = {};
    $elt.find(_getElementSelector('annotation', options.ns.math)).each(function () {
        const $annotation = $(this);
        const encoding = $annotation.attr('encoding');
        if (encoding) {
            elt.annotations[encoding] = _.unescape($annotation.html());
        }
        $annotation.remove();
    });

    //set math xml
    elt.mathML = $elt.html();

    //set ns:
    elt.ns = {
        name: 'm',
        uri: 'http://www.w3.org/1998/Math/MathML' //@todo : remove hardcoding there
    };

    return elt;
}

function buildTooltip(targetHtml, contentId, contentHtml) {
    const qtiClass = '_tooltip';

    return {
        elements: {},
        qtiClass: qtiClass,
        serial: util.buildSerial(qtiClass + '_'),
        attributes: {
            'aria-describedby': contentId
        },
        content: contentHtml,
        body: {
            elements: {},
            serial: util.buildSerial('container'),
            body: targetHtml
        }
    };
}

function parseTable($elt, elt, options) {
    elt.body = {
        body: '',
        elements: {}
    };

    const $parsedTable = parseContainer($elt, options);
    elt.body.body = $parsedTable.body;
    elt.body.elements = $parsedTable.elements;
    return elt;
}

function parseFigure($elt, elt, options) {
    elt.body = {
        body: '',
        elements: {}
    };

    const $parsedFigure = parseContainer($elt, options);
    elt.body.body = $parsedFigure.body;
    elt.body.elements = $parsedFigure.elements;
    const $figcaption = $elt.find(_getElementSelector('figcaption', options.ns.figcaption));
    if ($figcaption.length) {
        const element = buildElement($figcaption);
        element.body = {
            body: $figcaption.html(),
            elements: {}
        };
        elt.body.elements[element.serial] = element;
        $figcaption.replaceWith(_placeholder(element));
    }
    elt.body.body = $elt.html();
    return elt;
}

function parseContainer($container, options) {
    const ret = {
        serial: util.buildSerial('_container_'),
        body: '',
        elements: {}
    };
    // table should be in top as it needs to be parsed first
    $container.find('table').each(function () {
        const $qtiElement = $(this);
        let element = buildElement($qtiElement, options);

        element = parseTable($qtiElement, element, options);
        ret.elements[element.serial] = element;
        $qtiElement.replaceWith(_placeholder(element));
    });

    // figure should be in top as it needs to be parsed first
    $container.find(_getElementSelector('figure', options.ns.figure)).each(function () {
        const $qtiElement = $(this);
        let element = buildElement($qtiElement, options);

        element = parseFigure($qtiElement, element, options);
        ret.elements[element.serial] = element;
        $qtiElement.replaceWith(_placeholder(element));
    });

    $container.find(_getElementSelector('math', options.ns.math)).each(function () {
        const $qtiElement = $(this);
        const element = buildMath($qtiElement, options);

        ret.elements[element.serial] = element;
        $qtiElement.replaceWith(_placeholder(element));
    });

    $container.find(_getElementSelector('include', options.ns.include)).each(function () {
        const $qtiElement = $(this);
        const element = buildElement($qtiElement, options);

        ret.elements[element.serial] = element;
        $qtiElement.replaceWith(_placeholder(element));
    });

    $container.find('[data-role="tooltip-target"]').each(function () {
        let element,
            $target = $(this),
            $content,
            contentId = $target.attr('aria-describedBy'),
            contentHtml;

        if (contentId) {
            $content = $container.find('#' + contentId);
            if ($content.length) {
                contentHtml = $content.html();

                element = buildTooltip($target.html(), contentId, contentHtml);

                ret.elements[element.serial] = element;
                $target.replaceWith(_placeholder(element));
                $content.remove();
            }
        }
    });

    _.forEach(_parsableElements, function (qtiClass) {
        $container.find(qtiClass).each(function () {
            const $qtiElement = $(this);
            const element = buildElement($qtiElement, options);
            ret.elements[element.serial] = element;
            $qtiElement.replaceWith(_placeholder(element));
        });
    });

    ret.body = $container.html();
    return ret;
}

function _placeholder(element) {
    return '{{' + element.serial + '}}';
}

parser = {
    parse: function (xmlStr, opts) {
        const options = _.merge(_.clone(_defaultOptions), opts || {});

        const $container = $(xmlStr);

        const element = buildElement($container, options);

        const data = parseContainer($container, options);

        let loader;

        if (!_.isUndefined(data.body)) {
            element.body = data;
        }

        if (_.isFunction(options.loaded) && options.model) {
            loader = new Loader().setClassesLocation(options.model);
            loader.loadAndBuildElement(element, options.loaded);
        }

        return element;
    }
};

export default parser;
