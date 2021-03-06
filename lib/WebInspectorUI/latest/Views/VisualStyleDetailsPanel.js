var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (C) 2015 Apple Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. AND ITS CONTRIBUTORS ``AS IS''
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL APPLE INC. OR ITS CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.VisualStyleDetailsPanel = (function (_WebInspector$StyleDetailsPanel) {
    _inherits(VisualStyleDetailsPanel, _WebInspector$StyleDetailsPanel);

    function VisualStyleDetailsPanel(delegate) {
        _classCallCheck(this, VisualStyleDetailsPanel);

        _get(Object.getPrototypeOf(VisualStyleDetailsPanel.prototype), "constructor", this).call(this, delegate, "visual", "visual", WebInspector.UIString("Styles — Visual"));

        this._currentStyle = null;
        this._forceNextStyleUpdate = false;

        this._sections = {};
        this._groups = {};
        this._keywords = {};
        this._units = {};
        this._autocompletionPropertyEditors = {};

        // These keywords, as well as the values below, are not localized as they must match the CSS spec.
        this._keywords.defaults = ["Inherit", "Initial"];
        this._keywords.boxModel = this._keywords.defaults.concat(["Auto"]);
        this._keywords.borderStyle = {
            basic: this._keywords.defaults.concat(["None", "Hidden", "Solid"]),
            advanced: ["Dashed", "Dotted", "Double", "Groove", "Hidden", "Inset", "None", "Outset", "Ridge"]
        };
        this._keywords.borderWidth = this._keywords.defaults.concat(["Medium", "Thick", "Thin"]);

        this._units.defaultsSansPercent = {
            basic: ["px", "em"],
            advanced: ["ch", "cm", "ex", "in", "mm", "pc", "pt", "rem", "vh", "vw", "vmax", "vmin"]
        };
        this._units.defaults = {
            basic: ["%"].concat(this._units.defaultsSansPercent.basic),
            advanced: this._units.defaultsSansPercent.advanced
        };

        // Selector Section
        this._selectorSection = new WebInspector.VisualStyleSelectorSection(this);
        this._selectorSection.addEventListener(WebInspector.VisualStyleSelectorSection.Event.SelectorChanged, this._updateSections, this);
        this._selectorSection.addEventListener(WebInspector.VisualStyleSelectorSection.Event.StyleTextChanged, this._prepareForChange, this);
        this._element.appendChild(this._selectorSection.element);

        // Layout Section
        this._generateSection("display", WebInspector.UIString("Display"));
        this._generateSection("position", WebInspector.UIString("Position"));
        this._generateSection("float", WebInspector.UIString("Float and Clear"));
        this._generateSection("dimensions", WebInspector.UIString("Dimensions"));
        this._generateSection("margin", WebInspector.UIString("Margin"));
        this._generateSection("padding", WebInspector.UIString("Padding"));
        this._generateSection("flexbox", WebInspector.UIString("Flexbox"));
        this._generateSection("alignment", WebInspector.UIString("Alignment"));

        this._sections.layout = new WebInspector.DetailsSection("layout", WebInspector.UIString("Layout"), [this._groups.display.section, this._groups.position.section, this._groups.float.section, this._groups.dimensions.section, this._groups.margin.section, this._groups.padding.section, this._groups.flexbox.section, this._groups.alignment.section]);
        this._element.appendChild(this._sections.layout.element);

        // Text Section
        this._generateSection("text-style", WebInspector.UIString("Style"));
        this._generateSection("font", WebInspector.UIString("Font"));
        this._generateSection("text-spacing", WebInspector.UIString("Spacing"));
        this._generateSection("text-shadow", WebInspector.UIString("Shadow"));

        this._sections.text = new WebInspector.DetailsSection("text", WebInspector.UIString("Text"), [this._groups.textStyle.section, this._groups.font.section, this._groups.textSpacing.section, this._groups.textShadow.section]);
        this._element.appendChild(this._sections.text.element);

        // Background Section
        this._generateSection("background-style", WebInspector.UIString("Style"));
        this._generateSection("border", WebInspector.UIString("Border"));
        this._generateSection("outline", WebInspector.UIString("Outline"));
        this._generateSection("box-shadow", WebInspector.UIString("Shadow"));

        this._sections.background = new WebInspector.DetailsSection("background", WebInspector.UIString("Background"), [this._groups.backgroundStyle.section, this._groups.border.section, this._groups.outline.section, this._groups.boxShadow.section]);
        this._element.appendChild(this._sections.background.element);

        // Animation Section
        this._generateSection("transition", WebInspector.UIString("Transition"));

        this._sections.animation = new WebInspector.DetailsSection("animation", WebInspector.UIString("Animation"), [this._groups.transition.section]);
        this._element.appendChild(this._sections.animation.element);
    }

    // Public

    _createClass(VisualStyleDetailsPanel, [{
        key: "refresh",
        value: function refresh(significantChange) {
            if (significantChange || this._forceNextStyleUpdate) {
                this._selectorSection.update(this._nodeStyles);
                this._updateSections();
                this._forceNextStyleUpdate = false;
            }

            _get(Object.getPrototypeOf(VisualStyleDetailsPanel.prototype), "refresh", this).call(this);
        }

        // Private

    }, {
        key: "_generateSection",
        value: function _generateSection(id, displayName) {
            if (!id || !displayName) return;

            function replaceDashWithCapital(match) {
                return match.replace("-", "").toUpperCase();
            }

            var camelCaseId = id.replace(/-\b\w/g, replaceDashWithCapital);

            function createOptionsElement() {
                var container = document.createElement("div");
                container.classList.add("visual-style-section-clear");
                container.title = WebInspector.UIString("Click to clear modified properties");
                container.addEventListener("click", this._clearModifiedSection.bind(this, camelCaseId));
                return container;
            }

            this._groups[camelCaseId] = {
                section: new WebInspector.DetailsSection(id, displayName, [], createOptionsElement.call(this)),
                properties: {}
            };

            var populateFunction = this["_populate" + camelCaseId.capitalize() + "Section"];
            populateFunction.call(this);
        }
    }, {
        key: "_prepareForChange",
        value: function _prepareForChange(event) {
            this._forceNextStyleUpdate = true;
        }
    }, {
        key: "_updateSections",
        value: function _updateSections(event) {
            this._currentStyle = this._selectorSection.currentStyle();
            if (!this._currentStyle) return;

            var disabled = this._currentStyle[WebInspector.VisualStyleDetailsPanel.StyleDisabledSymbol];
            this._element.classList.toggle("disabled", disabled);
            if (disabled) return;

            for (var key in this._groups) {
                this._updateProperties(this._groups[key], !!event);
            }for (var key in this._sections) {
                var section = this._sections[key];
                var oneSectionExpanded = false;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = section.groups[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var group = _step.value;

                        if (!group.collapsed) {
                            oneSectionExpanded = true;
                            break;
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator["return"]) {
                            _iterator["return"]();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                section.collapsed = !oneSectionExpanded;
            }
        }
    }, {
        key: "_updateProperties",
        value: function _updateProperties(group, forceStyleUpdate) {
            if (!group.section) return;

            if (group.links) {
                for (var key in group.links) {
                    group.links[key].linked = false;
                }
            }

            var initialTextList = this._initialTextList;
            if (!initialTextList) this._currentStyle[WebInspector.VisualStyleDetailsPanel.InitialPropertySectionTextListSymbol] = initialTextList = new WeakMap();

            var initialPropertyText = {};
            var initialPropertyTextMissing = !initialTextList.has(group);
            for (var key in group.properties) {
                var propertyEditor = group.properties[key];
                propertyEditor.update(!propertyEditor.style || forceStyleUpdate ? this._currentStyle : null);

                var value = propertyEditor.synthesizedValue;
                if (value && !propertyEditor.propertyMissing && initialPropertyTextMissing) initialPropertyText[key] = value;
            }

            if (initialPropertyTextMissing) initialTextList.set(group, initialPropertyText);

            var groupHasSetProperty = this._groupHasSetProperty(group);
            group.section.collapsed = !groupHasSetProperty && !group.section.expandedByUser;
            group.section.element.classList.toggle("has-set-property", groupHasSetProperty);
            this._sectionModified(group);

            var autocompleteCompatibleProperties = group.autocompleteCompatibleProperties;
            if (!autocompleteCompatibleProperties || !autocompleteCompatibleProperties.length) return;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = autocompleteCompatibleProperties[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var editor = _step2.value;

                    this._updateAutocompleteCompatiblePropertyEditor(editor, forceStyleUpdate);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                        _iterator2["return"]();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    }, {
        key: "_updateAutocompleteCompatiblePropertyEditor",
        value: function _updateAutocompleteCompatiblePropertyEditor(editor, force) {
            if (!editor || editor.hasCompletions && !force) return;

            editor.completions = WebInspector.CSSKeywordCompletions.forProperty(editor.propertyReferenceName);
        }
    }, {
        key: "_sectionModified",
        value: function _sectionModified(group) {
            group.section.element.classList.toggle("modified", this._initialPropertyTextModified(group));
            group.section.element.classList.toggle("has-set-property", this._groupHasSetProperty(group));
        }
    }, {
        key: "_clearModifiedSection",
        value: function _clearModifiedSection(groupId) {
            var group = this._groups[groupId];
            group.section.element.classList.remove("modified");
            var initialPropertyTextList = this._currentStyle[WebInspector.VisualStyleDetailsPanel.InitialPropertySectionTextListSymbol].get(group);
            if (!initialPropertyTextList) return;

            var newStyleText = this._currentStyle.text;
            for (var key in group.properties) {
                var propertyEditor = group.properties[key];
                var initialValue = initialPropertyTextList[key] || null;
                newStyleText = propertyEditor.modifyPropertyText(newStyleText, initialValue);
                propertyEditor.resetEditorValues(initialValue);
            }

            this._currentStyle.text = newStyleText;
            group.section.element.classList.toggle("has-set-property", this._groupHasSetProperty(group));
        }
    }, {
        key: "_initialPropertyTextModified",
        value: function _initialPropertyTextModified(group) {
            if (!group.properties) return false;

            var initialPropertyTextList = this._initialTextList.get(group);
            if (!initialPropertyTextList) return false;

            for (var key in group.properties) {
                var propertyEditor = group.properties[key];
                if (propertyEditor.propertyMissing) continue;

                var value = propertyEditor.synthesizedValue;
                if (value && initialPropertyTextList[key] !== value) return true;
            }

            return false;
        }
    }, {
        key: "_groupHasSetProperty",
        value: function _groupHasSetProperty(group) {
            for (var key in group.properties) {
                var propertyEditor = group.properties[key];
                var value = propertyEditor.synthesizedValue;
                if (value && !propertyEditor.propertyMissing) return true;
            }
            return false;
        }
    }, {
        key: "_populateSection",
        value: function _populateSection(group, groups) {
            if (!group || !groups) return;

            group.section.groups = groups;
            for (var key in group.properties) {
                group.properties[key].addEventListener(WebInspector.VisualStylePropertyEditor.Event.ValueDidChange, this._sectionModified.bind(this, group));
            }
        }
    }, {
        key: "_populateDisplaySection",
        value: function _populateDisplaySection() {
            var group = this._groups.display;
            var properties = group.properties;

            var displayRow = new WebInspector.DetailsSectionRow();

            properties.display = new WebInspector.VisualStyleKeywordPicker("display", WebInspector.UIString("Type"), {
                basic: ["None", "Block", "Flex", "Inline", "Inline Block"],
                advanced: ["Compact", "Inline Flex", "Inline Table", "List Item", "Table", "Table Caption", "Table Cell", "Table Column", "Table Column Group", "Table Footer Group", "Table Header Group", "Table Row", "Table Row Group", " WAP Marquee", " WebKit Box", " WebKit Grid", " WebKit Inline Box", " WebKit Inline Grid"]
            });
            properties.visibility = new WebInspector.VisualStyleKeywordPicker("visibility", WebInspector.UIString("Visibility"), {
                basic: ["Hidden", "Visible"],
                advanced: ["Collapse"]
            });

            displayRow.element.appendChild(properties.display.element);
            displayRow.element.appendChild(properties.visibility.element);

            var sizingRow = new WebInspector.DetailsSectionRow();

            properties.boxSizing = new WebInspector.VisualStyleKeywordPicker("box-sizing", WebInspector.UIString("Sizing"), this._keywords.defaults.concat(["Border Box", "Content Box"]));
            properties.cursor = new WebInspector.VisualStyleKeywordPicker("cursor", WebInspector.UIString("Cursor"), {
                basic: ["Auto", "Default", "None", "Pointer", "Crosshair", "Text"],
                advanced: ["Context Menu", "Help", "Progress", "Wait", "Cell", "Vertical Text", "Alias", "Copy", "Move", "No Drop", "Not Allowed", "All Scroll", "Col Resize", "Row Resize", "N Resize", "E Resize", "S Resize", "W Resize", "NS Resize", "EW Resize", "NE Resize", "NW Resize", "SE Resize", "sW Resize", "NESW Resize", "NWSE Resize"]
            });

            sizingRow.element.appendChild(properties.boxSizing.element);
            sizingRow.element.appendChild(properties.cursor.element);

            var overflowRow = new WebInspector.DetailsSectionRow();

            properties.opacity = new WebInspector.VisualStyleUnitSlider("opacity", WebInspector.UIString("Opacity"));
            properties.overflow = new WebInspector.VisualStyleKeywordPicker(["overflow-x", "overflow-y"], WebInspector.UIString("Overflow"), {
                basic: ["Initial", "Auto", "Hidden", "Scroll", "Visible"],
                advanced: ["Marquee", "Overlay", " WebKit Paged X", " WebKit Paged Y"]
            });

            overflowRow.element.appendChild(properties.opacity.element);
            overflowRow.element.appendChild(properties.overflow.element);

            var displayGroup = new WebInspector.DetailsSectionGroup([displayRow, sizingRow, overflowRow]);
            this._populateSection(group, [displayGroup]);
        }
    }, {
        key: "_addMetricsMouseListeners",
        value: function _addMetricsMouseListeners(editor, mode) {
            function editorMouseover() {
                if (!this._currentStyle) return;

                if (!this._currentStyle.ownerRule) {
                    WebInspector.domTreeManager.highlightDOMNode(this._currentStyle.node.id, mode);
                    return;
                }

                WebInspector.domTreeManager.highlightSelector(this._currentStyle.ownerRule.selectorText, this._currentStyle.node.ownerDocument.frameIdentifier, mode);
            }

            function editorMouseout() {
                WebInspector.domTreeManager.hideDOMNodeHighlight();
            }

            editor.element.addEventListener("mouseover", editorMouseover.bind(this));
            editor.element.addEventListener("mouseout", editorMouseout);
        }
    }, {
        key: "_generateMetricSectionRows",
        value: function _generateMetricSectionRows(group, prefix, allowNegatives, highlightOnHover) {
            var properties = group.properties;
            var links = group.links = {};

            var hasPrefix = prefix && prefix.length;
            var propertyNamePrefix = hasPrefix ? prefix + "-" : "";

            var top = hasPrefix ? prefix + "Top" : "top";
            var bottom = hasPrefix ? prefix + "Bottom" : "bottom";
            var left = hasPrefix ? prefix + "Left" : "left";
            var right = hasPrefix ? prefix + "Right" : "right";

            var vertical = new WebInspector.DetailsSectionRow();

            properties[top] = new WebInspector.VisualStyleNumberInputBox(propertyNamePrefix + "top", WebInspector.UIString("Top"), this._keywords.boxModel, this._units.defaults, allowNegatives);
            properties[bottom] = new WebInspector.VisualStyleNumberInputBox(propertyNamePrefix + "bottom", WebInspector.UIString("Bottom"), this._keywords.boxModel, this._units.defaults, allowNegatives, true);
            links["vertical"] = new WebInspector.VisualStylePropertyEditorLink([properties[top], properties[bottom]], "link-vertical");

            vertical.element.appendChild(properties[top].element);
            vertical.element.appendChild(links["vertical"].element);
            vertical.element.appendChild(properties[bottom].element);

            var horizontal = new WebInspector.DetailsSectionRow();

            properties[left] = new WebInspector.VisualStyleNumberInputBox(propertyNamePrefix + "left", WebInspector.UIString("Left"), this._keywords.boxModel, this._units.defaults, allowNegatives);
            properties[right] = new WebInspector.VisualStyleNumberInputBox(propertyNamePrefix + "right", WebInspector.UIString("Right"), this._keywords.boxModel, this._units.defaults, allowNegatives, true);
            links["horizontal"] = new WebInspector.VisualStylePropertyEditorLink([properties[left], properties[right]], "link-horizontal");

            horizontal.element.appendChild(properties[left].element);
            horizontal.element.appendChild(links["horizontal"].element);
            horizontal.element.appendChild(properties[right].element);

            var allLinkRow = new WebInspector.DetailsSectionRow();
            links["all"] = new WebInspector.VisualStylePropertyEditorLink([properties[top], properties[bottom], properties[left], properties[right]], "link-all", [links["vertical"], links["horizontal"]]);
            allLinkRow.element.appendChild(links["all"].element);

            if (highlightOnHover) {
                this._addMetricsMouseListeners(properties[top], prefix);
                this._addMetricsMouseListeners(links["vertical"], prefix);
                this._addMetricsMouseListeners(properties[bottom], prefix);
                this._addMetricsMouseListeners(links["all"], prefix);
                this._addMetricsMouseListeners(properties[left], prefix);
                this._addMetricsMouseListeners(links["horizontal"], prefix);
                this._addMetricsMouseListeners(properties[right], prefix);
            }

            return [vertical, allLinkRow, horizontal];
        }
    }, {
        key: "_populatePositionSection",
        value: function _populatePositionSection() {
            var group = this._groups.position;
            var rows = this._generateMetricSectionRows(group, null, true);
            var properties = group.properties;

            var positionType = new WebInspector.DetailsSectionRow();

            properties.position = new WebInspector.VisualStyleKeywordPicker("position", WebInspector.UIString("Type"), {
                basic: ["Static", "Relative", "Absolute", "Fixed"],
                advanced: [" WebKit Sticky"]
            });
            properties.zIndex = new WebInspector.VisualStyleNumberInputBox("z-index", WebInspector.UIString("Z-Index"), this._keywords.boxModel, null, true);

            positionType.element.appendChild(properties.position.element);
            positionType.element.appendChild(properties.zIndex.element);
            positionType.element.classList.add("visual-style-separated-row");

            rows.unshift(positionType);

            var positionGroup = new WebInspector.DetailsSectionGroup(rows);
            this._populateSection(group, [positionGroup]);
        }
    }, {
        key: "_populateFloatSection",
        value: function _populateFloatSection() {
            var group = this._groups.float;
            var properties = group.properties;

            var floatRow = new WebInspector.DetailsSectionRow();

            properties.float = new WebInspector.VisualStyleKeywordIconList("float", WebInspector.UIString("Float"), ["Left", "Right", "None"]);
            floatRow.element.appendChild(properties.float.element);

            var clearRow = new WebInspector.DetailsSectionRow();

            properties.clear = new WebInspector.VisualStyleKeywordIconList("clear", WebInspector.UIString("Clear"), ["Left", "Right", "Both", "None"]);
            clearRow.element.appendChild(properties.clear.element);

            var floatGroup = new WebInspector.DetailsSectionGroup([floatRow, clearRow]);
            this._populateSection(group, [floatGroup]);
        }
    }, {
        key: "_populateDimensionsSection",
        value: function _populateDimensionsSection() {
            var group = this._groups.dimensions;
            var properties = group.properties;

            var dimensionsWidth = new WebInspector.DetailsSectionRow();

            properties.width = new WebInspector.VisualStyleRelativeNumberSlider("width", WebInspector.UIString("Width"), this._keywords.boxModel, this._units.defaults);

            dimensionsWidth.element.appendChild(properties.width.element);

            var dimensionsHeight = new WebInspector.DetailsSectionRow();

            properties.height = new WebInspector.VisualStyleRelativeNumberSlider("height", WebInspector.UIString("Height"), this._keywords.boxModel, this._units.defaults, true);

            dimensionsHeight.element.appendChild(properties.height.element);

            var dimensionsProperties = [properties.width, properties.height];
            var dimensionsRegularGroup = new WebInspector.DetailsSectionGroup([dimensionsWidth, dimensionsHeight]);

            var dimensionsMinWidth = new WebInspector.DetailsSectionRow();

            properties.minWidth = new WebInspector.VisualStyleRelativeNumberSlider("min-width", WebInspector.UIString("Width"), this._keywords.boxModel, this._units.defaults);

            dimensionsMinWidth.element.appendChild(properties.minWidth.element);

            var dimensionsMinHeight = new WebInspector.DetailsSectionRow();

            properties.minHeight = new WebInspector.VisualStyleRelativeNumberSlider("min-height", WebInspector.UIString("Height"), this._keywords.boxModel, this._units.defaults);

            dimensionsMinHeight.element.appendChild(properties.minHeight.element);

            var dimensionsMinProperties = [properties.minWidth, properties.minHeight];
            var dimensionsMinGroup = new WebInspector.DetailsSectionGroup([dimensionsMinWidth, dimensionsMinHeight]);

            var dimensionsMaxKeywords = this._keywords.defaults.concat("None");
            var dimensionsMaxWidth = new WebInspector.DetailsSectionRow();

            properties.maxWidth = new WebInspector.VisualStyleRelativeNumberSlider("max-width", WebInspector.UIString("Width"), dimensionsMaxKeywords, this._units.defaults);

            dimensionsMaxWidth.element.appendChild(properties.maxWidth.element);

            var dimensionsMaxHeight = new WebInspector.DetailsSectionRow();

            properties.maxHeight = new WebInspector.VisualStyleRelativeNumberSlider("max-height", WebInspector.UIString("Height"), dimensionsMaxKeywords, this._units.defaults);

            dimensionsMaxHeight.element.appendChild(properties.maxHeight.element);

            var dimensionsMaxProperties = [properties.maxWidth, properties.maxHeight];
            var dimensionsMaxGroup = new WebInspector.DetailsSectionGroup([dimensionsMaxWidth, dimensionsMaxHeight]);

            var dimensionsTabController = new WebInspector.VisualStyleTabbedPropertiesRow({
                "default": { title: WebInspector.UIString("Default"), element: dimensionsRegularGroup.element, properties: dimensionsProperties },
                "min": { title: WebInspector.UIString("Min"), element: dimensionsMinGroup.element, properties: dimensionsMinProperties },
                "max": { title: WebInspector.UIString("Max"), element: dimensionsMaxGroup.element, properties: dimensionsMaxProperties }
            });

            var highlightMode = "content";
            this._addMetricsMouseListeners(group.properties.width, highlightMode);
            this._addMetricsMouseListeners(group.properties.height, highlightMode);
            this._addMetricsMouseListeners(group.properties.minWidth, highlightMode);
            this._addMetricsMouseListeners(group.properties.minHeight, highlightMode);
            this._addMetricsMouseListeners(group.properties.maxWidth, highlightMode);
            this._addMetricsMouseListeners(group.properties.maxHeight, highlightMode);

            var dimensionsGroup = new WebInspector.DetailsSectionGroup([dimensionsTabController, dimensionsRegularGroup, dimensionsMinGroup, dimensionsMaxGroup]);
            this._populateSection(group, [dimensionsGroup]);
        }
    }, {
        key: "_populateMarginSection",
        value: function _populateMarginSection() {
            var group = this._groups.margin;
            var rows = this._generateMetricSectionRows(group, "margin", true, true);
            var marginGroup = new WebInspector.DetailsSectionGroup(rows);
            this._populateSection(group, [marginGroup]);
        }
    }, {
        key: "_populatePaddingSection",
        value: function _populatePaddingSection() {
            var group = this._groups.padding;
            var rows = this._generateMetricSectionRows(group, "padding", false, true);
            var paddingGroup = new WebInspector.DetailsSectionGroup(rows);
            this._populateSection(group, [paddingGroup]);
        }
    }, {
        key: "_populateFlexboxSection",
        value: function _populateFlexboxSection() {
            var group = this._groups.flexbox;
            var properties = group.properties;

            var flexOrderRow = new WebInspector.DetailsSectionRow();

            properties.order = new WebInspector.VisualStyleNumberInputBox("order", WebInspector.UIString("Order"), this._keywords.defaults);
            properties.flexBasis = new WebInspector.VisualStyleNumberInputBox("flex-basis", WebInspector.UIString("Basis"), this._keywords.boxModel, this._units.defaults, true);

            flexOrderRow.element.appendChild(properties.order.element);
            flexOrderRow.element.appendChild(properties.flexBasis.element);

            var flexSizeRow = new WebInspector.DetailsSectionRow();

            properties.flexGrow = new WebInspector.VisualStyleNumberInputBox("flex-grow", WebInspector.UIString("Grow"), this._keywords.defaults);
            properties.flexShrink = new WebInspector.VisualStyleNumberInputBox("flex-shrink", WebInspector.UIString("Shrink"), this._keywords.defaults);

            flexSizeRow.element.appendChild(properties.flexGrow.element);
            flexSizeRow.element.appendChild(properties.flexShrink.element);

            var flexFlowRow = new WebInspector.DetailsSectionRow();

            properties.flexDirection = new WebInspector.VisualStyleKeywordPicker("flex-direction", WebInspector.UIString("Direction"), this._keywords.defaults.concat(["Row", "Row Reverse", "Column", "Column Reverse"]));
            properties.flexWrap = new WebInspector.VisualStyleKeywordPicker("flex-wrap", WebInspector.UIString("Wrap"), this._keywords.defaults.concat(["Wrap", "Wrap Reverse", "Nowrap"]));

            flexFlowRow.element.appendChild(properties.flexDirection.element);
            flexFlowRow.element.appendChild(properties.flexWrap.element);

            var flexboxGroup = new WebInspector.DetailsSectionGroup([flexOrderRow, flexSizeRow, flexFlowRow]);
            this._populateSection(group, [flexboxGroup]);
        }
    }, {
        key: "_populateAlignmentSection",
        value: function _populateAlignmentSection() {
            var group = this._groups.alignment;
            var properties = group.properties;
            var alignmentKeywords = ["Initial", "Auto", "Flex Start", "Flex End", "Center", "Stretch"];
            var advancedAlignmentKeywords = ["Start", "End", "Left", "Right", "Baseline", "Last Baseline"];

            var contentRow = new WebInspector.DetailsSectionRow();
            var contentKeywords = {
                basic: alignmentKeywords.concat(["Space Between", "Space Around"]),
                advanced: advancedAlignmentKeywords.concat(["Space Evenly"])
            };

            properties.justifyContent = new WebInspector.VisualStyleKeywordPicker("justify-content", WebInspector.UIString("Horizontal"), contentKeywords);
            properties.alignContent = new WebInspector.VisualStyleKeywordPicker("align-content", WebInspector.UIString("Vertical"), contentKeywords);

            contentRow.element.appendChild(properties.justifyContent.element);
            contentRow.element.appendChild(properties.alignContent.element);

            var itemsRow = new WebInspector.DetailsSectionRow();
            var itemKeywords = {
                basic: alignmentKeywords,
                advanced: ["Self Start", "Self End"].concat(advancedAlignmentKeywords)
            };

            properties.alignItems = new WebInspector.VisualStyleKeywordPicker("align-items", WebInspector.UIString("Children"), itemKeywords);
            properties.alignSelf = new WebInspector.VisualStyleKeywordPicker("align-self", WebInspector.UIString("Self"), itemKeywords);

            itemsRow.element.appendChild(properties.alignItems.element);
            itemsRow.element.appendChild(properties.alignSelf.element);

            var alignmentGroup = new WebInspector.DetailsSectionGroup([contentRow, itemsRow]);
            this._populateSection(group, [alignmentGroup]);
        }
    }, {
        key: "_populateTextStyleSection",
        value: function _populateTextStyleSection() {
            var group = this._groups.textStyle;
            var properties = group.properties;

            var textAppearanceRow = new WebInspector.DetailsSectionRow();

            properties.color = new WebInspector.VisualStyleColorPicker("color", WebInspector.UIString("Color"));
            properties.textDirection = new WebInspector.VisualStyleKeywordPicker("direction", WebInspector.UIString("Direction"), this._keywords.defaults.concat(["LTR", "RTL"]));

            textAppearanceRow.element.appendChild(properties.color.element);
            textAppearanceRow.element.appendChild(properties.textDirection.element);

            var textAlignRow = new WebInspector.DetailsSectionRow();

            properties.textAlign = new WebInspector.VisualStyleKeywordIconList("text-align", WebInspector.UIString("Align"), ["Left", "Center", "Right", "Justify"]);

            textAlignRow.element.appendChild(properties.textAlign.element);

            var textTransformRow = new WebInspector.DetailsSectionRow();

            properties.textTransform = new WebInspector.VisualStyleKeywordIconList("text-transform", WebInspector.UIString("Transform"), ["Capitalize", "Uppercase", "Lowercase", "None"]);

            textTransformRow.element.appendChild(properties.textTransform.element);

            var textDecorationRow = new WebInspector.DetailsSectionRow();

            properties.textDecoration = new WebInspector.VisualStyleKeywordIconList("text-decoration", WebInspector.UIString("Decoration"), ["Underline", "Line Through", "Overline", "None"]);

            textDecorationRow.element.appendChild(properties.textDecoration.element);

            group.autocompleteCompatibleProperties = [properties.color];

            var textStyleGroup = new WebInspector.DetailsSectionGroup([textAppearanceRow, textAlignRow, textTransformRow, textDecorationRow]);
            this._populateSection(group, [textStyleGroup]);
        }
    }, {
        key: "_populateFontSection",
        value: function _populateFontSection() {
            var group = this._groups.font;
            var properties = group.properties;

            var fontFamilyRow = new WebInspector.DetailsSectionRow();

            properties.fontFamily = new WebInspector.VisualStyleFontFamilyListEditor("font-family", WebInspector.UIString("Family"));

            fontFamilyRow.element.appendChild(properties.fontFamily.element);

            var fontSizeRow = new WebInspector.DetailsSectionRow();

            properties.fontSize = new WebInspector.VisualStyleNumberInputBox("font-size", WebInspector.UIString("Size"), this._keywords.defaults.concat(["Larger", "XX Large", "X Large", "Large", "Medium", "Small", "X Small", "XX Small", "Smaller"]), this._units.defaults);

            properties.fontWeight = new WebInspector.VisualStyleKeywordPicker("font-weight", WebInspector.UIString("Weight"), {
                basic: this._keywords.defaults.concat(["Bolder", "Bold", "Normal", "Lighter"]),
                advanced: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
            });

            fontSizeRow.element.appendChild(properties.fontSize.element);
            fontSizeRow.element.appendChild(properties.fontWeight.element);

            var fontStyleRow = new WebInspector.DetailsSectionRow();

            properties.fontStyle = new WebInspector.VisualStyleKeywordIconList("font-style", WebInspector.UIString("Style"), ["Italic", "Normal"]);
            properties.fontVariant = new WebInspector.VisualStyleKeywordCheckbox("font-variant", WebInspector.UIString("Variant"), "Small Caps");

            fontStyleRow.element.appendChild(properties.fontStyle.element);
            fontStyleRow.element.appendChild(properties.fontVariant.element);

            group.autocompleteCompatibleProperties = [properties.fontFamily];

            var fontGroup = new WebInspector.DetailsSectionGroup([fontFamilyRow, fontSizeRow, fontStyleRow]);
            this._populateSection(group, [fontGroup]);
        }
    }, {
        key: "_populateTextSpacingSection",
        value: function _populateTextSpacingSection() {
            var group = this._groups.textSpacing;
            var properties = group.properties;

            var defaultTextKeywords = this._keywords.defaults.concat(["Normal"]);

            var textLayoutRow = new WebInspector.DetailsSectionRow();

            properties.lineHeight = new WebInspector.VisualStyleNumberInputBox("line-height", WebInspector.UIString("Height"), defaultTextKeywords, this._units.defaults);
            properties.verticalAlign = new WebInspector.VisualStyleNumberInputBox("vertical-align", WebInspector.UIString("Align"), ["Baseline", "Bottom"].concat(this._keywords.defaults, ["Middle", "Sub", "Super", "Text Bottom", "Text Top", "Top"]), this._units.defaults);

            textLayoutRow.element.appendChild(properties.lineHeight.element);
            textLayoutRow.element.appendChild(properties.verticalAlign.element);

            var textSpacingRow = new WebInspector.DetailsSectionRow();

            properties.letterSpacing = new WebInspector.VisualStyleNumberInputBox("letter-spacing", WebInspector.UIString("Letter"), defaultTextKeywords, this._units.defaults);
            properties.wordSpacing = new WebInspector.VisualStyleNumberInputBox("word-spacing", WebInspector.UIString("Word"), defaultTextKeywords, this._units.defaults);

            textSpacingRow.element.appendChild(properties.letterSpacing.element);
            textSpacingRow.element.appendChild(properties.wordSpacing.element);

            var textWhitespaceRow = new WebInspector.DetailsSectionRow();

            properties.textIndent = new WebInspector.VisualStyleNumberInputBox("text-indent", WebInspector.UIString("Indent"), this._keywords.defaults, this._units.defaults);
            properties.whiteSpace = new WebInspector.VisualStyleKeywordPicker("white-space", WebInspector.UIString("Whitespace"), this._keywords.defaults.concat(["Normal", "Nowrap", "Pre", "Pre Line", "Pre Wrap"]));

            textWhitespaceRow.element.appendChild(properties.textIndent.element);
            textWhitespaceRow.element.appendChild(properties.whiteSpace.element);

            var textSpacingGroup = new WebInspector.DetailsSectionGroup([textLayoutRow, textSpacingRow, textWhitespaceRow]);
            this._populateSection(group, [textSpacingGroup]);
        }
    }, {
        key: "_populateTextShadowSection",
        value: function _populateTextShadowSection() {
            var group = this._groups.textShadow;
            var properties = group.properties;

            var textShadowSizing = new WebInspector.DetailsSectionRow();

            var textShadowH = new WebInspector.VisualStyleNumberInputBox("text-shadow", WebInspector.UIString("Horizontal"), null, this._units.defaultsSansPercent);
            var textShadowV = new WebInspector.VisualStyleNumberInputBox("text-shadow", WebInspector.UIString("Vertical"), null, this._units.defaultsSansPercent);

            textShadowSizing.element.appendChild(textShadowH.element);
            textShadowSizing.element.appendChild(textShadowV.element);

            var textShadowStyle = new WebInspector.DetailsSectionRow();

            var textShadowColor = new WebInspector.VisualStyleColorPicker("text-shadow", WebInspector.UIString("Color"));
            textShadowColor.colorProperty = true;
            var textShadowBlur = new WebInspector.VisualStyleNumberInputBox("text-shadow", WebInspector.UIString("Blur"), null, this._units.defaultsSansPercent);
            textShadowBlur.optionalProperty = true;

            textShadowStyle.element.appendChild(textShadowColor.element);
            textShadowStyle.element.appendChild(textShadowBlur.element);

            properties.textShadow = new WebInspector.VisualStylePropertyCombiner("text-shadow", [textShadowH, textShadowV, textShadowBlur, textShadowColor]);

            group.autocompleteCompatibleProperties = [textShadowColor];

            var textShadowGroup = new WebInspector.DetailsSectionGroup([textShadowSizing, textShadowStyle]);
            this._populateSection(group, [textShadowGroup]);
        }
    }, {
        key: "_populateBackgroundStyleSection",
        value: function _populateBackgroundStyleSection() {
            var group = this._groups.backgroundStyle;
            var properties = group.properties;

            var backgroundStyleRow = new WebInspector.DetailsSectionRow();

            properties.backgroundColor = new WebInspector.VisualStyleColorPicker("background-color", WebInspector.UIString("Color"));
            properties.backgroundImage = new WebInspector.VisualStyleURLInput("background-image", WebInspector.UIString("Image"));

            backgroundStyleRow.element.appendChild(properties.backgroundColor.element);
            backgroundStyleRow.element.appendChild(properties.backgroundImage.element);

            var backgroundSizeRow = new WebInspector.DetailsSectionRow();

            var backgroundSizeKeywords = this._keywords.boxModel.concat(["Contain", "Cover"]);
            var backgroundSizeX = new WebInspector.VisualStyleNumberInputBox("background-size", WebInspector.UIString("Width"), backgroundSizeKeywords, this._units.defaults);
            backgroundSizeX.masterProperty = true;
            var backgroundSizeY = new WebInspector.VisualStyleNumberInputBox("background-size", WebInspector.UIString("Height"), backgroundSizeKeywords, this._units.defaults);
            backgroundSizeY.masterProperty = true;

            properties.backgroundSize = new WebInspector.VisualStylePropertyCombiner("background-size", [backgroundSizeX, backgroundSizeY]);

            backgroundSizeRow.element.appendChild(backgroundSizeX.element);
            backgroundSizeRow.element.appendChild(backgroundSizeY.element);

            var backgroundRepeatRow = new WebInspector.DetailsSectionRow();

            properties.backgroundRepeat = new WebInspector.VisualStyleKeywordPicker("background-repeat", WebInspector.UIString("Repeat"), this._keywords.defaults.concat(["No Repeat", "Repeat", "Repeat X", "Repeat Y"]));
            properties.backgroundAttachment = new WebInspector.VisualStyleKeywordPicker("background-attachment", WebInspector.UIString("Attach"), this._keywords.defaults.concat(["Fixed", "Local", "Scroll"]));

            backgroundRepeatRow.element.appendChild(properties.backgroundRepeat.element);
            backgroundRepeatRow.element.appendChild(properties.backgroundAttachment.element);

            var backgroundPositionRow = new WebInspector.DetailsSectionRow();

            var backgroundPositionX = new WebInspector.VisualStyleNumberInputBox("background-position", WebInspector.UIString("Position X"), ["Center", "Left", "Right"], this._units.defaults);
            var backgroundPositionY = new WebInspector.VisualStyleNumberInputBox("background-position", WebInspector.UIString("Position Y"), ["Bottom", "Center", "Top"], this._units.defaults);

            properties.backgroundPosition = new WebInspector.VisualStylePropertyCombiner("background-position", [backgroundPositionX, backgroundPositionY]);

            backgroundPositionRow.element.appendChild(backgroundPositionX.element);
            backgroundPositionRow.element.appendChild(backgroundPositionY.element);

            group.autocompleteCompatibleProperties = [properties.backgroundColor];

            var backgroundStyleGroup = new WebInspector.DetailsSectionGroup([backgroundStyleRow, backgroundSizeRow, backgroundRepeatRow, backgroundPositionRow]);
            this._populateSection(group, [backgroundStyleGroup]);
        }
    }, {
        key: "_populateBorderSection",
        value: function _populateBorderSection() {
            var group = this._groups.border;
            var properties = group.properties;

            var borderAllSize = new WebInspector.DetailsSectionRow();

            properties.borderStyle = new WebInspector.VisualStyleKeywordPicker(["border-top-style", "border-right-style", "border-bottom-style", "border-left-style"], WebInspector.UIString("Style"), this._keywords.borderStyle);
            properties.borderStyle.propertyReferenceName = "border-style";
            properties.borderWidth = new WebInspector.VisualStyleNumberInputBox(["border-top-width", "border-right-width", "border-bottom-width", "border-left-width"], WebInspector.UIString("Width"), this._keywords.borderWidth, this._units.defaults);
            properties.borderWidth.propertyReferenceName = "border-width";

            borderAllSize.element.appendChild(properties.borderStyle.element);
            borderAllSize.element.appendChild(properties.borderWidth.element);

            var borderAllStyle = new WebInspector.DetailsSectionRow();

            properties.borderColor = new WebInspector.VisualStyleColorPicker(["border-top-color", "border-right-color", "border-bottom-color", "border-left-color"], WebInspector.UIString("Color"));
            properties.borderColor.propertyReferenceName = "border-color";
            properties.borderRadius = new WebInspector.VisualStyleNumberInputBox(["border-top-left-radius", "border-top-right-radius", "border-bottom-left-radius", "border-bottom-right-radius"], WebInspector.UIString("Radius"), this._keywords.defaults, this._units.defaults);
            properties.borderRadius.propertyReferenceName = "border-radius";

            borderAllStyle.element.appendChild(properties.borderColor.element);
            borderAllStyle.element.appendChild(properties.borderRadius.element);

            var borderAllProperties = [properties.borderStyle, properties.borderWidth, properties.borderColor, properties.borderRadius];
            var borderAllGroup = new WebInspector.DetailsSectionGroup([borderAllSize, borderAllStyle]);

            var borderTopSize = new WebInspector.DetailsSectionRow();

            properties.borderTopStyle = new WebInspector.VisualStyleKeywordPicker("border-top-style", WebInspector.UIString("Style"), this._keywords.borderStyle);
            properties.borderTopWidth = new WebInspector.VisualStyleNumberInputBox("border-top-width", WebInspector.UIString("Width"), this._keywords.borderWidth, this._units.defaults);

            borderTopSize.element.appendChild(properties.borderTopStyle.element);
            borderTopSize.element.appendChild(properties.borderTopWidth.element);

            var borderTopStyle = new WebInspector.DetailsSectionRow();

            properties.borderTopColor = new WebInspector.VisualStyleColorPicker("border-top-color", WebInspector.UIString("Color"));
            properties.borderTopRadius = new WebInspector.VisualStyleNumberInputBox(["border-top-left-radius", "border-top-right-radius"], WebInspector.UIString("Radius"), this._keywords.defaults, this._units.defaults);

            borderTopStyle.element.appendChild(properties.borderTopColor.element);
            borderTopStyle.element.appendChild(properties.borderTopRadius.element);

            var borderTopProperties = [properties.borderTopStyle, properties.borderTopWidth, properties.borderTopColor, properties.borderTopRadius];
            var borderTopGroup = new WebInspector.DetailsSectionGroup([borderTopSize, borderTopStyle]);

            var borderRightSize = new WebInspector.DetailsSectionRow();

            properties.borderRightStyle = new WebInspector.VisualStyleKeywordPicker("border-right-style", WebInspector.UIString("Style"), this._keywords.borderStyle);
            properties.borderRightWidth = new WebInspector.VisualStyleNumberInputBox("border-right-width", WebInspector.UIString("Width"), this._keywords.borderWidth, this._units.defaults);

            borderRightSize.element.appendChild(properties.borderRightStyle.element);
            borderRightSize.element.appendChild(properties.borderRightWidth.element);

            var borderRightStyle = new WebInspector.DetailsSectionRow();

            properties.borderRightColor = new WebInspector.VisualStyleColorPicker("border-right-color", WebInspector.UIString("Color"));
            properties.borderRightRadius = new WebInspector.VisualStyleNumberInputBox(["border-top-right-radius", "border-bottom-right-radius"], WebInspector.UIString("Radius"), this._keywords.defaults, this._units.defaults);

            borderRightStyle.element.appendChild(properties.borderRightColor.element);
            borderRightStyle.element.appendChild(properties.borderRightRadius.element);

            var borderRightProperties = [properties.borderRightStyle, properties.borderRightWidth, properties.borderRightColor, properties.borderRightRadius];
            var borderRightGroup = new WebInspector.DetailsSectionGroup([borderRightSize, borderRightStyle]);

            var borderBottomSize = new WebInspector.DetailsSectionRow();

            properties.borderBottomStyle = new WebInspector.VisualStyleKeywordPicker("border-bottom-style", WebInspector.UIString("Style"), this._keywords.borderStyle);
            properties.borderBottomWidth = new WebInspector.VisualStyleNumberInputBox("border-bottom-width", WebInspector.UIString("Width"), this._keywords.borderWidth, this._units.defaults);

            borderBottomSize.element.appendChild(properties.borderBottomStyle.element);
            borderBottomSize.element.appendChild(properties.borderBottomWidth.element);

            var borderBottomStyle = new WebInspector.DetailsSectionRow();

            properties.borderBottomColor = new WebInspector.VisualStyleColorPicker("border-bottom-color", WebInspector.UIString("Color"));
            properties.borderBottomRadius = new WebInspector.VisualStyleNumberInputBox(["border-bottom-left-radius", "border-bottom-right-radius"], WebInspector.UIString("Radius"), this._keywords.defaults, this._units.defaults);

            borderBottomStyle.element.appendChild(properties.borderBottomColor.element);
            borderBottomStyle.element.appendChild(properties.borderBottomRadius.element);

            var borderBottomProperties = [properties.borderBottomStyle, properties.borderBottomWidth, properties.borderBottomColor, properties.borderBottomRadius];
            var borderBottomGroup = new WebInspector.DetailsSectionGroup([borderBottomSize, borderBottomStyle]);

            var borderLeftSize = new WebInspector.DetailsSectionRow();

            properties.borderLeftStyle = new WebInspector.VisualStyleKeywordPicker("border-left-style", WebInspector.UIString("Style"), this._keywords.borderStyle);
            properties.borderLeftWidth = new WebInspector.VisualStyleNumberInputBox("border-left-width", WebInspector.UIString("Width"), this._keywords.borderWidth, this._units.defaults);

            borderLeftSize.element.appendChild(properties.borderLeftStyle.element);
            borderLeftSize.element.appendChild(properties.borderLeftWidth.element);

            var borderLeftStyle = new WebInspector.DetailsSectionRow();

            properties.borderLeftColor = new WebInspector.VisualStyleColorPicker("border-left-color", WebInspector.UIString("Color"));
            properties.borderLeftRadius = new WebInspector.VisualStyleNumberInputBox(["border-top-left-radius", "border-bottom-left-radius"], WebInspector.UIString("Radius"), this._keywords.defaults, this._units.defaults);

            borderLeftStyle.element.appendChild(properties.borderLeftColor.element);
            borderLeftStyle.element.appendChild(properties.borderLeftRadius.element);

            var borderLeftProperties = [properties.borderLeftStyle, properties.borderLeftWidth, properties.borderLeftColor, properties.borderLeftRadius];
            var borderLeftGroup = new WebInspector.DetailsSectionGroup([borderLeftSize, borderLeftStyle]);

            var borderTabController = new WebInspector.VisualStyleTabbedPropertiesRow({
                "all": { title: WebInspector.UIString("All"), element: borderAllGroup.element, properties: borderAllProperties },
                "top": { title: WebInspector.UIString("Top"), element: borderTopGroup.element, properties: borderTopProperties },
                "right": { title: WebInspector.UIString("Right"), element: borderRightGroup.element, properties: borderRightProperties },
                "bottom": { title: WebInspector.UIString("Bottom"), element: borderBottomGroup.element, properties: borderBottomProperties },
                "left": { title: WebInspector.UIString("Left"), element: borderLeftGroup.element, properties: borderLeftProperties }
            });

            var highlightMode = "border";
            this._addMetricsMouseListeners(group.properties.borderWidth, highlightMode);
            this._addMetricsMouseListeners(group.properties.borderTopWidth, highlightMode);
            this._addMetricsMouseListeners(group.properties.borderBottomWidth, highlightMode);
            this._addMetricsMouseListeners(group.properties.borderLeftWidth, highlightMode);
            this._addMetricsMouseListeners(group.properties.borderRightWidth, highlightMode);

            group.autocompleteCompatibleProperties = [properties.borderColor, properties.borderTopColor, properties.borderBottomColor, properties.borderLeftColor, properties.borderRightColor];

            var borderGroup = new WebInspector.DetailsSectionGroup([borderTabController, borderAllGroup, borderTopGroup, borderRightGroup, borderBottomGroup, borderLeftGroup]);
            this._populateSection(group, [borderGroup]);
        }
    }, {
        key: "_populateOutlineSection",
        value: function _populateOutlineSection() {
            var group = this._groups.outline;
            var properties = group.properties;

            var outlineSizeRow = new WebInspector.DetailsSectionRow();

            properties.outlineWidth = new WebInspector.VisualStyleNumberInputBox("outline-width", WebInspector.UIString("Width"), this._keywords.borderWidth, this._units.defaults);
            properties.outlineOffset = new WebInspector.VisualStyleNumberInputBox("outline-offset", WebInspector.UIString("Offset"), this._keywords.defaults, this._units.defaults, true);

            outlineSizeRow.element.appendChild(properties.outlineWidth.element);
            outlineSizeRow.element.appendChild(properties.outlineOffset.element);

            var outlineStyleRow = new WebInspector.DetailsSectionRow();

            properties.outlineStyle = new WebInspector.VisualStyleKeywordPicker("outline-style", WebInspector.UIString("Style"), this._keywords.borderStyle);
            properties.outlineColor = new WebInspector.VisualStyleColorPicker("outline-color", WebInspector.UIString("Color"));

            outlineStyleRow.element.appendChild(properties.outlineStyle.element);
            outlineStyleRow.element.appendChild(properties.outlineColor.element);

            group.autocompleteCompatibleProperties = [properties.outlineColor];

            var outlineGroup = new WebInspector.DetailsSectionGroup([outlineSizeRow, outlineStyleRow]);
            this._populateSection(group, [outlineGroup]);
        }
    }, {
        key: "_populateBoxShadowSection",
        value: function _populateBoxShadowSection() {
            var group = this._groups.boxShadow;
            var properties = group.properties;

            var boxShadowRow = new WebInspector.DetailsSectionRow();

            properties.boxShadow = new WebInspector.VisualStyleCommaSeparatedKeywordEditor("box-shadow");
            properties.boxShadow.element.style.marginLeft = "11px";

            boxShadowRow.element.appendChild(properties.boxShadow.element);

            var boxShadowHRow = new WebInspector.DetailsSectionRow();

            var boxShadowH = new WebInspector.VisualStyleRelativeNumberSlider("box-shadow", WebInspector.UIString("Left"), null, this._units.defaultsSansPercent, true);

            boxShadowHRow.element.appendChild(boxShadowH.element);

            var boxShadowVRow = new WebInspector.DetailsSectionRow();

            var boxShadowV = new WebInspector.VisualStyleRelativeNumberSlider("box-shadow", WebInspector.UIString("Top"), null, this._units.defaultsSansPercent, true);

            boxShadowVRow.element.appendChild(boxShadowV.element);

            var boxShadowBlurRow = new WebInspector.DetailsSectionRow();

            var boxShadowBlur = new WebInspector.VisualStyleNumberInputBox("box-shadow", WebInspector.UIString("Blur"), null, this._units.defaultsSansPercent);
            boxShadowBlur.optionalProperty = true;
            var boxShadowSpread = new WebInspector.VisualStyleNumberInputBox("box-shadow", WebInspector.UIString("Spread"), null, this._units.defaultsSansPercent, true);
            boxShadowSpread.optionalProperty = true;

            boxShadowBlurRow.element.appendChild(boxShadowBlur.element);
            boxShadowBlurRow.element.appendChild(boxShadowSpread.element);

            var boxShadowColorRow = new WebInspector.DetailsSectionRow();

            var boxShadowColor = new WebInspector.VisualStyleColorPicker("box-shadow", WebInspector.UIString("Color"));
            boxShadowColor.colorProperty = true;
            var boxShadowInset = new WebInspector.VisualStyleKeywordCheckbox("box-shadow", WebInspector.UIString("Inset"), "Inset");
            boxShadowInset.optionalProperty = true;

            boxShadowColorRow.element.appendChild(boxShadowColor.element);
            boxShadowColorRow.element.appendChild(boxShadowInset.element);

            var boxShadowPropertyCombiner = new WebInspector.VisualStylePropertyCombiner("box-shadow", [boxShadowH, boxShadowV, boxShadowBlur, boxShadowSpread, boxShadowColor, boxShadowInset]);

            function noRemainingTreeItems() {
                boxShadowPropertyCombiner.updateValuesFromText("");
                boxShadowH.disabled = true;
                boxShadowV.disabled = true;
                boxShadowBlur.disabled = true;
                boxShadowSpread.disabled = true;
                boxShadowColor.disabled = true;
                boxShadowInset.disabled = true;
            }
            properties.boxShadow.addEventListener(WebInspector.VisualStyleCommaSeparatedKeywordEditor.Event.NoRemainingTreeItems, noRemainingTreeItems, this);

            function selectedBoxShadowItemValueChanged() {
                properties.boxShadow.selectedTreeElementValue = boxShadowPropertyCombiner.synthesizedValue;
            }
            boxShadowPropertyCombiner.addEventListener(WebInspector.VisualStylePropertyEditor.Event.ValueDidChange, selectedBoxShadowItemValueChanged, this);

            function boxShadowItemSelected(event) {
                boxShadowPropertyCombiner.updateValuesFromText(event.data.text || "");
            }
            properties.boxShadow.addEventListener(WebInspector.VisualStyleCommaSeparatedKeywordEditor.Event.TreeItemSelected, boxShadowItemSelected, this);

            group.autocompleteCompatibleProperties = [boxShadowColor];

            var boxShadow = new WebInspector.DetailsSectionGroup([boxShadowRow, boxShadowHRow, boxShadowVRow, boxShadowBlurRow, boxShadowColorRow]);
            this._populateSection(group, [boxShadow]);
        }
    }, {
        key: "_populateTransitionSection",
        value: function _populateTransitionSection() {
            var group = this._groups.transition;
            var properties = group.properties;

            var transitionRow = new WebInspector.DetailsSectionRow();

            properties.transition = new WebInspector.VisualStyleCommaSeparatedKeywordEditor("transition");
            properties.transition.element.style.marginLeft = "11px";

            transitionRow.element.appendChild(properties.transition.element);

            var transitionPropertyRow = new WebInspector.DetailsSectionRow();

            var transitionProperty = new WebInspector.VisualStylePropertyNameInput("transition-property", WebInspector.UIString("Property"));
            var transitionTiming = new WebInspector.VisualStyleTimingEditor("transition-timing-function", WebInspector.UIString("Timing"), ["Linear", "Ease", "Ease In", "Ease Out", "Ease In Out"]);

            transitionPropertyRow.element.appendChild(transitionProperty.element);
            transitionPropertyRow.element.appendChild(transitionTiming.element);

            var transitionDurationRow = new WebInspector.DetailsSectionRow();

            var transitionTimeKeywords = ["s", "ms"];
            var transitionDuration = new WebInspector.VisualStyleNumberInputBox("transition-duration", WebInspector.UIString("Duration"), null, transitionTimeKeywords);
            var transitionDelay = new WebInspector.VisualStyleNumberInputBox("transition-delay", WebInspector.UIString("Delay"), null, transitionTimeKeywords);
            transitionDelay.optionalProperty = true;

            transitionDurationRow.element.appendChild(transitionDuration.element);
            transitionDurationRow.element.appendChild(transitionDelay.element);

            var transitionPropertyCombiner = new WebInspector.VisualStylePropertyCombiner("transition", [transitionProperty, transitionTiming, transitionDuration, transitionDelay]);

            function noRemainingTreeItems() {
                transitionPropertyCombiner.updateValuesFromText("");
                transitionProperty.disabled = true;
                transitionTiming.disabled = true;
                transitionDuration.disabled = true;
                transitionDelay.disabled = true;
            }
            properties.transition.addEventListener(WebInspector.VisualStyleCommaSeparatedKeywordEditor.Event.NoRemainingTreeItems, noRemainingTreeItems, this);

            function selectedtransitionItemValueChanged() {
                properties.transition.selectedTreeElementValue = transitionPropertyCombiner.synthesizedValue;
            }
            transitionPropertyCombiner.addEventListener(WebInspector.VisualStylePropertyEditor.Event.ValueDidChange, selectedtransitionItemValueChanged, this);

            function transitionItemSelected(event) {
                transitionPropertyCombiner.updateValuesFromText(event.data.text || "");
            }
            properties.transition.addEventListener(WebInspector.VisualStyleCommaSeparatedKeywordEditor.Event.TreeItemSelected, transitionItemSelected, this);

            group.autocompleteCompatibleProperties = [transitionProperty];

            var transitionGroup = new WebInspector.DetailsSectionGroup([transitionRow, transitionPropertyRow, transitionDurationRow]);
            this._populateSection(group, [transitionGroup]);
        }
    }, {
        key: "_initialTextList",
        get: function get() {
            return this._currentStyle[WebInspector.VisualStyleDetailsPanel.InitialPropertySectionTextListSymbol];
        }
    }]);

    return VisualStyleDetailsPanel;
})(WebInspector.StyleDetailsPanel);

WebInspector.VisualStyleDetailsPanel.StyleDisabledSymbol = Symbol("visual-style-style-disabled");
WebInspector.VisualStyleDetailsPanel.InitialPropertySectionTextListSymbol = Symbol("visual-style-initial-property-section-text");

// FIXME: Add information about each property as a form of documentation.  This is currently empty as
// we do not have permission to use the info on sites like MDN and have not written anything ourselves.
WebInspector.VisualStyleDetailsPanel.propertyReferenceInfo = {};
