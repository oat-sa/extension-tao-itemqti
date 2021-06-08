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

namespace oat\taoQtiItem\model\import;

use core_kernel_classes_Resource;
use oat\taoQtiItem\model\import\Validator\AbstractValidationException;
use oat\taoQtiItem\model\import\Validator\AggregatedValidationException;
use oat\taoQtiItem\model\import\Validator\ErrorValidationException;
use oat\taoQtiItem\model\import\Validator\WarningValidationException;
use Throwable;

class ItemImportResult
{
    /** @var ItemInterface[] */
    private $items;

    /** @var ErrorValidationException[] */
    private $errors;

    /** @var WarningValidationException[] */
    private $warnings;

    /** @var ErrorValidationException[]|WarningValidationException[] */
    private $errorsAndWarnings;

    /** @var int */
    private $totalSuccessfulImport;

    /** @var int */
    private $totalScannedItems;

    /** @var core_kernel_classes_Resource|null */
    private $firstItem;

    public function __construct()
    {
        $this->items = [];
        $this->errors = [];
        $this->warnings = [];
        $this->errorsAndWarnings = [];
        $this->totalSuccessfulImport = 0;
        $this->totalScannedItems = 0;
    }

    public function addItem(int $line, ItemInterface $item): self
    {
        $this->items[$line] = $item;

        return $this;
    }

    public function getFirstItem(): ?core_kernel_classes_Resource
    {
        return $this->firstItem;
    }

    public function setFirstItem(core_kernel_classes_Resource $firstItem): void
    {
        $this->firstItem = $firstItem;
    }

    public function setTotalSuccessfulImport(int $totalSuccessfulImport): void
    {
        $this->totalSuccessfulImport = $totalSuccessfulImport;
    }

    public function setTotalScannedItems(int $totalScannedItems): void
    {
        $this->totalScannedItems = $totalScannedItems;
    }

    /**
     * @return ItemInterface[]
     */
    public function getItems(): array
    {
        return $this->items;
    }

    public function getTotalWarnings(): int
    {
        return count($this->warnings, COUNT_RECURSIVE);
    }

    public function getTotalErrors(): int
    {
        return count($this->errors, COUNT_RECURSIVE);
    }

    /**
     * @return WarningValidationException[]
     */
    public function getWarnings(): array
    {
        return $this->warnings;
    }

    /**
     * @return ErrorValidationException[]
     */
    public function getErrors(): array
    {
        return $this->errors;
    }

    public function getTotalSuccessfulImport(): int
    {
        return $this->totalSuccessfulImport;
    }

    public function getTotalScannedItems(): int
    {
        return $this->totalScannedItems;
    }

    /**
     * @return ErrorValidationException[]|WarningValidationException[]
     */
    public function getErrorsAndWarnings(): array
    {
        return $this->errorsAndWarnings;
    }

    public function addException(int $line, Throwable $exception): self
    {
        if ($exception instanceof AggregatedValidationException) {
            $this->addAggregatedException($line, $exception);

            return $this;
        }

        if ($exception instanceof AbstractValidationException) {
            $this->addInternalException($line, $exception);

            return $this;
        }

        $this->addInternalException($line, new ErrorValidationException($exception->getMessage()));

        return $this;
    }

    private function addAggregatedException(int $line, AggregatedValidationException $exception): self
    {
        foreach ($exception->getErrors() as $errorException) {
            $this->addInternalException($line, $errorException);
        }

        foreach ($exception->getWarnings() as $warningException) {
            $this->addInternalException($line, $warningException);
        }

        return $this;
    }

    private function addInternalException(int $line, AbstractValidationException $exception): self
    {
        $this->errorsAndWarnings[$line] = isset($this->errorsAndWarnings[$line]) ? $this->errorsAndWarnings[$line] : [];
        $this->errors[$line] = isset($this->errors[$line]) ? $this->errors[$line] : [];
        $this->warnings[$line] = isset($this->warnings[$line]) ? $this->warnings[$line] : [];

        $this->errorsAndWarnings[$line][] = $exception;

        if ($exception instanceof ErrorValidationException) {
            $this->errors[$line][] = $exception;
        }

        if ($exception instanceof WarningValidationException) {
            $this->warnings[$line][] = $exception;
        }

        return $this;
    }
}
