<?php

/**
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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 *
 * @author Julien Sébire, <julien@taotesting.com>
 */

namespace oat\taoQtiItem\model\Export;

class QTIPackedItem30Exporter extends QTIPackedItemExporter
{
    protected function renderManifest(array $options, array $qtiItemData)
    {
        $dir = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem')->getDir();
        $tpl = $dir . 'model/qti/templates/imsmanifestQti30.tpl.php';

        $templateRenderer = new \taoItems_models_classes_TemplateRenderer($tpl, [
            'qtiItems' => [$qtiItemData],
            'manifestIdentifier' => 'MANIFEST-' . \tao_helpers_Display::textCleaner(uniqid('tao', true), '-'),
        ]);

        $renderedManifest = $templateRenderer->render();
        $newManifest = new \DOMDocument('1.0', TAO_DEFAULT_ENCODING);
        $newManifest->loadXML($renderedManifest);

        return $newManifest;
    }

    protected function itemContentPostProcessing($content)
    {
        // Elements and attibutes
        $qtiElementReplacements = $this->getQti30ElementNamesReplacements();
        $content = str_replace(
            array_keys($qtiElementReplacements),
            array_values($qtiElementReplacements),
            $content
        );

        $qtiAttributeReplacements = $this->getQti30AttributeNamesReplacements();
        $content = str_replace(
            array_keys($qtiAttributeReplacements),
            array_values($qtiAttributeReplacements),
            $content
        );

        $qtiSharedCssReplacements = $this->getQti3SharedCss();
        $content = str_replace(
            array_keys($qtiSharedCssReplacements),
            array_values($qtiSharedCssReplacements),
            $content
        );

        $namespacesReplacements = [
            'http://www.imsglobal.org/xsd/imsqti_v2p2' => 'http://www.imsglobal.org/xsd/imsqtiasi_v3p0',
            'http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd' => 'https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd',
        ];
        $content = str_replace(
            array_keys($namespacesReplacements),
            array_values($namespacesReplacements),
            $content
        );

        $responseProcessingReplacements = [
            'http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct' => 'http://www.imsglobal.org/question/qti_v3p0/rptemplates/match_correct',
            'http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response' => 'http://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response',
            'http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response_point' => 'http://www.imsglobal.org/question/qti_v3p0/rptemplates/map_response_point',
        ];
        $content = str_replace(
            array_keys($responseProcessingReplacements),
            array_values($responseProcessingReplacements),
            $content
        );

        return $content;
    }

