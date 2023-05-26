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

use oat\oatbox\service\ConfigurableService;
use oat\tao\model\TaoOntology;
use oat\taoQtiItem\model\flyExporter\extractor\Extractor;
use oat\taoQtiItem\model\flyExporter\extractor\ExtractorException;

/**
 * Class ItemExporter
 *
 * @package oat\taoQtiItem\model\flyExporter\simpleExporter
 */
class ItemExporter extends ConfigurableService implements SimpleExporter
{
    /**
     * Default csv delimiter
     */
    public const CSV_DELIMITER = ',';

    /**
     * Default csv enclosure
     */
    public const CSV_ENCLOSURE = '"';

    /**
     * Default property delimiter
     */
    public const DEFAULT_PROPERTY_DELIMITER = '|';

    /**
     * Optional config option to set CSV enclosure
     */
    public const CSV_ENCLOSURE_OPTION = 'enclosure';

    /**
     * Optional config option to set CSV delimiter
     */
    public const CSV_DELIMITER_OPTION = 'delimiter';

    /**
     * Location of the export file, a relative path with the name of final file.
     * The final destination will be under /tmp.
     */
    public const OPTION_FILE_LOCATION = 'fileLocation';

    /**
     * CSV file headers
     *
     * @var array
     */
    protected $headers = [];

    /**
     * Columns requested by export
     *
     * @var array
     */
    protected $columns = [];

    /**
     * Available extractors
     *
     * @var array
     */
    protected $extractors = [];

    public function __construct(array $options)
    {
        parent::__construct($options);

        if (!$this->hasOption(self::OPTION_FILE_LOCATION)) {
            throw new ExtractorException('File location config is not correctly set.');
        }

        $this->extractors = $this->getOption('extractors');
        $this->columns = $this->getOption('columns');
        if (!$this->extractors || !$this->columns) {
            throw new ExtractorException('Data config is not correctly set.');
        }
    }

    /**
     * @inheritdoc
     *
     * @throws ExtractorException
     * @param \core_kernel_classes_Resource[] $items
     * @return string
     */
    public function export(array $items = null)
    {
        $this->headers = [];
        if (empty($items)) {
            $items = $this->getItems();
        }

        $data = $this->getDataByItems($items);

        return $this->save($this->headers, $data);
    }

    /**
     * Loop all items and call extract function
     *
     * @param array $items
     * @return array
     * @throws ExtractorException
     */
    public function getDataByItems(array $items)
    {
        $output = [];
        foreach ($items as $item) {
            try {
                $output[] = $this->getDataByItem($item);
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
    public function getDataByItem(\core_kernel_classes_Resource $item)
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

            foreach ($values as $key => $value) {
                $interactionData = is_array($value) && count($value) > 1 ? $value : $values;

                if (
                    array_values(
                        array_intersect(array_keys($data[0]), array_keys($interactionData))
                    ) === array_keys($interactionData)
                ) {
                    $line = array_intersect_key($data[0], array_flip($this->headers));
                    $data[] = array_merge($line, $interactionData);
                } else {
                    foreach ($data as &$piece) {
                        $piece = array_merge($piece, $interactionData);
                    }
                    unset($piece);
                }

                $this->headers = array_unique(array_merge($this->headers, array_keys($interactionData)));
            }
        }

        return $data;
    }

    /**
     * Save data to file
     *
     * @param array $headers
     * @param array $data
     * @return string
     */
    public function save(array $headers, array $data)
    {
        $output = $contents = [];

        $enclosure = $this->getCsvEnclosure();
        $delimiter = $this->getCsvDelimiter();

        $contents[] = $enclosure
            . implode($enclosure . $delimiter . $enclosure, $headers)
            . $enclosure;

        if (!empty($data)) {
            foreach ($data as $item) {
                foreach ($item as $line) {
                    foreach ($headers as $index => $value) {
                        if (isset($line[$value]) && $line[$value] !== '') {
                            $output[$value] = $enclosure . (string)$line[$value] . $enclosure;
                            unset($line[$value]);
                        } else {
                            $output[$value] = '';
                        }
                    }
                    $contents[] = implode($delimiter, array_merge($output, $line));
                }
            }
        }

        $filePath = $this->getFilePath();

        if (file_put_contents($filePath, chr(239) . chr(187) . chr(191) . implode("\n", $contents))) {
            $this->headers = [];
            return $filePath;
        }

        return '';
    }

    private function getFilePath()
    {
        $filePath = \tao_helpers_Export::getExportPath() . DIRECTORY_SEPARATOR
            . ltrim($this->getOption(self::OPTION_FILE_LOCATION), '/');

        $basePath = dirname($filePath);

        // if "self::OPTION_FILE_LOCATION" contains folder(s), we have to create it
        if (!file_exists($basePath)) {
            mkdir($basePath, 0777, true);
        }

        return $filePath;
    }

    /**
     * Get csv headers
     *
     * @return array
     */
    public function getHeaders()
    {
        return $this->headers;
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
        return TaoOntology::CLASS_URI_ITEM;
    }

    /**
     * Get the CSV enclosure from config, if not set use default value
     *
     * @return string
     */
    protected function getCsvEnclosure()
    {
        if ($this->hasOption(self::CSV_ENCLOSURE_OPTION)) {
            return $this->getOption(self::CSV_ENCLOSURE_OPTION);
        }

        return self::CSV_ENCLOSURE;
    }

    /**
     * Get the CSV delimiter from config, if not set use default value
     *
     * @return string
     */
    protected function getCsvDelimiter()
    {
        if ($this->hasOption(self::CSV_DELIMITER_OPTION)) {
            return $this->getOption(self::CSV_DELIMITER_OPTION);
        }

        return self::CSV_DELIMITER;
    }
}
