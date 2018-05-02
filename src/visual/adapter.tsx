import * as collections from 'typescript-collections';
import * as React from 'preact-compat';
import {h} from 'preact';
import * as visual from './visual';
import * as sdmxdata from '../sdmx/data';
import * as commonreferences from '../sdmx/commonreferences';
import * as structure from '../sdmx/structure';
import * as _ from 'lodash';
//import * as model from 'model';
import * as sdmxtime from '../sdmx/time';
import * as bindings from './bindings';
import * as colors from 'color-ts';
import Controls from './controls';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import Button from 'preact-material-components/Button';
import Menu from 'preact-material-components/Menu';
import 'preact-material-components/List/style.css';
import 'preact-material-components/Menu/style.css';
import 'preact-material-components/Button/style.css';
import FilterDialog from './SingleItemFilterDialog';

export interface Model {
    render(s: string);
    unrender(s: string);
}
export interface ReactModel extends Model {
    public getReact();
}
private class ModelChrome {

}
export class MultiMenuPage extends React.Component {
    public props = {};
    public state = {};
    constructor(props, state) {
        super(props, state);
        this.props = props;
        this.state = state;
    }
    onClick(e,item:structure.ItemType){
        this.state.boundto.setCurrentValue(item);this.props.visual.renderVisual();super.forceUpdate();
    }
    getItems(itemscheme: structure.ItemSchemeType, boundto: bindings.BoundTo) {
        var result = [];
        var items = itemscheme.getItems();
        for (var i = 0; i < items.length; i++) {
            result.push(<Menu.Item onclick={(e)=>{this.onClick(e,items[i])}}>{structure.NameableType.toString(items[i])}</Menu.Item>);
        }
        return (result);
    }

    render(): any[] | Element {
        var visual: visual.Visual = this.props.visual;
        var id: number = this.props.id;
        var boundto: bindings.BoundTo = visual.getMenu(id);
        if (boundto == null) return [];
        this.state.boundto=boundto;
        var itemScheme = boundto.getCodelist();
        var items = itemScheme.findSubItemsString(null);
        return (
            <div style="display: inline;float: left;">
                <Menu.Anchor>
                    <Button
                        onClick={e => {
                            this.menu.MDComponent.open = true;
                        }}
                    >
                        {boundto.getConceptName()}
                    </Button>
                    <Menu
                        ref={menu => {
                            this.menu = menu;
                        }}
                    >{this.getItems(itemScheme,boundto)}
                    </Menu>
                </Menu.Anchor>
            </div>
        );
    }
}
export class LevelMenuPage extends React.Component {
    public props = {};
    public state = {};
    private menu = null;
    constructor(props, state) {
        super(props, state);
        this.props = props;
        this.state = state;
    }
    getItems(n: number) {
        var result = [];
        for (var i = 0; i < n; i++) {
            result.push(<Menu.Item onclick={this.state.boundto.setLevel(i)}>Level {i}</Menu.Item>);
        }
        return (result);
    }

    render(): any[] | Element {
        var visual: visual.Visual = this.props.visual;
        var id: number = this.props.id;
        var boundto: bindings.BoundTo = visual.getMenu(id);
        if (boundto == null) return [];
        this.state.boundto = boundto;
        var itemScheme = boundto.getCodelist();
        var n = boundto.getCodelist().getMaximumLevel();
        return (
            <div style="display: inline;float: left;">
                <Menu.Anchor>
                    <Button
                        onClick={e => {
                            this.menu.MDComponent.open = true;
                        }}
                    >
                        {boundto.getConceptName()}
                    </Button>
                    <Menu
                        ref={menu => {
                            this.menu = menu;
                        }}
                    >{this.getItems(n)}
                    </Menu>
                </Menu.Anchor>
            </div>
        );
    }
}
export class LevelButton extends React.Component {
    public props = {};
    public state = {};
    private menu = null;
    constructor(props, state) {
        super(props, state);
        this.props = props;
        this.state = state;
    }
    getItems(n: number) {
        var result = [];
        for (var i = 0; i < n; i++) {
            result.push(<Button onclick={this.state.boundto.setLevel(i)}>Level {i}</Button>);
        }
        return (result);
    }

