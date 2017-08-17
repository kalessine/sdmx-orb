import {h, Component} from 'preact';
import Dialog from 'preact-material-components/Dialog';
import Button from 'preact-material-components/Button';
import List from 'preact-material-components/List';
import Checkbox from 'preact-material-components/Checkbox';
import 'preact-material-components/List/style.css';
import 'preact-material-components/Button/style.css';
import 'preact-material-components/Dialog/style.css';
import * as interfaces from '../sdmx/interfaces';
import * as structure from '../sdmx/structure';
import * as _ from 'lodash';
export interface FilterDialogProps {
    open?: boolean,
    registry: interfaces.LocalRegistry,
    struct: structure.DataStructure,
    concept: structure.ConceptType,
    itemScheme: structure.ItemSchemeType
}
export interface FilterDialogState {
    open?: boolean
}

export default class MyDialog extends Component<FilterDialogProps, FilterDialogState> {
    private scrollingDlg = null;
    constructor(props: FilterDialogProps, state: FilterDialogState) {
        super(props, state);
        this.setState(this.getInitialState());
    }
    getInitialState(): FilterDialogState {
        return {
            open: false
        };
    }
    show() {
        this.scrollingDlg.MDComponent.show();
    }
    change(event){
        console.log(event);
    }
    getItemSchemeList(itemScheme: structure.ItemSchemeType) {
        var list = [];
        if (itemScheme == null) return list;
        _.forEach(itemScheme.getItems(), function (item) {
            list.push(<List.Item>
            <Checkbox id="cb-${structure.NameableType.toIDString(item)}" onChange={(event)=>this.change(event)}/>
            <label for="cb-${structure.NameableType.toIDString(item)}" id="cb-${structure.NameableType.toIDString(item)}-label">{structure.NameableType.toString(item)}</label>
            </List.Item>);
        });
        return list;
    }
    render(props: FilterDialogProps, state: FilterDialogState) {
        return (
            <div>
                <Dialog ref={(scrollingDlg) => {this.scrollingDlg = scrollingDlg}}>
                    <Dialog.Header>Filter {structure.NameableType.toString(props.concept)}</Dialog.Header>
                    <Dialog.Body scrollable={true}>
                        <List>
                            {this.getItemSchemeList(this.props.itemScheme)}
                        </List>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.FooterButton onClick={() => {alert("Select All");}}>Select All</Dialog.FooterButton>
                        <Dialog.FooterButton onClick={() => {alert("Clear");}}>Clear</Dialog.FooterButton>
                        <Dialog.FooterButton cancel={true}>Decline</Dialog.FooterButton>
                        <Dialog.FooterButton accept={true}>Accept</Dialog.FooterButton>
                    </Dialog.Footer>
                </Dialog>
            </div>
        );
    }
}