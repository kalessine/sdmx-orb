import {h, Component} from 'preact';
import _ from 'lodash';
export interface DataflowsProps {
    name: string
}

export default class Dataflows extends Component<DataflowsProps, any> {
    getInitialState() {
        return {
            dataflows: [],
            selectedString: null,
            selectedObject: null
        };
    }
    load(dataflows) {
        var object = null;
        this.setState({
            dataflows: dataflows,
            selectedString: structure.NameableType.toString(object),
            selectedObject: object
        });
        this.forceUpdate();
        this.props.onSelectDataflow(object);

    },
    change(s) {
        var object = null;
        for (var i = 0; i < this.state.dataflows.length; i++) {
            if (structure.NameableType.toString(this.state.dataflows[i]).trim() == s.target.value.trim()) {
                object = this.state.dataflows[i];
            }
        }
        this.setState({
            selectedString: s.target.value,
            selectedObject: object
        });
        this.forceUpdate();
        this.props.onSelectDataflow(object);
        this.props.onQuery(null);
    },
    repeatItem2(item, itemIndex) {
        return <option value={itemIndex}>{structure.NameableType.toString(item)</option>;
    }
    render() {
        var options = _.map(this.state.dataflows, this.repeatItem2);
        return <div>
                <select value=this.state.selectedString onChange=this.change > +options +</select></div>
            }
    }
}