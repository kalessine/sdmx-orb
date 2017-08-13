import {h, Component} from 'preact';
import _ from 'lodash';
import * as structure from '../sdmx/structure';
import * as sdmx from '../sdmx';
import * as interfaces from '../sdmx/interfaces';
export interface ServicesProps {
    onConnect:Function,
}

export default class Services extends Component<ServicesProps, any> {
    private onConnect:Function = null;
    constructor(a:ServicesProps){
        super(a);
        this.setState(this.getInitialState());
    }
    getInitialState() {
        var array = [];
        array.push("");
        for (var i = 0; i < sdmx.SdmxIO.listServices().length; i++) {
            array.push(sdmx.SdmxIO.listServices()[i]);
        }
        var o = {
            services: array,
            selected: "",
            queryable: null
        };
        return o;
    }
    listServices(){
        var options = [];
        var index:number = 0;
        this.state.services.forEach(function(item){
            options.push(<option>{item}</option>);
            index++;
        });
        return options;
    }
    changeService(item){
        var service = item.target.value;
        var q = sdmx.SdmxIO.connect(service);
        this.setState({selected:service,queryable:q});
        this.onConnect(q);
    }
    render(props: ServicesProps,state) {
        this.onConnect = props.onConnect;
        if(state.services == null ) return <div><p>No State</p></div>;
        return <div><select value={state.selected} onChange={(a)=>this.changeService(a)}>{this.listServices()}</select></div>
    }
}

