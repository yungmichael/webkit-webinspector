/*
 * Copyright (C) 2013 University of Washington. All rights reserved.
 * Copyright (C) 2014 Apple Inc. All rights reserved.
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
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.ProbeSetDataGridNode = function (dataGrid) {
    console.assert(dataGrid instanceof WebInspector.ProbeSetDataGrid, "Invalid ProbeSetDataGrid argument:", dataGrid);

    WebInspector.DataGridNode.call(this, this.data);
    this.dataGrid = dataGrid; // This is set to null in DataGridNode's constructor.
    this._data = {};

    this._element = document.createElement("tr");
    this._element.dataGridNode = this;
    this._element.classList.add("revealed");
};

WebInspector.ProbeSetDataGridNode.SeparatorStyleClassName = "separator";
WebInspector.ProbeSetDataGridNode.UnknownValueStyleClassName = "unknown-value";

WebInspector.ProbeSetDataGridNode.prototype = Object.defineProperties({
    constructor: WebInspector.ProbeSetDataGridNode,
    __proto__: WebInspector.DataGridNode.prototype,

    createCellContent: function createCellContent(columnIdentifier, cell) {
        var sample = this.data[columnIdentifier];
        if (sample === WebInspector.ProbeSetDataFrame.MissingValue) {
            cell.classList.add(WebInspector.ProbeSetDataGridNode.UnknownValueStyleClassName);
            return sample;
        }

        if (sample instanceof WebInspector.RemoteObject) {
            switch (sample.type) {
                case "function": // FIXME: is there a better way to visualize functions?
                case "object":
                    return new WebInspector.ObjectPropertiesSection(sample, WebInspector.ProbeSet.SampleObjectTitle).element;
                case "string":
                case "number":
                case "boolean":
                case "undefined":
                case "null":
                    return document.createTextNode(sample.value);
                case "array":
                // FIXME: reuse existing visualization of arrays here.
                default:
                    console.log("Don't know how to represent sample:", sample);
            }
        }

        return sample;
    },

    updateCellsFromFrame: function updateCellsFromFrame(frame, probeSet) {},

    updateCellsForSeparator: function updateCellsForSeparator(frame, probeSet) {
        this._element.classList.add(WebInspector.ProbeSetDataGridNode.SeparatorStyleClassName);
    }
}, {
    element: { // Public

        get: function get() {
            return this._element;
        },
        configurable: true,
        enumerable: true
    },
    data: {
        get: function get() {
            return this._data;
        },
        configurable: true,
        enumerable: true
    },
    frame: {
        set: function set(value) {
            console.assert(value instanceof WebInspector.ProbeSetDataFrame, "Invalid ProbeSetDataFrame argument: ", value);
            this._frame = value;

            var data = {};
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.dataGrid.probeSet.probes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var probe = _step.value;

                    var sample = this.frame[probe.id];
                    if (!sample || !sample.object) data[probe.id] = WebInspector.ProbeSetDataFrame.MissingValue;else data[probe.id] = sample.object;
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

            this._data = data;
        },
        get: function get() {
            return this._frame;
        },
        configurable: true,
        enumerable: true
    }
});
