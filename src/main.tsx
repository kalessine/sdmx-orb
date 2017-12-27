import * as React from 'preact-compat';
import {h, render, Component} from 'preact';
import SdmxClient from './SdmxClient';
import Editor from './visual/editor';
import JSONResultPanel from './visualmaker/JSONResultPanel';
import * as Tabs from "react-simpletabs";
import * as visual from './visual/visual';
import * as bindings from './visual/bindings';
import * as customisedialog from './visual/CustomiseDialog';
import * as bindingsX from './visual/bindingsX';

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
        return (
            <Tabs>
                <Tabs.Panel title='SdmxClient'>
                    <div>
                        <SdmxClient />
                    </div>
                </Tabs.Panel>
                <Tabs.Panel title='Tab #2'>
                    <div>
                        <Editor />
                    </div>
                </Tabs.Panel>
                <Tabs.Panel title='Tab #3'>
                    <div>
                        <p>this is a test2!?</p>
                    </div>
                </Tabs.Panel>
            </Tabs>
        );

    }
    public setState(o: object) {
        super.setState(o);
    }
}


React.render(<Main />, document.querySelector('#app'));