    render(): any[] | Element {
        var visual: visual.Visual = this.props.visual;
        var id: number = this.props.id;
        var boundto: bindings.BoundTo = visual.getMenu(id);
        if (boundto == null) return [];
        this.state.boundto = boundto;
        var itemScheme = boundto.getCodelist();
        var n = boundto.getCodelist().getMaximumLevel();
        return (
            <div style="display: inline;float: left;">
                <label>{boundto.getConceptName()}</label>
                {this.getItems(n)}
            </div>
        );
    }
}
export class MenuPage extends React.Component {
    public props = {open: false};
    public state = {open: false};
    public filter = null;
    constructor(props, state) {
        super(props, state);
        this.props = props;
        this.state = state;
    }
    onClick(e) {
        var s = this.state;
        s.open = true;
        super.setState(s);
        this.filter.show();
    }
    render(): any[] | Element {
        var visual: visual.Visual = this.props.visual;
        var id: number = this.props.id;
        var boundto: bindings.BoundTo = visual.getMenu(id);
        if (boundto == null) return [];
        this.props.boundto = boundto;
        this.state.struct = visual.getDataStructure();
        var itemScheme = boundto.getCodelist();
        var items = itemScheme.findSubItemsString(null);
        return (
            <div style="display: inline;float: left;">
                <Button onClick={this.onClick.bind(this)}>{boundto.getConceptName()}</Button>
                <FilterDialog ref={(filter) => {this.filter = filter}} open={this.state.open} visual={visual} registry={visual.getRegistry()} struct={this.state.struct} concept={this.props.boundto.getConcept()} boundto={this.props.boundto} />
            </div>);
    }
}

export class ModelWrapper {
    private mymodel = null;
    private visual: visual.Visual = null;
    private visualComponent: VisualComponent = null;
    constructor() {}
    public getModel(): Model {
        return this.mymodel;
    }
    public setModel(m: Model) {
        this.mymodel = m;
    }
    public setVisual(v: visual.Visual) {
        this.visual = v;
    }
    public render(s: string) {
        if (this.visualComponent != null) {
            this.unrender(s);
        }
        this.visualComponent = React.render(<VisualComponent visual={this.visual} selector={s} model={this.mymodel} />, document.querySelector(s));
    }
    public unrender(s: string) {
        if (s != null) {React.unmountComponentAtNode(document.querySelector(s));}
    }
}


export class VisualComponent extends React.Component {

    private selector: string = "";
    private visual = null;
    private mymodel = null;
    public setSelector(s: string) {
        this.selector = s;
    }
    public props = {};
    public state = {};
    '
    constructor(props, state) {
        super(props, state);
        this.props = props;
        this.state = state;
        this.selector = props.selector;
    }

    public render(props, state) {
        this.visual = props.visual;
        this.mymodel = props.model;
        var menus = [];
        for (var i: number = 0; i < this.visual.getMenuCount(); i++) {
            var boundto = this.visual.getMenu(i);
            console.log(boundto);
            if (boundto.getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_SINGLE_MENU) {
                menus.push(<MenuPage visual={this.visual} id={i} />);
            }
            if (boundto.getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_MULTI_MENU) {
                menus.push(<MultiMenuPage visual={this.visual} id={i} />);
            }
            if (boundto.getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_LEVEL_MENU) {
                menus.push(<LevelMenuPage visual={this.visual} id={i} />);
            }
        }
        return (<div id={this.selector + "-main"} style="display: table; border: 1px solid black;">
            <div id={this.selector + "-title"} style="display: table-row;"><span style="float:right;">{this.visual.getTitle()}</span></div>
            <div id={this.selector + "-menu"} style="display: table-row;">{menus}</div>
            <div id={this.selector + "-visual"} style="display: table-cell; vertical-align: middle;">{this.mymodel.getReact()}</div>
            <div id={this.selector + "-right"} style="display: table-cell; vertical-align: top; width: 33%;border: 1px dotted black;"><Controls visual={this.visual} /></div>
            <div id={this.selector + "-bottom"} style="display: table-row;"></div>
        </div>);

    }
    public getVisualComponentId() {
        return this.selector + "-visual";
    }
}



