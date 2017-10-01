import * as React from 'preact-compat';
import {h, Component} from 'preact';
import * as _ from 'lodash';
import * as structure from '../sdmx/structure';
import * as interfaces from '../sdmx/interfaces';
import * as data from '../sdmx/data';
import {DragSource} from 'preact-dnd';
import ItemTypes from './ItemTypes';
import {DragDropContext} from 'react-dnd';
import * as HTML5Backend from 'react-dnd-html5-backend';
import Column from './Column';
import ColumnDropTarget from './ColumnDropTarget';
import {IntCartesianProduct} from './IntCartesianProduct';
import * as collections from 'typescript-collections';

export interface MainTableProps {
    fields: Array<structure.ConceptType>,
    data: Array<structure.ConceptType>,
    cols: Array<structure.ConceptType>,
    rs: Array<structure.ConceptType>,
    registry: interfaces.LocalRegistry,
    struct: structure.DataStructure,
    query: data.Query,
    filterButton: Function,
    filterTimeButton: Function,
    dropField: Function,
    cube: data.Cube,
    time_fields: Array<string>,
    empty_columns: boolean,
    empty_rows: boolean
}
export interface MainTableState {
}
@DragDropContext(HTML5Backend)
export default class MainTable extends React.Component<MainTableProps, MainTableState> {
    private props: MainTableProps = {};
    private state: MainTableState = {};
    constructor(props: MainTableProps, state: MainTableState) {
        super(props, state);
    }
    isDropped(boxName) {

    }
    getFields(fields: Array<structure.ConceptType>, props: MainTableProps, rcf: string) {
        var fields_buttons: Array<any> = [];
        var filterButton = this.props.filterButton;
        _.forEach(fields, function (item: structure.ConceptType) {
            fields_buttons.push(<ColumnDropTarget accepts={ItemTypes.Dimension} name={rcf + '_' + structure.NameableType.toIDString(item)} onDrop={(a1: structure.ConceptType, a2: string) => {props.dropField(a1, a2);}}></ColumnDropTarget>);
            fields_buttons.push(<Column item={item} filterButton={props.filterButton} name={structure.NameableType.toIDString(item)} filterTimeButton={props.filterTimeButton} dropField={() => {}}></Column>);
        });
        fields_buttons.push(<ColumnDropTarget accepts={ItemTypes.Dimension} name={rcf + "_end"} onDrop={(a1: structure.ConceptType, a2: string) => {props.dropField(a1, a2);}}></ColumnDropTarget>);
        return fields_buttons;
    }
    getData(props: MainTableProps, state: MainTableState) {
        var fields_buttons = this.getFields(props.fields, props, 'fields');
        var data_buttons = this.getFields(props.data, props, 'data');
        var columns = this.getFields(props.cols, props, 'columns');
        if (props.rs == null) return [];
        if (props.query != null) {
            _.forEach(props.query.getTimeQueryKey().getValues(), function (e) {
                props.query.getTimeQueryKey().removeValue(e);
            });
            _.forEach(props.time_fields, function (e) {
                props.query.getTimeQueryKey().addValue(e);
            });
        }

        var cols: number = 0;
        for (var i: number = 0; i < props.cols.length; i++) {
            if (cols == 0) {cols = props.query.getQueryKey(props.cols[i].getId().toString()).getValues().length;}
            else {cols *= props.query.getQueryKey(props.cols[i].getId().toString()).getValues().length;}
        }
        var rowlengths: Array<number> = [];
        for (var k: number = 0; k < this.props.rs.length; k++) {
            rowlengths.push(this.props.query.getQueryKey(this.props.rs[k].getId().toString()).getValues().length);
        }
        var collengths: Array<number> = [];
        for (var k: number = 0; k < this.props.cols.length; k++) {
            collengths.push(this.props.query.getQueryKey(this.props.cols[k].getId().toString()).getValues().length);
        }
        var cartesianrows = new IntCartesianProduct(rowlengths);
        var cartesiancols = new IntCartesianProduct(collengths);

        var html = [];
        html.push(<tr>
            <td class="flds-grp-cap av-flds text-muted"><div>Fields</div></td><td class="av-flds"><div class="">
                <table>
                    <tbody>
                        <tr>
                            <td>
                                {fields_buttons}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            </td>
        </tr>);
        html.push(<tr>
            <td class="flds-grp-cap av-flds text-muted"><div>Data</div></td><td class="av-flds"><div class="">
                <table>
                    <tbody>
                        <tr>
                            <td>
                                {data_buttons}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            </td>
        </tr>);
        html.push(<tr>
            <td class="flds-grp-cap av-flds text-muted" colSpan={this.props.rs.length}><div>Columns</div></td><td class="av-flds" colSpan={cartesiancols.getMaxIndex()}>
                {columns}
            </td>
        </tr>);
        var rows: number = 0;
        for (var i: number = 0; i < props.rs.length; i++) {
            if (rows == 0) {rows = props.query.getQueryKey(props.rs[i].getId().toString()).getValues().length;}
            else {rows *= props.query.getQueryKey(props.rs[i].getId().toString()).getValues().length;}
        }

        html.push(<tr><td colSpan={this.props.rs.length}><table>{this.getFields(props.rs, props, 'rows')}</table></td>{this.getColumnHeaders(props, state)}</tr>);
        for (var i: number = 0; i < cartesianrows.getMaxIndex(); i++) {
            var htmlrow = [];
            htmlrow.push(this.getRowHeaders(this.props, this.state, i));
            var rowValues = cartesianrows.next();
            var hasColumns = false;
            cartesiancols = new IntCartesianProduct(collengths);
            for (var j: number = 0; j < cartesiancols.getMaxIndex(); j++) {
                var key: data.FullKey = new data.FullKey();
                var colValues = cartesiancols.next();
                var hasRows = false;
                // console.log(colValues);
                for (var k: number = 0; k < this.props.cols.length; k++) {
                    key.setComponent(this.props.cols[k].getId().toString(), this.props.query.getQueryKey(this.props.cols[k].getId().toString()).getValues()[colValues[k]]);
                    //   console.log(colValues);
                    //   console.log(this.props.query.getQueryKey(this.props.cols[k].getId().toString()));
                    //  console.log(this.props.query.getQueryKey(this.props.cols[k].getId().toString()).getValues()[colValues[k]]);
                }
                for (var k: number = 0; k < this.props.rs.length; k++) {
                    key.setComponent(this.props.rs[k].getId().toString(), this.props.query.getQueryKey(this.props.rs[k].getId().toString()).getValues()[rowValues[k]]);
                    // console.log(this.props.query.getQueryKey(this.props.rs[k].getId().toString()).getValues()[rowValues[k]]);
                }
                var measure = "OBS_VALUE";
                if (props.struct == null) return htmlrow;
                if (props.struct.getDataStructureComponents().getDimensionList().getMeasureDimension() != null) {
                    measure = props.struct.getDataStructureComponents().getDimensionList().getMeasureDimension().getId().toString();
                }
                if (this.props.cube != null) {
                    var dat = "";
                    if (measure == "OBS_VALUE") {
                        var flatObs = this.props.cube.findFlatObs(key);
                        if (flatObs != null) {
                            dat = flatObs.getValue(this.props.cube.getFlatColumnMapper().getColumnIndex("OBS_VALUE"));
                            hasColumns = true;
                            hasRows = true;
                            htmlrow.push(<td><div class="cell"><div class="cell-data">{dat}</div></div></td>);
                        }
                    } else {
                        for (var l: number = 0; l < this.props.data.length; l++) {
                            key.setComponent(measure, this.props.data[l].getId().toString());
                            var flatObs = this.props.cube.findFlatObs(key);
                            if (flatObs != null) {
                                dat = flatObs.getValue(this.props.cube.getFlatColumnMapper().getColumnIndex(this.props.struct.getDataStructureComponents().getMeasureList().getPrimaryMeasure().getId().toString()));
                                hasColumns = true;
                                hasRows = true;
                                htmlrow.push(<td><div class="cell"><div class="cell-data">{dat}</div></div></td>);
                            }
                        }
                    }
                }
            }
            if (!props.empty_rows && !props.empty_columns) {
                if (hasRows || hasColumns) {
                    html.push(<tr>{htmlrow}</tr>);
                }
            }
            if (props.empty_rows && !props.empty_columns) {
                if (hasColumns) {
                    html.push(<tr>{htmlrow}</tr>);
                }
            }
            if (props.empty_columns && !props.empty_rows) {
                if (hasRows) {
                    html.push(<tr>{htmlrow}</tr>);
                }
            }
            if (props.empty_rows && props.empty_columns) {
                html.push(<tr>{htmlrow}</tr>);
            }
        }
        return <table class="orb">{html}</table>
    }

