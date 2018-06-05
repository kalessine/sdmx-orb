import * as React from 'preact-compat';
import {h} from 'preact';
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
import * as _ from 'lodash';
import * as moment from 'moment';
import Select from 'preact-material-components/Select';
import Button from 'preact-material-components/Button';
import {DatePicker} from 'react-toolbox';
export default class Controls extends React.Component {
    public props: any = {};
    public state: any = {};
    constructor(props, state) {
        this.props = props;
        this.state = state;
    }
    listDropDown(c: string, val: string) {
        var options = [];
        this.props.visual.findBinding(c).getAllValues().forEach(function (item) {
            var val2 = structure.NameableType.toString(item);
            var sel = val == val2 ? "true" : "false";
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
    onEndDateChange(endDate) {
        this.props.visual.getTime().setEndDate(endDate);
        this.props.visual.renderVisual();
        this.setState({open: true});
    }
    onStartDateChange(startDate) {
        this.props.visual.getTime().setStartDate(startDate);
        this.props.visual.renderVisual();
        this.setState({open: true});
    }
    onFocusChange() {

    }
    changeDensity(e) {
        this.props.visual.getArea().setDensity(e.target.checked);
        this.props.visual.renderVisual();
    }
    public render(props, state) {
        this.props = props;
        this.state = state;
        var html = [];
        var visual = this.props.visual;
        for (var i: number = 0; i < visual.getBindings().length; i++) {
            var b: bindings.BoundTo = visual.getBinding(i);
            if (b.getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_DROPDOWN) {
                var cnc = b.getConceptName();
                var val = structure.NameableType.toString(b.getCurrentValue());
                html.push(<div>{cnc}</div>);
                var o = <select title={b.getConcept()} value={val} onChange={this.changeDropDown.bind(this)}>{this.listDropDown(b.getConcept(), val)}</select>
                html.push(o);
                html.push(<br />);
            }
            else {
                console.log("No dropdown");
                console.log(b);
            }
        }
        if (visual.getCrossSection() != null && visual.getCrossSection().getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_DROPDOWN) {
            var cnc = visual.getCrossSection().getConceptName();
            var val = structure.NameableType.toString(visual.getCrossSection().getCurrentValue());
            html.push(<div>{cnc}</div>);
            var o = <select title={visual.getCrossSection().getConcept()} value={val} onChange={this.changeDropDown.bind(this)}>{this.listDropDown(visual.getCrossSection().getConcept(), val)}</select>
            html.push(o);
            html.push(<br />);
        }
        b = visual.getTime();
        if (b.getBoundTo() == bindings.BoundTo.BOUND_TIME_DROPDOWN || b.getBoundTo() == bindings.BoundTo.BOUND_TIME_X || b.getBoundTo() == bindings.BoundTo.BOUND_TIME_Y) {
            var bt = b as bindings.BoundToTime;
            var cnc = bt.getConceptName();
            var start = bt.getStartDate();
            var end = bt.getEndDate();
            html.push(<div>{cnc}</div>);
            html.push(<DatePicker onChange={(day) => this.onStartDateChange(day)} value={start} />);
            html.push(<DatePicker onChange={(day) => this.onEndDateChange(day)} value={end} />);
            if (bt.getBoundTo() == bindings.BoundTo.BOUND_TIME_DROPDOWN) {
                var val = structure.NameableType.toString(bt.getCurrentValue());
                var o = <select title={bt.getConcept()} onChange={this.changeDropDown.bind(this)}>{this.listDropDown(bt.getConcept(), val)}</select>
                html.push(o);
            }
            html.push(<br />);
        }
        b = visual.getArea();
        if (b != null) {
            var ba = b as bindings.BoundToArea;
            html.push([<Buttton onClick={this.changeDensity.bind(this)} />,ba.isDensity()?"Density":"Raw Number"]);
        }
        return (<div>{html}</div>);
    }
}
