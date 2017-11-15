import * as React from 'preact-compat';
import {h, render, Component} from 'preact';
import SdmxClient from './SdmxClient';
import JSONResultPanel from './visualmaker/JSONResultPanel';
import * as Tabs from "react-simpletabs";
export class Main extends React.Component {
    constructor() {
    }
    public render(props, state) {
        return (
            <Tabs>
                <Tabs.Panel title='SdmxClient'>
                    <SdmxClient />
                </Tabs.Panel>
                <Tabs.Panel title='Tab #2'>
                    <div>
                        <p>this is a test!?</p>
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
//import HelloWorld2 from './HelloWorld2';
//render(<HelloWorld2 name="James" />, document.querySelector('#app'));
