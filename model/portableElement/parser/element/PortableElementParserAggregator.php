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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\model\portableElement\parser\element;

use oat\taoQtiItem\model\portableElement\exception\PortableElementInconsistencyModelException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementParserException;
use oat\taoQtiItem\model\portableElement\parser\PortableElementParser;

class PortableElementParserAggregator
{
    /**
     * @var PortableElementParser[]
     */
    protected $parsers;

    /**
     * PortableElementParserAggregator constructor.
     * Check if $parsers are valid.
     *
     * @param $parsers
     * @throws PortableElementInconsistencyModelException
     */
    public function __construct($parsers)
    {
        foreach ($parsers as $parser) {
            if (! $parser instanceof PortableElementParser) {
                throw new PortableElementInconsistencyModelException(
                    'Portable element parser has to be child of PortableElementParser.');
            }
        }
        $this->parsers = $parsers;
    }

    public function getEligibleParser($source)
    {
        /** @var PortableElementParser $parser */
        foreach ($this->parsers as $parser) {
            if ($parser->hasValidPortableElement($source)) {
                return $parser;
            }
        }

        throw new PortableElementParserException(
            'This zip source is not compatible with any portable element. Manifest and/or engine file are missing '
                . ' or related extensions are not installed.'
        );
    }
}