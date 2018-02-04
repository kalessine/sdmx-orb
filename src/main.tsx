import * as structure from './sdmx/structure';
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
        console.log('0.92');
        console.log('1');
        export class Main extends React.Component {
        public props = {};
                public state = {};
                public context = {};
                public getChildContext() {return this.context; }

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
</Tabs>
                );
        }
        public setState(o: object) {
        super.setState(o);
        }
        }


React.render(<Main />, document.querySelector('#app'));


