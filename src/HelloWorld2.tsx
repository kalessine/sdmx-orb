import {h,render,Component } from 'preact';

    export interface HelloWorldProps2 {
    name: string
}
console.log(h);
console.log(render);
console.log(Component);
export default class HelloWorld2 extends Component<HelloWorldProps2,any> {
    constructor(a:any,b:any){
        super(a,b);
    }
    render (props) {
        return <p>Hello {props.name}!</p>
    }
}