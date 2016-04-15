var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { resolveForwardRef, Injectable } from 'angular2/src/core/di';
import { isPresent, stringify } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { DirectiveMetadata, ComponentMetadata, InputMetadata, OutputMetadata, HostBindingMetadata, HostListenerMetadata, ContentChildrenMetadata, ViewChildrenMetadata, ContentChildMetadata, ViewChildMetadata } from 'angular2/src/core/metadata';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { ReflectorReader } from 'angular2/src/core/reflection/reflector_reader';
function _isDirectiveMetadata(type) {
    return type instanceof DirectiveMetadata;
}
/*
 * Resolve a `Type` for {@link DirectiveMetadata}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
export let DirectiveResolver = class {
    constructor(_reflector) {
        if (isPresent(_reflector)) {
            this._reflector = _reflector;
        }
        else {
            this._reflector = reflector;
        }
    }
    /**
     * Return {@link DirectiveMetadata} for a given `Type`.
     */
    resolve(type) {
        var typeMetadata = this._reflector.annotations(resolveForwardRef(type));
        if (isPresent(typeMetadata)) {
            var metadata = typeMetadata.find(_isDirectiveMetadata);
            if (isPresent(metadata)) {
                var propertyMetadata = this._reflector.propMetadata(type);
                return this._mergeWithPropertyMetadata(metadata, propertyMetadata, type);
            }
        }
        throw new BaseException(`No Directive annotation found on ${stringify(type)}`);
    }
    _mergeWithPropertyMetadata(dm, propertyMetadata, directiveType) {
        var inputs = [];
        var outputs = [];
        var host = {};
        var queries = {};
        StringMapWrapper.forEach(propertyMetadata, (metadata, propName) => {
            metadata.forEach(a => {
                if (a instanceof InputMetadata) {
                    if (isPresent(a.bindingPropertyName)) {
                        inputs.push(`${propName}: ${a.bindingPropertyName}`);
                    }
                    else {
                        inputs.push(propName);
                    }
                }
                if (a instanceof OutputMetadata) {
                    if (isPresent(a.bindingPropertyName)) {
                        outputs.push(`${propName}: ${a.bindingPropertyName}`);
                    }
                    else {
                        outputs.push(propName);
                    }
                }
                if (a instanceof HostBindingMetadata) {
                    if (isPresent(a.hostPropertyName)) {
                        host[`[${a.hostPropertyName}]`] = propName;
                    }
                    else {
                        host[`[${propName}]`] = propName;
                    }
                }
                if (a instanceof HostListenerMetadata) {
                    var args = isPresent(a.args) ? a.args.join(', ') : '';
                    host[`(${a.eventName})`] = `${propName}(${args})`;
                }
                if (a instanceof ContentChildrenMetadata) {
                    queries[propName] = a;
                }
                if (a instanceof ViewChildrenMetadata) {
                    queries[propName] = a;
                }
                if (a instanceof ContentChildMetadata) {
                    queries[propName] = a;
                }
                if (a instanceof ViewChildMetadata) {
                    queries[propName] = a;
                }
            });
        });
        return this._merge(dm, inputs, outputs, host, queries, directiveType);
    }
    _merge(dm, inputs, outputs, host, queries, directiveType) {
        var mergedInputs = isPresent(dm.inputs) ? ListWrapper.concat(dm.inputs, inputs) : inputs;
        var mergedOutputs;
        if (isPresent(dm.outputs)) {
            dm.outputs.forEach((propName) => {
                if (ListWrapper.contains(outputs, propName)) {
                    throw new BaseException(`Output event '${propName}' defined multiple times in '${stringify(directiveType)}'`);
                }
            });
            mergedOutputs = ListWrapper.concat(dm.outputs, outputs);
        }
        else {
            mergedOutputs = outputs;
        }
        var mergedHost = isPresent(dm.host) ? StringMapWrapper.merge(dm.host, host) : host;
        var mergedQueries = isPresent(dm.queries) ? StringMapWrapper.merge(dm.queries, queries) : queries;
        if (dm instanceof ComponentMetadata) {
            return new ComponentMetadata({
                selector: dm.selector,
                inputs: mergedInputs,
                outputs: mergedOutputs,
                host: mergedHost,
                exportAs: dm.exportAs,
                moduleId: dm.moduleId,
                queries: mergedQueries,
                changeDetection: dm.changeDetection,
                providers: dm.providers,
                viewProviders: dm.viewProviders
            });
        }
        else {
            return new DirectiveMetadata({
                selector: dm.selector,
                inputs: mergedInputs,
                outputs: mergedOutputs,
                host: mergedHost,
                exportAs: dm.exportAs,
                queries: mergedQueries,
                providers: dm.providers
            });
        }
    }
};
DirectiveResolver = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ReflectorReader])
], DirectiveResolver);
export var CODEGEN_DIRECTIVE_RESOLVER = new DirectiveResolver(reflector);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlX3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2RpcmVjdGl2ZV9yZXNvbHZlci50cyJdLCJuYW1lcyI6WyJfaXNEaXJlY3RpdmVNZXRhZGF0YSIsIkRpcmVjdGl2ZVJlc29sdmVyIiwiRGlyZWN0aXZlUmVzb2x2ZXIuY29uc3RydWN0b3IiLCJEaXJlY3RpdmVSZXNvbHZlci5yZXNvbHZlIiwiRGlyZWN0aXZlUmVzb2x2ZXIuX21lcmdlV2l0aFByb3BlcnR5TWV0YWRhdGEiLCJEaXJlY3RpdmVSZXNvbHZlci5fbWVyZ2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsaUJBQWlCLEVBQUUsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO09BQzNELEVBQU8sU0FBUyxFQUFXLFNBQVMsRUFBQyxNQUFNLDBCQUEwQjtPQUNyRSxFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUFDLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGdDQUFnQztPQUVyRSxFQUNMLGlCQUFpQixFQUNqQixpQkFBaUIsRUFDakIsYUFBYSxFQUNiLGNBQWMsRUFDZCxtQkFBbUIsRUFDbkIsb0JBQW9CLEVBQ3BCLHVCQUF1QixFQUN2QixvQkFBb0IsRUFDcEIsb0JBQW9CLEVBQ3BCLGlCQUFpQixFQUNsQixNQUFNLDRCQUE0QjtPQUM1QixFQUFDLFNBQVMsRUFBQyxNQUFNLHlDQUF5QztPQUMxRCxFQUFDLGVBQWUsRUFBQyxNQUFNLCtDQUErQztBQUU3RSw4QkFBOEIsSUFBUztJQUNyQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsWUFBWUEsaUJBQWlCQSxDQUFDQTtBQUMzQ0EsQ0FBQ0E7QUFFRDs7Ozs7O0dBTUc7QUFDSDtJQUlFQyxZQUFZQSxVQUE0QkE7UUFDdENDLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzFCQSxJQUFJ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QSxPQUFPQSxFQUFFQSxhQUFhQTtnQkFDdEJBLGVBQWVBLEVBQUVBLEVBQUVBLENBQUNBLGVBQWVBO2dCQUNuQ0EsU0FBU0EsRUFBRUEsRUFBRUEsQ0FBQ0EsU0FBU0E7Z0JBQ3ZCQSxhQUFhQSxFQUFFQSxFQUFFQSxDQUFDQSxhQUFhQTthQUNoQ0EsQ0FBQ0EsQ0FBQ0E7UUFFTEEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsTUFBTUEsQ0FBQ0EsSUFBSUEsaUJBQWlCQSxDQUFDQTtnQkFDM0JBLFFBQVFBLEVBQUVBLEVBQUVBLENBQUNBLFFBQVFBO2dCQUNyQkEsTUFBTUEsRUFBRUEsWUFBWUE7Z0JBQ3BCQSxPQUFPQSxFQUFFQSxhQUFhQTtnQkFDdEJBLElBQUlBLEVBQUVBLFVBQVVBO2dCQUNoQkEsUUFBUUEsRUFBRUEsRUFBRUEsQ0FBQ0EsUUFBUUE7Z0JBQ3JCQSxPQUFPQSxFQUFFQSxhQUFhQTtnQkFDdEJBLFNBQVNBLEVBQUVBLEVBQUVBLENBQUNBLFNBQVNBO2FBQ3hCQSxDQUFDQSxDQUFDQTtRQUNMQSxDQUFDQTtJQUNIQSxDQUFDQTtBQUNISixDQUFDQTtBQXZJRDtJQUFDLFVBQVUsRUFBRTs7c0JBdUlaO0FBRUQsV0FBVywwQkFBMEIsR0FBRyxJQUFJLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtyZXNvbHZlRm9yd2FyZFJlZiwgSW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtUeXBlLCBpc1ByZXNlbnQsIGlzQmxhbmssIHN0cmluZ2lmeX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZU1ldGFkYXRhLFxuICBDb21wb25lbnRNZXRhZGF0YSxcbiAgSW5wdXRNZXRhZGF0YSxcbiAgT3V0cHV0TWV0YWRhdGEsXG4gIEhvc3RCaW5kaW5nTWV0YWRhdGEsXG4gIEhvc3RMaXN0ZW5lck1ldGFkYXRhLFxuICBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YSxcbiAgVmlld0NoaWxkcmVuTWV0YWRhdGEsXG4gIENvbnRlbnRDaGlsZE1ldGFkYXRhLFxuICBWaWV3Q2hpbGRNZXRhZGF0YVxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YSc7XG5pbXBvcnQge3JlZmxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0aW9uJztcbmltcG9ydCB7UmVmbGVjdG9yUmVhZGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rvcl9yZWFkZXInO1xuXG5mdW5jdGlvbiBfaXNEaXJlY3RpdmVNZXRhZGF0YSh0eXBlOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGUgaW5zdGFuY2VvZiBEaXJlY3RpdmVNZXRhZGF0YTtcbn1cblxuLypcbiAqIFJlc29sdmUgYSBgVHlwZWAgZm9yIHtAbGluayBEaXJlY3RpdmVNZXRhZGF0YX0uXG4gKlxuICogVGhpcyBpbnRlcmZhY2UgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdGhlIGFwcGxpY2F0aW9uIGRldmVsb3BlciB0byBjcmVhdGUgY3VzdG9tIGJlaGF2aW9yLlxuICpcbiAqIFNlZSB7QGxpbmsgQ29tcGlsZXJ9XG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEaXJlY3RpdmVSZXNvbHZlciB7XG4gIHByaXZhdGUgX3JlZmxlY3RvcjogUmVmbGVjdG9yUmVhZGVyO1xuXG4gIGNvbnN0cnVjdG9yKF9yZWZsZWN0b3I/OiBSZWZsZWN0b3JSZWFkZXIpIHtcbiAgICBpZiAoaXNQcmVzZW50KF9yZWZsZWN0b3IpKSB7XG4gICAgICB0aGlzLl9yZWZsZWN0b3IgPSBfcmVmbGVjdG9yO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9yZWZsZWN0b3IgPSByZWZsZWN0b3I7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB7QGxpbmsgRGlyZWN0aXZlTWV0YWRhdGF9IGZvciBhIGdpdmVuIGBUeXBlYC5cbiAgICovXG4gIHJlc29sdmUodHlwZTogVHlwZSk6IERpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgICB2YXIgdHlwZU1ldGFkYXRhID0gdGhpcy5fcmVmbGVjdG9yLmFubm90YXRpb25zKHJlc29sdmVGb3J3YXJkUmVmKHR5cGUpKTtcbiAgICBpZiAoaXNQcmVzZW50KHR5cGVNZXRhZGF0YSkpIHtcbiAgICAgIHZhciBtZXRhZGF0YSA9IHR5cGVNZXRhZGF0YS5maW5kKF9pc0RpcmVjdGl2ZU1ldGFkYXRhKTtcbiAgICAgIGlmIChpc1ByZXNlbnQobWV0YWRhdGEpKSB7XG4gICAgICAgIHZhciBwcm9wZXJ0eU1ldGFkYXRhID0gdGhpcy5fcmVmbGVjdG9yLnByb3BNZXRhZGF0YSh0eXBlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21lcmdlV2l0aFByb3BlcnR5TWV0YWRhdGEobWV0YWRhdGEsIHByb3BlcnR5TWV0YWRhdGEsIHR5cGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBObyBEaXJlY3RpdmUgYW5ub3RhdGlvbiBmb3VuZCBvbiAke3N0cmluZ2lmeSh0eXBlKX1gKTtcbiAgfVxuXG4gIHByaXZhdGUgX21lcmdlV2l0aFByb3BlcnR5TWV0YWRhdGEoZG06IERpcmVjdGl2ZU1ldGFkYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TWV0YWRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnlbXX0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlVHlwZTogVHlwZSk6IERpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgICB2YXIgaW5wdXRzID0gW107XG4gICAgdmFyIG91dHB1dHMgPSBbXTtcbiAgICB2YXIgaG9zdDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICB2YXIgcXVlcmllczoge1trZXk6IHN0cmluZ106IGFueX0gPSB7fTtcblxuICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChwcm9wZXJ0eU1ldGFkYXRhLCAobWV0YWRhdGE6IGFueVtdLCBwcm9wTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICBtZXRhZGF0YS5mb3JFYWNoKGEgPT4ge1xuICAgICAgICBpZiAoYSBpbnN0YW5jZW9mIElucHV0TWV0YWRhdGEpIHtcbiAgICAgICAgICBpZiAoaXNQcmVzZW50KGEuYmluZGluZ1Byb3BlcnR5TmFtZSkpIHtcbiAgICAgICAgICAgIGlucHV0cy5wdXNoKGAke3Byb3BOYW1lfTogJHthLmJpbmRpbmdQcm9wZXJ0eU5hbWV9YCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlucHV0cy5wdXNoKHByb3BOYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYSBpbnN0YW5jZW9mIE91dHB1dE1ldGFkYXRhKSB7XG4gICAgICAgICAgaWYgKGlzUHJlc2VudChhLmJpbmRpbmdQcm9wZXJ0eU5hbWUpKSB7XG4gICAgICAgICAgICBvdXRwdXRzLnB1c2goYCR7cHJvcE5hbWV9OiAke2EuYmluZGluZ1Byb3BlcnR5TmFtZX1gKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3V0cHV0cy5wdXNoKHByb3BOYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYSBpbnN0YW5jZW9mIEhvc3RCaW5kaW5nTWV0YWRhdGEpIHtcbiAgICAgICAgICBpZiAoaXNQcmVzZW50KGEuaG9zdFByb3BlcnR5TmFtZSkpIHtcbiAgICAgICAgICAgIGhvc3RbYFske2EuaG9zdFByb3BlcnR5TmFtZX1dYF0gPSBwcm9wTmFtZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaG9zdFtgWyR7cHJvcE5hbWV9XWBdID0gcHJvcE5hbWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGEgaW5zdGFuY2VvZiBIb3N0TGlzdGVuZXJNZXRhZGF0YSkge1xuICAgICAgICAgIHZhciBhcmdzID0gaXNQcmVzZW50KGEuYXJncykgPyAoPGFueVtdPmEuYXJncykuam9pbignLCAnKSA6ICcnO1xuICAgICAgICAgIGhvc3RbYCgke2EuZXZlbnROYW1lfSlgXSA9IGAke3Byb3BOYW1lfSgke2FyZ3N9KWA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYSBpbnN0YW5jZW9mIENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhKSB7XG4gICAgICAgICAgcXVlcmllc1twcm9wTmFtZV0gPSBhO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGEgaW5zdGFuY2VvZiBWaWV3Q2hpbGRyZW5NZXRhZGF0YSkge1xuICAgICAgICAgIHF1ZXJpZXNbcHJvcE5hbWVdID0gYTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgQ29udGVudENoaWxkTWV0YWRhdGEpIHtcbiAgICAgICAgICBxdWVyaWVzW3Byb3BOYW1lXSA9IGE7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYSBpbnN0YW5jZW9mIFZpZXdDaGlsZE1ldGFkYXRhKSB7XG4gICAgICAgICAgcXVlcmllc1twcm9wTmFtZV0gPSBhO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5fbWVyZ2UoZG0sIGlucHV0cywgb3V0cHV0cywgaG9zdCwgcXVlcmllcywgZGlyZWN0aXZlVHlwZSk7XG4gIH1cblxuICBwcml2YXRlIF9tZXJnZShkbTogRGlyZWN0aXZlTWV0YWRhdGEsIGlucHV0czogc3RyaW5nW10sIG91dHB1dHM6IHN0cmluZ1tdLFxuICAgICAgICAgICAgICAgICBob3N0OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSwgcXVlcmllczoge1trZXk6IHN0cmluZ106IGFueX0sXG4gICAgICAgICAgICAgICAgIGRpcmVjdGl2ZVR5cGU6IFR5cGUpOiBEaXJlY3RpdmVNZXRhZGF0YSB7XG4gICAgdmFyIG1lcmdlZElucHV0cyA9IGlzUHJlc2VudChkbS5pbnB1dHMpID8gTGlzdFdyYXBwZXIuY29uY2F0KGRtLmlucHV0cywgaW5wdXRzKSA6IGlucHV0cztcblxuICAgIHZhciBtZXJnZWRPdXRwdXRzO1xuICAgIGlmIChpc1ByZXNlbnQoZG0ub3V0cHV0cykpIHtcbiAgICAgIGRtLm91dHB1dHMuZm9yRWFjaCgocHJvcE5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAoTGlzdFdyYXBwZXIuY29udGFpbnMob3V0cHV0cywgcHJvcE5hbWUpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgICAgIGBPdXRwdXQgZXZlbnQgJyR7cHJvcE5hbWV9JyBkZWZpbmVkIG11bHRpcGxlIHRpbWVzIGluICcke3N0cmluZ2lmeShkaXJlY3RpdmVUeXBlKX0nYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgbWVyZ2VkT3V0cHV0cyA9IExpc3RXcmFwcGVyLmNvbmNhdChkbS5vdXRwdXRzLCBvdXRwdXRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWVyZ2VkT3V0cHV0cyA9IG91dHB1dHM7XG4gICAgfVxuXG4gICAgdmFyIG1lcmdlZEhvc3QgPSBpc1ByZXNlbnQoZG0uaG9zdCkgPyBTdHJpbmdNYXBXcmFwcGVyLm1lcmdlKGRtLmhvc3QsIGhvc3QpIDogaG9zdDtcbiAgICB2YXIgbWVyZ2VkUXVlcmllcyA9XG4gICAgICAgIGlzUHJlc2VudChkbS5xdWVyaWVzKSA/IFN0cmluZ01hcFdyYXBwZXIubWVyZ2UoZG0ucXVlcmllcywgcXVlcmllcykgOiBxdWVyaWVzO1xuXG4gICAgaWYgKGRtIGluc3RhbmNlb2YgQ29tcG9uZW50TWV0YWRhdGEpIHtcbiAgICAgIHJldHVybiBuZXcgQ29tcG9uZW50TWV0YWRhdGEoe1xuICAgICAgICBzZWxlY3RvcjogZG0uc2VsZWN0b3IsXG4gICAgICAgIGlucHV0czogbWVyZ2VkSW5wdXRzLFxuICAgICAgICBvdXRwdXRzOiBtZXJnZWRPdXRwdXRzLFxuICAgICAgICBob3N0OiBtZXJnZWRIb3N0LFxuICAgICAgICBleHBvcnRBczogZG0uZXhwb3J0QXMsXG4gICAgICAgIG1vZHVsZUlkOiBkbS5tb2R1bGVJZCxcbiAgICAgICAgcXVlcmllczogbWVyZ2VkUXVlcmllcyxcbiAgICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBkbS5jaGFuZ2VEZXRlY3Rpb24sXG4gICAgICAgIHByb3ZpZGVyczogZG0ucHJvdmlkZXJzLFxuICAgICAgICB2aWV3UHJvdmlkZXJzOiBkbS52aWV3UHJvdmlkZXJzXG4gICAgICB9KTtcblxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IERpcmVjdGl2ZU1ldGFkYXRhKHtcbiAgICAgICAgc2VsZWN0b3I6IGRtLnNlbGVjdG9yLFxuICAgICAgICBpbnB1dHM6IG1lcmdlZElucHV0cyxcbiAgICAgICAgb3V0cHV0czogbWVyZ2VkT3V0cHV0cyxcbiAgICAgICAgaG9zdDogbWVyZ2VkSG9zdCxcbiAgICAgICAgZXhwb3J0QXM6IGRtLmV4cG9ydEFzLFxuICAgICAgICBxdWVyaWVzOiBtZXJnZWRRdWVyaWVzLFxuICAgICAgICBwcm92aWRlcnM6IGRtLnByb3ZpZGVyc1xuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB2YXIgQ09ERUdFTl9ESVJFQ1RJVkVfUkVTT0xWRVIgPSBuZXcgRGlyZWN0aXZlUmVzb2x2ZXIocmVmbGVjdG9yKTtcbiJdfQ==