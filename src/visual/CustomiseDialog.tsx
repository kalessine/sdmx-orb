import * as React from 'preact-compat';
import {h, Component} from 'preact';
import Dialog from 'preact-material-components/Dialog';
import Select from 'preact-material-components/Select';
import Button from 'preact-material-components/Button';
import * as _ from 'lodash';
import * as visual from './visual';
import * as structure from '../sdmx/structure';
import * as bindings from './bindings';
import 'preact-material-components/List/style.css';
import 'preact-material-components/Menu/style.css';
import 'preact-material-components/Select/style.css';
//import {DropdownBindingCustomiser} from './bindings';
console.log('9');
export interface CustomiseDialogProps {
    open?: boolean,
    renderFunc: Function,
    visual: visual.Visual,
    currentBindingObject: bindings.BoundTo,
    currentBindingConcept: string
}
export interface CustomiseDialogState {
    element: bindings.BindingsCustomiser,
    boundTo: number
}
export default class CustomiseDialog extends React.Component {
    private scrollingDlg = null;
    private props: CustomiseDialogProps = null;
    private state: CustomiseDialogState = {} as any;
    private rendering = false;
    constructor(props: CustomiseDialogProps, state: any) {
        super(props, state);
        this.props = props;
        this.state = state;
    }
    show() {
        if (this.scrollingDlg != null) {
            this.scrollingDlg.MDComponent.show();
        }
    }
    changeBinding(k: string, v: object) {
        if(k!=null&&v!=null){this.props.currentBindingObject[k] = v;}
        super.forceUpdate();
        console.log(this.props.currentBindingObject.getPercentOfId());
    }
    listItems(b: bindings.BoundTo) {
        var html = [];
        html.push(<Select.Item>No Percent of Id</Select.Item>);
        _.each(b.getAllValues(),function(item: structure.ItemType) {
          html.push(<Select.Item> {structure.NameableType.toString(item)}</Select.Item>);
         });
       return html;
    }
    public selectItem(b:bindings.BoundTo,s:string){
        return (<Select selectedIndex={b.getAllValues().indexOf(b.getPercentOfItemType())+1}  onChange={(event) => {b.setPercentOfId(b.getAllValues()[event.selectedIndex-1] != null ? b.getAllValues()[event.selectedIndex-1].getId().toString() : null);super.forceUpdate();}>{this.listItems(b)}</Select>);
    }
    render(): any {
    if (this.props.currentBindingObject == null) {
        return (<div>Customise Something</div>);
    }
    //if (this.state.boundTo != this.props.currentBindingObject.getBoundTo()) {
        this.state.element = null;
    //}
    if (this.state.element == null) {
        switch (this.props.currentBindingObject.getBoundTo()) {
            case bindings.BoundTo.BOUND_DISCRETE_DROPDOWN:
                this.state.boundTo = bindings.BoundTo.BOUND_DISCRETE_DROPDOWN;
                var b = this.props.currentBindingObject as bindings.BoundToDiscreteDropdown;
                this.state.element = (<div><Button onClick={() => {this.changeBinding('flat', !b.isFlat());}}>{b.isFlat() ? "Flat" : "Hierarchical"}</Button>
                    <Button onClick={() => {this.changeBinding('clientSide', !b.isClientSide());}}>{b.isClientSide() ? "Client Side" : "Server Side"}</Button>
                    <p>Percent Of Field</p>{this.selectItem(b,'perCentId')}
                    </div>);
                    break;
                default: this.state.element = (<div><p>Unknown Binding</p></div>);
            }
        }
        return (<div>
                        <Dialog ref={(scrollingDlg) => {this.scrollingDlg = scrollingDlg}} open={this.props.open}>
                            <Dialog.Header>Filter {this.props.currentBindingObject != null ? this.props.currentBindingObject.getConcept() : ""}</Dialog.Header>
                            <Dialog.Body scrollable={true}>{this.state.element}</Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.FooterButton accept={true}>Accept</Dialog.FooterButton>
                            </Dialog.Footer>
                        </Dialog>
                    </div>);
    }
}
