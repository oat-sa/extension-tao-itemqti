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

/**
 * @author Christophe Noël
 */
class ResponseProcessingUpdater
{
    private $qtiItem;
    private $isBroken = false;
    private $originalXml;
    private $fixedXml = null;

    public function __construct($qtiItemPathname) {
        $this->qtiItem      = $this->getQtiItemFrom($qtiItemPathname);
        $this->originalXml  = $this->getXmlStringFrom($qtiItemPathname);
        $this->isBroken     = $this->hasBrokenResponseProcessing();

        if ($this->isBroken()) {
            // calling toXML() is enough to get a correct XML...
            // ... but it can also change other part of the XML, such as the assessmentItem attributes !
            $this->fixedXml = $this->qtiItem->toXML();
        }
    }

    private function getQtiItemFrom($pathname) {
        $xml = new \DOMDocument();
        $xml->load($pathname);

        $parser = new ParserFactory($xml);
        return $parser->load();
    }

    private function getXmlStringFrom($pathname) {
        $xml = new \DOMDocument();
        $xml->formatOutput = true;
        $xml->preserveWhiteSpace = false;
        $xml->load($pathname);
        return $xml->saveXml();
    }

    private function hasBrokenResponseProcessing() {
        $responses = $this->qtiItem->getResponses();

        if (count($responses) != 1) {
            return false; // if the file has multiple or no response declaration, we consider it valid...
        }

        $responseIdentifier = current($responses)->attr('identifier');
        if ($responseIdentifier === "RESPONSE") {
            return false; // files that uses the default identifier are declared valid...
        }

        if (strpos($this->originalXml, 'template="http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct"') !== 0) {
            return true; // custom id + template = this shouldn't happen!!!
        }
        return false;
    }

    public function isBroken() {
        return $this->isBroken;
    }

    public function getFixedXml() {
        if ($this->fixedXml == null || !$this->isBroken()) {
            throw new \common_Exception("item isn't broken, no need to fix it !");
        }
        return $this->fixedXml;
    }
}