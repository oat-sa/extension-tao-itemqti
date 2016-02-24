<?php
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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 *
 */

namespace oat\taoQtiItem\scripts\itemUpdater;

use oat\taoQtiItem\model\qti\ParserFactory;
use oat\taoQtiItem\model\qti\response\TemplatesDriven;

/**
 * @author Christophe Noël
 */
class ResponseProcessingUpdater
{
    private $qtiItem;
    private $isBroken = false;
    private $fixedXml = null;

    public function __construct($qtiItemPathname) {
        $this->qtiItem = $this->getQtiItemFrom($qtiItemPathname);

        $this->originalXml = $this->getXmlStringFrom($qtiItemPathname);

        $this->isBroken = $this->hasBrokenResponseProcessing();

        if ($this->isBroken()) {
            $this->fixedXml = $this->qtiItem->toXML(); // calling toXML() is enough to get a correct XML...
        }
    }

    private function getQtiItemFrom($pathname)
    {
        $xml = new \DOMDocument();
        $xml->load($pathname);

        $parser = new ParserFactory($xml);
        return $parser->load();
    }

    private function getXmlStringFrom($pathname)
    {
        $xml = new \DOMDocument();
        $xml->formatOutput = true;
        $xml->preserveWhiteSpace = false;
        $xml->load($pathname);
        return $xml->saveXml();
    }

    private function hasBrokenResponseProcessing() {
        $responses = $this->qtiItem->getResponses();

        if (count($responses) > 1) {
            return false;
        }
        foreach ($responses as $response) {
            $responseIdentifier = $response->attr('identifier');
            if ($responseIdentifier === "RESPONSE") {
                $hasCustomResponse = false;
            } else {
                $hasCustomResponse = true;
            }

            if (strpos($this->originalXml, 'http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct') !== 0) {
                $hasTemplateResponseProcessing = true;
            } else {
                $hasTemplateResponseProcessing = false;
            }
        }
        if ($hasCustomResponse && $hasTemplateResponseProcessing) {
            return true;
        }
        return false;
    }

//    public function getXmlFixed() {
//        if ($this->isBroken) {
//            if ($this->xmlFixed != null) {
//                return $this->xmlFixed;
//            } else {
//                $responseProcessing = $this->qtiItem->getResponseProcessing();
//                $responseProcessing->create($this->qtiItem);
//                $this->qtiItem->setResponseProcessing($responseProcessing);
//                return $this->qtiItem->toXML();
//            }
//        } else {
//            throw new \common_Exception('response processing for this item is not broken, there is nothing to fix');
//        }
//    }


    public function isBroken() {
        return $this->isBroken;
    }

    public function getFixedXml() {
        return $this->fixedXml;
    }



    /**
     * xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx
     * xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx
     * xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx
     *
     * @param oat\taoQtiItem\modal\Item $item  xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx xxxxxx
     * @return boolean
     */
    public function updateItem(/* \oat\taoQtiItem\model\qti\Item $item */)
    {
        $changed = false;
//        $responses = $item->getResponses();
//
//        foreach ($responses as $response) {
//
//            $responseIdentifier = $response->attr('identifier');
//            $rules              = $response->getFeedbackRules();
//
//            foreach ($rules as $rule) {
//                $modalFeedbacks = array();
//                if ($rule->getFeedbackThen()) {
//                    $modalFeedbacks[] = $rule->getFeedbackThen();
//                }
//                if ($rule->getFeedbackElse()) {
//                    $modalFeedbacks[] = $rule->getFeedbackElse();
//                }
//                foreach ($modalFeedbacks as $modalFeedback) {
//                    $feedbackXml = simplexml_load_string($modalFeedback->toQti());
//                    if ($feedbackXml->div[0] && $feedbackXml->div[0]['class'] && preg_match('/^x-tao-wrapper/',
//                            $feedbackXml->div[0]['class'])) {
//                        //the item body has not already been wrapped by the new wrapper <div class="x-tao-wrapper w-tao-relatedOutcome-{{response.identifier}}">
//                        continue;
//                    }
//                    $message = $modalFeedback->getBody()->getBody();
//                    $modalFeedback->getBody()->edit('<div class="x-tao-wrapper x-tao-relatedOutcome-'.$responseIdentifier.'">'.$message.'</div>',
//                        true);
//                    $changed = true;
//                }
//            }
//        }

        return $changed;
    }

}