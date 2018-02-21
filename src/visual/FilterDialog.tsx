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
    boundto: interfaces.LocalRegistry,
    visual:visual.Visual
}
export interface FilterDialogState {
    open?: boolean,
    data: Array<object>,
    tree: object
}

export default class MyDialog extends React.Component<FilterDialogProps, FilterDialogState> {
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
        var boundto:bindings.BoundTo = this.props.boundto;
        var item: structure.ItemType=null;
        var items: Array<structure.ItemType> = boundto.getAllValues();
        collections.arrays.forEach(items, function (item2: structure.ItemType) {
            if (item2.getId().equalsString(id)) {
                item = item2;
            }
        });
        if (checked) {
            boundto.addCurrentValue(item);
        } else {
            boundto.removeCurrentValue(item);
        }
    }
    toggle(id: string) {
        var boundto:bindings.BoundTo = this.props.boundto;
        var item: structure.ItemType = null;
        var checked:number = 0;
        var subs:Array<structure.ItemType> = boundto.getCodelist().findSubItemsString(id);
        collections.arrays.forEach(subs, function (item2: structure.ItemType) {
            if (boundto.containsValue(item2.getId().toString())) {
                checked++;
            }
        });
        if (checked==0||(checked>0&&checked<subs.length) {
            collections.arrays.forEach(subs, function (item2: structure.ItemType) {
                boundto.addCurrentValue(item2);
            });
        } else {
            collections.arrays.forEach(subs, function (item2: structure.ItemType) {
                boundto.removeCurrentValue(item2);
            });
        }
        this.setState(this.state);
    }
    getItemSchemeList(props: FilterDialogProps, itemScheme: structure.ItemSchemeType) {
        return this.props.boundto.getCodelist();
    }
    selectAll() {
        var boundto:bindings.BoundTo = this.props.boundto;
        var to_add = [];
        collections.arrays.forEach(boundto.getCodelist().getItems(), function (item:structure.ItemType) {
            to_add.push(item);

        });
        collections.arrays.forEach(to_add, function (item:structure.ItemType) {
            boundto.addCurrentValue(item);
        });
        this.setState({open: true, data: this.getItemSchemeList(this.props, this.props.boundto.getCodelist())});
    }
    clear() {
        var boundto:bindings.BoundTo = this.props.boundto;
        var to_remove = [];
        collections.arrays.forEach(boundto.getCodelist().getItems(), function (item:structure.ItemType) {
            to_remove.push(item);
        });
        collections.arrays.forEach(to_remove, function (item:structure.ItemType) {
            boundto.removeCurrentValue(item);
        });
        this.setState({open: true, data: this.getItemSchemeList(this.props, this.props.itemScheme)});
    }
    public renderRow(html: Array<object>, itemScheme: structure.ItemSchemeType, id: commonreferences.ID) {
        var item: structure.ItemType = itemScheme.findItemId(id);
        var boundto:bindings.BoundTo = this.props.boundto;
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
            var style = {display:"block","float":"left", "margin-left":(20*level)+"px;",clear:"both",width:"100%"};
            html.push(<Tree.Node><Checkbox checked={checked} id={this.props.boundto.getConcept().getId().toString + "_" + id} onclick={(evt) => {evt.stopPropagation(); this.change(id, checked, evt)}} /><label>{structure.NameableType.toString(item)}</label><button onclick={(evt) => {evt.stopPropagation();this.toggle(item.getId().toString())}}>Toggle</button><Tree preventdefaultmousedown={false} style={JSON.stringify(style)} depth={level}>{html2}</Tree></Tree.Node>);
        } else {
            html.push(<Tree.Node style={JSON.stringify(style)}><Checkbox checked={checked} id={this.props.bounto.getConcept().getId().toString + "_" + id} onclick={(evt) => {evt.stopPropagation(); this.change(id, checked, evt)}} />
                <label>{structure.NameableType.toString(item)}</label></Tree.Node>);
        }
    }
    render(): JSX.Element {
        var data = [];
        var html = [];
        var tree = this.state.tree;
        if (this.props.boundto.getItemScheme()!=null) {
            data = this.props.boundto.getItemScheme().getItems();
            if (this.props.boundto.getItemScheme().isFlat()) {
                return <div>
                    <Dialog ref={(scrollingDlg) => {this.scrollingDlg = scrollingDlg}}>
                        <Dialog.Header>Filter {structure.NameableType.toString(this.props.concept)}</Dialog.Header>
                        <Dialog.Body scrollable={true}><VirtualList
                            width='100%'
                            height={600}
                            itemCount={data.length}
                            itemSize={20} // Also supports variable heights (array or function getter)
                            renderItem={({index, style}) =>{
                                console.log(style);
                                var item: structure.ItemSchemeType = data[index];
                                var qk: data.QueryKey = this.props.visual.getQuery();
                                structure.NameableType.toString(this.props.boundto.getConcept().toString()));
                                var selected = false;
                                collections.arrays.forEach(qk.getDimenson(s), function (item2) {
                                    if (item2 == item.getId().toString()) {
                                        selected = true;
                                    }
                                });
                                var checked = selected;
                                var id: string = structure.NameableType.toIDString(item);
                                return <div key={index}><Checkbox checked={checked} id={this.props.concept.getId().toString + "_" + id} onclick={(evt) => {this.change(id, checked, evt)}} />
                                    <label>{structure.NameableType.toString(item)}()</label></div>;
                            } /></Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.FooterButton onClick={() => {this.selectAll();}}>Select All</Dialog.FooterButton>
                            <Dialog.FooterButton onClick={() => {this.clear();}}>Clear</Dialog.FooterButton>
                            <Dialog.FooterButton accept={true} onClick={() => this.props.queryFunc()}>Accept</Dialog.FooterButton>
                        </Dialog.Footer>
                    </Dialog>
                </div>
            }
            else {
                var id = null;
                var array = this.props.itemScheme.findSubItemsString(null);
                var html2 = [];
                for (var i: number = 0; i < array.length; i++) {
                    this.renderRow(html2, this.props.itemScheme, array[i].getId());
                }
                var tree:any = <Tree preventdefaultmousedown="false">{html2}</Tree>;
                return <div><Dialog ref={(scrollingDlg) => {this.scrollingDlg = scrollingDlg}}>
                    <Dialog.Header>Filter {structure.NameableType.toString(this.props.concept)}</Dialog.Header>
                    <Dialog.Body scrollable={true}>
                        {tree}
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.FooterButton onClick={() => {this.selectAll();}}>Select All</Dialog.FooterButton>
                        <Dialog.FooterButton onClick={() => {this.clear();}}>Clear</Dialog.FooterButton>
                        <Dialog.FooterButton accept={true} onClick={() => this.props.queryFunc()}>Accept</Dialog.FooterButton>
                    </Dialog.Footer>
                </Dialog>
                </div >
            };
        } else
            return <div></div>;
    }
}