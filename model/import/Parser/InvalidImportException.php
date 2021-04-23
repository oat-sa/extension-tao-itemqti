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

use Exception;

class InvalidImportException extends Exception
{
    /** @var array */
    private $errors;

    /** @var int */
    private $totalErrors = 0;

    public function addError(int $line, string $message): self
    {
        $this->totalErrors++;
        $this->errors[$line] = $this->errors[$line] ?? [];
        $this->errors[$line][] = $message;

        $this->message .= rtrim($message, ',') . ', ';

        return $this;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    public function getTotalErrors(): int
    {
        return $this->totalErrors;
    }
}
