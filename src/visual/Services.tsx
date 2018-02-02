import * as React from 'preact-compat';
import {h,Component} from 'preact';
import _ from 'lodash';
import Select from 'preact-material-components/Select';
import * as structure from '../sdmx/structure';
import * as sdmx from '../sdmx';
import * as interfaces from '../sdmx/interfaces';
console.log('3');
export interface ServicesProps {
    onConnect: Function,
}

export default class Services extends React.Component {
    private props:ServicesProps = null;
    public state:any = null;
    private onConnect: Function = null;
    private presel = null;
    constructor(a: ServicesProps,b:any) {
        super(a,b);
        this.props=a;
        this.state = this.getInitialState();
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
        super.setState({chosenIndex:e.selectedIndex, selected: service, queryable: q});
        this.onConnect(q);
    }
    render():React.ReactElement<any> {
        var props: ServicesProps=this.props;
        var state:any = this.state;
        this.onConnect = props.onConnect;
        if (state.services == null) {return (<div><p>No State</p></div>);}
        return (<div><Select value={state.selected} onChange={(a) => this.changeService(a)}>{this.listServices()}</Select></div>);
    }
}

