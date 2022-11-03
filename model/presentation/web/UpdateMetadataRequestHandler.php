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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\presentation\web;

use common_exception_Error;
use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use InvalidArgumentException;
use JsonException;
use oat\taoQtiItem\model\input\UpdateMetadataInput;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;
use Psr\Http\Message\ServerRequestInterface;
use RuntimeException;

class UpdateMetadataRequestHandler
{
    /**
     * @throws JsonException
     * @throws InvalidArgumentException
     * @throws common_exception_Error
     */
    public function handle(ServerRequestInterface $request): UpdateMetadataInput
    {
        $requestBody = (array)json_decode(
            (string)$request->getBody(),
            true,
            512,
            JSON_THROW_ON_ERROR
        );

        $this->validateRequestBody($requestBody);

        $resource = new core_kernel_classes_Resource($requestBody[UpdateMetadataInput::RESOURCE_URI]);

        if (!$resource->exists()) {
            throw new RuntimeException(sprintf('Resource with id %s does not exist', $resource->getUri()));
        }

        $property = new core_kernel_classes_Property($requestBody[UpdateMetadataInput::PROPERTY_URI]);

        if (!$property->exists()) {
            throw new RuntimeException(sprintf('Property with id %s does not exist', $property->getUri()));
        }

        return new UpdateMetadataInput(
            $resource,
            new SimpleMetadataValue(
                $requestBody[UpdateMetadataInput::RESOURCE_URI],
                [$requestBody[UpdateMetadataInput::PROPERTY_URI]],
                $requestBody[UpdateMetadataInput::VALUE]
            )
        );
    }

    private function validateRequestBody(array $requestBody): void
    {
        if (
            !isset(
                $requestBody[UpdateMetadataInput::PROPERTY_URI],
                $requestBody[UpdateMetadataInput::RESOURCE_URI],
                $requestBody[UpdateMetadataInput::VALUE]
            )
        ) {
            throw new InvalidArgumentException(
                sprintf(
                    "The properties %s, %s and %s are mandatory",
                    ...UpdateMetadataInput::VALID_PROPERTIES
                )
            );
        }

        foreach ($requestBody as $parameterKey => $parameterValue) {
            if (!in_array($parameterKey, UpdateMetadataInput::VALID_PROPERTIES)) {
                throw new InvalidArgumentException(
                    sprintf(
                        "Valid properties are %s",
                        implode(', ', UpdateMetadataInput::VALID_PROPERTIES)
                    )
                );
            }

            if (!is_string($parameterValue)) {
                throw new InvalidArgumentException(
                    sprintf(
                        "The property %s must be string",
                        $parameterKey
                    )
                );
            }
        }
    }
}