    private function getQti30ElementNamesReplacements()
    {
        $qti3names = [
            'qti-adaptive-engine-ref',
            'qti-adaptive-selection',
            'qti-adaptive-settings-ref',
            'qti-and',
            'qti-any-n',
            'qti-area-map-entry',
            'qti-area-mapping',
            'qti-assessment-item-ref',
            'qti-assessment-item',
            'qti-assessment-section-ref',
            'qti-assessment-section',
            'qti-assessment-stimulus-ref',
            'qti-assessment-stimulus',
            'qti-assessment-test',
            'qti-associable-hotspot',
            'qti-associate-interaction',
            'qti-base-value',
            'qti-branch-rule',
            'qti-calculator-info',
            'qti-calculator',
            'qti-calculator-type',
            'qti-card-entry',
            'qti-card',
            'qti-catalog-info',
            'qti-catalog',
            'qti-choice-interaction',
            'qti-companion-materials-info',
            'qti-container-size',
            'qti-contains',
            'qti-content-body',
            'qti-context-declaration',
            'qti-context-variable',
            'qti-correct-response',
            'qti-correct',
            'qti-custom-interaction',
            'qti-custom-operator',
            'qti-default',
            'qti-default-value',
            'qti-delete',
            'qti-description',
            'qti-digital-material',
            'qti-divide',
            'qti-drawing-interaction',
            'qti-duration-gte',
            'qti-duration-lt',
            'qti-end-attempt-interaction',
            'qti-equal-rounded',
            'qti-equal',
            'qti-exit-response',
            'qti-exit-template',
            'qti-exit-test',
            'qti-extended-text-interaction',
            'qti-feedback-block',
            'qti-feedback-inline',
            'qti-field-value',
            'qti-file-href',
            'qti-gap-img',
            'qti-gap-match-interaction',
            'qti-gap-text',
            'qti-gap',
            'qti-gcd',
            'qti-graphic-associate-interaction',
            'qti-graphic-gap-match-interaction',
            'qti-graphic-order-interaction',
            'qti-gte',
            'qti-gt',
            'qti-hotspot-choice',
            'qti-hotspot-interaction',
            'qti-hottext-interaction',
            'qti-hottext',
            'qti-html-content',
            'qti-increment-si',
            'qti-increment-us',
            'qti-index',
            'qti-inline-choice-interaction',
            'qti-inline-choice',
            'qti-inside',
            'qti-integer-divide',
            'qti-integer-modulus',
            'qti-integer-to-float',
            'qti-interaction-markup',
            'qti-interaction-modules',
            'qti-interaction-module',
            'qti-interpolation-table-entry',
            'qti-interpolation-table',
            'qti-is-null',
            'qti-item-body',
            'qti-item-session-control',
            'qti-label',
            'qti-lcm',
            'qti-lookup-outcome-value',
            'qti-lte',
            'qti-lt',
            'qti-major-increment',
            'qti-map-entry',
            'qti-mapping',
            'qti-map-response-point',
            'qti-map-response',
            'qti-match-interaction',
            'qti-match-table-entry',
            'qti-match-table',
            'qti-match',
            'qti-math-constant',
            'qti-math-operator',
            'qti-max',
            'qti-media-interaction',
            'qti-member',
            'qti-metadata-ref',
            'qti-minimum-length',
            'qti-minor-increment',
            'qti-min',
            'qti-modal-feedback',
            'qti-multiple',
            'qti-not',
            'qti-null',
            'qti-number-correct',
            'qti-number-incorrect',
            'qti-number-presented',
            'qti-number-responded',
            'qti-number-selected',
            'qti-ordered',
            'qti-ordering',
            'qti-order-interaction',
            'qti-or',
            'qti-outcome-condition',
            'qti-outcome-declaration',
            'qti-outcome-else-if',
            'qti-outcome-else',
            'qti-outcome-if',
            'qti-outcome-maximum',
            'qti-outcome-minimum',
            'qti-outcome-processing-fragment',
            'qti-outcome-processing',
            'qti-pattern-match',
            'qti-physical-material',
            'qti-portable-custom-interaction',
            'qti-position-object-interaction',
            'qti-position-object-stage',
            'qti-power',
            'qti-pre-condition',
            'qti-printed-variable',
            'qti-product',
            'qti-prompt',
            'qti-protractor',
            'qti-random-float',
            'qti-random-integer',
            'qti-random',
            'qti-repeat',
            'qti-resource-icon',
            'qti-response-condition',
            'qti-response-declaration',
            'qti-response-else-if',
            'qti-response-else',
            'qti-response-if',
            'qti-response-processing-fragment',
            'qti-response-processing',
            'qti-round-to',
            'qti-round',
            'qti-rubric-block',
            'qti-rule-system-si',
            'qti-rule-system-us',
            'qti-rule',
            'qti-selection',
            'qti-select-point-interaction',
            'qti-set-correct-response',
            'qti-set-default-value',
            'qti-set-outcome-value',
            'qti-set-template-value',
            'qti-simple-associable-choice',
            'qti-simple-choice',
            'qti-simple-match-set',
            'qti-slider-interaction',
            'qti-stats-operator',
            'qti-stimulus-body',
            'qti-string-match',
            'qti-stylesheet',
            'qti-substring',
            'qti-subtract',
            'qti-sum',
            'qti-template-block',
            'qti-template-condition',
            'qti-template-constraint',
            'qti-template-declaration',
            'qti-template-default',
            'qti-template-else-if',
            'qti-template-else',
            'qti-template-if',
            'qti-template-inline',
            'qti-template-processing',
            'qti-template-variable',
            'qti-test-feedback',
            'qti-test-part',
            'qti-test-variables',
            'qti-text-entry-interaction',
            'qti-time-limits',
            'qti-truncate',
            'qti-upload-interaction',
            'qti-usagedata-ref',
            'qti-value',
            'qti-variable-mapping',
            'qti-variable',
            'qti-weight',
        ];

        $replacements = [];
        foreach ($qti3names as $qti3name) {
            $qti2name = $this->dashesToCamelCase(substr($qti3name, 4));
            $replacements['<' . $qti2name] = '<' . $qti3name;
            $replacements['</' . $qti2name] = '</' . $qti3name;
        }

        $replacements['<simple-choice'] = '<qti-simple-choice';
        $replacements['</simple-choice'] = '</qti-simple-choice';

        return $replacements;
    }

