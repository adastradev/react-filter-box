import * as React from 'react';
import * as _ from "lodash";
import FilterInput from "./FilterInput";
import SimpleResultProcessing from "./SimpleResultProcessing";

import GridDataAutoCompleteHandler, { Option } from "./GridDataAutoCompleteHandler";
import Expression from "./Expression";
import FilterQueryParser from "./FilterQueryParser";
import BaseResultProcessing from "./BaseResultProcessing";
import BaseAutoCompleteHandler from "./BaseAutoCompleteHandler";
import ParsedError from "./ParsedError";
import { validateQueryString, validateQueryExpression } from './validateQuery';

export default class ReactFilterBox extends React.Component<any, any> {

    public static defaultProps: any = {
        onParseOk: () => { },
        onParseError: () => { },
        onChange: () => { },
        onDataFiltered: () => { },
        autoCompleteHandler: null,
        onBlur: () => { },
        onFocus: () => { },
        editorConfig: { },
        strictMode: false
    };

    parser = new FilterQueryParser();

    constructor(props: any) {
        super(props);

        var autoCompleteHandler = this.props.autoCompleteHandler ||
            new GridDataAutoCompleteHandler(this.props.data, this.props.options)

        this.parser.setAutoCompleteHandler(autoCompleteHandler);

        let errorState = false;
        if (props.strictMode && props.query && props.query.length > 0) {
            const expressions = this.parser.parse(props.query);
            if ((expressions as Expression[]).length > 0) {
                errorState = validateQueryExpression(expressions as Expression[], autoCompleteHandler).isValid === false;
            } else if ((expressions as ParsedError).isError) {
                errorState = true;
            }
        }

        this.state = {
            isFocus: false,
            isError: errorState
        }
        //need onParseOk, onParseError, onChange, options, data
    }

    needAutoCompleteValues(codeMirror: any, text: string) {
        return this.parser.getSuggestions(text);
    }

    onSubmit(query: string) {
        var result = this.parser.parse(query);
        if ((result as ParsedError).isError) {
            return this.props.onParseError(result, { isValid: true });
        } else if (this.props.strictMode) {
            const validationResult = validateQueryExpression(result as Expression[], this.parser.autoCompleteHandler);
            if (!validationResult.isValid) {
                return this.props.onParseError(result, validationResult);
            }
        }

        return this.props.onParseOk(result);
    }

    onChange(query: string) {
        var validationResult = { isValid: true };
        var result = this.parser.parse(query);
        if ((result as ParsedError).isError) {
            this.setState({ isError: true })
        } else if (this.props.strictMode) {
            validationResult = validateQueryExpression(result as Expression[], this.parser.autoCompleteHandler);
            this.setState({ isError: !validationResult.isValid })
        } else {
            this.setState({ isError: false })
        }

        this.props.onChange(query, result, validationResult);
    }

    onBlur() {
        this.setState({ isFocus: false });
    }

    onFocus() {
        this.setState({ isFocus: true });
    }

    render() {
        var className = "react-filter-box";
        if (this.state.isFocus) {
            className += " focus"
        }
        if (this.state.isError) {
            className += " error"
        }

        return <div className={className}>
            <FilterInput
                autoCompletePick={this.props.autoCompletePick}
                customRenderCompletionItem={this.props.customRenderCompletionItem}
                onBlur={this.onBlur.bind(this)}
                onFocus={this.onFocus.bind(this)}
                value={this.props.query}
                needAutoCompleteValues={this.needAutoCompleteValues.bind(this)}
                onSubmit={this.onSubmit.bind(this)}
                onChange={this.onChange.bind(this)}
                editorConfig={this.props.editorConfig} />
        </div>
    }
}

export {
    SimpleResultProcessing,
    BaseResultProcessing,
    GridDataAutoCompleteHandler,
    BaseAutoCompleteHandler,
    Option as AutoCompleteOption,
    Expression,
    validateQueryExpression,
    validateQueryExpression as validateQuery,
    validateQueryString,
};
