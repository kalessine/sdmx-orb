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
    toggle(id: string) {
        var dim: data.QueryKey = this.props.query.getQueryKey(this.props.concept.getId().toString());
        var item: structure.ItemType = null;
        var checked:number = 0;
        var subs:Array<structure.ItemType> = dim.getItemScheme().findSubItemsString(id);
        collections.arrays.forEach(subs, function (item2: structure.ItemType) {
            if (dim.containsValue(item2.getId().toString())) {
                checked++;
            }
        });
        if (checked==0||(checked>0&&checked<subs.length) {
            collections.arrays.forEach(subs, function (item2: structure.ItemType) {
                dim.addValue(item2.getId().toString());
            });
        } else {
            collections.arrays.forEach(subs, function (item2: structure.ItemType) {
                dim.removeValue(item2.getId().toString());
            });
        }
        this.setState(this.state);
    }
    getItemSchemeList(props: FilterDialogProps, itemScheme: structure.ItemSchemeType) {
        var list = [];
        if (!props.concept) return [];
        var dim: data.QueryKey = props.query.getQueryKey(props.concept.getId().toString());
        if (itemScheme == null) return list;
        collections.arrays.forEach(itemScheme.getItems(), function (item) {
            list.push(item);
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
        this.setState({open: true, data: this.getItemSchemeList(this.props, this.props.itemScheme)});
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
        this.setState({open: true, data: this.getItemSchemeList(this.props, this.props.itemScheme)});
    }
    public renderRow(html: Array<object>, itemScheme: structure.ItemSchemeType, id: commonreferences.ID) {
        var item: structure.ItemType = itemScheme.findItemId(id);
        var dim: data.QueryKey = this.props.query.getQueryKey(this.props.concept.getId().toString());
        var selected = false;
        collections.arrays.forEach(dim.getValues(), function (item2) {
            if (id.toString() == item2) {
                selected = true;
            }
        });
        var checked = selected;

        var id: string = structure.NameableType.toIDString(item);
        var subs = this.props.itemScheme.findSubItemsId(item.getId());
        var level: number = this.props.itemScheme.getLevel(item.getId().toString());
        var hasChildren = subs.length > 0;
        if (hasChildren) {
            var html2 = [];
            for (var i = 0; i < subs.length; i++) {
                this.renderRow(html2, itemScheme, subs[i].getId());
            }
            html.push(<Tree.Node><Checkbox checked={checked} id={this.props.concept.getId().toString + "_" + id} onclick={(evt) => {evt.stopPropagation(); this.change(id, checked, evt)}} /><label>{structure.NameableType.toString(item)}</label><button onclick={(evt) => {this.toggle(item.getId().toString())}}>Toggle</button><Tree preventdefaultmousedown={false} style='float:left; margin-left:{20*level}px;' depth={level}>{html2}</Tree></Tree.Node>);
        } else {
            html.push(<Tree.Node style='float:left; margin-left:{20*level}px;'><Checkbox checked={checked} id={this.props.concept.getId().toString + "_" + id} onclick={(evt) => {evt.stopPropagation(); this.change(id, checked, evt)}} />
                <label>{structure.NameableType.toString(item)}</label></Tree.Node>);
        }
    }
    render(props: FilterDialogProps, state: FilterDialogState): JSX.Element {
        if (!props.open) {
            this.props = props;
            this.state.data = null;
        }
        var data = [];
        var html = [];
        var tree = this.state.tree;
        if (props.itemScheme) {
            data = props.itemScheme.getItems();
            if (props.itemScheme.isFlat()) {
                return <div>
                    <Dialog ref={(scrollingDlg) => {this.scrollingDlg = scrollingDlg}}>
                        <Dialog.Header>Filter {structure.NameableType.toString(props.concept)}</Dialog.Header>
                        <Dialog.Body scrollable={true}><VirtualList
                            width='100%'
                            height={600}
                            itemCount={data.length}
                            itemSize={20} // Also supports variable heights (array or function getter)
                            renderItem={({index, style}) =>
                                var item: structure.ItemSchemeType = data[index];
                                var dim: data.QueryKey = this.props.query.getQueryKey(this.props.concept.getId().toString());
                                var selected = false;
                                collections.arrays.forEach(dim.getValues(), function (item2) {
                                    if (item2 == item.getId().toString()) {
                                        selected = true;
                                    }
                                });
                                var checked = selected;
                                var id: string = structure.NameableType.toIDString(item);
                                return <div key={index} style={style} ><Checkbox checked={checked} id={this.props.concept.getId().toString + "_" + id} onclick={(evt) => {this.change(id, checked, evt)}} />
                                    <label>{structure.NameableType.toString(item)}()</label></div>;
                            } /></Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.FooterButton onClick={() => {this.selectAll();}}>Select All</Dialog.FooterButton>
                            <Dialog.FooterButton onClick={() => {this.clear();}}>Clear</Dialog.FooterButton>
                            <Dialog.FooterButton accept={true} onClick={() => props.queryFunc()}>Accept</Dialog.FooterButton>
                        </Dialog.Footer>
                    </Dialog>
                </div>
            }
            else {
                var id = null;
                var array = this.props.itemScheme.findSubItemsString(null);
                var html2 = [];
                for (var i: number = 0; i < array.length; i++) {
                    this.renderRow(html2, props.itemScheme, array[i].getId());
                }
                var tree = <Tree preventdefaultmousedown="false">{html2}</Tree>;
                return <div><Dialog ref={(scrollingDlg) => {this.scrollingDlg = scrollingDlg}}>
                    <Dialog.Header>Filter {structure.NameableType.toString(props.concept)}</Dialog.Header>
                    <Dialog.Body scrollable={true}>
                        {tree}
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.FooterButton onClick={() => {this.selectAll();}}>Select All</Dialog.FooterButton>
                        <Dialog.FooterButton onClick={() => {this.clear();}}>Clear</Dialog.FooterButton>
                        <Dialog.FooterButton accept={true} onClick={() => props.queryFunc()}>Accept</Dialog.FooterButton>
                    </Dialog.Footer>
                </Dialog>
                </div >
            };
        } else
            return <div></div>;
    }
}