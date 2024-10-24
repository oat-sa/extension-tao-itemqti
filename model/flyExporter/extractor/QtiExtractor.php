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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 *
 */

namespace oat\taoQtiItem\model\flyExporter\extractor;

use oat\oatbox\filesystem\FilesystemException;
use oat\taoQtiItem\model\qti\Service;

/**
 * Extract all given columns of item qti data
 *
 * Class QtiExtractor
 * @package oat\taoDepp\model\export
 */
class QtiExtractor implements Extractor
{
    /**
     * Item to export
     * @var \core_kernel_classes_Resource
     */
    protected $item;

    /**
     * Requested output columns
     * @var array
     */
    protected $columns = [];

    /**
     * All data formatted as $columns
     * @var array
     */
    protected $data = [];

    /**
     * Xml Dom of item content
     * @var \DOMDocument
     */
    protected $dom;

    /**
     * Xpath of item Dom element
     * @var \DOMXpath
     */
    protected $xpath;

    /**
     * All real interactions
     * @var array
     */
    protected $interactions = [];

    /**
     * Work around to handle dynamic column length
     * @var int
     */
    protected $headerChoice = 0;

    /**
     * Set item to extract
     *
     * @param \core_kernel_classes_Resource $item
     * @return $this
     * @throws ExtractorException
     */
    public function setItem(\core_kernel_classes_Resource $item)
    {
        $this->item = $item;
        $this->loadXml($item);

        return $this;
    }

    /**
     * Load Dom & Xpath of xml item content & register xpath namespace
     *
     * @param \core_kernel_classes_Resource $item
     * @return $this
     * @throws ExtractorException
     */
    private function loadXml(\core_kernel_classes_Resource $item)
    {
        $itemService = Service::singleton();

        try {
            $xml = $itemService->getXmlByRdfItem($item);
            if (empty($xml)) {
                throw new ExtractorException('No content found for item ' . $item->getUri());
            }
        } catch (FilesystemException $e) {
            throw new ExtractorException(
                'qti.xml file was not found for item ' . $item->getUri() . '; The item might be empty.'
            );
        }

        $this->dom   = new \DOMDocument();
        $this->dom->loadXml($xml);
        $this->xpath = new \DOMXpath($this->dom);
        $this->xpath->registerNamespace('qti', $this->dom->documentElement->namespaceURI);

        return $this;
    }

    /**
     * Add column to export with associate config
     *
     * @param $column
     * @param array $config
     * @return $this
     */
    public function addColumn($column, array $config)
    {
        $this->columns[$column] = $config;

        return $this;
    }

    /**
     * Launch interactions extraction
     * Transform interactions array to output data
     * Use callback & valuesAsColumns
     *
     * @return $this
     */
    public function run()
    {
        $this->extractInteractions();

        $this->data = $line = [];

        foreach ($this->interactions as $interaction) {
            foreach ($this->columns as $column => $config) {
                if (
                    isset($config['callback'])
                    && method_exists($this, $config['callback'])
                ) {
                    $params = [];
                    if (isset($config['callbackParameters'])) {
                        $params = $config['callbackParameters'];
                    }
                    $functionCall = $config['callback'];
                    $callbackValue = call_user_func([$this, $functionCall], $interaction, $params);
                    if (isset($config['valuesAsColumns'])) {
                        $line[$interaction['id']] = array_merge($line[$interaction['id']], $callbackValue);
                    } else {
                        $line[$interaction['id']][$column] = $callbackValue;
                    }
                }
            }
        }
        $this->data = $line;
        $this->columns = $this->interactions = [];
        return $this;
    }

