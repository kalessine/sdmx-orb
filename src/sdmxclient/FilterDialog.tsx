import React,{Component} from 'preact-compat';
import {h} from 'preact';
import Dialog from 'preact-material-components/Dialog';
import Button from 'preact-material-components/Button';
import List from 'preact-material-components/List';
import Checkbox from 'preact-material-components/Checkbox';
import * as interfaces from '../sdmx/interfaces';
import * as structure from '../sdmx/structure';
import * as data from '../sdmx/data';
import * as collections from 'typescript-collections';
export interface FilterDialogProps {
    open?: boolean,
    registry: interfaces.LocalRegistry,
    struct: structure.DataStructure,
    concept: structure.ConceptType,
    itemScheme: structure.ItemSchemeType,
    query: data.Query,
    queryFunc: Function
}
export interface FilterDialogState {
    open?: boolean
}

export default class MyDialog extends Component<FilterDialogProps, FilterDialogState> {
    private scrollingDlg = null;
    private items = [];
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
    change(id: string, checked: boolean) {
        var dim: data.QueryKey = this.props.query.getQueryKey(this.props.concept.getId().toString());
        var item: structure.ItemType = null;
        collections.arrays.forEach(dim.getItemScheme().getItems(), function (item2: structure.ItemType) {
            if (item2.getId().equalsString(id)) {
                item = item2;
            }
        });
        if (checked) {
            dim.removeValue(item.getId().toString());
        } else {
            dim.addValue(id);
        }
    }
    getItemSchemeList(props: FilterDialogProps, itemScheme: structure.ItemSchemeType) {
        var list = [];
        if (props.concept == null) return [];
        var dim: data.QueryKey = props.query.getQueryKey(props.concept.getId().toString());
        if (itemScheme == null) return list;
        this.items = [];
        collections.arrays.forEach(itemScheme.getItems(), function (item) {
            var id: string = structure.NameableType.toIDString(item);
            var selected = false;
            collections.arrays.forEach(dim.getValues(), function (item) {
                if (item == id) {selected = true;}
            });
            var checked = selected;
            list.push(<List.Item>
                <Checkbox checked={checked} id={this.props.concept.getId().toString + "_" + id} ref={(cb) => {this.items.push(cb)}} onclick={(evt) => {this.change(id, checked, evt)}} />
                <label for={id} id={this.props.concept.getId().toString + "_" + id + "_label"}>{structure.NameableType.toString(item)}({id})</label>
            </List.Item>);
        }.bind(this));
        return list;
    }
    selectAll() {
        var dim: data.QueryKey = this.props.query.getQueryKey(this.props.concept.getId().toString());
        var to_add = [];
        collections.arrays.forEach(dim.getItemScheme().getItems(), function (item) {
            to_add.push(item.getId().toString());

        });
        collections.arrays.forEach(to_add, function (item) {
            dim.addValue(item);
        });
        this.setState({open: true});
    }
    clear() {
        var dim: data.QueryKey = this.props.query.getQueryKey(this.props.concept.getId().toString());
        var to_remove = [];
        collections.arrays.forEach(dim.getValues(), function (item) {
            to_remove.push(item);

        });
        collections.arrays.forEach(to_remove, function (item) {
            dim.removeValue(item);
        });
        this.setState({open: true});
    }
    render(props: FilterDialogProps, state: FilterDialogState) {
        return (
            <div>
                <Dialog ref={(scrollingDlg) => {this.scrollingDlg = scrollingDlg}}>
                    <Dialog.Header>Filter {structure.NameableType.toString(props.concept)}</Dialog.Header>
                    <Dialog.Body scrollable={true}>
                        <List>
                            {this.getItemSchemeList(props, this.props.itemScheme)}
                        </List>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.FooterButton onClick={() => {this.selectAll();}}>Select All</Dialog.FooterButton>
                        <Dialog.FooterButton onClick={() => {this.clear();}}>Clear</Dialog.FooterButton>
                        <Dialog.FooterButton accept={true} onClick={() => props.queryFunc()}>Accept</Dialog.FooterButton>
                    </Dialog.Footer>
                </Dialog>
            </div>
        );
    }
}