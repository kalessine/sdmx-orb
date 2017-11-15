import * as React from 'preact-compat';
import {h,Component} from 'preact';
import {DropTarget} from 'preact-dnd';

const style = {
    height: '1.0rem',
    width: '1.0rem',
    marginRight: '.0rem',
    marginBottom: '.0rem',
    color: '0',
    padding: '0rem',
    textAlign: 'center',
    fontSize: '1rem',
    lineHeight: 'normal',
    float: 'left',
    name:"drop",
    "bg-color":'#0'
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
export default class ColumnDropTarget extends React.Component<any, any> {
    render(props, state) {
        const {accepts, isOver, canDrop, connectDropTarget, lastDroppedItem} = props;
        const isActive = isOver && canDrop;

        let backgroundColor = '#222';
        if (isActive) {
            backgroundColor = 'darkgreen';
        } else if (canDrop) {
            backgroundColor = 'darkkhaki';
        }
        //style.backgroundColor=backgroundColor;
        var sc:string = "";

        return connectDropTarget(
              <div style={style}>&#1421;</div>
        );
    }
}