    getColumnHeaders(props: MainTableProps, state: MainTableState) {
        var registry: interfaces.LocalRegistry = props.registry;
        var struct: structure.DataStructure = props.struct;
        var cols = [];
        if (props.cols == null) {
            return <table class="inner-table"><tbody><tr><td></td></tr></tbody></table>;
        }
        var collengths: Array<number> = [];
        for (var k: number = 0; k < this.props.cols.length; k++) {
            collengths.push(this.props.query.getQueryKey(this.props.cols[k].getId().toString()).getValues().length);
        }
        var cartesiancols = new IntCartesianProduct(collengths);
        var ht = [];
        for (var j: number = 0; j < cartesiancols.getMaxIndex(); j++) {
            var hasColumns = false;
            var key: data.FullKey = new data.FullKey();
            var fields = [];
            var colVars: Array<number> = cartesiancols.next();
            for (var k: number = 0; k < this.props.cols.length; k++) {
                var id = this.props.query.getQueryKey(this.props.cols[k].getId().toString()).getValues()[colVars[k]];
                var it = this.props.query.getQueryKey(this.props.cols[k].getId().toString()).getItemScheme().findItemString(id);
                if (this.props.struct.getDataStructureComponents().getDimensionList().getTimeDimension().getId().toString() == this.props.cols[k].getId().toString()) {
                    fields.push(<tr><td><div>{id}</div></td></tr>);
                } else {
                    fields.push(<tr><td><div>{structure.NameableType.toString(it)}</div></td></tr>);
                }
                key.setComponent(this.props.cols[k].getId().toString(), id);
            }
            var rowlengths: Array<number> = [];
            for (var k: number = 0; k < this.props.rs.length; k++) {
                rowlengths.push(this.props.query.getQueryKey(this.props.rs[k].getId().toString()).getValues().length);
            }
            var cartesianrows = new IntCartesianProduct(rowlengths);
            for (var i: number = 0; i < cartesianrows.getMaxIndex(); i++) {
                var rowValues = cartesianrows.next();
                for (var k: number = 0; k < this.props.rs.length; k++) {
                    key.setComponent(this.props.rs[k].getId().toString(), this.props.query.getQueryKey(this.props.rs[k].getId().toString()).getValues()[rowValues[k]]);
                }
                var measure: string = "OBS_VALUE;"
                var hasRows = false;
                if (this.props.cube != null) {
                    var dat = "";
                    if (props.struct.getDataStructureComponents().getDimensionList().getMeasureDimension() == null) {
                        var flatObs = this.props.cube.findFlatObs(key);
                        if (flatObs != null) {
                            dat = flatObs.getValue(this.props.cube.getFlatColumnMapper().getColumnIndex("OBS_VALUE"));
                            hasRows = true;
                            hasColumns = true;
                        }
                    } else {
                        var measure = props.struct.getDataStructureComponents().getDimensionList().getMeasureDimension().getId().toString();
                        for (var l: number = 0; l < this.props.data.length; l++) {
                            key.setComponent(measure, this.props.data[l].getId().toString());
                            var flatObs = this.props.cube.findFlatObs(key);
                            if (flatObs != null) {
                                dat = flatObs.getValue(this.props.cube.getFlatColumnMapper().getColumnIndex(this.props.struct.getDataStructureComponents().getMeasureList().getPrimaryMeasure().getId().toString()));
                                hasRows = true;
                                hasColumns = true;
                            }
                        }
                    }
                }
            }
            if (!props.empty_rows && !props.empty_columns) {
                if (hasRows || hasColumns) {
                    cols.push(<td>{fields}</td>);
                }
            }
            if (props.empty_rows && !props.empty_columns) {
                if (hasColumns) {
                    cols.push(<td>{fields}</td>);
                }
            }
            if (props.empty_columns && !props.empty_rows) {
                if (hasRows) {
                    cols.push(<td>{fields}</td>);
                }
            }
            if (props.empty_rows && props.empty_columns) {
                cols.push(<td>{fields}</td>);
            }
        }
        var html = cols;
        return html;
    }
    getRowHeaders(props: MainTableProps, state: MainTableState, rowIndex: number) {
        var registry: interfaces.LocalRegistry = props.registry;
        var struct: structure.DataStructure = props.struct;
        var rows = [];
        if (props.cols == null) {
            return <table class="inner-table"><tbody><tr><td></td></tr></tbody></table>;
        }
        var rowlengths: Array<number> = [];
        for (var k: number = 0; k < this.props.rs.length; k++) {
            rowlengths.push(this.props.query.getQueryKey(this.props.rs[k].getId().toString()).getValues().length);
        }
        var cartesiancols = new IntCartesianProduct(rowlengths);
        var rowVars: Array<number> = cartesiancols.next();
        for (var i: number = 0; i < rowIndex; i++) {
            rowVars = cartesiancols.next();
        }
        var ht = [];
        var fields = [];
        for (var k: number = 0; k < this.props.rs.length; k++) {
            var id = this.props.query.getQueryKey(this.props.rs[k].getId().toString()).getValues()[rowVars[k]];
            var it = this.props.query.getQueryKey(this.props.rs[k].getId().toString()).getItemScheme().findItemString(id);
            if (this.props.struct.getDataStructureComponents().getDimensionList().getTimeDimension().getId().toString() == this.props.rs[k].getId().toString()) {
                id = this.props.query.getQueryKey(this.props.rs[k].getId().toString()).getValues()[rowVars[k]];
                fields.push(<td><div>{id}</div></td>);
            }
            else {
                fields.push(<td><div>{structure.NameableType.toString(it)}</div></td>);
            }

        }
        rows.push(fields);
        var html = [];
        for (var k: number = 0; k < rows.length; k++) {
            html.push(rows[k]);
        }
        return html;
    }
    render() {
        var props: MainTableProps = this.props;
        var state: MainTableState = this.state;
        var registry: interfaces.LocalRegistry = props.registry;
        var struct: structure.DataStructure = props.struct;

        var html = <table>{this.getData(props, state)}</table>;
        return html;
    }
    public handleDrop(index, item) {}
}