import * as React from 'preact-compat';
import {h} from 'preact';
import * as visual from './visual';
import * as bindings from './bindings';
import * as structure from '../sdmx/structure';
import * as message from '../sdmx/message';
import * as interfaces from '../sdmx/interfaces';
import * as _ from 'lodash';
import Select from 'preact-material-components/Select';
import Services from './Services';
import Dataflows from './Dataflows';
import JSONResultPanel from './JSONResultPanel';
import CustomiseDialog from './CustomiseDialog';
import 'preact-material-components/List/style.css';
import 'preact-material-components/Menu/style.css';
import 'preact-material-components/Select/style.css';
import Button from 'preact-material-components/Button';

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
    currentBindingSave: Function
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
    public getVisualObject(): object {
        var obj = {};
        if (this.state.visual == null) return obj;
        if (this.state.visual != null && this.state.visual.getDataflow() != null) {
            obj["dataservice"] = this.state.visual.getDataService();
            obj["dataflowAgency"] = this.state.visual.getDataflow().getAgencyId().toString();
            obj["dataflowId"] = this.state.visual.getDataflow().getId().toString();
            obj["dataflowVersion"] = this.state.visual.getDataflow().getVersion().toString();
            obj["dataflowName"] = this.state.visual.getDataflow().getName();
            obj["structureAgency"] = this.state.visual.getDataflow().getStructure().getAgencyId().toString();
            obj["structureId"] = this.state.visual.getDataflow().getStructure().getMaintainableParentId().toString();
            obj["structureVersion"] = this.state.visual.getDataflow().getStructure().getVersion().toString();
        }
        var struct: structure.DataStructure = this.state.visual.getDataStructure();
        obj['dimensions']={};
        for (var i: number = 0; i < struct.getDataStructureComponents().getDimensionList().getDimensions().length;i++) {
            var dim: structure.Dimension = struct.getDataStructureComponents().getDimensionList().getDimensions()[i];
            var b = this.state.visual.findBinding(dim.getConceptIdentity().getId().toString());
            var be:bindings.BindingEntry = bindings.BindingRegisterUtil.findBindingEntry(b.getBoundTo());
            obj['dimensions'][b.getConcept()]=be.getSaveBindingToObject()(b);
        }
        return obj;
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
        console.log("SelectedBE="+concept+":" + index);
        return (<Select selectedIndex={index} onChange={(a) => {this.setBinding(concept, a['selectedIndex'], bindings.DimensionBindingRegister.register)}>{html}</Select>);
    }
    public setBinding(concept: string, i: number, reg: bindings.BindingRegister) {
        var html = [];
        var index: number = 0;
        var entry = null;
        _.forEach(reg.getList(), function (item: bindings.BindingEntry) {
            if (i == index) {entry = item;}
            index++;
        });
        console.log("Entruy=");
        console.log(entry);
        if (entry == null) {return;}
        var cn = entry.getCreateNew();
        var b = new cn(this.state.visual, concept);
        console.log(b);
        console.log(b.getBoundTo());
        this.state.visual.setBinding(b);
        this.forceUpdate();
    }

    public customRow(concept) {
        return (<div><p>{concept.getId().toString()}:{structure.NameableType.toString(concept)}</p>{this.selectBinding(concept.getId().toString(), bindings.DimensionBindingRegister.register, this.state.visual.findBinding(concept.getId().toString()).getBoundTo())}<Button onclick={(e) => {this.customise(concept.getId().toString());}>Customise</Button></div>);
    }
    public customise(s: string) {
        var st = this.state;
        st['currentBindingObject'] = this.state.visual.findBinding(s);
        st['currentBindingConcept'] = s;
        var be: bindings.BindingEntry = bindings.BindingRegisterUtil.findBindingEntry(st['currentBindingObject'].getBoundTo());
        st['currentBindingParse'] = be.getParseObjectToBinding();
        st['currentBindingSave'] = be.getSaveBindingToObject();
        st['openCustomise'] = false;
        super.setState(st);
        st['openCustomise'] = true;
        super.setState(st);
        if (this.customiseDialog != null) {
            this.customiseDialog.show();
        }
    }
    public render() {
        var html = [];
        html.push(<Services onConnect={(q: interfaces.Queryable) => this.connect(q)} />);
        html.push(<Dataflows dfs={this.getState().dataflows} selectDataflow={(df: structure.Dataflow) => this.selectDataflow(df)} />);
        html.push(<JSONResultPanel str={JSON.stringify(this.getVisualObject())} obj={this.getVisualObject()} />);
        if (this.state.visual == null) {
            return <div>{html}</div>;
        }
        var struct: structure.DataStructure = this.state.visual.getDataStructure();
        if (struct == null) {
            console.log("Struct is null");
            return <div>{html}</div>;
        }
        for (var i: number = 0; i < struct.getDataStructureComponents().getDimensionList().getDimensions().length; i++) {
            var dim: structure.Dimension = struct.getDataStructureComponents().getDimensionList().getDimensions()[i];
            var concept: structure.ConceptType = this.state.visual.getRegistry().findConcept(dim.getConceptIdentity());
            var b: bindings.BoundTo = this.state.visual.findBinding(concept.getId().toString());
            html.push(this.customRow(concept));
            if (this.state.currentBindingObject == null) {
                this.customise(concept.getId().toString());
            }
        }
        html.push(<CustomiseDialog currentBindingObject={this.state.currentBindingObject} renderFunc={this.state.currentBindingRenderFunc} currentBindingConcept={this.state.currentBindingConcept} visual={this.state.visual} ref={(customiseDialog) => {this.customiseDialog = customiseDialog}} open={this.state.openCustomise} />);
        return <div>{html}</div>;
    }
}