export interface Adapter {
    getId():number
    getName(): string;
    canCreateModelFromVisual(v: visual.Visual): boolean;
    createModel(v: visual.Visual, cube: sdmxdata.Cube): Model;
    setSingleValues(key: sdmxdata.PartialKey): void;
    addSingleDataPoint(key: sdmxdata.PartialKey): void;
    addCrossSectionalDataPoint(key: sdmxdata.PartialKey, crossSections: collections.Dictionary): void;
}
export class RechartsSparklineAdapter implements Adapter {
    private id = 1000;
    private singleValues: sdmxdata.PartialKey = null;
    private visual: visual.Visual = null;
    private min: number = null;
    private max: number = null;
    private minDate: Date = null;
    private maxDate: Date = null;
    private model = new RechartsSparklineModel();
    constructor() {
    }
    public getId() { return this.id; }
    public createModel(visual: visual.Visual, cube: sdmxdata.Cube): model.Model {
        this.visual = visual;
        this.model = new RechartsSparklineModel();
        this.model.setVisual(visual);
        this.model.setXLabel(visual.getX().getConceptName());
        this.model.setYLabel(visual.getValues()[0].getConceptName());
        this.min = null;
        this.max = null;
        this.minDate = null;
        this.maxDate = null;
        if (cube.then != null) {
            return cube.then(function (cube2) {
                var cu: CubeWalkUtils = new CubeWalkUtils();
                cu.visitRoot(cube2, visual, this);
                if (visual.getValues()[0].getSharedMaximum()) {
                    this.model.setMax(this.max);
                }
                if (visual.getValues()[0].getZeroOrigin()) {
                    this.model.setMin(this.min);
                }
                return this.model;
            }.bind(this));
        } else {
            var cu: CubeWalkUtils = new CubeWalkUtils();
            cu.visitRoot(cube, visual, this);
            if (visual.getValues()[0].getSharedMaximum()) {
                this.model.setMax(this.max);
            }
            if (visual.getValues()[0].getZeroOrigin()) {
                this.model.setMin(this.min);
            }
            return this.model;
        }
    }

    public canCreateModelFromVisual(visual: visual.Visual): boolean {
        var singleBinds: number = 0;
        var multiBinds: number = 0;
        var continuousBinds: number = 0;
        var time: number = 0;
        var series: number = 0;
        var list: number = 0;
        for (var i: number = 0; i < visual.size(); i++) {
            var b = visual.getBinding(i);
            if (b.expectValues() > 1) {
                multiBinds++;
            } else {
                singleBinds++;
            }
            if (b instanceof bindings.BoundToTimeSeries) {
                series++;
                return false;
            }
            if (b instanceof bindings.BoundToTimeList) {
                list++;
                return false;
            }
            if (b instanceof bindings.BoundToSeries) {
                series++;
                return false;
            }
            if (b instanceof bindings.BoundToList) {
                list++;
                return false;
            }
        }
        if (visual.getTime() != null && visual.getTime() instanceof bindings.BoundToTimeX) {
            time = 1;
        }
        if (time == 1 && visual.getValues().length == 1) {
            return true;
        }
        return false;
    }

    public getName(): string {
        return "RechartsSingleSparkline";
    }

    public setSingleValues(key: sdmxdata.PartialKey): void {
        this.singleValues = key;
    }

    public addSingleDataPoint(key: sdmxdata.PartialKey): void {
        var time: string = this.visual.getX().getConcept();
        var val: string = this.visual.getPrimaryMeasure().getConcept();
        var timeVal: string = structure.NameableType.toIDString(key.getComponent(time));
        var v1: number = parseFloat(key.getComponent(val));
        if (this.min == null || v1 < this.min) {
            this.min = v1;
        }
        if (this.max == null || v1 > this.max) {
            this.max = v1;
        }
        var s: string = structure.NameableType.toIDString(timeVal);
        var freq: string = structure.NameableType.toString(this.singleValues.getComponent("FREQ"));
        if (freq == null || "" == freq) {
            freq = structure.NameableType.toString(this.singleValues.getComponent("FREQUENCY"));
        }
        if (freq == null || "" == freq) {
            freq = structure.NameableType.toString(this.singleValues.getComponent("TIME_FORMAT"));
        }
        if (freq == null || "" == freq) {
            freq = structure.NameableType.toString(key.getComponent("FREQ"));
        }
        if (freq == null || "" == freq) {
            freq = structure.NameableType.toString(key.getComponent("FREQUENCY"));
        }
        if (freq == null || "" == freq) {
            freq = structure.NameableType.toString(key.getComponent("TIME_FORMAT"));
        }
        var rtd: sdmxtime.RegularTimePeriod = sdmxtime.TimeUtil.parseTime(freq, s);
        if (rtd != null) {
            var d: Date = new Date(rtd.getFirstMillisecond());
            if (this.minDate == null || this.minDate.getTime() > d.getTime()) {
                this.minDate = d;
            }
            if (this.maxDate == null || this.maxDate.getTime() < d.getTime()) {
                this.maxDate = d;
            }
        }
        this.model.addPoint(timeVal, v1);
    }

    addCrossSectionalDataPoint(key: sdmxdata.PartialKey, crossSections: collections.Dictionary): void {

    }
}

