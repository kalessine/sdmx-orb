import * as React from 'preact-compat';
import {h, Component} from 'preact';
console.log('8');
export interface TableToolbarProps {
    getState: Function,
    setState: Function
}

export default class TableToolbar extends Component<TableToolbarProps, any> {
    constructor(props: TableToolbarProps) {
        super(props);
    }
    componentDidMount() {
    }
    componentDidUpdate() {
    }
    createCallback(action) {
        if (action != null) return action.bind(this);
        return function () {
            alert("beep" + action);
        }
    }
    render() {
        var configButtons: Array<any> = //config.toolbar.buttons ?
            //defaultToolbarConfig.buttons.concat(config.toolbar.buttons) :
            defaultToolbarConfig.buttons;

        var buttons = [];
        for (var i = 0; i < configButtons.length; i++) {
            var btnConfig: any = configButtons[i];
            var refName = 'btn' + i;

            if (btnConfig.type == 'separator') {
                buttons.push(<div key={i.toString()} className="orb-tlbr-sep"></div>);
            } else if (btnConfig.type == 'label') {
                buttons.push(<div key={i.toString()} className="orb-tlbr-lbl">{btnConfig.text}</div>);
            } else {
                buttons.push(<div key={i.toString()} className={'orb-tlbr-btn ' + btnConfig.cssClass} title={btnConfig.tooltip} onClick={this.createCallback(btnConfig.action)}></div>);
            }
        }
        return <div class="orb-toolbar"><div>
            {buttons}
        </div></div>
    }
};

//var excelExport = require('../orb.export.excel');

var defaultToolbarConfig: any = {
    showEmptyRows: function (pgridComponent, button) {
        this.props.setState({empty_rows: !this.props.getState().empty_rows});
    },
    showEmptyColumns: function (pgridComponent, button) {
        this.props.setState({empty_columns: !this.props.getState().empty_columns});
    }
};

defaultToolbarConfig['buttons'] = [];
defaultToolbarConfig['buttons'].push({type: 'label', text: 'Rows:'});
defaultToolbarConfig['buttons'].push({type: 'button', tooltip: 'Show Empty Rows', cssClass: 'empty-rows', action: defaultToolbarConfig.showEmptyRows});
defaultToolbarConfig['buttons'].push({type: 'button', tooltip: 'Show Empty Columns', cssClass: 'empty-columns', action: defaultToolbarConfig.showEmptyColumns});
