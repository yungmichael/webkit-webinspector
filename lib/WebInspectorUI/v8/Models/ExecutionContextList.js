/*
 * Copyright (C) 2013 Apple Inc. All rights reserved.
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

WebInspector.ExecutionContextList = function () {
    WebInspector.Object.call(this);

    this._contexts = [];
    this._pageExecutionContext = null;
};

WebInspector.ExecutionContextList.prototype = Object.defineProperties({
    constructor: WebInspector.ExecutionContextList,

    add: function add(context) {
        // FIXME: The backend sends duplicate page context execution contexts with the same id. Why?
        if (context.isPageContext && this._pageExecutionContext) {
            console.assert(context.id === this._pageExecutionContext.id);
            return false;
        }

        this._contexts.push(context);

        if (context.isPageContext) {
            console.assert(!this._pageExecutionContext);
            this._pageExecutionContext = context;
            return true;
        }

        return false;
    },

    clear: function clear() {
        this._contexts = [];
        this._pageExecutionContext = null;
    }
}, {
    pageExecutionContext: { // Public

        get: function get() {
            return this._pageExecutionContext;
        },
        configurable: true,
        enumerable: true
    },
    contexts: {
        get: function get() {
            return this._contexts;
        },
        configurable: true,
        enumerable: true
    }
});

WebInspector.ExecutionContextList.prototype.__proto__ = WebInspector.Object.prototype;