    /**
     * Return output data
     *
     * @return array
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * Extract all interaction by find interaction node & relative choices
     * Find right answer & resolve identifier to choice name
     * Output example of item interactions:
     * array (
     *   [...],
     *   array(
     *      "id" => "56e7d1397ad57",
     *      "type" => "Match",
     *      "choices" => array (
     *          "M" => "Mouse",
     *          "S" => "Soda",
     *          "W" => "Wheel",
     *          "D" => "DarthVader",
     *          "A" => "Astronaut",
     *          "C" => "Computer",
     *          "P" => "Plane",
     *          "N" => "Number",
     *      ),
     *      "responses" => array (
     *          0 => "M C"
     *      ),
     *      "responseIdentifier" => "RESPONSE"
     *   )
     * )
     *
     * @return $this
     */
    protected function extractInteractions()
    {
        $elements = [
            // Multiple choice
            'Choice'            => ['domInteraction' => 'choiceInteraction', 'xpathChoice' => './/qti:simpleChoice'],
            'Order'             => ['domInteraction' => 'orderInteraction', 'xpathChoice' => './/qti:simpleChoice'],
            'Match'             => [
                'domInteraction' => 'matchInteraction',
                'xpathChoice' => './/qti:simpleAssociableChoice',
            ],
            'Associate'         => [
                'domInteraction' => 'associateInteraction',
                'xpathChoice' => './/qti:simpleAssociableChoice',
            ],
            'Gap Match'         => ['domInteraction' => 'gapMatchInteraction', 'xpathChoice' => './/qti:gapText'],
            'Hot text'          => ['domInteraction' => 'hottextInteraction', 'xpathChoice' => './/qti:hottext'],
            'Inline choice'     => [
                'domInteraction' => 'inlineChoiceInteraction',
                'xpathChoice' => './/qti:inlineChoice',
            ],
            'Graphic hotspot'   => ['domInteraction' => 'hotspotInteraction', 'xpathChoice' => './/qti:hotspotChoice'],
            'Graphic order'     => [
                'domInteraction' => 'graphicOrderInteraction',
                'xpathChoice' => './/qti:hotspotChoice',
            ],
            'Graphic associate' => [
                'domInteraction' => 'graphicAssociateInteraction',
                'xpathChoice' => './/qti:associableHotspot',
            ],
            'Graphic gap match' => ['domInteraction' => 'graphicGapMatchInteraction', 'xpathChoice' => './/qti:gapImg'],

            //Scaffholding
            'ScaffHolding'  => [
                'xpathInteraction' => '//*[@customInteractionTypeIdentifier="adaptiveChoiceInteraction"]',
                'xpathChoice'      => 'descendant::*[@class="qti-choice"]'
            ],

            // Custom PCI interactions; Proper interaction type name will be determined by an xpath query
            'Custom Interaction' => [
                'domInteraction' => 'customInteraction'
            ],

            // Simple interaction
            'Extended text' => ['domInteraction' => 'extendedTextInteraction'],
            'Slider'        => ['domInteraction' => 'sliderInteraction'],
            'Upload file'   => ['domInteraction' => 'uploadInteraction'],
            'Text entry'    => ['domInteraction' => 'textEntryInteraction'],
            'End attempt'   => ['domInteraction' => 'endAttemptInteraction'],
        ];

        /**
         * foreach all interactions type
         */
        foreach ($elements as $element => $parser) {
            if (isset($parser['domInteraction'])) {
                $interactionNode = $this->dom->getElementsByTagName($parser['domInteraction']);
            } elseif (isset($parser['xpathInteraction'])) {
                $interactionNode = $this->xpath->query($parser['xpathInteraction']);
            } else {
                continue;
            }

            if ($interactionNode->length == 0) {
                continue;
            }

            /**
             * foreach all real interactions
             */
            for ($i = 0; $i < $interactionNode->length; $i++) {
                $interaction = [];
                $interaction['id'] = uniqid();
                $interaction['type'] = $element;
                $interaction['choices'] = [];
                $interaction['responses'] = [];

                if ($parser['domInteraction'] === 'customInteraction') {
                    // figure out the proper type name of a custom interaction
                    $portableCustomNode = $this->xpath->query(
                        './pci:portableCustomInteraction',
                        $interactionNode->item($i)
                    );

                    if ($portableCustomNode->length) {
                        $interaction['type'] = ucfirst(
                            str_replace(
                                'Interaction',
                                '',
                                $portableCustomNode->item(0)->getAttribute('customInteractionTypeIdentifier')
                            )
                        );
                    }
                }

                /**
                 * Interaction right answers
                 */
                $interaction['responseIdentifier'] = $interactionNode->item($i)->getAttribute('responseIdentifier');
                $rightAnswer = $this->xpath->query(
                    './qti:responseDeclaration[@identifier="' . $interaction['responseIdentifier'] . '"]'
                );

                if ($rightAnswer->length > 0) {
                    $answers = $rightAnswer->item(0)->textContent;
                    if (!empty($answers)) {
                        foreach (explode(PHP_EOL, $answers) as $answer) {
                            if (trim($answer) !== '') {
                                $interaction['responses'][] = $answer;
                            }
                        }
                    }
                }

                /**
                 * Interaction choices
                 */
                $choiceNode = '';
                if (!empty($parser['domChoice'])) {
                    $choiceNode = $this->dom->getElementsByTagName($parser['domChoice']);
                } elseif (!empty($parser['xpathChoice'])) {
                    $choiceNode = $this->xpath->query($parser['xpathChoice'], $interactionNode->item($i));
                }

                if (!empty($choiceNode) && $choiceNode->length > 0) {
                    for ($j = 0; $j < $choiceNode->length; $j++) {
                        $identifier = $choiceNode->item($j)->getAttribute('identifier');
                        $value = $this->sanitizeNodeToValue($this->dom->saveHtml($choiceNode->item($j)));

                        //Image
                        if ($value === '') {
                            $imgNode = $this->xpath->query('./qti:img/@src', $choiceNode->item($j));
                            if ($imgNode->length > 0) {
                                $value = 'image' . $j . '_' . $imgNode->item(0)->value;
                            }
                        }
                        $interaction['choices'][$identifier] = $value;
                    }
                }

                $this->interactions[] = $interaction;
            }
        }
        return $this;
    }

