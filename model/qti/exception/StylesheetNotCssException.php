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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

namespace oat\taoQtiItem\model\qti\exception;

use common_Exception;
use common_exception_UserReadableException;

/**
 * Exception thrown when a stylesheet references an asset that is not CSS.
 */
class StylesheetNotCssException extends common_Exception implements common_exception_UserReadableException
{
    /**
     * @var string
     */
    private $fileName;

    public function __construct($fileName)
    {
        parent::__construct(sprintf('The file "%s" cannot be used as a style sheet: it is not CSS.', $fileName));
        $this->fileName = $fileName;
    }

    /**
     * Returns a human-readable message describing the error that occurred.
     *
     * @return string
     */
    public function getUserMessage()
    {
        return sprintf(
            __('The file “%s” cannot be used as a style sheet: it is not CSS.'),
            $this->fileName
        );
    }
}
