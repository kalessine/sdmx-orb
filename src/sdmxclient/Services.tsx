import {h, Component} from 'preact';
import _ from 'lodash';
import Select from 'preact-material-components/Select';
import 'preact-material-components/List/style.css';
import 'preact-material-components/Menu/style.css';
import 'preact-material-components/Select/style.css';
import * as structure from '../sdmx/structure';
import * as sdmx from '../sdmx';
import * as interfaces from '../sdmx/interfaces';

export interface ServicesProps {
    onConnect: Function,
}

export default class Services extends Component<ServicesProps, any> {
    private onConnect: Function = null;
    private presel = null;
    constructor(a: ServicesProps) {
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
            chosenIndex:-1,
            services: array,
            selected: "",
            queryable: null
        };
        return o;
    }
    listServices() {
        var options = [];
        var index: number = 0;
        this.state.services.forEach(function (item) {
            options.push(<Select.Item>{item}</Select.Item>);
            index++;
        });
        return options;
    }
    changeService(e) {
        var service:string = this.state.services[e.selectedIndex];
        var q = sdmx.SdmxIO.connect(service);
        this.setState({chosenIndex:e.selectedIndex, selected: service, queryable: q});
        this.onConnect(q);
    }
    render(props: ServicesProps, state) {
        this.onConnect = props.onConnect;
        if (state.services == null) return <div><p>No State</p></div>;
        return (<div><Select hintText="Select an SDMX Serviceoption"
            ref={presel => {this.presel = presel;}}
            selectedIndex={this.state.chosenIndex}
            onChange={(a) => {
                this.changeService(a)
            }}>
            {this.listServices()}
        </Select></div>)
        //return <div><select value={state.selected} onChange={(a) => this.changeService(a)}></select></div>
    }
}

