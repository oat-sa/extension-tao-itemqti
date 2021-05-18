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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\import\Parser;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\import\ParsedMetadatum;

class MetadataParser extends ConfigurableService implements ColumnParserInterface
{
    public function parse(array $line, array $rules, array $fields): array
    {
        $parsedMetadata = [];
        $columnName = $fields['columnName'];

        $metadata = $this->findKeysByMask($columnName, $line);

        foreach ($metadata as $metadataAlias => $metadatum) {
            $parsedMetadata[] = new ParsedMetadatum($metadatum, str_replace('metadata_', '', $metadataAlias));
        }

        return $parsedMetadata;
    }

    private function findKeysByMask(string $pattern, array $input): array
    {
        $pattern = '/\b('.$pattern.')\b/';
        return array_intersect_key($input, array_flip(preg_grep($pattern, array_keys($input))));
    }
}
