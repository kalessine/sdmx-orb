import * as React from 'preact-compat';
import {h, Component} from 'preact';
import Dialog from 'preact-material-components/Dialog';
import Button from 'preact-material-components/Button';
import List from 'preact-material-components/List';
import Checkbox from 'preact-material-components/Checkbox';
import * as interfaces from '../sdmx/interfaces';
import * as structure from '../sdmx/structure';
import * as commonreferences from '../sdmx/commonreferences';
import * as data from '../sdmx/data';
import * as collections from 'typescript-collections';
import VirtualList from 'react-tiny-virtual-list';
import * as Tree from 'react-simple-tree';
import TreeView from 'react-treeview';
import * as visual from 'visual';
import * as bindings from 'bindings';
export interface FilterDialogProps {
    open?: boolean,
    boundto: bindings.BoundTo,
    visual: visual.Visual
}
export interface FilterDialogState {
    open?: boolean,
    data: Array<object>,
    tree: object
}

export default class SingleItemFilterDialog extends React.Component<FilterDialogProps, FilterDialogState> {
    private props: FilterDialogProps = {};
    private state: FilterDialogState = {data: null};

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
        super.setState({data: this.getItemSchemeList(this.props, this.props.itemScheme)});
        if (this.scrollingDlg != null) {
            this.scrollingDlg.MDComponent.show();
        }
    }
    change(id: string, checked: boolean) {
        var boundto: bindings.BoundTo = this.props.boundto;
        if (checked) {
            boundto.setCurrentValuesString([id]);
        } else {
            boundto.setCurrentValues([]);
        }
        super.forceUpdate();
    }
    toggle(id: string) {
        var boundto: bindings.BoundTo = this.props.boundto;
        var item: structure.ItemType = null;
        boundto.setCurrentValueString(id);
        this.setState(this.state);
        super.forceUpdate();
    }
    getItemSchemeList(props: FilterDialogProps, itemScheme: structure.ItemSchemeType) {
        return this.props.boundto.getCodelist();
    }
    clear() {
        var boundto: bindings.BoundTo = this.props.boundto;
        var to_remove = [];
        collections.arrays.forEach(boundto.getCodelist().getItems(), function (item: structure.ItemType) {
            to_remove.push(item.getId().toString());
        });
        collections.arrays.forEach(to_remove, function (item: structure.ItemType) {
            boundto.removeCurrentValueString(item.getId().toString());
        });
        this.setState({open: true, data: this.getItemSchemeList(this.props, this.props.itemScheme)});
    }
    public renderRow(html: Array<object>, itemScheme: structure.ItemSchemeType, id: commonreferences.ID) {
        var item: structure.ItemType = itemScheme.findItemId(id);
        var boundto: bindings.BoundTo = this.props.boundto;
        var selected = false;
        collections.arrays.forEach(boundto.getValues(), function (item2) {
            if (id.toString() == item2) {
                selected = true;
            }
        });
        var checked = selected;

        var id_string: string = structure.NameableType.toIDString(item);
        var subs = this.props.boundto.getCodelist().findSubItemsId(item.getId());
        var level: number = this.props.boundto.getCodelist().getLevel(item.getId().toString());
        var hasChildren = subs.length > 0;
        if (hasChildren) {
            var html2 = [];
            for (var i = 0; i < subs.length; i++) {
                this.renderRow(html2, itemScheme, subs[i].getId());
            }
            var style = {display: "block", "float": "left", "margin-left": (20 * level) + "px;", clear: "both", width: "100%"};
            html.push(<Tree.Node><Checkbox checked={checked} id={this.props.boundto.getConcept() + "_" + id} onclick={(evt) => {evt.stopPropagation(); this.change(id, checked, evt)}} /><label>{structure.NameableType.toString(item)}</label><button onclick={(evt) => {evt.stopPropagation(); this.toggle(item.getId().toString())}}>Toggle</button><Tree preventdefaultmousedown={false} style={JSON.stringify(style)} depth={level}>{html2}</Tree></Tree.Node>);
        } else {
            html.push(<Tree.Node style={JSON.stringify(style)}><Checkbox checked={checked} id={this.props.bounto.getConcept().getId().toString + "_" + id} onclick={(evt) => {evt.stopPropagation(); this.change(id, checked, evt)}} />
                <label>{structure.NameableType.toString(item)}</label></Tree.Node>);
        }
    }
    render(): JSX.Element {
        var data = [];
        var html = [];
        var tree = this.state.tree;
        if (this.props.boundto.getItemScheme() != null) {
            if (this.props.boundto.getItemScheme().isFlat()) {
                data = this.props.boundto.getItemScheme().getItems();
                return (<div>
                    <Dialog ref={(scrollingDlg) => {this.scrollingDlg = scrollingDlg}}>
                        <Dialog.Header>Filter {this.props.boundto.getConceptName()}</Dialog.Header>
                        <Dialog.Body scrollable={true}><VirtualList
                            width='100%'
                            height={600}
                            itemCount={data.length}
                            itemSize={20} // Also supports variable heights (array or function getter)
                            renderItem={({index, style}) => {
                                console.log(style);
                                var item: structure.ItemSchemeType = data[index];
                                var dim: data.QueryKey = this.props.visual.getQuery().getQueryKey(this.props.boundto.getConcept());
                                var selected = false;
                                collections.arrays.forEach(dim.getValues(), function (item2) {
                                    if (item2 == item.getId().toString()) {
                                        selected = true;
                                    }
                                });
                                var checked = selected;
                                var id: string = structure.NameableType.toIDString(item);
                                return <div key={index}><Checkbox checked={checked} id={this.props.boundto.getConcept() + "_" + id} onclick={(evt) => {this.change(id, checked, evt)}} />
                                    <label>{structure.NameableType.toString(item)}()</label></div>;
                            }} /></Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.FooterButton onClick={() => {this.clear();}}>Clear</Dialog.FooterButton>
                            <Dialog.FooterButton accept={true} onClick={() => {this.props.visual.renderVisual();
        super.forceUpdate();}}>Accept</Dialog.FooterButton>
                        </Dialog.Footer>
                    </Dialog>
                </div>);
            }
            else {
                var id = null;
                var array = this.props.boundto.getItemScheme().findSubItemsString(null);
                var html2 = [];
                for (var i: number = 0; i < array.length; i++) {
                    this.renderRow(html2, this.props.boundto.getItemScheme(), array[i].getId());
                }
                var tree: any = <Tree preventdefaultmousedown="false">{html2}</Tree>;
                return <Dialog ref={(scrollingDlg) => {this.scrollingDlg = scrollingDlg}}>
                    <Dialog.Header>Filter {structure.NameableType.toString(this.props.concept)}</Dialog.Header>
                    <Dialog.Body scrollable={true}>
                        {tree}
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.FooterButton onClick={() => {this.clear();}}>Clear</Dialog.FooterButton>
                        <Dialog.FooterButton accept={true} onClick={() => {this.props.visual.renderVisual();
        super.forceUpdate();}}>Accept</Dialog.FooterButton>
                    </Dialog.Footer>
                </Dialog>
            };
        } else
            return <div></div>;
    }
}
