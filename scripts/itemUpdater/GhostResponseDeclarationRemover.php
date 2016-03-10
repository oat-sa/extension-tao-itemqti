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
class GhostResponseDeclarationRemover
{
    private $qtiItem;
    private $isBroken = false;
    private $fixedXml = null;
    
    private $ghostResponses = [];

    public function __construct($qtiItemPathname) {
        $this->qtiItem      = $this->getQtiItemFrom($qtiItemPathname);
        $this->isBroken     = $this->hasGhostResponseDeclaration();

        if ($this->isBroken()) {
            $this->setFixedXml();
        }
    }

    private function getQtiItemFrom($pathname) {
        $xml = new \DOMDocument();
        $xml->load($pathname);

        $parser = new ParserFactory($xml);
        return $parser->load();
    }

    private function hasGhostResponseDeclaration() {
        $responses = $this->qtiItem->getResponses();
        $interactions = $this->qtiItem->getInteractions();
        
        $usedResponses = [];
        foreach($interactions as $interaction){
            $usedResponses[] = $interaction->attr('responseIdentifier');
        }
        
        foreach ($responses as $response) {
            $responseIdentifier = $response->attr('identifier');
            if(!in_array($responseIdentifier, $usedResponses)){
                $this->ghostResponses[] = $response;
            }
        }
        return (count($this->ghostResponses) > 0);
    }

    public function isBroken() {
        return $this->isBroken;
    }

    public function getFixedXml() {
        if (!$this->isBroken()) {
            throw new \common_Exception("item isn't broken, no need to fix it !");
        }
        if ($this->fixedXml == null) {
            $this->setFixedXml();
        }
        return $this->fixedXml;
    }

    private function setFixedXml() {
        foreach ($this->ghostResponses as $ghostResponse) {
            $this->qtiItem->removeResponse($ghostResponse);
        }
        $this->fixedXml = $this->qtiItem->toXML();
    }

}
