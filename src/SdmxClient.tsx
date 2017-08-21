import {h, Component} from 'preact';
import Services from './sdmxclient/Services';
import Dataflows from './sdmxclient/Dataflows';
import MainTable from './sdmxclient/MainTable';
import FilterDialog from './sdmxclient/FilterDialog';
import TableToolbar from './sdmxclient/TableToolbar';
import Drawer from 'preact-material-components/Drawer';
import Button from 'preact-material-components/Button';
import * as interfaces from './sdmx/interfaces';
import * as common from './sdmx/common';
import * as commonreferences from './sdmx/commonreferences';
import * as structure from './sdmx/structure';
import * as data from './sdmx/data';
import * as _ from 'lodash';
import * as collections from 'typescript-collections';
    
export interface SdmxClientProps {

}
export interface SdmxClientState {
    queryable: interfaces.Queryable,
    service: string,
    dataflows: Array<structure.Dataflow>,
    dataflow: structure.Dataflow,
    structureRef: commonreferences.Reference,
    struct: structure.DataStructure,
    all_fields: Array<structure.ConceptType>,
    fields: Array<structure.ConceptType>,
    rows: Array<structure.ConceptType>,
    columns: Array<structure.ConceptType>,
    data: Array<structure.ConceptType>,
    registry: interfaces.LocalRegistry,
    query: data.Query,
    showFilter: boolean,
    filterConcept: structure.ConceptType,
    filterItemScheme: structure.ItemSchemeType
    
}

