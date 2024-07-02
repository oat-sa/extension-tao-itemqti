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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\helpers;

use common_ext_ExtensionsManager as ExtensionsManager;
use DOMDocument;
use Exception;
use oat\taoQtiItem\model\qti\exception\QtiModelException;

class QtiXmlLoader
{
    private ExtensionsManager $extensionsManager;

    /**
     * @param ExtensionsManager $extensionsManager
     */
    public function __construct(ExtensionsManager $extensionsManager)
    {
        $this->extensionsManager = $extensionsManager;
    }

    /**
     * Load QTI xml and return DOMDocument instance.
     * This is service implementation of oat\taoQtiItem\helpers\Authoring::loadQtiXml
     * @throws QtiModelException
     */
    public function load(string $xml): DOMDocument
    {
        $dom = new DOMDocument('1.0', 'UTF-8');
        $this->configDomParser($dom);
        try {
            $dom->loadXML($xml);
        } catch (Exception $e) {
            throw new QtiModelException('Invalid QTI XML', 0, $e);
        }

        return $dom;
    }

    private function getQtiParserConfig(): array
    {
        return $this->extensionsManager->getExtensionById('taoQtiItem')
            ->getConfig('XMLParser');
    }

    private function configDomParser(DOMDocument $dom): void
    {
        $parserConfig = $this->getQtiParserConfig();
        if ($this->parserConfigValid($parserConfig)) {
            $dom->formatOutput = $parserConfig['formatOutput'];
            $dom->preserveWhiteSpace = $parserConfig['preserveWhiteSpace'];
            $dom->validateOnParse = $parserConfig['validateOnParse'];

            return;
        }

        $dom->formatOutput = true;
        $dom->preserveWhiteSpace = false;
        $dom->validateOnParse = false;
    }

    private function parserConfigValid(array $parserConfig): bool
    {
        return !empty($parserConfig) &&
            isset($parserConfig['formatOutput'], $parserConfig['preserveWhiteSpace'], $parserConfig['validateOnParse']);
    }
}
