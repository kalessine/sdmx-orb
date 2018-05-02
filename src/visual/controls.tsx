import * as React from 'preact-compat';
import { h } from 'preact';
import * as message from "../sdmx/message";
import * as sdmx from "../sdmx";
import * as interfaces from "../sdmx/interfaces";
import * as adapter from "./adapter";
import * as model from "./model";
import * as data from "../sdmx/data";
import * as common from "../sdmx/common";
import * as structure from "../sdmx/structure";
import * as commonreferences from "../sdmx/commonreferences";
import * as bindings from "./bindings";
import _ from 'lodash';
import Select from 'preact-material-components/Select';

export default class Controls extends React.Component {
    public props: any = {};
    public state: any = {};
    constructor(props, state) {
        this.props = props;
        this.state = state;
    }
    listDropDown(c: string,val:string) {
        var options = [];
        this.props.visual.findBinding(c).getAllValues().forEach(function(item) {
            var val2 = structure.NameableType.toString(item);
            var sel = val==val2?"true":"false";
            options.push(<option selected={sel}>{val2}</option>);
        });
        return options;
    }
    changeDropDown(e) {
        var c = e.target.title;
        var binding = this.props.visual.findBinding(c);
        var item = this.props.visual.findBinding(c).getAllValues()[e.target.selectedIndex];
        this.props.visual.findBinding(c).setCurrentValue(item);
        this.props.visual.renderVisual();
        super.forceUpdate();
    }
    public render(props, state) {
        this.props = props;
        this.state = state;
        var html = [];
        var visual = this.props.visual;
        for (var i: number = 0; i < visual.getBindings().length; i++) {
            var b = visual.getBinding(i);
            if (b instanceof bindings.BoundToDropdown) {
                var cnc = b.getConceptName();
                var val = structure.NameableType.toString(b.getCurrentValue());
                html.push(<div>{cnc}</div>);
                var o = <select title={b.getConcept()} value={val} onChange={this.changeDropDown.bind(this)}>{this.listDropDown(b.getConcept(),val)}</select>
                html.push(o);
                html.push(<br/>);
            }else{
                console.log("No dropdown");
                console.log(b);
            }
        }
        return (<div>{html}</div>);
    }
}