export default class SdmxClient extends Component<SdmxClientProps, SdmxClientState> {
    private control = null;
    private drawer: any = null;
    private filter: any = null;
    public state: SdmxClientState = this.getInitialState();
    constructor(props: SdmxClientProps, state: SdmxClientState) {
        super(props, state);
        this.state=state;
    }
    getInitialState(): SdmxClientState {
        var o: SdmxClientState = {
            queryable: null,
            service: '',
            dataflows: [],
            dataflow: null,
            structureRef: null,
            struct: null,
            all_fields: [],
            fields: [],
            rows: [],
            columns: [],
            data: [],
            registry: null,
            query: null,
            showFilter: false,
            filterConcept: null,
            filterItemScheme: null,
        };
        return o;
    }
    connect(q: interfaces.Queryable) {
        this.setState({queryable: q});
        if (this.state.queryable == null) {
            this.setState({dataflows: []});
            return;
        }
        this.state.queryable.getRemoteRegistry().listDataflows().then(function (dfs) {
            this.setState({dataflows: dfs});
        }.bind(this));
    }
    selectDataflow(df: structure.Dataflow) {
        var s: SdmxClientState = this.state;
        s.dataflow = df;
        s.structureRef = df.getStructure();
        s.all_fields = [];
        s.fields = [];
        s.columns = [];
        s.rows = [];
        s.data = [];
        this.setState(s);
        this.state.queryable.getRemoteRegistry().findDataStructure(df.getStructure()).then(function (struct: structure.DataStructure) {
            this.selectStructure(struct);
        }.bind(this));
    }
    selectStructure(struct: structure.DataStructure) {
        var all_fields: Array<structure.ConceptType> = [];
        var rows: Array<structure.ConceptType> = [];
        var columns: Array<structure.ConceptType> = [];
        var data_fields: Array<structure.ConceptType> = [];
        var reg: interfaces.LocalRegistry = this.state.queryable.getRemoteRegistry().getLocalRegistry();
        for (var i: number = 0; i < struct.getDataStructureComponents().getDimensionList().getDimensions().length; i++) {
            var dim: structure.Dimension = struct.getDataStructureComponents().getDimensionList().getDimensions()[i];
            all_fields.push(reg.findConcept(dim.getConceptIdentity()));
            if (i < (struct.getDataStructureComponents().getDimensionList().getDimensions().length / 2)) {
                rows.push(reg.findConcept(dim.getConceptIdentity()));
            } else {
                columns.push(reg.findConcept(dim.getConceptIdentity()));
            }
        }
        var time: structure.TimeDimension = struct.getDataStructureComponents().getDimensionList().getTimeDimension();
        if (time != null) {
            all_fields.push(reg.findConcept(time.getConceptIdentity()));
            columns.push(reg.findConcept(time.getConceptIdentity()));
        }
        if (struct.getDataStructureComponents().getDimensionList().getMeasureDimension() != null) {
            var cs: structure.ConceptSchemeType = reg.findConceptScheme(struct.getDataStructureComponents().getDimensionList().getMeasureDimension().getLocalRepresentation().getEnumeration());
            for (var i: number = 0; i < cs.size(); i++) {
                data_fields.push(cs.getItem(i));
            }
        } else {
            var c = reg.findConcept(struct.getDataStructureComponents().getMeasureList().getPrimaryMeasure().getConceptIdentity());
            data_fields.push(c);
        }
        var q: data.Query = new data.Query(this.state.dataflow, reg);
        var s: SdmxClientState = this.state;
        this.setState({struct: struct, all_fields: all_fields, rows: rows, columns: columns, data: data_fields, registry: reg, query: q});
    }
    render(props: SdmxClientProps, state: SdmxClientState) {
        this.state=state;
        return (<div class="orb-container orb-blue">
            <Drawer.TemporaryDrawer
                ref={drawer => {
                    this.drawer = drawer;
                }}
                onOpen={() => {
                    console.log("open");
                }}
                onClose={() => {
                    console.log("Close");
                }}
            >
                <Drawer.TemporaryDrawerHeader>
                    Hello Header
          </Drawer.TemporaryDrawerHeader>
                <Drawer.DrawerItem>Item1</Drawer.DrawerItem>
                <Drawer.DrawerItem selected={true}>Item2</Drawer.DrawerItem>
            </Drawer.TemporaryDrawer>

            <Button
                raised={true}
                accent={true}
                ripple={true}
                onClick={e => {
                    this.drawer.MDComponent.open = true;
                }}>hi</Button>


            <Services onConnect={(q: interfaces.Queryable) => this.connect(q)} />
            <Dataflows dfs={state.dataflows} selectDataflow={(df: structure.Dataflow) => this.selectDataflow(df)} />
            <TableToolbar name="" />
            <MainTable struct={state.struct} registry={state.registry} fields={state.fields} data={state.data} cols={this.state.columns} rs={this.state.rows} query={state.query} filterButton={(e, i) => this.filterButton(e, i)} dropField={(a1,a2)=>{this.dropField(a1,a2);}} />
            <FilterDialog ref={(filter) => {this.filter = filter}} registry={this.state.registry} struct={this.state.struct} concept={this.state.filterConcept} itemScheme={this.state.filterItemScheme} query={this.state.query}/>
        </div>);
    }
    filterButton(e, id) {
        e.preventDefault();
        var filterConcept = this.state.registry.findConcept(this.state.struct.findComponentString(id).getConceptIdentity());
        if (this.state.struct.findComponentString(id).getLocalRepresentation()==null)return;
        if (this.state.struct.findComponentString(id).getLocalRepresentation().getEnumeration()==null)return;
        var filterItemScheme = this.state.struct.findComponentString(id).getLocalRepresentation().getEnumeration();
        var filterCodelist = this.state.registry.findCodelist(filterItemScheme);
        if( filterCodelist == null ) {
            filterCodelist = this.state.registry.findConceptScheme(filterItemScheme);
        }
        this.setState({filterItemScheme:filterCodelist, filterConcept:filterConcept});
        this.filter.show();
        return false;
    }
    dropField(bin:string,field: structure.ConceptType) {
        var rows = this.state.rows;
        var columns = this.state.columns;
        var fields = this.state.fields;
        var binArray: Array<structure.ConceptType> = [];
        var binIndex = 0;
        var binNumber = -1;
        var dropped = bin.substring(bin.indexOf("_")+1, bin.length);
        var axe = bin.substring(0, bin.indexOf("_"));
        if( axe == 'rows' ) {
            binNumber = 0;
            binArray = rows;
        }else if(axe == 'columns'){
            binNumber=1;
            binArray = columns;
        }else if( axe == 'fields' ) {
            binNumber=2;
            binArray = fields;
        }
        collections.arrays.forEach(this.state.rows,function(item){
            if (field==item){
                collections.arrays.remove(rows,item);
            }
            if (dropped == structure.NameableType.toIDString(item)){
                binIndex = binArray.indexOf(item);
            }
        }.bind(this));
        collections.arrays.forEach(this.state.columns,function(item){
            if (field==item){
                collections.arrays.remove(columns,item);
            }
            if (dropped == structure.NameableType.toIDString(item)){
                
                binIndex = binArray.indexOf(item);
            }
        }.bind(this));
        collections.arrays.forEach(this.state.fields,function(item){
            if (field==item){
                collections.arrays.remove(fields,item);
            }
            if (dropped == structure.NameableType.toIDString(item)){
                binIndex = binArray.indexOf(item);
            }
        }.bind(this));
        var newArray:Array<structure.ConceptType> = [];
        collections.arrays.forEach(binArray, function (item: structure.ConceptType){
            if (structure.NameableType.toIDString(item)==dropped) {
                newArray.push(field);
            }
            newArray.push(item);
        });
        if("end"==dropped) {
            newArray.push(field);
        }
        switch(binNumber) {
            case 0:{
                this.setState({rows:newArray,columns:columns,fields:fields});
            }break;
            case 1:{
                this.setState({rows:rows,columns:newArray,fields:fields});
            }break;
            case 2:{
                this.setState({rows:rows,columns:columns,fields:newArray});
            }break;
        }
    }
}