import React, { Component } from 'react';
import { render } from 'react-dom';

export interface HelloWorldProps {
    name: string
}
console.log(preact.h);
console.log(preact.render);
console.log(preact.Component);
export default class HelloWorld extends preact.Component<HelloWorldProps,any> {
    constructor(a:any,b:any){
        super(a,b);
    }
    render (props) {
        return <p>Hello {props.name}!</p>
    }
}