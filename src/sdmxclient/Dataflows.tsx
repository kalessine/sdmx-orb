import {h, Component} from 'preact';
import _ from 'lodash';
import * as structure from '../sdmx/structure';
export interface DataflowsProps {
    dfs: Array<structure.Dataflow>,
    selectDataflow:Function
}

export default class Dataflows extends Component<DataflowsProps, any> {
    constructor(props: DataflowsProps) {
        super(props);

    }
    getInitialState() {
        return {
            dataflows: [],
            selectedString: null,
            selectedObject: null
        };
    }
    change(s) {
        var object = null;
        for (var i = 0; i < this.props.dfs.length; i++) {
            if (structure.NameableType.toString(this.props.dfs[i]).trim() == s.target.value.trim()) {
                object = this.props.dfs[i];
            }
        }
        this.setState({
            selectedString: s.target.value,
            selectedObject: object
        });
        this.props.selectDataflow(object);
    }
    listDataflowOptions(state) {
        var options = [];
        var index = 0;
        if(this.props.dfs == null ) return [];
        this.props.dfs.forEach(function(item){
            options.push(<option>{structure.NameableType.toString(item)}</option>);
            index++;
        });
        return options;
    }
    render(props: DataflowsProps,state) {
        return <div><select value={this.state.selectedString} onChange={(e)=>this.change(e)}>{this.listDataflowOptions(props)}</select></div>
    }
}
