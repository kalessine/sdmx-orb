import {h, Component} from 'preact';
import * as structure from '../sdmx/structure';
import {DragSource} from 'preact-dnd';
import ItemTypes from './ItemTypes';
export interface ColumnProps {
    item: structure.ConceptType,
    filterButton: Function,
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
        return {
            item: props.item,
        };
    },

    endDrag(props, monitor) {
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
export default class Column extends Component<ColumnProps, ColumnState> {
    constructor(props: ColumnProps, state: ColumnState) {
        super(props, state);

    }
    render(props, state) {
        var item = props.item;
        const {isDragging, connectDragSource} = this.props;
        const opacity = isDragging ? 0.4 : 1;
        return connectDragSource(<td><div class="fld-btn">
            <table><tbody>
                <tr> <td class="caption"><span>{structure.NameableType.toString(item)}</span><span></span ></td><td><div class="sort-indicator "></div> </td><td class="filter"><div class="fltr-btn" onClick={(e) => props.filterButton(e, structure.NameableType.toIDString(item))}></div></td>
                </tr>
            </tbody>
            </table>
        </div></td >);
    }
}