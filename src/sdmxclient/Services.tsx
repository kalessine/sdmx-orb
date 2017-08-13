import {h, Component} from 'preact';
import _ from 'lodash';
import * as structure from '../sdmx/structure';
import * as sdmx from '../sdmx';
import * as interfaces from '../sdmx/interfaces';
export interface ServicesProps {
    onConnect?: any;
    onQuery?: any;
}

export default class Services extends Component<ServicesProps, any> {
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
        alert(JSON.stringify(array));
        return o;
    }
    connect() {
        this.setState({queryable: sdmx.SdmxIO.connect(this.state.selected)});
        this.props.onConnect(this.state.queryable);
        this.props.onQuery(null);
    }
    onChange(e) {
        this.setState({
            selected: e.target.value
        }, function () {
            this.connect();
        });

    }
    render() {
        return <div><select value={this.state.selected}>{_.map(this.state.services, this.repeatItem2)}</select></div>
    }
    repeatItem2(item, itemIndex) {
        return <option value={itemIndex}>{structure.NameableType.toString(item)}</option>;
    }
}