    private function getQti30AttributeNamesReplacements()
    {
        $qti3names = [
            'allow-comment',
            'allow-late-submission',
            'allow-review',
            'allow-skipping',
            'base-type',
            'case-sensitive',
            'center-point',
            'count-attempt',
            'custom-interaction-type-identifier',
            'data-catalog-idref',
            'data-qti-suppress-tts',
            'default-value',
            'exclude-category',
            'expected-length',
            'expected-lines',
            'external-scored',
            'fallback-path',
            'field-identifier',
            'hotspot-label',
            'include-boundary',
            'include-category',
            'include-lower-bound',
            'include-upper-bound',
            'keep-together',
            'long-interpretation',
            'lower-bound',
            'map-key',
            'mapped-value',
            'mapping-indicator',
            'mastery-value',
            'match-group',
            'match-max',
            'match-min',
            'math-variable',
            'max-associations',
            'max-attempts',
            'max-choices',
            'max-plays',
            'max-strings',
            'max-time',
            'mime-type',
            'min-associations',
            'min-choices',
            'min-plays',
            'min-strings',
            'min-time',
            'navigation-mode',
            'normal-maximum',
            'normal-minimum',
            'number-repeats',
            'object-label',
            'outcome-identifier',
            'param-variable',
            'pattern-mask',
            'placeholder-text',
            'power-form',
            'primary-configuration',
            'primary-path',
            'response-identifier',
            'rounding-mode',
            'secondary-configuration',
            'section-identifier',
            'show-feedback',
            'show-hide',
            'show-solution',
            'source-identifier',
            'source-value',
            'step-label',
            'string-identifier',
            'submission-mode',
            'target-identifier',
            'target-value',
            'template-identifier',
            'template-location',
            'time-dependent',
            'tolerance-mode',
            'tool-name',
            'tool-version',
            'upper-bound',
            'validate-responses',
            'variable-identifier-ref',
            'variable-identifier',
            'weight-identifier',
            'with-replacement',
        ];

        $replacements = [];
        foreach ($qti3names as $qti3name) {
            $qti2name = $this->dashesToCamelCase($qti3name);
            $replacements[' ' . $qti2name . '="'] = ' ' . $qti3name . '="';
        }

        return $replacements;
    }

    private function dashesToCamelCase($tag)
    {
        $parts = explode('-', $tag);
        $first = array_shift($parts);
        $parts = array_map('ucfirst', $parts);
        array_unshift($parts, $first);
        return implode('', $parts);
    }

    public function getQti3SharedCss()
    {
        return [
            'grid-row' => 'qti-layout-row',
            'col-' => 'qti-layout-col',
            'txt-lft' => 'qti-align-left',
            'txt-ctr' => 'qti-align-center',
            'txt-rgt' => 'qti-align-right',
            'txt-jty' => 'qti-align-justify',
            '<em>' => '<span class="qti-italic">',
            '</em>' => '</span>',
            'txt-underline' => 'qti-underline',
            '<strong>' => '<span class="qti-bold">',
            '</strong>' => '</span>',
            '<blockquote>' => '<p class="qti-well">',
            '</blockquote>' => '</p>',
        ];
    }
}