export class RechartsSparklineModel implements ReactModel {
    private data = [];
    private xAxisLabel = "Time";
    private yAxisLabel = "Amount";
    private visual: visual.Visual = null;
    private title = null;
    private chart = null;
    private controls = null;
    private min = null;
    private max = null;
    public addPoint(x: string, y: number) {
        var dat = {};
        dat['x'] = x;
        dat['y'] = y;
        //dat['series']='series';
        this.data.push(dat);
    }
    public getReact() {
        return (<LineChart width={600} height={300} data={this.data}
            margin={{top: 5, right: 30, left: 20, bottom: 5}}>
            <XAxis dataKey='x' />
            <YAxis max={this.max} />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey='y' stroke="#8884d8" activeDot={{r: 8}} />
        </LineChart>);
    }
    public render(s: string) {
        if (s != null) {
            this.chart = React.render(<LineChart width={600} height={300} data={this.data}
                margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                <XAxis dataKey='x' />
                <YAxis max={this.max} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey='y' stroke="#8884d8" activeDot={{r: 8}} />
            </LineChart>, document.querySelector(s));
        }
    }
    public unrender(s: string) {
        if (s != null) {React.unmountComponentAtNode(document.querySelector(s));}
    }
    public setVisual(v: visual.Visual) {
        this.visual = v;
    }
    public setMax(n: number) {
        this.max = n;
    }
    public setMin(n: number) {
        this.min = n;
    }
    public setTitle(s: string) {
        this.title = s;
    }
    public setXLabel(s: string) {
        this.xAxisLabel = s;
    }
    public setYLabel(s: string) {
        this.yAxisLabel = s;
    }
}

export class RechartsSeriesSparklineAdapter implements Adapter {
    private id:number = 1001;
    private singleValues: sdmxdata.PartialKey = null;
    private visual: visual.Visual = null;
    private min: number = null;
    private max: number = null;
    private minDate: Date = null;
    private maxDate: Date = null;
    private model = new RechartsSeriesSparklineModel();
    constructor() {
    }
    public getId() { return this.id; }
    public createModel(visual: visual.Visual, cube: sdmxdata.Cube): model.Model {
        this.visual = visual;
        this.model = new RechartsSeriesSparklineModel();
        this.model.setVisual(visual);
        this.model.setXLabel(visual.getX().getConceptName());
        this.model.setYLabel(visual.getValues()[0].getConceptName());
        this.min = null;
        this.max = null;
        this.minDate = null;
        this.maxDate = null;
        if (cube.then != null) {
            return cube.then(function (cube2) {
                var cu: CubeWalkUtils = new CubeWalkUtils();
                cu.visitRoot(cube2, visual, this);
                if (visual.getValues()[0].getSharedMaximum()) {
                    this.model.setMax(this.max);
                }
                if (visual.getValues()[0].getZeroOrigin()) {
                    this.model.setMin(this.min);
                }
                return this.model;
            }.bind(this));
        } else {
            var cu: CubeWalkUtils = new CubeWalkUtils();
            cu.visitRoot(cube, visual, this);
            if (visual.getValues()[0].getSharedMaximum()) {
                this.model.setMax(this.max);
            }
            if (visual.getValues()[0].getZeroOrigin()) {
                this.model.setMin(this.min);
            }
            return this.model;
        }
    }

    public canCreateModelFromVisual(visual: visual.Visual): boolean {
        var singleBinds: number = 0;
        var multiBinds: number = 0;
        var continuousBinds: number = 0;
        var time: number = 0;
        var series: number = 0;
        var list: number = 0;
        for (var i: number = 0; i < visual.size(); i++) {
            var b = visual.getBinding(i);
            if (b.expectValues() > 1) {
                multiBinds++;
            } else {
                singleBinds++;
            }
            if (b instanceof bindings.BoundToTimeSeries) {
                series++;
            }
            if (b instanceof bindings.BoundToTimeList) {
                list++;
                return false;
            }
            if (b instanceof bindings.BoundToSeries) {
                series++;
            }
            if (b instanceof bindings.BoundToList) {
                list++;
                return false;
            }
        }
        if (visual.getTime() != null && visual.getTime() instanceof bindings.BoundToTimeX) {
            time = 1;
        }
        if (time == 1 && visual.getValues().length == 1) {
            return true;
        }
        return false;
    }

    public getName(): string {
        return "RechartsSeriesSparkline";
    }

    public setSingleValues(key: sdmxdata.PartialKey): void {
        this.singleValues = key;
    }

