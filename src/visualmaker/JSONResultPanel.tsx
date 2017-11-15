import * as React from 'preact-compat';
import {h} from 'preact';
export interface JSONResultProps {

}
export interface JSONResultState {
     str:string,
     obj:object
}
export class JSONResultPanel extends React.Component {
    public props:JSONResultProps = {} as JSONResultProps;
    public state:JSONResultState = {str:"{}",obj:{}} as JSONResultState;
    
    public setParameter(name:string,val:object){
        this.state.obj[name]=val;
        super.setState(this.state);
    }
    
    public render(props,state){
        return <p>+state.str+<p>;
    }
}