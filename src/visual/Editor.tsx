import * as React from 'preact-compat';
import {h} from 'preact';
console.log('0.3');
import * as visual from './visual';
console.log('0.4');
import * as bindings from './bindings';
console.log('0.5');
import * as structure from '../sdmx/structure';
import * as commonreferences from '../sdmx/commonreferences';
import * as sdmx from '../sdmx';
console.log('0.6');
import * as message from '../sdmx/message';
console.log('0.7');
import * as interfaces from '../sdmx/interfaces';
console.log('0.8');
import * as _ from 'lodash';
console.log('0.9');
import Select from 'preact-material-components/Select';
console.log('1.0');
import Services from './Services';
console.log('1.0');
import Dataflows from './Dataflows';
console.log('1.1');
import JSONResultPanel from './JSONResultPanel';
console.log('1.2');
import CustomiseDialog from './CustomiseDialog';
console.log('1.3');
import 'preact-material-components/List/style.css';
console.log('1.4');
import 'preact-material-components/Menu/style.css';
console.log('1.5');
import 'preact-material-components/Select/style.css';
console.log('1.6');
import Button from 'preact-material-components/Button';
console.log('1.7');
import * as adapter from './adapter';
console.log('1.8');
console.log('10');
export interface EditorProps {

}
export interface EditorState {
    dataflows: Array<structure.Dataflow>,
    queryable: interfaces.Queryable,
    dataflow: structure.Dataflow,
    visual: visual.Visual,
    jsonText: string,
    jsonObj: object,
    openCustomise: boolean,
    currentBindingConcept: string,
    currentBindingObject: bindings.BoundTo,
    currentBindingRenderFunc: Function,
    currentBindingParse: Function,
    currentBindingSave: Function,
    adapters: Array<adapter.Adapter>
}
export default class Editor extends React.Component {
    private customiseDialog = null;
    public state: EditorState = null;
    public props: EditorProps = null;
    constructor(props, state) {
        super(props, state);
        this.props = props;
        this.state = state;
    }
    public changeBinding(e: Event) {
        console.log(e);
    }
    public connect(q) {
        super.setState({queryable: q});
        if (this.getState().queryable == null) {
            super.setState({dataflows: []});
            return;
        }
        this.state.queryable.getRemoteRegistry().listDataflows().then(function (dfs) {
            this.setState({dataflows: dfs});
        }.bind(this));
    }
    public selectDataflow(df: structure.Dataflow) {
        var s: EditorState = this.getState();
        s.dataflow = df;
        s.visual = null;
        super.setState(s);
        this.getState().queryable.getRemoteRegistry().findDataStructure(df.getStructure()).then(function (struct: structure.DataStructure) {
            this.selectStructure(struct);
        }.bind(this));
    }
    public selectStructure(struct: message.StructureType) {
        var state: EditorState = this.getState();
        state.visual = new visual.Visual();
        state.visual.setQueryable(this.state.queryable);
        state.visual.setDataflow(this.state.dataflow);
        state.visual.init();
        super.forceUpdate();
    }
    public getState() {return this.state;}
    public parseVisualObject(obj: object) {

    }
    changeAdapter(e) {
        var i: number = e.selectedIndex;
        if (i == 0) {return;}
        this.state.visual.setAdapter(this.state.adapters[e.selectedIndex]);
        super.forceUpdate();
    }
    listAdapters() {
        var adapters = [];
        adapters.push(null);
        for (var i: number = 0; i < adapter.AdapterRegistrySingleton.getList().length; i++) {
            if (adapter.AdapterRegistrySingleton.getList()[i].canCreateModelFromVisual(this.state.visual)) {
                var adapt = adapter.AdapterRegistrySingleton.getList()[i];
                adapters.push(adapt);
            }
        }
        this.state.adapters = adapters;
        var options = [];
        var index: number = 0;
        _.forEach(this.state.adapters, function (item) {
            var name = item != null ? item.getName() : "";
            options.push(<Select.Item>{name}</Select.Item>);
            index++;
        });
        return options;
    }

