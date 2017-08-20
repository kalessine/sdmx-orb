import {h, Component} from 'preact';
import * as structure from '../sdmx/structure';
import {DragSource} from 'preact-dnd';
import ItemTypes from './ItemTypes';
export interface ColumnProps {
    item: structure.ConceptType,
    filterButton: Function,
    connectDragSource?: Function,
    isDragging?: boolean,
    name: string
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
            name: props.name,
        };
    },

    endDrag(props, monitor) {
        const item = monitor.getItem();
        const dropResult = monitor.getDropResult();

        if (dropResult) {
            let alertMessage = '';
            if (dropResult.allowedDropEffect === 'any' || dropResult.allowedDropEffect === dropResult.dropEffect) {
                alertMessage = `You ${dropResult.dropEffect === 'copy' ? 'copied' : 'moved'} ${item.name} into ${dropResult.name}!`;
            } else {
                alertMessage = `You cannot ${dropResult.dropEffect} an item into the ${dropResult.name}`;
            }
            window.alert( // eslint-disable-line no-alert
                alertMessage,
            );
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