    /**
     * Remove first and last xml tag from string
     * Transform variable to string value
     *
     * @param $value
     * @return string
     */
    protected function sanitizeNodeToValue($value)
    {
        $first = strpos($value, '>') + 1;
        $last = strrpos($value, '<') - $first;
        $value = substr($value, $first, $last);
        $value = str_replace('"', "\"\"", $value);
        return trim($value);
    }

    /**
     * Callback to retrieve right answers
     * Find $responses & resolve identifier with $choices
     *
     * @param $interaction
     * @return string
     */
    public function getRightAnswer($interaction, $params)
    {
        $return = ['BR_identifier' => [], 'BR_label' => []];
        if (isset($interaction['responses'])) {
            foreach ($interaction['responses'] as $response) {
                $allResponses = explode(' ', trim($response));
                $returnLabel = [];
                $returnIdentifier = [];

                foreach ($allResponses as $partialResponse) {
                    if (
                        isset($interaction['choices'][$partialResponse])
                        && $interaction['choices'][$partialResponse] !== ''
                    ) {
                        $returnLabel[] = $interaction['choices'][$partialResponse];
                    } else {
                        $returnLabel[] = '';
                    }
                    $returnIdentifier[] = $partialResponse;
                }

                $return['BR_identifier'][] = implode(' ', $returnIdentifier);
                $return['BR_label'][] = implode(' ', $returnLabel);
            }
        }
        if (isset($params['delimiter'])) {
            $delimiter = $params['delimiter'];
        } else {
            $delimiter = self::DEFAULT_PROPERTY_DELIMITER;
        }

        $return['BR_identifier'] = implode($delimiter, $return['BR_identifier']);
        $return['BR_label'] = implode($delimiter, $return['BR_label']);

        return $return;
    }

    /**
     * Callback to retrieve number of choices
     *
     * @param $interaction
     * @return int|string
     */
    public function getNumberOfChoices($interaction)
    {
        if (!empty($interaction['choices'])) {
            return count($interaction['choices']);
        } else {
            return '';
        }
    }

    /**
     * Callback to retrieve all choices
     * Add dynamic column to have same columns number as other
     *
     * @param $interaction
     * @return array
     */
    public function getChoices($interaction)
    {
        $return = [];
        if (isset($interaction['choices'])) {
            $i = 1;
            foreach ($interaction['choices'] as $identifier => $choice) {
                $return['choice_identifier_' . $i] = $identifier;
                $return['choice_label_' . $i] = ($choice) ?: '';
                $i++;
            }
            if ($this->headerChoice > count($return)) {
                while ($this->headerChoice > count($return)) {
                    $return['choice_identifier_' . $i] = '';
                    $return['choice_label_' . $i] = '';
                    $i++;
                }
            } else {
                $this->headerChoice = count($return);
            }
        }
        return $return;
    }

    /**
     * Callback to retrieve interaction type
     *
     * @param $interaction
     * @return mixed
     * @throws ExtractorException
     */
    public function getInteractionType($interaction)
    {
        if (isset($interaction['type'])) {
            return $interaction['type'];
        } else {
            throw new ExtractorException('Interaction malformed: missing type.');
        }
    }

    /**
     * Callback to retrieve interaction response identifier
     *
     * @param $interaction
     * @return mixed
     */
    public function getResponseIdentifier($interaction)
    {
        return $interaction['responseIdentifier'];
    }

    /**
     * Get human readable declaration class
     * @return string
     */
    public function __toPhpCode()
    {
        return 'new ' . get_class($this) . '()';
    }
}
