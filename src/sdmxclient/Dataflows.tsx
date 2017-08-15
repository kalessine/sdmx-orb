import {h, Component} from 'preact';
import _ from 'lodash';
import Select from 'preact-material-components/Select';
import 'preact-material-components/List/style.css';
import 'preact-material-components/Menu/style.css';
import 'preact-material-components/Select/style.css';
import * as structure from '../sdmx/structure';
export interface DataflowsProps {
    dfs: Array<structure.Dataflow>,
    selectDataflow:Function
}

export default class Dataflows extends Component<DataflowsProps, any> {
    private presel = null;
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
        var o:structure.Dataflow = null;
        o = this.props.dfs[s.selectedIndex];
        this.setState({
            chosenIndex:s.selectedIndex,
            selectedString: structure.NameableType.toString(o),
            selectedObject:o
        });
        this.props.selectDataflow(o);
    }
    listDataflowOptions(state) {
        var options = [];
        var index = 0;
        if(this.props.dfs == null ) return [];
        this.props.dfs.forEach(function(item){
            options.push(<Select.Item>{structure.NameableType.toString(item)}</Select.Item>);
            index++;
        });
        return options;
    }
    render(props: DataflowsProps,state) {
        return (<div><Select hintText="Select a Dataflow"
            ref={presel => {this.presel = presel;}}
            selectedIndex={this.state.chosenIndex}
            onChange={(a) => {
                this.change(a)
            }}>{this.listDataflowOptions(state)}</Select></div>)
        //return <div><select value={this.state.selectedString} onChange={(e)=>this.change(e)}>{this.listDataflowOptions(props)}</select></div>
    }
}
