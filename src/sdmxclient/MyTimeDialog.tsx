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
import {DatePicker} from 'react-toolbox/lib/date_picker';
export interface TimeDialogProps {
    open?: boolean,
    registry: interfaces.LocalRegistry,
    struct: structure.DataStructure,
    concept: structure.ConceptType,
    itemScheme: structure.ItemSchemeType,
    query: data.Query,
    queryFunc: Function,
    time_fields: Array<string>
}
export interface TimeDialogState {
    open?: boolean
}

export class MyTimeDialog extends Component<TimeDialogProps, TimeDialogState> {
    private scrollingDlg = null;
    private items = [];
    public state:TimeDialogState = null;
    constructor(props: TimeDialogProps, state: TimeDialogState) {
        super(props, state);
        //this.setState(this.getInitialState());
    }
    getInitialState(): TimeDialogState {
        return {
            open: false
        };
    }
    show() {
        console.log(this.scrollingDlg);
        this.scrollingDlg.MDComponent.show();
    }
    change(props:TimeDialogProps,id: string, checked: boolean) {
        var dim: data.QueryKey = props.query.getQueryKey(props.concept.getId().toString());
        var item: structure.ItemType = null;
        collections.arrays.forEach(dim.getValues(), function (item2: string) {
            if (item2==id) {
                item = item2;
            }
        });
        if (checked) {
            dim.removeValue(item);
        } else {
            dim.addValue(id);
        }
    }
    getItemSchemeList(props: TimeDialogProps, itemScheme: structure.ItemSchemeType) {
        var list = [];
        if (props.concept == null) return [];
        var dim: data.QueryKey = props.query.getQueryKey(props.concept.getId().toString());
        if (props.time_fields == null) return list;
        this.items = [];
        collections.arrays.forEach(props.time_fields, function (item) {
            var id: string = structure.NameableType.toIDString(item);
            var selected = false;
            collections.arrays.forEach(dim.getValues(), function (item) {
                if (item == id) {selected = true;}
            });
            var checked = selected;
            list.push(<List.Item>
                <Checkbox checked={checked} id={this.props.concept.getId().toString + "_" + id} ref={(cb) => {this.items.push(cb)}} onclick={(evt) => {this.change(props,id, checked, evt)}} />
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

    changeStartDate(props:TimeDialogProps,e) {
        props.query.setStartDate(e);
        this.setState({open:true});
    }
    changeEndDate(props:TimeDialogProps,e) {
        props.query.setEndDate(e);
        this.setState({open:true});
    }
    handleChange = (item, value) => {
        alert("test");
    };
    render(props: TimeDialogProps, state: TimeDialogState) {
        if (!props.query) return <div></div>;
        var html = [];
        html.push(<DatePicker value={props.query.getStartDate()} onChange={this.changeStartDate.bind(this,props)}/>);
        html.push(<DatePicker value={props.query.getEndDate()} onChange={this.changeEndDate.bind(this,props)}/>);
        return (
            <div>
                <Dialog ref={(scrollingDlg) => {this.scrollingDlg = scrollingDlg}}>
                    <Dialog.Header>Filter {structure.NameableType.toString(props.concept)}</Dialog.Header>
                    <Dialog.Body scrollable={true}>
                        {html}
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