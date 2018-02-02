import * as React from 'preact-compat';
import {h} from 'preact';
console.log('11');
export interface JSONResultState {

}
export interface JSONResultProps {
     str:string,
     obj:object
}
export default class JSONResultPanel extends React.Component {
    public state:JSONResultState = null;
    public props:JSONResultProps = null;
    constructor(props,state){
        super(props,state);
        this.props=props;
        this.state=state;
    }
    public render(props,state){
        return (<p>{this.props.str}</p>);
    }
}