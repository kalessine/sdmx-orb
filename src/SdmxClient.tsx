import {h, Component} from 'preact';
import Services from './sdmxclient/Services';
import Dataflows from './sdmxclient/Dataflows';
import Toolbar from './sdmxclient/Toolbar';
import * as interfaces from './sdmx/interfaces';
import * as structure from './sdmx/structure';
export interface SdmxClientProps {

}

export default class SdmxClient extends Component<SdmxClientProps, any> {
    constructor(props:SdmxClientProps) {
        super(props);
        
    }
    getInitialState(){
        var o = {
            queryable:null,
            service:'',
            dataflows:[]
        };
        return o;
    }
    connect(q:interfaces.Queryable){
        this.setState({queryable:q});
        if(this.state.queryable == null ) {
            this.setState({dataflows:[]});
            return;
        }
        this.state.queryable.getRemoteRegistry().listDataflows().then(function(dfs){
            this.setState({dataflows:dfs});
        }.bind(this));
    }
    selectDataflow(df:structure.Dataflow){
        alert("Dataflow:"+structure.NameableType.toString(df));
    }
    render (props,state) {
        //return h(Services, { test: function (q) { return this.connect(q); }.bind(this), onconnect: function (q) { return this.connect(q); }, muah: this.connect.bind(this) });
        return <div class="orb-container orb-blue"><Services onConnect={(q: interfaces.Queryable) => this.connect(q)} /><Dataflows dfs={state.dataflows} selectDataflow={(df: structure.Dataflow) => this.selectDataflow(df)}/><Toolbar name=""/></div>
    }
}