    public selectBinding(concept: string, reg: bindings.BindingRegister, boundTo: number) {
        var html = [];
        var index: number = -1;
        var i = 0;
        var selectedBE: bindings.BindingEntry = null;;
        _.forEach(reg.getList(), function (be: bindings.BindingEntry) {
            html.push(<Select.Item> {be.getName()}</Select.Item>);
            if (be.getId() == boundTo) {
                index = i;
                selectedBE = be;
            }
            i++;
        });
        return (<Select selectedIndex={index} onChange={(a) => {this.setBinding(concept, a['selectedIndex'], reg)}>{html}</Select>);
    }
    public setBinding(concept: string, i: number, reg: bindings.BindingRegister) {
        var html = [];
        var index: number = 0;
        var entry = null;
        _.forEach(reg.getList(), function (item: bindings.BindingEntry) {
            if (i == index) {entry = item;}
            index++;
        });
        if (entry == null) {return;}
        var cn = entry.getCreateNew();
        var b = new cn(this.state.visual, concept);
        this.state.visual.setBinding(b);
        super.forceUpdate();
    }

    public customRow(concept: structure.ConceptType, register: bindings.BindingRegister) {
        return (<div><p>{concept.getId().toString()}:{structure.NameableType.toString(concept)}</p>{this.selectBinding(concept.getId().toString(), register, this.state.visual.findBinding(concept.getId().toString()).getBoundTo())}<Button onclick={(e) => {this.customise(concept.getId().toString());}>Customise</Button></div>);
    }
    public customRow2(boundto: bindings.BoundTo, register: bindings.BindingRegister) {
        return (<div><p>{boundto.getConcept()}:{structure.NameableType.toString(boundto.getConceptName())}</p>{this.selectBinding(boundto.getConcept(), register, boundto.getBoundTo())}<Button onclick={(e) => {this.customise(boundto.getConcept());}>Customise</Button></div>);
    }
    public customise(s: string) {
        var st = this.state;
        st['currentBindingObject'] = this.state.visual.findBinding(s);
        st['currentBindingConcept'] = s;
        var be: bindings.BindingEntry = bindings.BindingRegisterUtil.findBindingEntry(st['currentBindingObject'].getBoundTo());
        st['currentBindingParse'] = be.getParseObjectToBinding();
        st['currentBindingSave'] = be.getSaveBindingToObject();
        st['openCustomise'] = false;
        st['openCustomise'] = true;
        super.forceUpdate();
        if (this.customiseDialog != null) {
            this.customiseDialog.show();
        }
    }
    public changeVisualText(a) {
        this.state.visual.setVisualId(a.text);
    }
    public changeControlsText(a) {
        this.state.visual.setControlsId(a.text);
    }
    public render() {
        var html = [];

        html.push(<Services onConnect={(q: interfaces.Queryable) => {this.connect(q);}} ></Services>);
        html.push(<Dataflows dfs={this.getState().dataflows} selectDataflow={(df: structure.Dataflow) => this.selectDataflow(df)} />);
        if (this.state.visual == null) {
            return <div>{html}</div>;
        }
        html.push(<JSONResultPanel str={JSON.stringify(this.state.visual.getVisualObject())} obj={this.state.visual.getVisualObject()} />);
        html.push(<label>Visual Id</label> <input type="text" value={this.state.visual.getVisualId()} onChange={this.changeVisualText.bind(this)} />);
        var struct: structure.DataStructure = this.state.visual.getDataStructure();
        if (struct == null) {
            console.log("Struct is null");
            return <div>{html}</div>;
        }
        for (var i: number = 0; i < struct.getDataStructureComponents().getDimensionList().getDimensions().length; i++) {
            var dim: structure.Dimension = struct.getDataStructureComponents().getDimensionList().getDimensions()[i];
            var concept: structure.ConceptType = this.state.visual.getRegistry().findConcept(dim.getConceptIdentity());
            var b: bindings.BoundTo = this.state.visual.findBinding(concept.getId().toString());
            html.push(this.customRow(concept, bindings.DimensionBindingRegister.register));
            //if (this.state.currentBindingObject == null) {
            //    this.customise(concept.getId().toString());
            //}
        }
        if (this.state.visual.getTime() != null) {
            var dim2: structure.TimeDimension = struct.findComponentString(this.state.visual.getTime().getConcept()) as structure.TimeDimension;
            var concept2 = this.state.visual.getRegistry().findConcept(dim2.getConceptIdentity());
            html.push(this.customRow(concept2, bindings.TimeBindingRegister.register));
        }
        if (this.state.visual.getCrossSection() != null) {
            var dim3: structure.Component = struct.findComponentString(this.state.visual.getCrossSection().getConcept()) as structure.Component; 3
            var concept3 = this.state.visual.getRegistry().findConcept(dim3.getConceptIdentity());
            html.push(this.customRow(concept3, bindings.CrossSectionBindingRegister.register));
        }
        for (var i: number = 0; i < this.state.visual.getValues().length; i++) {
            html.push(this.customRow2(this.state.visual.getValues()[i], bindings.MeasureBindingRegister.register));
        }
        html.push(<CustomiseDialog currentBindingObject={this.state.currentBindingObject} renderFunc={this.state.currentBindingRenderFunc} currentBindingConcept={this.state.currentBindingConcept} visual={this.state.visual} ref={(customiseDialog) => {this.customiseDialog = customiseDialog}} open={this.state.openCustomise} />);
        var ad = this.state.visual.getAdapter();
        var adps = this.listAdapters();
        var change = this.changeAdapter.bind(this);
        html.push(<Select value={ad != null ? ad.getName() : ""} onChange={change}>{adps}</Select>);
        if(this.state.visual.getAdapter()!=null) {
         html.push(<Button onClick={(e)=>this.renderVisual()}>Render!</Button>);
        }
        return <div>{html}</div>;
    }
    public renderVisual() {
        var vis = new visual.Visual();
        vis.parseVisualObject(this.state.visual.getVisualObject());
    }
}


