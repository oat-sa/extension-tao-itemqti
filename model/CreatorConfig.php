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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\model;

/**
 * Interface defining required method for a plugin
 *
 * @package taoQtiItem
 */
class CreatorConfig extends Config
{
    protected $interactions = [];
    protected $infoControls = [];
    protected $plugins      = [];

    // hard coded urls for using by item creator
    protected $controlEndpoints = [
        'itemDataUrl' => ['taoQtiItem', 'QtiCreator', 'getItemData'],
        'loadCssUrl' => ['taoQtiItem', 'QtiCssAuthoring', 'load'],
        'downloadCssUrl' => ['taoQtiItem', 'QtiCssAuthoring', 'download'],

        'saveItemUrl' => ['taoQtiItem', 'QtiCreator', 'saveItem'],
        'saveCssUrl' => ['taoQtiItem', 'QtiCssAuthoring', 'save'],

        'portableElementAddResourcesUrl' => ['taoQtiItem', 'PortableElement', 'addRequiredResources'],

        'mediaSourcesUrl' => ['taoQtiItem', 'QtiCreator', 'getMediaSources'],
        'getFilesUrl' => ['taoItems', 'ItemContent', 'files'],
        'fileAccessUrl' => ['taoQtiItem', 'QtiCreator', 'getFile'],

        'fileExistsUrl' => ['taoItems', 'ItemContent', 'fileExists'],
        'fileUploadUrl' => ['taoItems', 'ItemContent', 'upload'],
        'fileDownloadUrl' => ['taoItems', 'ItemContent', 'download'],
        'fileDeleteUrl' => ['taoItems', 'ItemContent', 'delete'],

        'previewUrl' => ['taoQtiItem', 'QtiPreview', 'index'],
        'previewRenderUrl' => ['taoQtiItem', 'QtiPreview', 'render'],
        'previewSubmitUrl' => ['taoQtiItem', 'QtiPreview', 'submitResponses'],
    ];

    public function addInteraction($interactionFile)
    {
        $this->interactions[] = $interactionFile;
    }

    public function addInfoControl($infoControl)
    {
        $this->infoControls[] = $infoControl;
    }

    /**
     * Add a plugin to the configuration
     * @param string $name - the plugin name
     * @param string $module - the plugin AMD module
     * @param string $category - the plugin category
     */
    public function addPlugin($name, $module, $category)
    {
        $this->plugins[] = [
            'name' => $name,
            'module' => $module,
            'category' => $category
        ];
    }

    /**
     * Remove a plugin from the configuration
     * @param string $name - the plugin name
     */
    public function removePlugin($name)
    {
        foreach ($this->plugins as $key => $plugin) {
            if ($plugin['name'] == $name) {
                $this->plugins[$key]['exclude'] = true;
            }
        }
    }

    public function toArray()
    {

        $interactions = [];
        foreach ($this->interactions as $interaction) {
            unset($interaction['directory']);
            $interactions[] = $interaction;
        }

        $infoControls = [];
        foreach ($this->infoControls as $infoControl) {
            unset($infoControl['directory']);
            $infoControls[] = $infoControl;
        }

        return [
            'properties'     => $this->properties,
            'contextPlugins' => $this->plugins,
            'interactions'   => $interactions,
            'infoControls'   => $infoControls,
        ];
    }

    public function init()
    {

        foreach ($this->interactions as $interaction) {
            $this->prepare($interaction);
        }
        foreach ($this->infoControls as $infoControl) {
            $this->prepare($infoControl);
        }
        foreach ($this->controlEndpoints as $key => $endpoint) {
            $this->setProperty($key, \tao_helpers_Uri::url($endpoint[2], $endpoint[1], $endpoint[0]));
        }

        //as the config overrides the plugins, we get the list from the registry
        $registry = QtiCreatorClientConfigRegistry::getRegistry();
        $this->plugins = array_merge($this->plugins, $registry->getPlugins());
    }

    protected function prepare($hook)
    {

        if (isset($this->properties['uri'])) {
            $item = new \core_kernel_classes_Resource($this->properties['uri']);

            //check for implementation in debugging state:
            if (isset($hook['debug']) && $hook['debug']) {
                //add required resources:
                $registry = new $hook['registry']();
                $registry->addRequiredResources($hook['typeIdentifier'], $item);
                \common_Logger::d('added ' . $hook['registry'] . ' ' . $hook['typeIdentifier']);
            }
        } else {
            throw new \common_Exception('cannot prepare hook because of missing property in config : "uri" ');
        }
    }
}
