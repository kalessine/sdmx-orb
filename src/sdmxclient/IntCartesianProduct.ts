import * as _ from 'lodash';
import * as collections from 'typescript-collections';

export class IntCartesianProduct {

    private _lengths:Array<number>=[];
    private _indices:Array<number> = [];
    private maxIndex:number;
    private _hasNext:boolean = true;

    constructor(lengths:Array<number>) {
        this._lengths = collections.arrays.copy(lengths);
        this._indices = new Array<number>(lengths.length);
        for (var i: number = 0; i < this._indices.length;i++) {
            this._indices[i]=0;
        }
        this.maxIndex = this.findMaxIndex();
    }

    public findMaxIndex():number {
        let max:number = -1;
        let maxIndex:number = 1;
        for (var i:number = 0; i < this._lengths.length; i++) {
            var length = this._lengths[i];
            maxIndex*=length;
        }
        return maxIndex;
    }

    public hasNext():boolean {
        return this._hasNext;
    }

    public next():Array<number> {
        var result: Array<number> = collections.arrays.copy(this._indices);
        for(var i:number = this._indices.length - 1; i >= 0; i--) {
            if (this._indices[i] == this._lengths[i] - 1) {
                this._indices[i] = 0;
                if (i == 0) {
                    this._hasNext = false;
                }
            } else {
                this._indices[i]++;
                break;
            }
        }
        return result;
    }

    public getMaxIndex():number {
        //console.log("MaxIndex=" + this.maxIndex);
        return this.maxIndex;
    }
}