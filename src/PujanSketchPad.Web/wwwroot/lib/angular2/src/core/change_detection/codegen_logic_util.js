'use strict';var lang_1 = require('angular2/src/facade/lang');
var codegen_facade_1 = require('./codegen_facade');
var proto_record_1 = require('./proto_record');
var exceptions_1 = require('angular2/src/facade/exceptions');
/**
 * Class responsible for providing change detection logic for change detector classes.
 */
var CodegenLogicUtil = (function () {
    function CodegenLogicUtil(_names, _utilName, _changeDetectorStateName) {
        this._names = _names;
        this._utilName = _utilName;
        this._changeDetectorStateName = _changeDetectorStateName;
    }
    /**
     * Generates a statement which updates the local variable representing `protoRec` with the current
     * value of the record. Used by property bindings.
     */
    CodegenLogicUtil.prototype.genPropertyBindingEvalValue = function (protoRec) {
        var _this = this;
        return this._genEvalValue(protoRec, function (idx) { return _this._names.getLocalName(idx); }, this._names.getLocalsAccessorName());
    };
    /**
     * Generates a statement which updates the local variable representing `protoRec` with the current
     * value of the record. Used by event bindings.
     */
    CodegenLogicUtil.prototype.genEventBindingEvalValue = function (eventRecord, protoRec) {
        var _this = this;
        return this._genEvalValue(protoRec, function (idx) { return _this._names.getEventLocalName(eventRecord, idx); }, "locals");
    };
    CodegenLogicUtil.prototype._genEvalValue = function (protoRec, getLocalName, localsAccessor) {
        var context = (protoRec.contextIndex == -1) ?
            this._names.getDirectiveName(protoRec.directiveIndex) :
            getLocalName(protoRec.contextIndex);
        var argString = protoRec.args.map(function (arg) { return getLocalName(arg); }).join(", ");
        var rhs;
        switch (protoRec.mode) {
            case proto_record_1.RecordType.Self:
                rhs = context;
                break;
            case proto_record_1.RecordType.Const:
                rhs = codegen_facade_1.codify(protoRec.funcOrValue);
                break;
            case proto_record_1.RecordType.PropertyRead:
                rhs = context + "." + protoRec.name;
                break;
            case proto_record_1.RecordType.SafeProperty:
                var read = context + "." + protoRec.name;
                rhs = this._utilName + ".isValueBlank(" + context + ") ? null : " + read;
                break;
            case proto_record_1.RecordType.PropertyWrite:
                rhs = context + "." + protoRec.name + " = " + getLocalName(protoRec.args[0]);
                break;
            case proto_record_1.RecordType.Local:
                rhs = localsAccessor + ".get(" + codegen_facade_1.rawString(protoRec.name) + ")";
                break;
            case proto_record_1.RecordType.InvokeMethod:
                rhs = context + "." + protoRec.name + "(" + argString + ")";
                break;
            case proto_record_1.RecordType.SafeMethodInvoke:
                var invoke = context + "." + protoRec.name + "(" + argString + ")";
                rhs = this._utilName + ".isValueBlank(" + context + ") ? null : " + invoke;
                break;
            case proto_record_1.RecordType.InvokeClosure:
                rhs = context + "(" + argString + ")";
                break;
            case proto_record_1.RecordType.PrimitiveOp:
                rhs = this._utilName + "." + protoRec.name + "(" + argString + ")";
                break;
            case proto_record_1.RecordType.CollectionLiteral:
                rhs = this._utilName + "." + protoRec.name + "(" + argString + ")";
                break;
            case proto_record_1.RecordType.Interpolate:
                rhs = this._genInterpolation(protoRec);
                break;
            case proto_record_1.RecordType.KeyedRead:
                rhs = context + "[" + getLocalName(protoRec.args[0]) + "]";
                break;
            case proto_record_1.RecordType.KeyedWrite:
                rhs = context + "[" + getLocalName(protoRec.args[0]) + "] = " + getLocalName(protoRec.args[1]);
                break;
            case proto_record_1.RecordType.Chain:
                rhs = "" + getLocalName(protoRec.args[protoRec.args.length - 1]);
                break;
            default:
                throw new exceptions_1.BaseException("Unknown operation " + protoRec.mode);
        }
        return getLocalName(protoRec.selfIndex) + " = " + rhs + ";";
    };
    CodegenLogicUtil.prototype.genPropertyBindingTargets = function (propertyBindingTargets, genDebugInfo) {
        var _this = this;
        var bs = propertyBindingTargets.map(function (b) {
            if (lang_1.isBlank(b))
                return "null";
            var debug = genDebugInfo ? codegen_facade_1.codify(b.debug) : "null";
            return _this._utilName + ".bindingTarget(" + codegen_facade_1.codify(b.mode) + ", " + b.elementIndex + ", " + codegen_facade_1.codify(b.name) + ", " + codegen_facade_1.codify(b.unit) + ", " + debug + ")";
        });
        return "[" + bs.join(", ") + "]";
    };
    CodegenLogicUtil.prototype.genDirectiveIndices = function (directiveRecords) {
        var _this = this;
        var bs = directiveRecords.map(function (b) {
            return (_this._utilName + ".directiveIndex(" + b.directiveIndex.elementIndex + ", " + b.directiveIndex.directiveIndex + ")");
        });
        return "[" + bs.join(", ") + "]";
    };
    /** @internal */
    CodegenLogicUtil.prototype._genInterpolation = function (protoRec) {
        var iVals = [];
        for (var i = 0; i < protoRec.args.length; ++i) {
            iVals.push(codegen_facade_1.codify(protoRec.fixedArgs[i]));
            iVals.push(this._utilName + ".s(" + this._names.getLocalName(protoRec.args[i]) + ")");
        }
        iVals.push(codegen_facade_1.codify(protoRec.fixedArgs[protoRec.args.length]));
        return codegen_facade_1.combineGeneratedStrings(iVals);
    };
    CodegenLogicUtil.prototype.genHydrateDirectives = function (directiveRecords) {
        var _this = this;
        var res = [];
        var outputCount = 0;
        for (var i = 0; i < directiveRecords.length; ++i) {
            var r = directiveRecords[i];
            var dirVarName = this._names.getDirectiveName(r.directiveIndex);
            res.push(dirVarName + " = " + this._genReadDirective(i) + ";");
            if (lang_1.isPresent(r.outputs)) {
                r.outputs.forEach(function (output) {
                    var eventHandlerExpr = _this._genEventHandler(r.directiveIndex.elementIndex, output[1]);
                    var statementStart = "this.outputSubscriptions[" + outputCount++ + "] = " + dirVarName + "." + output[0];
                    if (lang_1.IS_DART) {
                        res.push(statementStart + ".listen(" + eventHandlerExpr + ");");
                    }
                    else {
                        res.push(statementStart + ".subscribe({next: " + eventHandlerExpr + "});");
                    }
                });
            }
        }
        if (outputCount > 0) {
            var statementStart = 'this.outputSubscriptions';
            if (lang_1.IS_DART) {
                res.unshift(statementStart + " = new List(" + outputCount + ");");
            }
            else {
                res.unshift(statementStart + " = new Array(" + outputCount + ");");
            }
        }
        return res.join("\n");
    };
    CodegenLogicUtil.prototype.genDirectivesOnDestroy = function (directiveRecords) {
        var res = [];
        for (var i = 0; i < directiveRecords.length; ++i) {
            var r = directiveRecords[i];
            if (r.callOnDestroy) {
                var dirVarName = this._names.getDirectiveName(r.directiveIndex);
                res.push(dirVarName + ".ngOnDestroy();");
            }
        }
        return res.join("\n");
    };
    CodegenLogicUtil.prototype._genEventHandler = function (boundElementIndex, eventName) {
        if (lang_1.IS_DART) {
            return "(event) => this.handleEvent('" + eventName + "', " + boundElementIndex + ", event)";
        }
        else {
            return "(function(event) { return this.handleEvent('" + eventName + "', " + boundElementIndex + ", event); }).bind(this)";
        }
    };
    CodegenLogicUtil.prototype._genReadDirective = function (index) { return "this.getDirectiveFor(directives, " + index + ")"; };
    CodegenLogicUtil.prototype.genHydrateDetectors = function (directiveRecords) {
        var res = [];
        for (var i = 0; i < directiveRecords.length; ++i) {
            var r = directiveRecords[i];
            if (!r.isDefaultChangeDetection()) {
                res.push(this._names.getDetectorName(r.directiveIndex) + " = this.getDetectorFor(directives, " + i + ");");
            }
        }
        return res.join("\n");
    };
    CodegenLogicUtil.prototype.genContentLifecycleCallbacks = function (directiveRecords) {
        var res = [];
        var eq = lang_1.IS_DART ? '==' : '===';
        // NOTE(kegluneq): Order is important!
        for (var i = directiveRecords.length - 1; i >= 0; --i) {
            var dir = directiveRecords[i];
            if (dir.callAfterContentInit) {
                res.push("if(" + this._names.getStateName() + " " + eq + " " + this._changeDetectorStateName + ".NeverChecked) " + this._names.getDirectiveName(dir.directiveIndex) + ".ngAfterContentInit();");
            }
            if (dir.callAfterContentChecked) {
                res.push(this._names.getDirectiveName(dir.directiveIndex) + ".ngAfterContentChecked();");
            }
        }
        return res;
    };
    CodegenLogicUtil.prototype.genViewLifecycleCallbacks = function (directiveRecords) {
        var res = [];
        var eq = lang_1.IS_DART ? '==' : '===';
        // NOTE(kegluneq): Order is important!
        for (var i = directiveRecords.length - 1; i >= 0; --i) {
            var dir = directiveRecords[i];
            if (dir.callAfterViewInit) {
                res.push("if(" + this._names.getStateName() + " " + eq + " " + this._changeDetectorStateName + ".NeverChecked) " + this._names.getDirectiveName(dir.directiveIndex) + ".ngAfterViewInit();");
            }
            if (dir.callAfterViewChecked) {
                res.push(this._names.getDirectiveName(dir.directiveIndex) + ".ngAfterViewChecked();");
            }
        }
        return res;
    };
    return CodegenLogicUtil;
})();
exports.CodegenLogicUtil = CodegenLogicUtil;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZWdlbl9sb2dpY191dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jb2RlZ2VuX2xvZ2ljX3V0aWwudHMiXSwibmFtZXMiOlsiQ29kZWdlbkxvZ2ljVXRpbCIsIkNvZGVnZW5Mb2dpY1V0aWwuY29uc3RydWN0b3IiLCJDb2RlZ2VuTG9naWNVdGlsLmdlblByb3BlcnR5QmluZGluZ0V2YWxWYWx1ZSIsIkNvZGVnZW5Mb2dpY1V0aWwuZ2VuRXZlbnRCaW5kaW5nRXZhbFZhbHVlIiwiQ29kZWdlbkxvZ2ljVXRpbC5fZ2VuRXZhbFZhbHVlIiwiQ29kZWdlbkxvZ2ljVXRpbC5nZW5Qcm9wZXJ0eUJpbmRpbmdUYXJnZXRzIiwiQ29kZWdlbkxvZ2ljVXRpbC5nZW5EaXJlY3RpdmVJbmRpY2VzIiwiQ29kZWdlbkxvZ2ljVXRpbC5fZ2VuSW50ZXJwb2xhdGlvbiIsIkNvZGVnZW5Mb2dpY1V0aWwuZ2VuSHlkcmF0ZURpcmVjdGl2ZXMiLCJDb2RlZ2VuTG9naWNVdGlsLmdlbkRpcmVjdGl2ZXNPbkRlc3Ryb3kiLCJDb2RlZ2VuTG9naWNVdGlsLl9nZW5FdmVudEhhbmRsZXIiLCJDb2RlZ2VuTG9naWNVdGlsLl9nZW5SZWFkRGlyZWN0aXZlIiwiQ29kZWdlbkxvZ2ljVXRpbC5nZW5IeWRyYXRlRGV0ZWN0b3JzIiwiQ29kZWdlbkxvZ2ljVXRpbC5nZW5Db250ZW50TGlmZWN5Y2xlQ2FsbGJhY2tzIiwiQ29kZWdlbkxvZ2ljVXRpbC5nZW5WaWV3TGlmZWN5Y2xlQ2FsbGJhY2tzIl0sIm1hcHBpbmdzIjoiQUFBQSxxQkFBK0QsMEJBQTBCLENBQUMsQ0FBQTtBQUUxRiwrQkFBeUQsa0JBQWtCLENBQUMsQ0FBQTtBQUM1RSw2QkFBc0MsZ0JBQWdCLENBQUMsQ0FBQTtBQUd2RCwyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUU3RDs7R0FFRztBQUNIO0lBQ0VBLDBCQUFvQkEsTUFBdUJBLEVBQVVBLFNB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O0FBQURBLENBQUNBLEFBcE9ELElBb09DO0FBcE9ZLHdCQUFnQixtQkFvTzVCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0lTX0RBUlQsIEpzb24sIFN0cmluZ1dyYXBwZXIsIGlzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7Q29kZWdlbk5hbWVVdGlsfSBmcm9tICcuL2NvZGVnZW5fbmFtZV91dGlsJztcbmltcG9ydCB7Y29kaWZ5LCBjb21iaW5lR2VuZXJhdGVkU3RyaW5ncywgcmF3U3RyaW5nfSBmcm9tICcuL2NvZGVnZW5fZmFjYWRlJztcbmltcG9ydCB7UHJvdG9SZWNvcmQsIFJlY29yZFR5cGV9IGZyb20gJy4vcHJvdG9fcmVjb3JkJztcbmltcG9ydCB7QmluZGluZ1RhcmdldH0gZnJvbSAnLi9iaW5kaW5nX3JlY29yZCc7XG5pbXBvcnQge0RpcmVjdGl2ZVJlY29yZH0gZnJvbSAnLi9kaXJlY3RpdmVfcmVjb3JkJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcblxuLyoqXG4gKiBDbGFzcyByZXNwb25zaWJsZSBmb3IgcHJvdmlkaW5nIGNoYW5nZSBkZXRlY3Rpb24gbG9naWMgZm9yIGNoYW5nZSBkZXRlY3RvciBjbGFzc2VzLlxuICovXG5leHBvcnQgY2xhc3MgQ29kZWdlbkxvZ2ljVXRpbCB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX25hbWVzOiBDb2RlZ2VuTmFtZVV0aWwsIHByaXZhdGUgX3V0aWxOYW1lOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHByaXZhdGUgX2NoYW5nZURldGVjdG9yU3RhdGVOYW1lOiBzdHJpbmcpIHt9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlcyBhIHN0YXRlbWVudCB3aGljaCB1cGRhdGVzIHRoZSBsb2NhbCB2YXJpYWJsZSByZXByZXNlbnRpbmcgYHByb3RvUmVjYCB3aXRoIHRoZSBjdXJyZW50XG4gICAqIHZhbHVlIG9mIHRoZSByZWNvcmQuIFVzZWQgYnkgcHJvcGVydHkgYmluZGluZ3MuXG4gICAqL1xuICBnZW5Qcm9wZXJ0eUJpbmRpbmdFdmFsVmFsdWUocHJvdG9SZWM6IFByb3RvUmVjb3JkKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fZ2VuRXZhbFZhbHVlKHByb3RvUmVjLCBpZHggPT4gdGhpcy5fbmFtZXMuZ2V0TG9jYWxOYW1lKGlkeCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9uYW1lcy5nZXRMb2NhbHNBY2Nlc3Nvck5hbWUoKSk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGVzIGEgc3RhdGVtZW50IHdoaWNoIHVwZGF0ZXMgdGhlIGxvY2FsIHZhcmlhYmxlIHJlcHJlc2VudGluZyBgcHJvdG9SZWNgIHdpdGggdGhlIGN1cnJlbnRcbiAgICogdmFsdWUgb2YgdGhlIHJlY29yZC4gVXNlZCBieSBldmVudCBiaW5kaW5ncy5cbiAgICovXG4gIGdlbkV2ZW50QmluZGluZ0V2YWxWYWx1ZShldmVudFJlY29yZDogYW55LCBwcm90b1JlYzogUHJvdG9SZWNvcmQpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9nZW5FdmFsVmFsdWUocHJvdG9SZWMsIGlkeCA9PiB0aGlzLl9uYW1lcy5nZXRFdmVudExvY2FsTmFtZShldmVudFJlY29yZCwgaWR4KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibG9jYWxzXCIpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2VuRXZhbFZhbHVlKHByb3RvUmVjOiBQcm90b1JlY29yZCwgZ2V0TG9jYWxOYW1lOiBGdW5jdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2Fsc0FjY2Vzc29yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHZhciBjb250ZXh0ID0gKHByb3RvUmVjLmNvbnRleHRJbmRleCA9PSAtMSkgP1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX25hbWVzLmdldERpcmVjdGl2ZU5hbWUocHJvdG9SZWMuZGlyZWN0aXZlSW5kZXgpIDpcbiAgICAgICAgICAgICAgICAgICAgICBnZXRMb2NhbE5hbWUocHJvdG9SZWMuY29udGV4dEluZGV4KTtcbiAgICB2YXIgYXJnU3RyaW5nID0gcHJvdG9SZWMuYXJncy5tYXAoYXJnID0+IGdldExvY2FsTmFtZShhcmcpKS5qb2luKFwiLCBcIik7XG5cbiAgICB2YXIgcmhzOiBzdHJpbmc7XG4gICAgc3dpdGNoIChwcm90b1JlYy5tb2RlKSB7XG4gICAgICBjYXNlIFJlY29yZFR5cGUuU2VsZjpcbiAgICAgICAgcmhzID0gY29udGV4dDtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5Db25zdDpcbiAgICAgICAgcmhzID0gY29kaWZ5KHByb3RvUmVjLmZ1bmNPclZhbHVlKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5Qcm9wZXJ0eVJlYWQ6XG4gICAgICAgIHJocyA9IGAke2NvbnRleHR9LiR7cHJvdG9SZWMubmFtZX1gO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBSZWNvcmRUeXBlLlNhZmVQcm9wZXJ0eTpcbiAgICAgICAgdmFyIHJlYWQgPSBgJHtjb250ZXh0fS4ke3Byb3RvUmVjLm5hbWV9YDtcbiAgICAgICAgcmhzID0gYCR7dGhpcy5fdXRpbE5hbWV9LmlzVmFsdWVCbGFuaygke2NvbnRleHR9KSA/IG51bGwgOiAke3JlYWR9YDtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5Qcm9wZXJ0eVdyaXRlOlxuICAgICAgICByaHMgPSBgJHtjb250ZXh0fS4ke3Byb3RvUmVjLm5hbWV9ID0gJHtnZXRMb2NhbE5hbWUocHJvdG9SZWMuYXJnc1swXSl9YDtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5Mb2NhbDpcbiAgICAgICAgcmhzID0gYCR7bG9jYWxzQWNjZXNzb3J9LmdldCgke3Jhd1N0cmluZyhwcm90b1JlYy5uYW1lKX0pYDtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5JbnZva2VNZXRob2Q6XG4gICAgICAgIHJocyA9IGAke2NvbnRleHR9LiR7cHJvdG9SZWMubmFtZX0oJHthcmdTdHJpbmd9KWA7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFJlY29yZFR5cGUuU2FmZU1ldGhvZEludm9rZTpcbiAgICAgICAgdmFyIGludm9rZSA9IGAke2NvbnRleHR9LiR7cHJvdG9SZWMubmFtZX0oJHthcmdTdHJpbmd9KWA7XG4gICAgICAgIHJocyA9IGAke3RoaXMuX3V0aWxOYW1lfS5pc1ZhbHVlQmxhbmsoJHtjb250ZXh0fSkgPyBudWxsIDogJHtpbnZva2V9YDtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5JbnZva2VDbG9zdXJlOlxuICAgICAgICByaHMgPSBgJHtjb250ZXh0fSgke2FyZ1N0cmluZ30pYDtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5QcmltaXRpdmVPcDpcbiAgICAgICAgcmhzID0gYCR7dGhpcy5fdXRpbE5hbWV9LiR7cHJvdG9SZWMubmFtZX0oJHthcmdTdHJpbmd9KWA7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFJlY29yZFR5cGUuQ29sbGVjdGlvbkxpdGVyYWw6XG4gICAgICAgIHJocyA9IGAke3RoaXMuX3V0aWxOYW1lfS4ke3Byb3RvUmVjLm5hbWV9KCR7YXJnU3RyaW5nfSlgO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBSZWNvcmRUeXBlLkludGVycG9sYXRlOlxuICAgICAgICByaHMgPSB0aGlzLl9nZW5JbnRlcnBvbGF0aW9uKHByb3RvUmVjKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5LZXllZFJlYWQ6XG4gICAgICAgIHJocyA9IGAke2NvbnRleHR9WyR7Z2V0TG9jYWxOYW1lKHByb3RvUmVjLmFyZ3NbMF0pfV1gO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBSZWNvcmRUeXBlLktleWVkV3JpdGU6XG4gICAgICAgIHJocyA9IGAke2NvbnRleHR9WyR7Z2V0TG9jYWxOYW1lKHByb3RvUmVjLmFyZ3NbMF0pfV0gPSAke2dldExvY2FsTmFtZShwcm90b1JlYy5hcmdzWzFdKX1gO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBSZWNvcmRUeXBlLkNoYWluOlxuICAgICAgICByaHMgPSBgJHtnZXRMb2NhbE5hbWUocHJvdG9SZWMuYXJnc1twcm90b1JlYy5hcmdzLmxlbmd0aCAtIDFdKX1gO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYFVua25vd24gb3BlcmF0aW9uICR7cHJvdG9SZWMubW9kZX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIGAke2dldExvY2FsTmFtZShwcm90b1JlYy5zZWxmSW5kZXgpfSA9ICR7cmhzfTtgO1xuICB9XG5cbiAgZ2VuUHJvcGVydHlCaW5kaW5nVGFyZ2V0cyhwcm9wZXJ0eUJpbmRpbmdUYXJnZXRzOiBCaW5kaW5nVGFyZ2V0W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VuRGVidWdJbmZvOiBib29sZWFuKTogc3RyaW5nIHtcbiAgICB2YXIgYnMgPSBwcm9wZXJ0eUJpbmRpbmdUYXJnZXRzLm1hcChiID0+IHtcbiAgICAgIGlmIChpc0JsYW5rKGIpKSByZXR1cm4gXCJudWxsXCI7XG5cbiAgICAgIHZhciBkZWJ1ZyA9IGdlbkRlYnVnSW5mbyA/IGNvZGlmeShiLmRlYnVnKSA6IFwibnVsbFwiO1xuICAgICAgcmV0dXJuIGAke3RoaXMuX3V0aWxOYW1lfS5iaW5kaW5nVGFyZ2V0KCR7Y29kaWZ5KGIubW9kZSl9LCAke2IuZWxlbWVudEluZGV4fSwgJHtjb2RpZnkoYi5uYW1lKX0sICR7Y29kaWZ5KGIudW5pdCl9LCAke2RlYnVnfSlgO1xuICAgIH0pO1xuICAgIHJldHVybiBgWyR7YnMuam9pbihcIiwgXCIpfV1gO1xuICB9XG5cbiAgZ2VuRGlyZWN0aXZlSW5kaWNlcyhkaXJlY3RpdmVSZWNvcmRzOiBEaXJlY3RpdmVSZWNvcmRbXSk6IHN0cmluZyB7XG4gICAgdmFyIGJzID0gZGlyZWN0aXZlUmVjb3Jkcy5tYXAoXG4gICAgICAgIGIgPT5cbiAgICAgICAgICAgIGAke3RoaXMuX3V0aWxOYW1lfS5kaXJlY3RpdmVJbmRleCgke2IuZGlyZWN0aXZlSW5kZXguZWxlbWVudEluZGV4fSwgJHtiLmRpcmVjdGl2ZUluZGV4LmRpcmVjdGl2ZUluZGV4fSlgKTtcbiAgICByZXR1cm4gYFske2JzLmpvaW4oXCIsIFwiKX1dYDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dlbkludGVycG9sYXRpb24ocHJvdG9SZWM6IFByb3RvUmVjb3JkKTogc3RyaW5nIHtcbiAgICB2YXIgaVZhbHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3RvUmVjLmFyZ3MubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlWYWxzLnB1c2goY29kaWZ5KHByb3RvUmVjLmZpeGVkQXJnc1tpXSkpO1xuICAgICAgaVZhbHMucHVzaChgJHt0aGlzLl91dGlsTmFtZX0ucygke3RoaXMuX25hbWVzLmdldExvY2FsTmFtZShwcm90b1JlYy5hcmdzW2ldKX0pYCk7XG4gICAgfVxuICAgIGlWYWxzLnB1c2goY29kaWZ5KHByb3RvUmVjLmZpeGVkQXJnc1twcm90b1JlYy5hcmdzLmxlbmd0aF0pKTtcbiAgICByZXR1cm4gY29tYmluZUdlbmVyYXRlZFN0cmluZ3MoaVZhbHMpO1xuICB9XG5cbiAgZ2VuSHlkcmF0ZURpcmVjdGl2ZXMoZGlyZWN0aXZlUmVjb3JkczogRGlyZWN0aXZlUmVjb3JkW10pOiBzdHJpbmcge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICB2YXIgb3V0cHV0Q291bnQgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGlyZWN0aXZlUmVjb3Jkcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHIgPSBkaXJlY3RpdmVSZWNvcmRzW2ldO1xuICAgICAgdmFyIGRpclZhck5hbWUgPSB0aGlzLl9uYW1lcy5nZXREaXJlY3RpdmVOYW1lKHIuZGlyZWN0aXZlSW5kZXgpO1xuICAgICAgcmVzLnB1c2goYCR7ZGlyVmFyTmFtZX0gPSAke3RoaXMuX2dlblJlYWREaXJlY3RpdmUoaSl9O2ApO1xuICAgICAgaWYgKGlzUHJlc2VudChyLm91dHB1dHMpKSB7XG4gICAgICAgIHIub3V0cHV0cy5mb3JFYWNoKG91dHB1dCA9PiB7XG4gICAgICAgICAgdmFyIGV2ZW50SGFuZGxlckV4cHIgPSB0aGlzLl9nZW5FdmVudEhhbmRsZXIoci5kaXJlY3RpdmVJbmRleC5lbGVtZW50SW5kZXgsIG91dHB1dFsxXSk7XG4gICAgICAgICAgdmFyIHN0YXRlbWVudFN0YXJ0ID1cbiAgICAgICAgICAgICAgYHRoaXMub3V0cHV0U3Vic2NyaXB0aW9uc1ske291dHB1dENvdW50Kyt9XSA9ICR7ZGlyVmFyTmFtZX0uJHtvdXRwdXRbMF19YDtcbiAgICAgICAgICBpZiAoSVNfREFSVCkge1xuICAgICAgICAgICAgcmVzLnB1c2goYCR7c3RhdGVtZW50U3RhcnR9Lmxpc3Rlbigke2V2ZW50SGFuZGxlckV4cHJ9KTtgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzLnB1c2goYCR7c3RhdGVtZW50U3RhcnR9LnN1YnNjcmliZSh7bmV4dDogJHtldmVudEhhbmRsZXJFeHByfX0pO2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChvdXRwdXRDb3VudCA+IDApIHtcbiAgICAgIHZhciBzdGF0ZW1lbnRTdGFydCA9ICd0aGlzLm91dHB1dFN1YnNjcmlwdGlvbnMnO1xuICAgICAgaWYgKElTX0RBUlQpIHtcbiAgICAgICAgcmVzLnVuc2hpZnQoYCR7c3RhdGVtZW50U3RhcnR9ID0gbmV3IExpc3QoJHtvdXRwdXRDb3VudH0pO2ApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzLnVuc2hpZnQoYCR7c3RhdGVtZW50U3RhcnR9ID0gbmV3IEFycmF5KCR7b3V0cHV0Q291bnR9KTtgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcy5qb2luKFwiXFxuXCIpO1xuICB9XG5cbiAgZ2VuRGlyZWN0aXZlc09uRGVzdHJveShkaXJlY3RpdmVSZWNvcmRzOiBEaXJlY3RpdmVSZWNvcmRbXSk6IHN0cmluZyB7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGlyZWN0aXZlUmVjb3Jkcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHIgPSBkaXJlY3RpdmVSZWNvcmRzW2ldO1xuICAgICAgaWYgKHIuY2FsbE9uRGVzdHJveSkge1xuICAgICAgICB2YXIgZGlyVmFyTmFtZSA9IHRoaXMuX25hbWVzLmdldERpcmVjdGl2ZU5hbWUoci5kaXJlY3RpdmVJbmRleCk7XG4gICAgICAgIHJlcy5wdXNoKGAke2RpclZhck5hbWV9Lm5nT25EZXN0cm95KCk7YCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXMuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dlbkV2ZW50SGFuZGxlcihib3VuZEVsZW1lbnRJbmRleDogbnVtYmVyLCBldmVudE5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKElTX0RBUlQpIHtcbiAgICAgIHJldHVybiBgKGV2ZW50KSA9PiB0aGlzLmhhbmRsZUV2ZW50KCcke2V2ZW50TmFtZX0nLCAke2JvdW5kRWxlbWVudEluZGV4fSwgZXZlbnQpYDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGAoZnVuY3Rpb24oZXZlbnQpIHsgcmV0dXJuIHRoaXMuaGFuZGxlRXZlbnQoJyR7ZXZlbnROYW1lfScsICR7Ym91bmRFbGVtZW50SW5kZXh9LCBldmVudCk7IH0pLmJpbmQodGhpcylgO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2dlblJlYWREaXJlY3RpdmUoaW5kZXg6IG51bWJlcikgeyByZXR1cm4gYHRoaXMuZ2V0RGlyZWN0aXZlRm9yKGRpcmVjdGl2ZXMsICR7aW5kZXh9KWA7IH1cblxuICBnZW5IeWRyYXRlRGV0ZWN0b3JzKGRpcmVjdGl2ZVJlY29yZHM6IERpcmVjdGl2ZVJlY29yZFtdKTogc3RyaW5nIHtcbiAgICB2YXIgcmVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaXJlY3RpdmVSZWNvcmRzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgciA9IGRpcmVjdGl2ZVJlY29yZHNbaV07XG4gICAgICBpZiAoIXIuaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uKCkpIHtcbiAgICAgICAgcmVzLnB1c2goXG4gICAgICAgICAgICBgJHt0aGlzLl9uYW1lcy5nZXREZXRlY3Rvck5hbWUoci5kaXJlY3RpdmVJbmRleCl9ID0gdGhpcy5nZXREZXRlY3RvckZvcihkaXJlY3RpdmVzLCAke2l9KTtgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcy5qb2luKFwiXFxuXCIpO1xuICB9XG5cbiAgZ2VuQ29udGVudExpZmVjeWNsZUNhbGxiYWNrcyhkaXJlY3RpdmVSZWNvcmRzOiBEaXJlY3RpdmVSZWNvcmRbXSk6IHN0cmluZ1tdIHtcbiAgICB2YXIgcmVzID0gW107XG4gICAgdmFyIGVxID0gSVNfREFSVCA/ICc9PScgOiAnPT09JztcbiAgICAvLyBOT1RFKGtlZ2x1bmVxKTogT3JkZXIgaXMgaW1wb3J0YW50IVxuICAgIGZvciAodmFyIGkgPSBkaXJlY3RpdmVSZWNvcmRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICB2YXIgZGlyID0gZGlyZWN0aXZlUmVjb3Jkc1tpXTtcbiAgICAgIGlmIChkaXIuY2FsbEFmdGVyQ29udGVudEluaXQpIHtcbiAgICAgICAgcmVzLnB1c2goXG4gICAgICAgICAgICBgaWYoJHt0aGlzLl9uYW1lcy5nZXRTdGF0ZU5hbWUoKX0gJHtlcX0gJHt0aGlzLl9jaGFuZ2VEZXRlY3RvclN0YXRlTmFtZX0uTmV2ZXJDaGVja2VkKSAke3RoaXMuX25hbWVzLmdldERpcmVjdGl2ZU5hbWUoZGlyLmRpcmVjdGl2ZUluZGV4KX0ubmdBZnRlckNvbnRlbnRJbml0KCk7YCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChkaXIuY2FsbEFmdGVyQ29udGVudENoZWNrZWQpIHtcbiAgICAgICAgcmVzLnB1c2goYCR7dGhpcy5fbmFtZXMuZ2V0RGlyZWN0aXZlTmFtZShkaXIuZGlyZWN0aXZlSW5kZXgpfS5uZ0FmdGVyQ29udGVudENoZWNrZWQoKTtgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIGdlblZpZXdMaWZlY3ljbGVDYWxsYmFja3MoZGlyZWN0aXZlUmVjb3JkczogRGlyZWN0aXZlUmVjb3JkW10pOiBzdHJpbmdbXSB7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIHZhciBlcSA9IElTX0RBUlQgPyAnPT0nIDogJz09PSc7XG4gICAgLy8gTk9URShrZWdsdW5lcSk6IE9yZGVyIGlzIGltcG9ydGFudCFcbiAgICBmb3IgKHZhciBpID0gZGlyZWN0aXZlUmVjb3Jkcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgdmFyIGRpciA9IGRpcmVjdGl2ZVJlY29yZHNbaV07XG4gICAgICBpZiAoZGlyLmNhbGxBZnRlclZpZXdJbml0KSB7XG4gICAgICAgIHJlcy5wdXNoKFxuICAgICAgICAgICAgYGlmKCR7dGhpcy5fbmFtZXMuZ2V0U3RhdGVOYW1lKCl9ICR7ZXF9ICR7dGhpcy5fY2hhbmdlRGV0ZWN0b3JTdGF0ZU5hbWV9Lk5ldmVyQ2hlY2tlZCkgJHt0aGlzLl9uYW1lcy5nZXREaXJlY3RpdmVOYW1lKGRpci5kaXJlY3RpdmVJbmRleCl9Lm5nQWZ0ZXJWaWV3SW5pdCgpO2ApO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGlyLmNhbGxBZnRlclZpZXdDaGVja2VkKSB7XG4gICAgICAgIHJlcy5wdXNoKGAke3RoaXMuX25hbWVzLmdldERpcmVjdGl2ZU5hbWUoZGlyLmRpcmVjdGl2ZUluZGV4KX0ubmdBZnRlclZpZXdDaGVja2VkKCk7YCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbn1cbiJdfQ==