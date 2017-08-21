import {h, Component} from 'preact';
import {DropTarget} from 'preact-dnd';

const style = {
    height: '1rem',
    width: '0.11rem',
    marginRight: '.0rem',
    marginBottom: '.0rem',
    color: 'white',
    padding: '1rem',
    textAlign: 'center',
    fontSize: '1rem',
    lineHeight: 'normal',
    float: 'left',
    name:"drop"
};

const dustbinTarget = {
    drop(props, monitor) {
        props.onDrop(props.name,monitor.getItem().item);
    },
};

export interface ColumnDropTargetProps {
    connectDropTarget: Function,
    isOver: boolean,
    canDrop: boolean,
    accepts: Array<string>,
    lastDroppedItem: object,
    onDrop: Function,
    name:string
}
@DropTarget(props => props.accepts, dustbinTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
}))
export default class ColumnDropTarget extends Component<any, any> {
    render(props, state) {
        const {accepts, isOver, canDrop, connectDropTarget, lastDroppedItem} = props;
        const isActive = isOver && canDrop;

        let backgroundColor = '#222';
        if (isActive) {
            backgroundColor = 'darkgreen';
        } else if (canDrop) {
            backgroundColor = 'darkkhaki';
        }

        return connectDropTarget(
              <div class="drp-indic" style={{style}}></div>
        );
    }
}