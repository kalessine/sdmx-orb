// This is put here because webpack doesn't
// like it lower down in adapter.tsx
import * as collections from 'typescript-collections';
import * as structure from './sdmx/structure';
import {ThemeProvider} from 'react-toolbox/lib/ThemeProvider';
console.log('0.1');
import * as React from 'preact-compat';
console.log('0.2');
import {h, render, Component} from 'preact';
console.log('0.3');
import SdmxClient from './SdmxClient';
console.log('0.4');
import Editor from './visual/editor';
console.log('0.5');
import JSONResultPanel from './visualmaker/JSONResultPanel';
console.log('0.6');
import * as Tabs from "react-simpletabs";
console.log('0.7');
import * as visual from './visual/visual';
console.log('0.8');
import * as bindings from './visual/bindings';
console.log('0.9');
import * as customisedialog from './visual/CustomiseDialog';
console.log('0.91');
import * as bindingsX from './visual/bindingsX';
console.log(theme);
var theme = {"RTButton":{"button":"_1T6gd","rippleWrapper":"_3rch8","squared":"x_Fgj","icon":"t6_L8","solid":"HUuyg","raised":"_33l7R _1T6gd x_Fgj HUuyg","flat":"_2JPw5 _1T6gd x_Fgj","floating":"_2U_a5 _1T6gd HUuyg","mini":"_2for7","toggle":"_3xRDd _1T6gd","primary":"_29RI9","accent":"mWBhu","neutral":"_3ViU3","inverse":"_1kgaQ"},"RTRipple":{"rippleWrapper":"cNe4x","ripple":"_1zJTi","rippleRestarting":"_3wQEe","rippleActive":"_1eRuo"},"RTDatePicker":{"input":"_2cfff","disabled":"_3PC3_","inputElement":"xD_FE","header":"yZhG0","year":"uhnZd","date":"_3wNVO","calendarWrapper":"_2zBGJ","yearsDisplay":"SV0v0","monthsDisplay":"_2-Gxw","dialog":"lOLkB","button":"_50klV","calendar":"_1juUq","prev":"PGGSb","next":"_3wsgQ","title":"_37fII","years":"_1yrr_","active":"_2jTt2","week":"_1wp1K","days":"_1JzI7","day":"_349-w","month":"_1mUHN","slideRightEnter":"_1tJhJ","slideRightLeave":"_1pz4X","slideRightEnterActive":"fAUzE","slideRightLeaveActive":"_33v8X","slideLeftEnter":"mOLI0","slideLeftLeave":"_2uLcH","slideLeftEnterActive":"_3gdF0","slideLeftLeaveActive":"_1lAUa"},"RTInput":{"input":"_2dBwA","withIcon":"_2uwUs","icon":"_2H9rJ","inputElement":"_2WvFs","bar":"fT1WI","label":"_3NjcG","fixed":"_1ANNN","required":"HMiz1","hint":"_1yQnr","filled":"_3QmiH","error":"_1p4yC","counter":"_2dI1B","disabled":"_2sOZC","errored":"ZsBmg","hidden":"_3Wr_7"},"RTDialog":{"wrapper":"_3niLM","dialog":"_17Ijy","active":"_1594s","small":"_3AQIo","normal":"_3wffD","large":"_3L5Sk","fullscreen":"_2F8R7","title":"_27QqA","body":"_33od4","navigation":"kA5VY","button":"_2r12z"},"RTOverlay":{"overlay":"_1kTMH","active":"_3vAcK"}};
export class Main extends React.Component {
    public props = {};
    public state = {};
    public context = {};
    public getChildContext() {return this.context;}

    constructor(props: any, state: any) {
        super(props, state);
        this.props = props;
        this.state = state;
    }
    public render() {
        return (<ThemeProvider theme={theme}>
            <Tabs>
                <Tabs.Panel title='SdmxClient'>
                    <div>
                        <SdmxClient />
                    </div>
                </Tabs.Panel>
                <Tabs.Panel title='Canned Visualisations'>
                    <div>
                        <Editor />
                    </div>
                </Tabs.Panel>
            </Tabs></ThemeProvider>
        );
    }
    public setState(o: object) {
        super.setState(o);
    }
}
React.render(<Main />, document.querySelector('#app'));


