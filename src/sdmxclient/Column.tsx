import * as React from 'preact-compat';
import {h,Component} from 'preact';
import * as structure from '../sdmx/structure';
import {DragSource} from 'preact-dnd';
import ItemTypes from './ItemTypes';
export interface ColumnProps {
    item: structure.ConceptType,
    filterButton: Function,
    filterTimeButton: Function,
    connectDragSource?: Function,
    isDragging?: boolean,
    name: string,
    dropField:Function
}

export interface ColumnState {

}

const style = {
    border: '1px dashed gray',
    backgroundColor: 'white',
    padding: '0.5rem 1rem',
    marginRight: '1.5rem',
    marginBottom: '1.5rem',
    float: 'left',
};

const boxSource = {
    beginDrag(props) {
        console.log("Begin Drag");
        return {
            item: props.item,
        };
    },

    endDrag(props, monitor) {
        console.log("End Drag");
        const item = monitor.getItem();
        const dropResult = monitor.getDropResult();

        if (dropResult) {
            props.dropField(item.item,props.name);
        }
    },
};
@DragSource(ItemTypes.Dimension, boxSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))
export default class Column extends React.Component<ColumnProps, ColumnState> {
    private props:ColumnProps = {} as ColumnProps;
    private state:ColumnState = {} as ColumnState; 
    constructor(props: ColumnProps, state: ColumnState) {
        super(props, state);

    }
    render():React.ReactElement<any> {
        var state:ColumnState = this.state;
        var props:ColumnProps = this.props;
        var item = props.item;
        const {isDragging, connectDragSource} = this.props;
        const opacity = isDragging ? 0.4 : 1;
        const isTime = this.props.name=="TIME"||this.props.name=="TIME_PERIOD";
        if( isTime ) {
        return connectDragSource(<td><div class="fld-btn">
            <table><tbody>
                <tr> <td class="caption"><span>{structure.NameableType.toString(item)}</span><span></span ></td><td><div class="sort-indicator "></div> </td><td class="filter"><div class="fltr-btn" onClick={(e) => { props.filterTimeButton(e, structure.NameableType.toIDString(item));}}></div></td>
                </tr>
            </tbody>
            </table>
        </div></td>);
        }else {
        return connectDragSource(<td><div class="fld-btn">
            <table><tbody>
                <tr> <td class="caption"><span>{structure.NameableType.toString(item)}</span><span></span ></td><td><div class="sort-indicator "></div> </td><td class="filter"><div class="fltr-btn" onClick={(e) => { props.filterButton(e, structure.NameableType.toIDString(item))}}></div></td>
                </tr>
            </tbody>
            </table>
        </div></td>);
        }
    }
}