    public addSingleDataPoint(key: sdmxdata.PartialKey): void {
        var time: string = this.visual.getX().getConcept();
        var val: string = this.visual.getPrimaryMeasure().getConcept();
        var timeVal: string = structure.NameableType.toIDString(key.getComponent(time));
        var v1: number = parseFloat(key.getComponent(val));
        var serName = this.visual.getSeries().getConceptName();
        var ser: string = structure.NameableType.toString(key.getComponent(this.visual.getSeries().getConcept()));
        if (this.min == null || v1 < this.min) {
            this.min = v1;
        }
        if (this.max == null || v1 > this.max) {
            this.max = v1;
        }
        var s: string = structure.NameableType.toIDString(timeVal);
        var freq: string = structure.NameableType.toString(this.singleValues.getComponent("FREQ"));
        if (freq == null || "" == freq) {
            freq = structure.NameableType.toString(this.singleValues.getComponent("FREQUENCY"));
        }
        if (freq == null || "" == freq) {
            freq = structure.NameableType.toString(this.singleValues.getComponent("TIME_FORMAT"));
        }
        if (freq == null || "" == freq) {
            freq = structure.NameableType.toString(key.getComponent("FREQ"));
        }
        if (freq == null || "" == freq) {
            freq = structure.NameableType.toString(key.getComponent("FREQUENCY"));
        }
        if (freq == null || "" == freq) {
            freq = structure.NameableType.toString(key.getComponent("TIME_FORMAT"));
        }
        var rtd: sdmxtime.RegularTimePeriod = sdmxtime.TimeUtil.parseTime(freq, s);
        if (rtd != null) {
            var d: Date = new Date(rtd.getFirstMillisecond());
            if (this.minDate == null || this.minDate.getTime() > d.getTime()) {
                this.minDate = d;
            }
            if (this.maxDate == null || this.maxDate.getTime() < d.getTime()) {
                this.maxDate = d;
            }
        }
        this.model.addPoint(ser, timeVal, v1);
    }

    addCrossSectionalDataPoint(key: sdmxdata.PartialKey, crossSections: collections.Dictionary): void {

    }

}

export class RechartsSeriesSparklineModel implements ReactModel {
    private seriesLabels = [];
    private data = [];
    private xAxisLabel = "Time";
    private yAxisLabel = "Amount";
    private visual: visual.Visual = null;
    private title = null;
    private chart = null;
    private controls = null;
    private min = null;
    private max = null;
    private colours: collections.Dictionary<string, Array<object>> = null;
    public addPoint(ser: string, x: string, y: number) {
        var dat = {};
        var n = true;
        for (var i: number = 0; i < this.data.length; i++) {
            if (this.data[i][this.xAxisLabel] == x) {
                dat = this.data[i];
                n = false;
            }
        }
        dat[this.xAxisLabel] = x;
        dat[ser] = y;
        if (n) {this.data.push(dat);}
        for (var i: number = 0; i < this.seriesLabels.length; i++) {
            if (this.seriesLabels[i] == ser) {
                return;
            }
        }
        this.seriesLabels.push(ser);
    }
    public getReact() {
        return (<LineChart width={600} height={300} data={this.data}
            margin={{top: 5, right: 30, left: 20, bottom: 5}}>
            <XAxis dataKey={this.xAxisLabel} />
            <YAxis max={this.max} />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            {this.getLines()}
        </LineChart>);
    }
    public render(s: string) {
        if (s != null) {
            this.chart = React.render(<LineChart width={600} height={300} data={this.data}
                margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                <XAxis dataKey={this.xAxisLabel} />
                <YAxis max={this.max} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                {this.getLines()}
            </LineChart>, document.querySelector(s));
        }
    }
    public getLines() {
        var html = [];
        var series: bindings.BoundToSeries = this.visual.getSeries() as bindings.BoundToSeries;
        for (var i: number = 0; i < series.getPossibleValues().length; i++) {
            var itm = series.getPossibleValues()[i];
            var col = colors.rgbToHtml(series.getColours().getValue(structure.NameableType.toIDString(itm)));
            html.push(<Line ref={structure.NameableType.toString(itm)} type="monotone" dataKey={structure.NameableType.toString(itm)} stroke={col} activeDot={{r: 8}} />);
        }
        return html;
    }
    public unrender(s: string) {
        if (s != null) {React.unmountComponentAtNode(document.querySelector(s));}
    }
    public setVisual(v: visual.Visual) {
        this.visual = v;
    }
    public setMax(n: number) {
        this.max = n;
    }
    public setMin(n: number) {
        this.min = n;
    }
    public setTitle(s: string) {
        this.title = s;
    }
    public setXLabel(s: string) {
        this.xAxisLabel = s;
    }
    public setYLabel(s: string) {
        this.yAxisLabel = s;
    }
    public setColours(c: collections.Dictionary<string, Array<any>>) {


    }
}
/*

 export class SeriesSparklineAdapter implements Adapter {


 }
 export class ListSparklineAdapter implements Adapter {


 }
 */
