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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */
define(['lodash'], function (_) {
    'use strict';

    class ItemState {
        constructor() {
            this.predefinedScales = new Set();
            this.activePredefinedScale = null;
            this.outcomeSelectors = new Map();
            this.outcomeIdentifierMap = new Map();
        }

        clear() {
            this.predefinedScales.clear();
            this.activePredefinedScale = null;
            this.outcomeSelectors.clear();
            this.outcomeIdentifierMap.clear();
        }

        isPredefinedScale(scale) {
            return scale && this.predefinedScales.has(scale);
        }

        hasActivePredefinedScale() {
            return this.activePredefinedScale !== null;
        }
    }

    class OutcomeIdentifier {
        static generate(outcome) {
            if (outcome.identifier) return outcome.identifier;
            if (outcome.serial) return outcome.serial;

            const props = [
                outcome.longInterpretation,
                outcome.interpretation,
                outcome.normalMinimum,
                outcome.normalMaximum
            ].filter(p => p !== undefined && p !== null && p !== '');

            return props.length > 0
                ? `temp_${props.join('_').replace(/[^a-zA-Z0-9_]/g, '_')}`
                : `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        }
    }

    class SelectorRegistry {
        constructor(itemState) {
            this.itemState = itemState;
        }

        register(selectorId, selector, outcome = null) {
            if (outcome) {
                this.cleanupDuplicates(selectorId, outcome);
            }

            this.itemState.outcomeSelectors.set(selectorId, selector);

            if (outcome) {
                const stableId = OutcomeIdentifier.generate(outcome);
                this.itemState.outcomeIdentifierMap.set(stableId, selectorId);
            }
        }

        unregister(selectorId, outcome = null) {
            this.itemState.outcomeSelectors.delete(selectorId);
            this.cleanupIdentifierMapping(selectorId, outcome);
        }

        updateRegistration(selectorId, oldOutcome, newOutcome) {
            const selector = this.itemState.outcomeSelectors.get(selectorId);
            if (!selector) return;

            const oldStableId = oldOutcome ? OutcomeIdentifier.generate(oldOutcome) : null;
            const newStableId = OutcomeIdentifier.generate(newOutcome);

            if (oldStableId && oldStableId !== newStableId) {
                this.updateIdentifierMapping(selectorId, oldStableId, newStableId);
            }
        }

        cleanupOrphaned() {
            const validSelectorIds = new Set(this.itemState.outcomeIdentifierMap.values());
            const orphanedIds = Array.from(this.itemState.outcomeSelectors.keys())
                .filter(id => !validSelectorIds.has(id));

            orphanedIds.forEach(id => {
                const selector = this.itemState.outcomeSelectors.get(id);
                if (selector) {
                    this.destroySelector(selector);
                    this.itemState.outcomeSelectors.delete(id);
                }
            });
        }

        cleanupDuplicates(selectorId, outcome) {
            const stableId = OutcomeIdentifier.generate(outcome);
            const existingSelectorId = this.itemState.outcomeIdentifierMap.get(stableId);

            if (existingSelectorId && existingSelectorId !== selectorId) {
                const existingSelector = this.itemState.outcomeSelectors.get(existingSelectorId);
                if (existingSelector && !existingSelector._destroyed) {
                    this.destroySelector(existingSelector);
                    this.itemState.outcomeSelectors.delete(existingSelectorId);
                }
            }
        }

        updateIdentifierMapping(selectorId, oldStableId, newStableId) {
            if (this.itemState.outcomeIdentifierMap.get(oldStableId) === selectorId) {
                this.itemState.outcomeIdentifierMap.delete(oldStableId);
            }

            const existingSelectorId = this.itemState.outcomeIdentifierMap.get(newStableId);
            if (existingSelectorId && existingSelectorId !== selectorId) {
                const existingSelector = this.itemState.outcomeSelectors.get(existingSelectorId);
                if (existingSelector && !existingSelector._destroyed) {
                    this.destroySelector(existingSelector);
                    this.itemState.outcomeSelectors.delete(existingSelectorId);
                }
            }

            this.itemState.outcomeIdentifierMap.set(newStableId, selectorId);
        }

        cleanupIdentifierMapping(selectorId, outcome) {
            if (outcome) {
                const stableId = OutcomeIdentifier.generate(outcome);
                const mappedSelectorId = this.itemState.outcomeIdentifierMap.get(stableId);
                if (mappedSelectorId === selectorId) {
                    this.itemState.outcomeIdentifierMap.delete(stableId);
                }
            } else {
                for (const [stableId, mappedSelectorId] of this.itemState.outcomeIdentifierMap.entries()) {
                    if (mappedSelectorId === selectorId) {
                        this.itemState.outcomeIdentifierMap.delete(stableId);
                        break;
                    }
                }
            }
        }

        destroySelector(selector) {
            try {
                if (typeof selector.destroy === 'function') {
                    selector.destroy();
                }
            } catch (error) {
                console.warn('Error destroying selector:', error);
            }
        }
    }

    class ScaleLockManager {
        constructor(itemState) {
            this.itemState = itemState;
            this.isUpdating = false;
        }

        handleScaleChange(newScale) {
            if (this.isUpdating) return;

            if (this.itemState.isPredefinedScale(newScale)) {
                this.lockToPredefinedScale(newScale);
            } else {
                this.checkForActivePredefinedScales();
            }
        }

        lockToPredefinedScale(scale) {
            if (this.itemState.activePredefinedScale === scale) return;

            this.itemState.activePredefinedScale = scale;
            this.updateAllSelectors();
        }

        checkForActivePredefinedScales() {
            const foundScale = this.findActivePredefinedScale();

            if (foundScale) {
                if (this.itemState.activePredefinedScale !== foundScale) {
                    this.lockToPredefinedScale(foundScale);
                }
            } else {
                if (this.itemState.hasActivePredefinedScale()) {
                    this.itemState.activePredefinedScale = null;
                    this.updateAllSelectors();
                }
            }
        }

        findActivePredefinedScale() {
            for (const [, selector] of this.itemState.outcomeSelectors.entries()) {
                try {
                    if (selector._destroyed) continue;

                    const currentValue = selector.getCurrentValue();
                    if (this.itemState.isPredefinedScale(currentValue)) {
                        return currentValue;
                    }
                } catch (error) {
                    console.warn('Error checking selector value:', error);
                }
            }
            return null;
        }

        updateAllSelectors() {
            if (this.isUpdating) return;

            this.isUpdating = true;
            try {
                this.itemState.outcomeSelectors.forEach((selector) => {
                    this.updateSelector(selector);
                });
            } catch (error) {
                console.warn('Error updating selectors:', error);
            } finally {
                this.isUpdating = false;
            }
        }

        updateSelector(selector) {
            try {
                if (selector._destroyed) return;
                selector.updateAvailableScales(this.itemState.activePredefinedScale);
            } catch (error) {
                console.warn('Error updating selector:', error);
            }
        }
    }

    const ScaleSynchronizationManager = {
        _itemStates: new Map(),
        _currentItemId: null,

        init(scalesPresets, itemId) {
            if (!itemId) {
                throw new Error('itemId is required for proper item isolation');
            }

            this._currentItemId = itemId;
            const itemState = this.getItemState(itemId);

            itemState.predefinedScales.clear();
            if (Array.isArray(scalesPresets)) {
                scalesPresets.forEach(scale => {
                    if (scale && scale.uri) {
                        itemState.predefinedScales.add(scale.uri);
                    }
                });
            }
        },

        reset(itemId = null) {
            if (itemId) {
                this.resetSpecificItem(itemId);
            } else {
                this.resetAllItems();
            }
        },

        registerSelector(selectorId, selector, outcome) {
            const itemState = this.getCurrentState();
            const registry = new SelectorRegistry(itemState);
            const lockManager = new ScaleLockManager(itemState);

            registry.register(selectorId, selector, outcome);
            lockManager.checkForActivePredefinedScales();
        },

        unregisterSelector(selectorId, outcome = null) {
            const itemState = this.getCurrentState();
            const registry = new SelectorRegistry(itemState);
            const lockManager = new ScaleLockManager(itemState);

            registry.unregister(selectorId, outcome);
            lockManager.checkForActivePredefinedScales();
        },

        updateSelectorRegistration(selectorId, oldOutcome, newOutcome) {
            const itemState = this.getCurrentState();
            const registry = new SelectorRegistry(itemState);

            registry.updateRegistration(selectorId, oldOutcome, newOutcome);
        },

        cleanupOrphanedSelectors() {
            const itemState = this.getCurrentState();
            const registry = new SelectorRegistry(itemState);

            registry.cleanupOrphaned();
        },

        onScaleChange(outcomeId, newScale) {
            const itemState = this.getCurrentState();
            const lockManager = new ScaleLockManager(itemState);

            lockManager.handleScaleChange(newScale);
        },

        isPredefinedScale(scale) {
            const itemState = this.getCurrentState();
            return itemState.isPredefinedScale(scale);
        },

        getActivePredefinedScale() {
            const itemState = this.getCurrentState();
            return itemState.activePredefinedScale;
        },

        getItemState(itemId) {
            if (!this._itemStates.has(itemId)) {
                this._itemStates.set(itemId, new ItemState());
            }
            return this._itemStates.get(itemId);
        },

        getCurrentState() {
            if (!this._currentItemId) {
                throw new Error('No active item set. Call init() first.');
            }
            return this.getItemState(this._currentItemId);
        },

        resetSpecificItem(itemId) {
            const state = this._itemStates.get(itemId);
            if (state) {
                this.destroyAllSelectorsInState(state);
                this._itemStates.delete(itemId);
                if (this._currentItemId === itemId) {
                    this._currentItemId = null;
                }
            }
        },

        resetAllItems() {
            this._itemStates.forEach(state => {
                this.destroyAllSelectorsInState(state);
            });
            this._itemStates.clear();
            this._currentItemId = null;
        },

        destroyAllSelectorsInState(state) {
            state.outcomeSelectors.forEach(selector => {
                if (selector && typeof selector.destroy === 'function') {
                    try {
                        selector.destroy();
                    } catch (error) {
                        console.warn('Error destroying selector during reset:', error);
                    }
                }
            });
        }
    };

    return ScaleSynchronizationManager;
});
