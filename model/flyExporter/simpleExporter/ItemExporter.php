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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 *
 */

namespace oat\taoQtiItem\model\flyExporter\simpleExporter;

use oat\oatbox\filesystem\File;
use oat\oatbox\filesystem\FileSystemService;
use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\flyExporter\extractor\Extractor;
use oat\taoQtiItem\model\flyExporter\extractor\ExtractorException;

/**
 *
 * Class ItemExporter
 * @package oat\taoQtiItem\model\flyExporter\simpleExporter
 */
class ItemExporter extends ConfigurableService implements SimpleExporter
{
    /**
     * File system
     */
    const EXPORT_FILESYSTEM = 'taoQtiItem';

    /**
     * Default csv delimiter
     */
    const CSV_DELIMITER = ',';

    /**
     * Defautl csv enclosure
     */
    const CSV_ENCLOSURE = '"';

    /**
     * Default property delimiter
     */
    const DEFAULT_PROPERTY_DELIMITER = '|';

    /**
     * Header of flyfile
     *
     * @var array
     */
    protected $headers = [];

    /**
     * Columns requested by export
     * @var array
     */
    protected $columns = [];

    /**
     * Available extractors
     * @var array
     */
    protected $extractors = [];

    /**
     * Fileysstem File to manage exported file storage
     *
     * @var File
     */
    protected $exportFile;

    /**
     * @inheritdoc
     *
     * @throws ExtractorException
     * @param \core_kernel_classes_Resource[] $items
     * @return mixed
     */
    public function export(array $items = null, $asFile = false)
    {
        if (empty($items)) {
            $items = $this->getItems();
        }

        $this->loadConfig();
        $data  = $this->extractDataFromItems($items);
        return $this->save($data, $asFile);
    }

    /**
     * Load config & check if mandatory settings exist
     *
     * @return $this
     * @throws ExtractorException
     * @throws \common_Exception
     */
    protected function loadConfig()
    {
        if (! $this->hasOption('fileLocation')) {
            throw new ExtractorException('File location config is not correctly set.');
        }

        $this->exportFile = $this->getServiceManager()
            ->get(FileSystemService::SERVICE_ID)
            ->getDirectory(self::EXPORT_FILESYSTEM)
            ->getFile($this->getOption('fileLocation'));

        $this->extractors = $this->getOption('extractors');
        $this->columns = $this->getOption('columns');
        if (!$this->extractors || !$this->columns) {
            throw new ExtractorException('Data config is not correctly set.');
        }

        return $this;
    }

    /**
     * Get all items of given uri otherwise get default class
     *
     * @return array
     */
    protected function getItems()
    {
        $class = new \core_kernel_classes_Class($this->getDefaultUriClass());
        return $class->getInstances(true);
    }

    /**
     * Get default class e.q. root class
     *
     * @return mixed
     */
    protected function getDefaultUriClass()
    {
        return TAO_ITEM_CLASS;
    }

    /**
     * Loop all items and call extract function
     *
     * @param array $items
     * @return array
     * @throws ExtractorException
     */
    protected function extractDataFromItems(array $items)
    {
        $output = [];
        foreach ($items as $item) {
            try {
                $itemData = $this->extractDataFromItem($item);
                $output[] = $itemData;
            } catch (ExtractorException $e) {
                \common_Logger::e('ERROR on item ' . $item->getUri() . ' : ' . $e->getMessage());
            }
        }

        if (empty($output)) {
            throw new ExtractorException('No data item to export.');
        }
        return $output;
    }

    /**
     * Loop foreach columns and extract data thought extractors
     *
     * @param \core_kernel_classes_Resource $item
     * @return array
     */
    protected function extractDataFromItem(\core_kernel_classes_Resource $item)
    {
        foreach ($this->columns as $column => $config) {
            /** @var Extractor $extractor */
            $extractor = $this->extractors[$config['extractor']];
            if (isset($config['parameters'])) {
                $parameters = $config['parameters'];
            } else {
                $parameters = [];
            }
            $extractor->addColumn($column, $parameters);
        }

        $data = ['0' => []];
        foreach ($this->extractors as $extractor) {

            $extractor->setItem($item);
            $extractor->run();
            $values = $extractor->getData();

            foreach($values as $key => $value) {

                if (count($value) > 1) {
                    $interactionData = $value;
                } else {
                    $interactionData = $values;
                }

                if (array_values(array_intersect(array_keys($data[0]), array_keys($interactionData))) == array_keys($interactionData)) {
                    $line = array_intersect_key($data[0], array_flip($this->headers));
                    $data[] = array_merge($line, $interactionData);
                } else {
                    $data[0] = array_merge($data[0], $interactionData);
                }

                $this->headers = array_unique(array_merge($this->headers, array_keys($interactionData)));
            }
        }

        return $data;
    }

    /**
     * Save data to file
     *
     * @param array $data
     * @param bool  $asFile
     * @return File|string
     */
    protected function save(array $data, $asFile = false)
    {
        $output = $contents = [];

        $contents[] = self::CSV_ENCLOSURE
            . implode(self::CSV_ENCLOSURE . self::CSV_DELIMITER . self::CSV_ENCLOSURE, $this->headers)
            . self::CSV_ENCLOSURE;

        if (! empty($data)) {
            foreach ($data as $item) {
                foreach ($item as $line) {
                    foreach ($this->headers as $index => $value) {
                        if (isset($line[$value]) && $line[$value]!=='') {
                            $output[$value] = self::CSV_ENCLOSURE . (string) $line[$value] . self::CSV_ENCLOSURE;
                            unset($line[$value]);
                        } else {
                            $output[$value] = '';
                        }
                    }
                    $contents[] = implode(self::CSV_DELIMITER,  array_merge($output, $line));
                }
            }
        }

        $this->exportFile->put(chr(239) . chr(187) . chr(191) . implode("\n", $contents));
        return $asFile ? $this->exportFile : $this->exportFile->getPrefix();
    }
}