export class CubeWalkUtils {
    private clearedPossibles: collections.Dictionary<string, boolean> = new collections.Dictionary<string, boolean>();
    private clearedTime: boolean = false;
    visitRoot(cube: sdmxdata.Cube, visual: visual.Visual, adapter: Adapter) {
        //console.log("visitRoot");
        // Comment this our for weird shit to happen
        this.clearedPossibles = new collections.Dictionary<string, boolean>();
        for (var i: number = 0; i < visual.getBindings().length; i++) {
            this.clearedPossibles.setValue(visual.getBinding(i).getConcept(), false);
        }
        if (visual.getTime() != null) {
            this.clearedPossibles.setValue(visual.getTime().getConcept(), false);
        }
        var singles = new sdmxdata.PartialKey();
        var multiples = new sdmxdata.PartialKey();
        if (cube == null) {
            return;
        }
        var current: sdmxdata.RootCubeDimension = cube.getRootCubeDimension();
        // No Observations!!
        if (current.getSubDimension() == null) {
            return;
        }
        this.clearedTime = false;
        var innerbd: bindings.BoundTo = visual.findBinding(current.getSubDimension());
        if (this.clearedPossibles.getValue(innerbd.getConcept()) == false) {
            innerbd.setPossibleValues([]);
            this.clearedPossibles.setValue(innerbd.getConcept(), true);
        }
        for (var i: number = 0; i < current.listSubDimensions().length; i++) {
            var it = current.listSubDimensions()[i];
            var inCurrentValue: boolean = false;
            var dim: sdmxdata.CubeDimension = it;
            if (innerbd.isInCurrentValues(dim.getValue())) {
                inCurrentValue = true;
            }
            var itm2: structure.ItemType = this.getComponent(visual, dim.getConcept(), dim.getValue()) as structure.ItemType;
            innerbd.getPossibleValues().push(itm2);
        }
        if (innerbd.isClientSide()) {
            if (!inCurrentValue) {
                if (innerbd.getPossibleValues().length > 0) {
                    //System.out.println("Setting value:" + innerbd.getPossibleValues().get(0).toString());
                    innerbd.setCurrentValue(innerbd.getPossibleValues()[0]);
                }
            }
        }
        for (var i: number = 0; i < current.listSubDimensions().length; i++) {
            var dim: sdmxdata.CubeDimension = current.listSubDimensions()[i];
            this.visit(cube, visual, dim, adapter, singles, multiples);
        }
    }
    public getComponent(visual: visual.Visual, concept: string, val: string): object {
        var b: bindings.BoundTo = visual.findBinding(concept);
        if (b == null) {
            var itm: structure.ItemType = sdmxdata.ValueTypeResolver.resolveCode(visual.getQueryable().getRemoteRegistry().getLocalRegistry(), visual.getDataStructure(), concept, val);
            return itm;
        } else if (b.isDiscrete()) {
            var itm: structure.ItemType = sdmxdata.ValueTypeResolver.resolveCode(visual.getQueryable().getRemoteRegistry().getLocalRegistry(), visual.getDataStructure(), concept, val);
            if (itm == null) {
                return val;
            }
            return itm;
        } else {
            //System.out.println("Returning val:"+concept+":"+val);
            return val;
        }
    }
    public visit(cube: sdmxdata.Cube, visual: visual.Visual, current: sdmxdata.CubeDimension, adapter: Adapter, singles: sdmxdata.PartialKey, multiples: sdmxdata.PartialKey) {
        //console.log("visit");
        var concept: string = current.getConcept();
        var val: string = current.getValue();
        //System.out.println("Visit:"+concept+":"+val);
        var bd: bindings.BoundTo = visual.findBinding(concept);
        if (bd.isInCurrentValues(val)) {
            var itm: object = this.getComponent(visual, bd.getConcept(), val);
            if (bd.expectValues() == 1) {
                singles.setComponent(concept, itm);
            } else {
                multiples.setComponent(concept, itm);
            }
        }
        var innerbd: bindings.BoundTo = visual.findBinding(current.getSubDimension());

        if (this.clearedPossibles.getValue(innerbd.getConcept()) == false) {
            innerbd.setPossibleValues([]);
            this.clearedPossibles.setValue(innerbd.getConcept(), true);
        }
        for (var i: number = 0; i < current.listSubDimensions().length; i++) {
            var it = current.listSubDimensions()[i];
            var inCurrentValue: boolean = false;
            var dim: sdmxdata.CubeDimension = it;
            if (innerbd.isInCurrentValues(dim.getValue())) {
                inCurrentValue = true;
            }
            var itm2: structure.ItemType = this.getComponent(visual, dim.getConcept(), dim.getValue()) as structure.ItemType;
            innerbd.getPossibleValues().push(itm2);
        }
        if (innerbd.isClientSide()) {
            if (!inCurrentValue) {
                if (innerbd.getPossibleValues().length > 0) {
                    //System.out.println("Setting value:" + innerbd.getPossibleValues().get(0).toString());
                    innerbd.setCurrentValue(innerbd.getPossibleValues()[0]);
                }
            }
        }
        var latest: sdmxdata.TimeCubeDimension = null;
        var latestTime: sdmxtime.RegularTimePeriod = null;
        var freq: string = structure.NameableType.toIDString(singles.getComponent("FREQ"));
        if (freq == null) {
            freq = structure.NameableType.toIDString(singles.getComponent("TIME_FORMAT"));
        }
        if (freq == null) {
            freq = structure.NameableType.toIDString(multiples.getComponent("FREQ"));
        }
        if (freq == null) {
            freq = structure.NameableType.toIDString(multiples.getComponent("TIME_FORMAT"));
        }
        for (var k: number = 0; k < current.listSubDimensions().length; k++) {
            var inner: sdmxdata.CubeDimension = current.listSubDimensions()[k];
            var innerbd: bindings.BoundTo = visual.findBinding(inner.getConcept());
            if (inner instanceof sdmxdata.TimeCubeDimension) {
                if ((innerbd as bindings.BoundToTime).isSingleLatestTime()) {
                    if (latest == null) {
                        latest = inner as sdmxdata.TimeCubeDimension;
                        latestTime = sdmxtime.TimeUtil.parseTime(freq, structure.NameableType.toIDString(inner.getValue()));
                    }
                    var timePeriod: sdmxtime.RegularTimePeriod = sdmxtime.TimeUtil.parseTime(structure.NameableType.toIDString(inner.getValue());
                    if (timePeriod.getStart().after(latestTime.getStart())) {
                        latestTime = timePeriod;
                        latest = inner as sdmxdata.TimeCubeDimension;
                    }
                } else {
                    this.visitTime(cube, visual, inner as sdmxdata.TimeCubeDimension, adapter, singles, multiples);
                }
            } else {
                this.visit(cube, visual, inner, adapter, singles, multiples);
            }
        }
    }
    public visitTime(cube: sdmxdata.Cube, visual: visual.Visual, dim: sdmxdata.TimeCubeDimension, adapter: Adapter, singles: sdmxdata.PartialKey, multiples: sdmxdata.PartialKey) {
        //console.log("visitTime");
        var concept: string = dim.getConcept();
        var val: string = dim.getValue();
        // This is for time drop down list
        // clearedTime clears all the time's possible values
        //System.out.println("Visit:"+concept+":"+val);

        var bd: bindings.BoundTo = visual.findBinding(concept);
        if (this.clearedPossibles.getValue(bd.getConcept()) == false) {
            bd.setPossibleValues([]);
            this.clearedPossibles.setValue(bd.getConcept(), true);
        }

        var itm: object = this.getComponent(visual, bd.getConcept(), val);
        if (bd.isInCurrentValues(structure.NameableType.toIDString(val))) {
            if (bd.expectValues() == 1) {
                singles.setComponent(concept, itm);
            } else {
                multiples.setComponent(concept, itm);
            }
        }else{
           
        }
        bd.getPossibleValues().push(itm);
        if (visual.getValues().length > 1) {
            /*
             var cross:bindings.BoundTo = bindings.getCrossSection();
             if (cross != null && cross.getBoundTo() == BoundTo.BOUND_MEASURES_INDIVIDUAL) {
             HashMap < String, String > crossSections = new HashMap < String, String > ();
             Collection < CubeObservation > obsList = dim.listObservations();
             Iterator < CubeObservation > it = obsList.iterator();
             while (it.hasNext()) {
             CubeObservation ob = it.next();
             visit(cube, bindings, ob, adapter, singles, multiples, crossSections);
             */
            //adapter.setSingleValues(singles);
            //adapter.addSingleDataPoint(multiples);
        }
        var obsList = dim.listObservations();
        for (var l: number = 0; l < obsList.length; l++) {
            var ob: sdmxdata.CubeObservation = obsList[l];
            this.visitObservation(cube, visual, ob, adapter, singles, multiples);
        }
    }
    public visitObservation(cube: sdmxdata.Cube, visual: visual.Visual, dim: sdmxdata.CubeObservation, adapter: Adapter, singles: sdmxdata.PartialKey, multiples: sdmxdata.PartialKey) {
        //console.log("visitObs");
        //System.out.println("Visit:" + dim.getConcept());
        if (dim.getCrossSection() != null) {
            if (this.clearedPossibles.getValue(dim.getConcept()) == false) {
                var boundto = visual.findBinding(dim.getConcept())
                boundto.setPossibleValues([]);
                this.clearedPossibles.setValue(dim.getConcept(), true);
            }
            var crossSection = visual.findBinding(dim.getConcept());
            if (!crossSection.isInCurrentValues(dim.getCrossSection())) {
                return;
            }
            var itm: object = this.getComponent(visual, crossSection.getConcept(), dim.getCrossSection());
            crossSection.getPossibleValues().push(itm as structure.ItemType);
            multiples.setComponent(dim.getConcept(), itm);
            }
        multiples.clearAttributes();
        var concept: string = dim.getObservationConcept();
        multiples.setComponent(concept, dim.getValue());
        for (var a: number = 0; a < dim.listAttributes().length; a++) {
            var att: sdmxdata.CubeAttribute = dim.listAttributes()[a];
            multiples.setAttribute(att.getConcept(), this.getComponent(visual, att.getConcept(), att.getValue()));
        }
        //console.log(cube);
        if (visual.getPercentOf() != null) {
            //console.log("Percent OF!");
            var percentOf: bindings.BoundToDiscrete = visual.getPercentOf();
            //console.log("Single Value:");
            //console.log(singles.getComponent(percentOf.getConcept()));
            //console.log("Mutliple Values");
            //console.log(multiples.getComponent(percentOf.getConcept()));
            //console.log("PercentOf");
            //console.log(percentOf.getPercentOfItemType());
            if (percentOf.getPercentOfItemType() != null && percentOf.getPercentOfItemType() != singles.getComponent(percentOf.getConcept())) {
                var k: sdmxdata.FullKey = new sdmxdata.FullKey();
                multiples.getDict().keys().forEach(function (key) {
                    k.getDict().setValue(key, multiples.getDict().getValue(key));
                });
                singles.getDict().keys().forEach(function (key) {
                    k.getDict().setValue(key, singles.getDict().getValue(key));
                });
                k.setComponent(percentOf.getConcept(), percentOf.getPercentOfItemType());
                //console.log(k);
                var obs: sdmxdata.CubeObs = cube.findCubeObs(k);
                if (obs == null) {
                    //console.log("Obs is null");
                    return;
                } else {
                //console.log(obs);
                // concept should be OBS_VALUE
                var percent = parseFloat(dim.getValue()) / parseFloat(obs.getValue(concept));
                    percent *= 100;
                    // Override OBS_VALUE
                    multiples.setComponent(concept, percent.toString());
                    //console.log("Percent="+percent);
                }
            }else{
            // This Point is the PercentOf Point, do nothing
                return;
            }
        }
        adapter.setSingleValues(singles);
        adapter.addSingleDataPoint(multiples);
    }
    /*
     public visitCrossSection(cube: sdmxdata.Cube, visual: visual.Visual, dim: sdmxdata.CubeObservation, adapter: Adapter, singles: sdmxdata.PartialKey, multiples: sdmxdata.PartialKey, crossSections: collections.Dictionary) {
     //System.out.println("Visit:" + dim.getConcept());
     if (dim.getCrossSection() != null) {
     //System.out.println("Cross" + dim.getConcept() + ":" + dim.getCrossSection());
     var crossSection: bindings.BoundTo = visual.findBinding(dim.getConcept());
     if (!crossSection.isInCurrentValues(dim.getCrossSection())) {
     //     System.out.println("Cross Section not in current values, returning");
     return;
     }
     multiples.setComponent(dim.getConcept(), CubeWalkUtils.getComponent(binds, dim.getConcept(), dim.getCrossSection()));
     }
     multiples.clearAttributes();
     var concept: string = dim.getObservationConcept();
     multiples.setComponent(concept, dim.getValue());
     for (var a: number = 0; a & lt; dim.listAttributes().length; a++) {
     var att: sdmxdata.CubeAttribute = dim.listAttributes()[a];
     multiples.setAttribute(att.getConcept(), getComponent(visual, att.getConcept(), att.getValue()));
     }
     crossSections.put(dim.getCrossSection(), dim.getValue());
     }*/
}
export var adapters: Array<Adapter> = [];
this.adapters.push(new RechartsSparklineAdapter());
this.adapters.push(new RechartsSeriesSparklineAdapter());
export class AdapterRegistrySingleton {
    
    static parseObjectFromJSON(b:Adapter) {
        
    }
    static getList() {return adapters;}
    static saveObjectToJSON(o:object){
        
    }
}
export function adapter2Object(ad:Adapter) {
    if(ad==null ) return {};
    return { typeid: ad.getId(), name: ad.getName()};
}
export function object2Adapter(o:any):Adapter {
    if(o==null ) return null;
    switch(o.typeid) {
        case 1000: return new RechartsSparklineAdapter();
        case 1001: return new RechartsSeriesSparklineAdapter();
    }
}