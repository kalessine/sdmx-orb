import * as React from 'preact-compat';
import {h,Component} from 'preact';
import _ from 'lodash';
import Select from 'preact-material-components/Select';
import * as structure from '../sdmx/structure';
export interface DataflowsProps {
    dfs: Array<structure.Dataflow>,
    selectDataflow:Function
}

export default class Dataflows extends React.Component<DataflowsProps, any> {
    private presel = null;
    public props:DataflowsProps = {} as DataflowsProps;
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
        super.setState({
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
    render() :JSX.Element{
        var props: DataflowsProps = this.props;
        var state:any = this.state;
        return (<div><Select hintText="Select a Dataflow"
            ref={presel => {this.presel = presel;}}
            selectedIndex={this.state.chosenIndex}
            onChange={(a) => {
                this.change(a)
            }}>{this.listDataflowOptions(state)}</Select></div>)
        //return <div><select value={this.state.selectedString} onChange={(e)=>this.change(e)}>{this.listDataflowOptions(props)}</select></div>
    }
}
