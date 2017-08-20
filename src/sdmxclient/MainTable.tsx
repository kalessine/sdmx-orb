import {h, Component} from 'preact';
import * as _ from 'lodash';
import * as structure from '../sdmx/structure';
import * as interfaces from '../sdmx/interfaces';
import * as data from '../sdmx/data';
import {DragSource} from 'preact-dnd';
import ItemTypes from './ItemTypes';
import {DragDropContext} from 'preact-dnd';
import HTML5Backend, { NativeTypes } from 'react-dnd-html5-backend';
import Column from './Column';
import ColumnDropTarget from './ColumnDropTarget';
export interface MainTableProps {
    all_fields: Array<structure.ConceptType>,
    data: Array<structure.ConceptType>,
    cols: Array<structure.ConceptType>,
    rs: Array<structure.ConceptType>,
    registry: interfaces.LocalRegistry,
    struct: structure.DataStructure,
    query: data.Query,
    filterButton: Function
}
export interface MainTableState {
}


@DragDropContext(HTML5Backend)
export default class MainTable extends Component<MainTableProps, MainTableState> {

    constructor(props: MainTableProps, state: MainTableState) {
        super(props, state);
        this.state = {
        };
    }
    isDropped(boxName) {
        
    }
    getFields(fields: Array<structure.ConceptType>, props: MainTableProps) {
        var fields_buttons:Array<any> = [];
        var filterButton = this.props.filterButton;
        _.forEach(fields, function (item:structure.ConceptType) {
            fields_buttons.push(<ColumnDropTarget accepts={ItemTypes.Dimension} ></ColumnDropTarget>);
            fields_buttons.push(<Column item={item} filterButton={props.filterButton} name={structure.NameableType.toIDString(item)}></Column>);
        });
        fields_buttons.push(<ColumnDropTarget accepts={ItemTypes.Dimension} ></ColumnDropTarget>);
        return fields_buttons;
    }
    getColumnHeaders(props: MainTableProps, state: MainTableState) {
        var registry: interfaces.LocalRegistry = props.registry;
        var struct: structure.DataStructure = props.struct;
        var html = [];
        if (props.cols == null) {
            return <table class="inner-table"><tbody><tr><td></td></tr></tbody></table>;
        }
        for (var i: number = 0; i < props.cols.length; i++) {
            var item = props.cols[i];
            html.push(<table><tbody><tr><td class="orb-tgl-btn"><div class="orb-tgl-btn-down"></div></td><td class="hdr-val"><div>{structure.NameableType.toString(item)}</div></td></tr></tbody></table>);
        }
        return <table class="inner-table"><tbody><tr><td> {html} </td><td> {html} </td><td> {html} </td></tr></tbody></table>;
    }
    render(props: MainTableProps, state: MainTableState) {
        var registry: interfaces.LocalRegistry = props.registry;
        var struct: structure.DataStructure = props.struct;
        var fields_buttons = this.getFields(props.all_fields,props);
        var data_buttons = this.getFields(props.data,props);
        var columns = this.getFields(props.cols,props);
        var rows = this.getFields(props.rs,props);
        var html = <table id="tbl-1" class="orb">
            <tbody>
                <tr>
                    <td colSpan={4}>
                        <table class="inner-table upper-buttons">
                            <tbody>
                                <tr>
                                    <td class="flds-grp-cap av-flds text-muted"><div>Fields</div></td><td class="av-flds"><div class="">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td><div class="drp-indic drp-indic-first"></div></td>
                                                    {fields_buttons}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="flds-grp-cap av-flds text-muted"><div>Data</div></td><td class="av-flds"><div class="">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td><div class="drp-indic drp-indic-first"></div></td>
                                                    {data_buttons}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td><div></div></td>
                    <td><div>
                        <table><tbody><tr>{columns}</tr>
                        </tbody></table>
                    </div></td>
                </tr>
                <tr>
                    <td>
                        <table>
                            <tbody>
                                <tr>{rows}</tr>
                            </tbody>
                        </table>
                    </td>
                    <td>{this.getColumnHeaders(props, state)}</td>
                </tr>
            </tbody></table>;
        return html;
    }
    handleDrop(index, item) {
        const {name} = item;
        this.setState({});
    }
}