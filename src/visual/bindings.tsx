import * as React from 'preact-compat';
import {h} from 'preact';
import * as structure from "../sdmx/structure";
import * as sdmx from "../sdmx";
import * as visual from "../visual/visual";
import * as data from "../sdmx/data";
import * as colors from 'colors-ts';
import * as collections from 'typescript-collections';
import Checkbox from 'preact-material-components/Checkbox';
import Select from 'preact-material-components/Select';

var makeRequest = function (opts): Promise<string> {
    return new Promise<string>(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(opts.method, opts.url);
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: xhr.status,
                statusText: xhr.statusText
            });
        };
        if (opts.headers) {
            Object.keys(opts.headers).forEach(function (key) {
                xhr.setRequestHeader(key, opts.headers[key]);
            });
        }
        var params = opts.params;
        // We'll need to stringify if we've been given an object
        // If we have a string, this is skipped.
        if (params && typeof params === 'object') {
            params = Object.keys(params).map(function (key) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
            }).join('&');
        }
        xhr.send(params);
    });
}
export class BoundTo {

    static NOT_BOUND: number = -1;
    static BOUND_CONTINUOUS_X: number = 0;
    static BOUND_DISCRETE_X: number = 1;
    static BOUND_CONTINUOUS_Y: number = 2;
    static BOUND_DISCRETE_Y: number = 3;
    static BOUND_DISCRETE_AREA: number = 4;
    static BOUND_CONTINUOUS_COLOUR: number = 5;
    static BOUND_DISCRETE_COLOUR: number = 6;
    static BOUND_CONTINUOUS_SIZE: number = 7;
    static BOUND_DISCRETE_SIZE: number = 8;
    public static BOUND_TOOLTIP: number = 9;

    static BOUND_DISCRETE_DROPDOWN: number = 10;
    static BOUND_DISCRETE_LIST: number = 11;
    static BOUND_DISCRETE_SLIDER: number = 12;
    static BOUND_DISCRETE_STATIC: number = 13;
    static BOUND_DISCRETE_SERIES: number = 14;

    static BOUND_CONTINUOUS_BETWEEN: number = 15;
    static BOUND_CONTINUOUS_GREATERTHAN: number = 16;
    static BOUND_CONTINUOUS_LESSTHAN: number = 17;

    static BOUND_TIME_X: number = 18;
    static BOUND_TIME_Y: number = 19;
    static BOUND_TIME_DROPDOWN: number = 20;
    static BOUND_TIME_LIST: number = 27;
    static BOUND_TIME_SERIES: number = 27;

    static BOUND_MEASURES_DROPDOWN: number = 21;
    static BOUND_MEASURES_LIST: number = 22;
    static BOUND_MEASURES_INDIVIDUAL: number = 23;
    static BOUND_MEASURES_SERIES: number = 24;
    static BOUND_MEASURES_X: number = 25;

    static BOUND_DISCRETE_SINGLE: number = 26;
    static BOUND_DISCRETE_ALL: number = 27;

    static BOUND_DISCRETE_SINGLE_MENU: number = 28;
    static BOUND_DISCRETE_MULTI_MENU: number = 29;
    static BOUND_DISCRETE_LEVEL_MENU: number = 30;

    static BOUND_DISCRETE_CROSS_MULTIPLE: number = 31;
    static BOUND_DISCRETE_CROSS_SINGLE: number = 32;

    private concept: string;
    private boundTo: number = BoundTo.NOT_BOUND;
    private continuous: boolean = false;
    private queryAll: boolean = false;
    private walkAll: boolean = false;
    private clientSide: boolean = false;
    private possibleValues: Array<structure.ItemType> = null;
    private measureDescriptor: boolean = false;
    private visual: visual.Visual = null;

    //static DIMENSION = [BoundTo.BOUND_DISCRETE_X, BoundTo.BOUND_DISCRETE_Y, BoundTo.BOUND_DISCRETE_DROPDOWN, BoundTo.BOUND_DISCRETE_LIST, BoundTo.BOUND_DISCRETE_SERIES];
    //static TIME = [BoundTo.BOUND_TIME_X, BoundTo.BOUND_TIME_Y, BoundTo.BOUND_TIME_DROPDOWN, BoundTo.BOUND_DISCRETE_LIST, BoundTo.BOUND_DISCRETE_SERIES];
    //static MEASURE = [BoundTo.BOUND_MEASURES_DROPDOWN, BoundTo.BOUND_MEASURES_LIST, BoundTo.BOUND_MEASURES_SERIES, BoundTo.BOUND_MEASURES_INDIVIDUAL];
    //static MEASURES = [BoundTo.BOUND_CONTINUOUS_X, BoundTo.BOUND_CONTINUOUS_Y, BoundTo.BOUND_CONTINUOUS_COLOUR, BoundTo.BOUND_CONTINUOUS_SIZE];

    constructor(visual: visual.Visual, concept: string) {
        this.concept = concept;
        this.visual = visual;
    }
    static escape(s: string): string {
        if (s.indexOf("'") != -1) {
            s = s.replace("'", "\\'");
        }
        return s;
    }
    static stripCRLFs(s: string) {
        if (s.indexOf("\r") != -1) {
            s = s.replace("\r", "");
        }
        if (s.indexOf("\n") != -1) {
            s = s.replace("\n", "");
        }
        return s;
    }
    /**
     * @return the concept
     */
    public getConcept(): string {
        return this.concept;
    }

    /**
     * @param concept the concept to set
     */
    public setConcept(concept: string) {
        this.concept = concept;
    }

    /**
     * @return the boundTo
     */
    public getBoundTo(): number {
        return BoundTo.NOT_BOUND;
    }

    public getBoundToString() {
        return "BoundTo";
    }
    /**
     * @return the continuous
     */
    public isContinuous(): boolean {
        return this.continuous;
    }

    /**
     * @param continuous the continuous to set
     */
    public setContinuous(continuous: boolean) {
        this.continuous = continuous;
    }

    public isDiscrete(): boolean {
        return !this.continuous;
    }

    public expectValues(): number {
        return this.queryAll ? 2 : 1;
    }
    public getItemScheme() {return this.visual.getItemScheme(this.concept);}

    public isMeasureDescriptor(): boolean {
        return this.measureDescriptor;
    }

    public setMeasureDescriptor(measureDescriptor: boolean) {
        this.measureDescriptor = measureDescriptor;
    }

    public getConceptName(): string {
        var loc: string = sdmx.SdmxIO.getLocale();
        var comp: structure.Component = this.visual.getDataStructure().findComponentString(this.concept);
        if (comp == null) {
            return structure.NameableType.toString(this.visual.getCrossSection().getCodelist().findItemString(this.concept));
        } else {
            var concept: structure.ConceptType = this.visual.getRegistry().findConcept(comp.getConceptIdentity());
            return BoundTo.stripCRLFs(BoundTo.escape(structure.NameableType.toString(concept)));
        }
    }

    public getCodelist(): structure.ItemSchemeType {
        var is: structure.ItemSchemeType = data.ValueTypeResolver.getPossibleCodes(this.visual.getRegistry(), this.visual.getDataStructure(), this.concept);
        return is;
    }

    public getValue(): string {
        var itm: structure.ItemType = this.visual.getBindingCurrentValue(this.concept);
        if (itm != null) {
            var s: string = BoundTo.stripCRLFs(BoundTo.escape(structure.NameableType.toString(itm)));
            return s;
        }
        return "";
    }

    public findValue(s: string): structure.ItemType {
        for (var i: number = 0; i < this.getPossibleValues().length; i++) {
            var itm: structure.ItemType = this.getPossibleValues()[i];
            if (BoundTo.escape(structure.NameableType.toString(itm)) == s) {
                return itm;
            }
        }
        return null;
    }

    public setValue(s: string) {
        if (s == null) {
            this.setCurrentValue(null);
            return;
        }
        for (var i: number = 0; i < this.getPossibleValues().length; i++) {
            var itm: structure.ItemType = this.getPossibleValues()[i];
            if (BoundTo.stripCRLFs(BoundTo.escape(structure.NameableType.toString(itm))) == s) {
                this.setCurrentValue(itm);
                return;
            }
        }
        this.setCurrentValue(null);
    }

    public getValues(): Array<string> {
        var itms: Array<structure.ItemType> = this.getCurrentValues();
        var result: Array<string> = [];
        for (var i: number = 0; i < itms.length; i++) {
            result[i] = BoundTo.stripCRLFs(BoundTo.escape(structure.NameableType.toString(itms[i])));
        }
        return result;
    }

    public setValues(s: Array<string>) {
        var result: Array<structure.ItemType> = [];
        for (var i: number = 0; i < s.length; i++) {
            result.push(this.findValue(s[i]));
        }
        this.setCurrentValues(result);
    }

    public setCurrentValue(itm: structure.ItemType) {
        var vals: Array<structure.ItemType> = [];
        if (itm != null) {vals.push(itm);}
        this.setCurrentValues(vals);
    }

    public getCurrentValue(): structure.ItemType {
        var result = this.visual.getBindingCurrentValues(this.concept);
        if (result.length > 0) {
            return result[0];
        }
        else return null;
    }

    /**
     * @return the currentValues
     */
    public getCurrentValues(): Array<structure.ItemType> {
        return this.visual.getBindingCurrentValues(this.concept);
    }

    /**
     * @return the currentValues
     */
    public getCurrentValuesString(): Array<string> {
        return this.visual.getBindingCurrentValuesString(this.concept);
    }

    /**
     * @return the currentValues
     */
    public getPossibleValuesString(): Array<string> {
        var list: Array<structure.ItemType> = this.getPossibleValues();
        var result: Array<string> = [];
        for (var i: number = 0; i < list.length; i++) {
            result.push(BoundTo.stripCRLFs(BoundTo.escape(structure.NameableType.toString(list[i]))));
        }
        return result;
    }

    public getAllValuesString(): Array<string> {
        var list: Array<structure.ItemType> = this.getAllValues();
        var result: Array<string> = [];
        for (var i: number = 0; i < list.length; i++) {
            result.push(BoundTo.stripCRLFs(BoundTo.escape(structure.NameableType.toString(list[i]))));
        }
        return result;
    }

    /**
     * @param currentValues the currentValues to set
     */
    public setCurrentValues(currentValues: Array<structure.ItemType>) {
        //if(currentValues.length==0){
        //    throw new Error("Error");
        //}
        var currentValues: Array<structure.ItemType> = this.removeDuplicates(currentValues);
        this.visual.setBindingCurrentValues(this.concept, currentValues);
        if (this.isClientSide()) {
            this.visual.setDirty(true);
            this.visual.setRequery(false);
        } else {
            this.visual.setDirty(true);
            this.visual.setRequery(true);
        }
    }
    public setCurrentValuesString(currentValues: Array<string>) {
        //if(currentValues.length==0){
        //    throw new Error("Error");
        //}
        var result = [];
        for (var i: number = 0; i < currentValues.length; i++) {
            result.push(data.ValueTypeResolver.resolveCode(this.visual.getRegistry(), this.visual.getDataStructure(), this.concept, currentValues[i]));
        }
        this.setCurrentValues(result);
    }


    public removeDuplicates(list: Array<structure.ItemType>): Array<structure.ItemType> {
        var result: Array<structure.ItemType> = [];
        for (var i: number = 0; i < list.length; i++) {
            var b: boolean = false;
            for (var j: number = i + 1; j < list.length; j++) {
                if (list[i].getId().equalsID(list[j].getId())) {
                    b = true;
                }
            }
            if (!b) {
                result.push(list[i]);
            }
        }
        return result;
    }

    public isClientSide(): boolean {
        return this.clientSide;
    }

    /**
     * @return the possibleValues
     */
    public getPossibleValues(): Array<structure.ItemType> {
        return this.possibleValues = this.visual.getQuery().getQueryKey(this.concept).getPossibleValues();
    }

    /**
     * @return the possibleValues
     */
    public setPossibleValues(list: Array<structure.ItemType>) {
        this.visual.getQuery().getQueryKey(this.concept).setPossibleValues(list);
    }

    public getAllValues(): Array<structure.ItemType> {
        var isc: structure.ItemSchemeType = data.ValueTypeResolver.getPossibleCodes(this.getVisual().getRegistry(), this.getVisual().getDataStructure(), this.concept);
        if (isc == null) {
            return [];
        }
        var list: Array<structure.ItemType> = [];
        for (var i: number = 0; i < isc.size(); i++) {
            list.push(isc.getItem(i));
        }
        return list;
    }

    public isInCurrentValues(s: string): boolean {
        if (this.walkAll) {
            return true;
        }
        for (var i: number = 0; i < this.visual.getBindingCurrentValues(this.concept).length; i++) {
            var item: structure.ItemType = this.visual.getBindingCurrentValues(this.concept)[i];
            if (item.getId().equalsString(s)) {
                return true;
            }
        }
        return false;
    }

    public isQueryAll(): boolean {
        return this.queryAll;
    }

    public setQueryAll(b: boolean) {
        this.queryAll = b;
    }

    /**
     * @param clientSide the clientSide to set
     */
    public setClientSide(cs: boolean) {
        this.clientSide = cs;
        if (this.clientSide) {
            this.setQueryAll(true);
        } else {
            this.setQueryAll(false);
        }
    }

    public isTimeDimension(): boolean {
        var comp: structure.Component = this.getVisual().getDataStructure().findComponentString(this.concept);
        return comp instanceof structure.TimeDimension;
    }

    /**
     * @return the bindings
     */
    public getVisual(): visual.Visual {
        return this.visual;
    }

    /**
     * @return the walkAll
     */
    public isWalkAll(): boolean {
        return this.walkAll;
    }

    /**
     * @param walkAll the walkAll to set
     */
    public setWalkAll(walkAll: boolean) {
        this.walkAll = walkAll;
    }

    /**
     * @param bindings the bindings to set
     */
    public setVisual(cc: visual.Visual) {
        this.visual = cc;
    }
    public findItemFromId(s: string) {
        for (var i: number = 0; i < this.getAllValues().length; i++) {
            if (this.getAllValues()[i].getId().toString() == s) {
                return this.getAllValues()[i];
            }
        }
        return null;
    }
    public findItemFromName(s: string) {
        for (var i: number = 0; i < this.getAllValues().length; i++) {
            if (structure.NameableType.toString(this.getAllValues()[i]) == s) {
                return this.getAllValues()[i];
            }
        }
        return null;
    }
    public removeCurrentValue(item: structure.ItemType) {
        this.visual.removeBindingCurrentValue(this.concept, item.getId().toString());
        if (this.isClientSide()) {
            this.visual.setDirty(true);
            this.visual.setRequery(false);
        } else {
            this.visual.setDirty(true);
            this.visual.setRequery(true);
        }
    }
    public addCurrentValue(item: structure.ItemType) {
        this.visual.addBindingCurrentValue(this.concept, item.getId().toString());
        if (this.isClientSide()) {
            this.visual.setDirty(true);
            this.visual.setRequery(false);
        } else {
            this.visual.setDirty(true);
            this.visual.setRequery(true);
        }
    }
    public removeCurrentValueString(s: string) {
        this.visual.removeBindingCurrentValue(this.concept, s);
        if (this.isClientSide()) {
            this.visual.setDirty(true);
            this.visual.setRequery(false);
        } else {
            this.visual.setDirty(true);
            this.visual.setRequery(true);
        }
    }
    public addCurrentValueString(s: string) {
        this.visual.addBindingCurrentValue(this.concept, s);
        if (this.isClientSide()) {
            this.visual.setDirty(true);
            this.visual.setRequery(false);
        } else {
            this.visual.setDirty(true);
            this.visual.setRequery(true);
        }
    }
    public containsValue(item: structure.ItemType): boolean {
        return this.visual.containsValue(this.concept, item);
    }
}

export class BoundToDiscrete extends BoundTo {
    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
    }
    public getBoundTo(): number {
        return BoundTo.NOT_BOUND;
    }
    public getBoundToString() {
        return "Discrete";
    }
}
export class BoundToSingleValue extends BoundToDiscrete {
    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_DISCRETE_SINGLE;
    }
    public getBoundToString() {
        return "SingleValue";
    }
}
export class BoundToAllValues extends BoundToDiscrete {
    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_DISCRETE_ALL;
    }
    public getBoundToString() {
        return "All Values";
    }
}
export class BoundToTime extends BoundTo {
    private singleLatestTime: boolean = false;
    private chooseTime: boolean = true;
    private lastTime: number = 0;

    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
        super.setWalkAll(true);
    }
    public getBoundTo(): number {
        return BoundTo.NOT_BOUND;
    }
    public isSingleLatestTime(): boolean {return this.singleLatestTime;}
    public setSingleLatestTime(b: boolean): void {this.singleLatestTime = b;}
    public isInCurrentValues(s: string): boolean {
        return true;
    }
    public expectValues() {return 2;}
    public getStartDate(): Date {return super.getVisual().getQuery().getStartDate();}
    public getEndDate(): Date {return super.getVisual().getQuery().getEndDate();}
    public setStartDate(d: Date) {
        super.getVisual().getQuery().setStartDate(d);
        super.getVisual().setRequery(true);
        super.getVisual().setDirty(true);
    }
    public setEndDate(d: Date) {
        super.getVisual().getQuery().setEndDate(d);
        super.getVisual().setRequery(true);
        super.getVisual().setDirty(true);
    }
    public isChooseTime(): boolean {return this.chooseTime;}
    public setChooseTime(b: boolean) {this.chooseTime = b;}
    public setLastTime(n: number) {this.lastTime = n;}
    public getLastTime() {return this.lastTime;}
    public init() {
        if (this.lastTime != 0) {
            super.getVisual().getQuery().setEndDate(new Date());
            super.getVisual().getQuery().setStartDate(new Date(new Date().getTime() - this.lastTime));
        }
    }
}
export class BoundToTimeX extends BoundToTime {
    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
        super.setWalkAll(true);
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_TIME_X;
    }
    public getBoundToString() {
        return "TimeX";
    }
    public expectValues() {return 2;}
}
export class BoundToTimeY extends BoundToTime {
    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
        super.setWalkAll(true);
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_TIME_Y;
    }
    public getBoundToString() {
        return "TimeY";
    }
    public expectValues() {return 2;}
}
export class BoundToContinuous extends BoundTo {
    private zeroOrigin = false;
    private sharedMaximum = true;
    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
        super.setContinuous(true);
    }
    public getBoundTo(): number {
        return BoundTo.NOT_BOUND;
    }
    public getBoundToString() {
        return "Continuous";
    }
    public getZeroOrigin() {return this.zeroOrigin;}
    public setZeroOrigin(b: boolean) {this.zeroOrigin = b;}
    public setSharedMaximum(b: boolean) {this.sharedMaximum = b;}
    public getSharedMaximum() {return this.sharedMaximum;}
}
export class BoundToDiscreteX extends BoundToDiscrete {
    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_DISCRETE_X;
    }
    public getBoundToString() {
        return "DiscreteX";
    }
}
export class BoundToDiscreteY extends BoundToDiscrete {
    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_DISCRETE_Y;
    }
    public getBoundToString() {
        return "DiscreteY";
    }
}
export class BoundToContinuousX extends BoundToContinuous {
    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_CONTINUOUS_X;
    }
    public getBoundToString() {
        return "BoundToContinuousX";
    }
}
export class BoundToContinuousY extends BoundToContinuous {
    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_CONTINUOUS_Y;
    }
    public getBoundToString() {
        return "BoundToContinuousY";
    }
}
export class BoundToContinuousColour extends BoundToContinuous {
    private minR: number = 255;
    private minG: number = 255;
    private minB: number = 255;
    private maxR: number = 0;
    private maxG: number = 0;
    private maxB: number = 0;

    private max: number = null;
    private min: number = null;


    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_CONTINUOUS_COLOUR;
    }
    public getBoundToString() {
        return "BoundToContinuousColour";
    }
    public getMinRed() {return this.minR;}
    public getMinGreen() {return this.minG;}
    public getMinBlue() {return this.minB;}
    public setMinRed(i: number) {this.minR = i;}
    public setMinGreen(i: number) {this.minG = i;}
    public setMinBlue(i: number) {this.minB = i;}
    public getMaxRed() {return this.maxR;}
    public getMaxGreen() {return this.maxG;}
    public getMaxBlue() {return this.maxB;}
    public setMaxRed(i: number) {this.maxR = i;}
    public setMaxGreen(i: number) {this.maxG = i;}
    public setMaxBlue(i: number) {this.maxB = i;}
    public getMinColour(): string {return "rgb(" + this.minR + "," + this.minG + "," + this.minB + ")";}
    public getMaxColour(): string {return "rgb(" + this.maxR + "," + this.maxG + "," + this.maxB + ")";}
    public getMin() {return this.min;}
    public setMin(n: number) {this.min = n;}
    public getMax() {return this.max;}
    public setMax(n: number) {this.max = n;}
    public getColor(n: number) {
        if (super.getZeroOrigin()) {
            this.min = 0;
        }
        var cval = (parseFloat(n) - parseFloat(this.min)) / (parseFloat(this.max) - parseFloat(this.min));
        var rd = this.getMaxRed() - this.getMinRed();
        var gd = this.getMaxGreen() - this.getMinGreen();
        var bd = this.getMaxBlue() - this.getMinBlue();
        
        return 'rgba(' + parseInt(this.minR + (cval*rd)) + ', ' + parseInt(this.minG + (cval*gd)) + ', ' + parseInt(this.minB + (cval*bd)) + ', ' + 1.0 + ')';
    }
}

export class BoundToList extends BoundToDiscrete {
    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
        super.setQueryAll(true);
        super.setWalkAll(true);
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_DISCRETE_LIST;
    }
    public getBoundToString() {
        return "BoundToList";
    }
    public getColor(n: number) {

    }
export class BoundToTimeList extends BoundToTime {
    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
        super.setQueryAll(true);
        super.setWalkAll(true);
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_TIME_LIST;
    }
    public getBoundToString() {
        return "BoundToTimeList";
    }
}
export class BoundToTimeSeries extends BoundToTime {
    private colours = new collections.Dictionary<string, Array<number>>();
    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
        super.setQueryAll(true);
        super.setWalkAll(true);
        for (var i: number = 0; i < this.getAllValues().length; i++) {
            var r = Math.random() * 255;
            var g = Math.random() * 255;
            var b = Math.random() * 255;
            this.colours.setValue(structure.NameableType.toIDString(this.getAllValues()[i]), [r, g, b]);
        }
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_TIME_SERIES;
    }
    public getBoundToString() {
        return "BoundToTimeSeries";
    }
    public getColours() {return this.colours;}
}
export class BoundToSeries extends BoundToDiscrete {

    private colours = new collections.Dictionary<string, Array<number>>();

    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
        super.setQueryAll(true);
        super.setWalkAll(true);
        super.setCurrentValues(this.getAllValues());
        for (var i: number = 0; i < this.getAllValues().length; i++) {
            var r = Math.random() * 255;
            var g = Math.random() * 255;
            var b = Math.random() * 255;
            this.colours.setValue(structure.NameableType.toIDString(this.getAllValues()[i]), [r, g, b]);
            console.log(this.colours);
        }
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_DISCRETE_SERIES;
    }
    public getBoundToString() {
        return "Series";
    }
    public expectValues() {return 2;}
    public getColours() {return this.colours;}
}
export class BoundToSlider extends BoundToDiscrete {

    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
        super.setQueryAll(true);
        super.setWalkAll(true);
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_DISCRETE_SLIDER;
    }
    public getBoundToString() {
        return "Slider";
    }
}

export class BoundToCrossMultiple extends BoundToDiscrete {

    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_DISCRETE_CROSS_MULTIPLE;
    }
    public getBoundToString() {
        return "Cross Sectional - Multiple";
    }
}
export class BoundToDropdown extends BoundToDiscrete {
    public flat: boolean = true;
    public perCentId: string = null;
    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
        super.setQueryAll(false);
        super.setWalkAll(true);
        super.setCurrentValue(super.getAllValues()[0]);
    }
    public expectValues(): number {
        return 1;
    }
    public isFlat(): boolean {
        return this.flat;
    }
    public setFlat(b: boolean) {
        this.flat = b;
    }
    public getPercentOfId() {
        return this.perCentId;
    }
    public getPercentOfItemType() {
        return this.getCodelist().findItemString(this.perCentId);
    }
    public setPercentOfId(s: string) {
        if (this.perCentId != null) {this.removeCurrentValueString(this.perCentId);}
        this.perCentId = s;
        if (s != null) {
            this.addCurrentValueString(s);
        }
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_DISCRETE_DROPDOWN;
    }
    public getBoundToString() {
        return "Dropdown";
    }
    public setCurrentValues(currentValues: Array<structure.ItemType>) {
        super.setCurrentValues(currentValues);
        if (this.perCentId != null) {
            this.addCurrentValueString(this.perCentId);
        }
    }
}
export class BoundToMultiMenu extends BoundToDiscrete {
    public level: number = 0;
    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
        super.setQueryAll(false);
        super.setWalkAll(true);
        super.setCurrentValue(super.getAllValues()[0]);
    }
    public expectValues(): number {
        return 2;
    }
    public getLevel(): number {
        return this.level;
    }
    public setLevel(b: number) {
        this.level = b;
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_DISCRETE_MULTI_MENU;
    }
    public getBoundToString() {
        return "Multi Menu";
    }
}
export class BoundToSingleMenu extends BoundToDiscrete {
    public level: number = 0;
    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
        super.setQueryAll(false);
        super.setWalkAll(true);
        super.setCurrentValue(super.getAllValues()[0]);
    }
    public expectValues(): number {
        return 1;
    }
    public getLevel(): number {
        return this.level;
    }
    public setLevel(b: number) {
        this.level = b;
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_DISCRETE_SINGLE_MENU;
    }
    public getBoundToString() {
        return "Single Menu";
    }
}
export class BoundToLevelMenu extends BoundToDiscrete {
    private level = 0;
    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
        super.setQueryAll(false);
        super.setWalkAll(true);
        super.setCurrentValue(super.getAllValues()[0]);
    }
    public expectValues(): number {
        return 1;
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_DISCRETE_LEVEL_MENU;
    }
    public getBoundToString() {
        return "Level Menu";
    }
    public getLevel() {return this.level;}
    public setLevel(n: number) {
        this.setCurrentValues(this.getCodelist().getItemsOnLevel(n));
    }

}
export class BoundToArea extends BoundToDiscrete {
    private flat: boolean = true;
    private level: number = 0;
    private density: boolean = true;
    private lat: number = 131.0361;
    private lon: number = -35.345;
    private zoom: number = 2;
    private ignoreTotal: boolean = true;
    private title: string = "ASGS2011";
    private geoJSON: string = "asgs2011.geojson";
    private matchField: string = "ID";
    private area: string = "AREA";
    private geoJSONObject: object = null;

    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
        super.setQueryAll(true);
        super.setWalkAll(true);
        super.setCurrentValues(super.getPossibleValues());
    }
    public isDensity() {return this.density;}
    public setDensity(b: boolean) {
        this.density = b;
        super.getVisual().setDirty(true);
    }
    public getBoundTo() {return BoundTo.BOUND_DISCRETE_AREA;}
    public isFlat(): boolean {return this.flat;}
    public setFlat(b: boolean) {this.flat = b;}
    public getLevel() {return this.level;}
    public setLevel(i: number) {this.level = i;}
    public getLatitude(): number {return this.lat;}
    public setLatitude(l: number) {this.lat = l;}
    public getLongitude(): number {return this.lon;}
    public setLongitude(l: number) {this.lon = l;}
    public getZoom(): number {return this.zoom;}
    public setZoom(i: number) {this.zoom = i;}
    public getIgnoreTotal(): boolean {return this.ignoreTotal;}
    public setIgnoreTotal(b: boolean) {this.ignoreTotal = b;}
    public getTitle(): string {return this.title;}
    public setTitle(s: string) {this.title = s;}
    public getGeoJSON(): string {return this.geoJSON;}
    public setGeoJSON(s: string) {
        this.geoJSON = s;
        this.geoJSONObject = makeRequest({url: this.geoJSON, method: "GET"}).then(function (gj) {
            console.log(gj);
            this.geoJSONObject = JSON.parse(gj);
        }.bind(this));
    }
    public getGeoJSONObject(): object {return this.geoJSONObject;}
    public getMatchField(): string {
        return this.matchField;
    }
    public setMatchField(s: string) {
        this.matchField = s;
    }
    public getAreaField(): string {
        return this.area;
    }
    public setAreaField(s: string) {
        this.area = s;
    }
}
export class BoundToTimeDropdown extends BoundToTime {
    public flat: boolean = true;
    public perCentId: string = null;
    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
        super.setQueryAll(true);
        super.setWalkAll(true);
    }
    public expectValues(): number {
        return 1;
    }
    public isFlat(): boolean {
        return this.flat;
    }
    public setFlat(b: boolean) {
        this.flat = b;
    }
    public getPercentOfId() {
        return this.perCentId;
    }
    public setPercentOfId(s: string) {
        this.perCentId = s;
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_TIME_DROPDOWN;
    }
    public getBoundToString() {
        return "Dropdown";
    }
}
export class BindingEntry {
    private id: number = 0;
    private name: string = "BoundTo";
    private parseObjectToBinding: Function = null;
    private saveBindingToObject: Function = null;
    private customise: Function = null;
    private createNew: Function = null;
    constructor(id: number, name: string, parse: Function, save: Function, createNew: Function) {
        this.id = id;
        this.name = name;
        this.parseObjectToBinding = parse;
        this.saveBindingToObject = save;
        if (this.id == 18) {
            console.log("BE Constructor");
            console.log(this.parseObjectToBinding);
        }
        this.createNew = createNew;
    }
    public getId(): number {return this.id;}
    public getName(): string {return this.name;}
    public setParseObjectToBinding(f: Function) {this.parseObjectToBinding = f;}
    public getParseObjectToBinding(): Function {return this.parseObjectToBinding;}
    public setSaveBindingToObject(f: Function) {this.saveBindingToObject = f;}
    public getSaveBindingToObject(): Function {return this.saveBindingToObject;}
    public setCustomise(f: Function) {this.customise = f;}
    public getCustomise(): Function {
        return this.customise;
    }
    public getCreateNew() {return this.createNew;}
    public setCreateNew(c: Function) {this.createNew = c;}
}

export class BindingRegister {
    private list: Array<BindingEntry> = [];
    constructor() {

    }
    public register(be: BindingEntry) {
        this.list.push(be);
    }
    public getList() {return this.list;}
}
export class DimensionBindingRegister extends BindingRegister {
    static register: DimensionBindingRegister = new DimensionBindingRegister();
    static registerState(be: BindingEntry) {
        DimensionBindingRegister.register.register(be);
    }
    static getList(): Array<BindingEntry> {
        return DimensionBindingRegister.register.getList();
    }
}
export class TimeBindingRegister extends BindingRegister {
    static register: TimeBindingRegister = new TimeBindingRegister();
    static registerState(be: BindingEntry) {
        TimeBindingRegister.register.register(be);
    }
    static getList(): Array<BindingEntry> {
        return TimeBindingRegister.register.getList();
    }
}
export class CrossSectionBindingRegister extends BindingRegister {
    static register: CrossSectionBindingRegister = new CrossSectionBindingRegister();
    static registerState(be: BindingEntry) {
        CrossSectionBindingRegister.register.register(be);
    }
    static getList(): Array<BindingEntry> {
        return CrossSectionBindingRegister.register.getList();
    }
}
export class MeasureBindingRegister extends BindingRegister {
    static register: MeasureBindingRegister = new MeasureBindingRegister();
    static registerState(be: BindingEntry) {
        MeasureBindingRegister.register.register(be);
    }
    static getList(): Array<BindingEntry> {
        return MeasureBindingRegister.register.getList();
    }
}
export class BindingRegisterUtil {
    static findBindingEntry(i: number): BindingEntry {
        var list = DimensionBindingRegister.getList();
        for (var j: number = 0; j < list.length; j++) {
            if (list[j].getId() == i) {
                return list[j];
            }
        }
        list = TimeBindingRegister.getList();
        for (var j: number = 0; j < list.length; j++) {
            if (list[j].getId() == i) {
                return list[j];
            }
        }
        list = CrossSectionBindingRegister.getList();
        for (var j: number = 0; j < list.length; j++) {
            if (list[j].getId() == i) {
                return list[j];
            }
        }
        list = MeasureBindingRegister.getList();
        for (var j: number = 0; j < list.length; j++) {
            if (list[j].getId() == i) {
                return list[j];
            }
        }
        console.log("Can't find bindingentry:" + i);
    }

}



export interface BindingCustomiserState {

}
export interface BindingCustomiserProps {
    concept: string;
    visual: visual.Visual;
    o: BoundTo
}
export class BindingsCustomiser extends React.Component {
    public state: BindingCustomiserState = null;
    public props: BindingCustomiserProps = null;
    constructor(props, state) {
        super(props, state);
        this.props = props;
        this.state = state;
    }
    public render(props, state) {
        return (<p>{this.props.concept}</p>);
    }
    public getBinding(): BoundTo {
        return null;
    }
    public setBinding(b: BoundTo) {
        this.props.o = b;
    }
}

export class DiscreteXCustomiser extends React.Component {
    public state: BindingCustomiserState = null;
    public props: BindingCustomiserProps = null;
    constructor(props, state) {
        super(props, state);
        this.props = props;
        this.state = state;
    }
    public changeFlat(e) {
        this.getBinding().setFlat(!this.getBinding().isFlat());
        super.setState({});
    }
    public changePercentId(e) {
        this.getBinding().setPercentOfId(e);
    }
    listItems() {
        var options = [];
        options.push(<Select.Item value={null}>No Percent of Id</Select.Item>);
        this.props.o.getAllValues().map(function (item) {
            options.push(<Select.Item value={structure.NameableType.toIDString(item)}>{item}</Select.Item>);
        });
        return options;
    }
    public render(props, state) {
        return (<Checkbox checked={this.getBinding().isFlat()} id={this.getBinding().getConcept() + "_flat"} onclick={(evt) => {evt.stopPropagation(); this.changeFlat(evt)}} />
            <Select value={this.getBinding().getPercentOfId()} onChange={(a) => this.changePercentId(a)}>{this.listItems()}</Select>
        );
    }
    public getBinding(): BoundToDropdown {
        return (this.props.o as BoundToDropdown);
    }
}
/*
export class DropdownBindingCustomiser extends React.Component {
    public state: BindingCustomiserState = null;
    public props: BindingCustomiserProps = null;
    constructor(props, state) {
        super(props, state);
        this.props = props;
        this.state = state;
    }
    public render() {
        return (<p>{this.props.o.getConcept()} {this.props.o.getBoundToString()} Test</p>);
    }
    public getBinding(v: visual.Visual): BoundToDropdown {
        return parseObjectToBindingBoundToDropdown(this.props.o, v);
    }
    public setBinding(b: BoundTo) {
        this.props.o = b;
        this.props.concept = b.getConcept();
    }

}*/
export function defaultSaveBindingToObject(b: BoundTo): BoundTo {
    console.log("Save:" + b.getBoundTo() + " Concept:" + b.getConcept());
    var o: any = {};
    o.concept = b.getConcept();
    switch (b.getBoundTo()) {
        case BoundTo.BOUND_DISCRETE_DROPDOWN:
            o.typeid = BoundTo.BOUND_DISCRETE_DROPDOWN;
            o.concept = b.getConcept();
            o.typename = "BoundToDropdown";
            o.clientSide = b.isClientSide();
            o.flat = b.isFlat();
            o.perCentOfId = b.getPercentOfId();
            break;
        case BoundTo.BOUND_DISCRETE_AREA:
            o.typeid = BoundTo.BOUND_DISCRETE_AREA;
            var ba = b as BoundToArea;
            o.concept = b.getConcept();
            o.typename = "BoundToArea";
            o.flat = b.isFlat();
            o.level = ba.getLevel();
            o.density = ba.isDensity();
            o.lat = ba.getLatitude();
            o.lon = ba.getLongitude();
            o.zoom = ba.getZoom();
            o.ignoreTotal = ba.getIgnoreTotal();
            o.title = ba.getTitle();
            o.geoJSON = ba.getGeoJSON();
            o.matchField = ba.getMatchField();
            o.area = ba.getAreaField();
            break;
        case BoundTo.BOUND_CONTINUOUS_COLOUR:
            o.typeid = BoundTo.BOUND_CONTINUOUS_COLOUR;
            o.typename = "BoundToContinuousColour";
            var bc = b as BoundToContinuousColour;
            o.zeroOrigin = bc.getZeroOrigin();
            o.concept = bc.getConcept();
            o.minR = bc.getMinRed();
            o.minG = bc.getMinGreen();
            o.minB = bc.getMinBlue();
            o.maxR = bc.getMaxRed();
            o.maxG = bc.getMaxGreen();
            o.maxB = bc.getMaxBlue();
            break;
        case BoundTo.BOUND_CONTINUOUS_X:
            o.typeid = BoundTo.BOUND_CONTINUOUS_X;
            break;
        case BoundTo.BOUND_CONTINUOUS_Y:
            o.typeid = BoundTo.BOUND_CONTINUOUS_Y;
            break;
        case BoundTo.BOUND_TIME_X:
            o.typeid = BoundTo.BOUND_TIME_X;
            var bx: BoundToTimeX = b as BoundToTimeX;
            o.typename = "BoundToTimeX";
            o.lastTime = bx.getLastTime();
            o.singleLatestTime = bx.isSingleLatestTime();
            o.chooseTime = bx.isChooseTime();
            o.start = bx.getStartDate().getTime();
            o.end = bx.getEndDate().getTime();
            break;
        case BoundTo.BOUND_TIME_Y:
            o.typeid = BoundTo.BOUND_TIME_Y;
            var by: BoundToTimeY = b as BoundToTimeY;
            o.typename = "BoundToTimeY";
            o.lastTime = by.getLastTime();
            o.singleLatestTime = by.isSingleLatestTime();
            o.chooseTime = by.isChooseTime();
            o.start = by.getStartDate().getTime();
            o.end = by.getEndDate().getTime();
            break;
        case BoundTo.BOUND_TIME_DROPDOWN:
            o.typeid = BoundTo.BOUND_TIME_DROPDOWN;
            var by: BoundToTimeY = b as BoundToTimeY;
            o.typename = "BoundToTimeDropDown";
            o.lastTime = by.getLastTime();
            o.singleLatestTime = by.isSingleLatestTime();
            o.chooseTime = by.isChooseTime();
            o.start = by.getStartDate().getTime();
            o.end = by.getEndDate().getTime();
            break;
        case BoundTo.BOUND_DISCRETE_LIST:
            o.typeid = BoundTo.BOUND_DISCRETE_LIST;
            break;
        case BoundTo.BOUND_DISCRETE_SERIES:
            o.typeid = BoundTo.BOUND_DISCRETE_SERIES;
            break;
        case BoundTo.BOUND_DISCRETE_SLIDER:
            o.typeid = BoundTo.BOUND_DISCRETE_SERIES;
            break;
    }
    return o;
}
export function defaultParseObjectToBinding(o: object, v: visual.Visual): BoundTo {
    console.log("Default Parse Objet:");
    console.log(o);
    var b = null;
    if (o['typeid'] == BoundTo.BOUND_DISCRETE_AREA) {
        var ba = new BoundToArea(v, o['concept']);
        ba.setFlat(o['flat']);
        ba.setLevel(o['level']);
        ba.setDensity(o['density']);
        ba.setLatitude(o['lat']);
        ba.setLongitude(o['lon']);
        ba.setZoom(o['zoom']);
        ba.setTitle(o['ignoreTotal']);
        ba.setTitle(o['title']);
        ba.setGeoJSON(o['geoJSON']);
        ba.setMatchField(o['matchField']);
        ba.setAreaField(o['area']);
        b = ba;
    }
    else if (o['typeid'] == BoundTo.BOUND_DISCRETE_DROPDOWN) {
        b = new BoundToDropdown(v, o['concept']);
        b.setFlat(o['flat']);
        b.setClientSide(o['clientSide']);
        b.setPercentOfId(o['perCentOfId']);
    }
    else if (o['typeid'] == BoundTo.BOUND_CONTINUOUS_X) {
        b = new BoundToContinuousX(v, o['concept']);
    }
    else if (o['typeid'] == BoundTo.BOUND_CONTINUOUS_Y) {
        b = new BoundToContinuousY(v, o['concept']);
    }
    else if (o['typeid'] == BoundTo.BOUND_CONTINUOUS_COLOUR) {
        b = new BoundToContinuousColour(v, o['concept']);
        b.setZeroOrigin(o['zeroOrigin' == 'true'])
        b.setMinRed(o.minR);
        b.setMinGreen(o.minG);
        b.setMinBlue(o.minB);
        b.setMaxRed(o.maxR);
        b.setMaxGreen(o.maxG);
        b.setMaxBlue(o.maxB);
    }
    else if (o['typeid'] == BoundTo.BOUND_TIME_X) {
        b = new BoundToTimeX(v, o['concept']);
        b.setLastTime(o['lastTime']);
        b.setSingleLatestTime(o['singleLatestTime']);
        b.setChooseTime(o['chooseTime']);
        var start = new Date();
        start.setTime(o['start']);
        var end = new Date();
        end.setTime(o['end']);
        b.setStartDate(start);
        b.setEndDate(end);
    }
    else if (o['typeid'] == BoundTo.BOUND_TIME_Y) {
        b = new BoundToTimeY(v, o['concept']);
        b.setLastTime(o['lastTime']);
        b.setSingleLatestTime(o['singleLatestTime']);
        b.setChooseTime(o['chooseTime']);
        var start = new Date();
        start.setTime(o['start']);
        var end = new Date();
        end.setTime(o['end']);
        b.setStartDate(start);
        b.setEndDate(end);
    }
    else if (o['typeid'] == BoundTo.BOUND_TIME_DROPDOWN) {
        b = new BoundToTimeDropdown(v, o['concept']);
        b.setLastTime(o['lastTime']);
        b.setSingleLatestTime(o['singleLatestTime']);
        b.setChooseTime(o['chooseTime']);
        var start = new Date();
        start.setTime(o['start']);
        var end = new Date();
        end.setTime(o['end']);
        b.setStartDate(start);
        b.setEndDate(end);
    }
    else if (o['typeid'] == BoundTo.BOUND_DISCRETE_LIST) {
        b = new BoundToList(v, o['concept']);
    }
    else if (o['typeid'] == BoundTo.BOUND_DISCRETE_SERIES) {
        b = new BoundToSeries(v, o['concept']);
    }
    else if (o['typeid'] == BoundTo.BOUND_DISCRETE_SLIDER) {
        b = new BoundToSlider(v, o['concept']);
    }
    console.log("Returning");
    console.log(b);
    return b;
}
/*
function saveBindingToObjectBoundToDropdown(b: BoundToDropdown): object {
    var o: any = {}
    o.concept = b.getConcept();
    o.typeid = b.getBoundTo();
    o.typename = "BoundToDropdown";
    o.clientSide = b.isClientSide();
    o.flat = b.isFlat();
    o.perCentOfId = b.getPercentOfId();
    return o;
}
export function saveBindingToObjectBoundToDiscreteX(b: BoundToDiscreteX): object {
    var o: any = {};
    o.concept = b.getConcept();
    o.typeid = b.getBoundTo();
    o.typename = "BoundToDiscreteX";
    return o;
}
export function parseObjectToBindingBoundToDiscreteX(o: object, v: visual.Visual): BoundToDiscreteX {
    var b: BoundToDiscreteX = new BoundToDiscreteX(v, o['concept']);
    return b;
}
*/
var be1: BindingEntry = new BindingEntry(BoundTo.BOUND_DISCRETE_DROPDOWN, "Dropdown", defaultParseObjectToBinding, defaultSaveBindingToObject, BoundToDropdown);
var be2: BindingEntry = new BindingEntry(BoundTo.BOUND_DISCRETE_X, "DiscreteX", defaultParseObjectToBinding, defaultSaveBindingToObject, BoundToDiscreteX);
var be3: BindingEntry = new BindingEntry(BoundTo.BOUND_DISCRETE_LIST, "List", defaultParseObjectToBinding, defaultSaveBindingToObject, BoundToList);
var be4: BindingEntry = new BindingEntry(BoundTo.BOUND_DISCRETE_SERIES, "Series", defaultParseObjectToBinding, defaultSaveBindingToObject, BoundToSeries);
var be5: BindingEntry = new BindingEntry(BoundTo.BOUND_DISCRETE_SINGLE, "Single Value", defaultParseObjectToBinding, defaultSaveBindingToObject, BoundToSingleValue);
var be6: BindingEntry = new BindingEntry(BoundTo.BOUND_DISCRETE_ALL, "All Values", defaultParseObjectToBinding, defaultSaveBindingToObject, BoundToAllValues);
var be7: BindingEntry = new BindingEntry(BoundTo.BOUND_TIME_X, "Time X", defaultParseObjectToBinding, defaultSaveBindingToObject, BoundToTimeX);
var be20: BindingEntry = new BindingEntry(BoundTo.BOUND_DISCRETE_AREA, "Area", defaultParseObjectToBinding, defaultSaveBindingToObject, BoundToArea);


var be8: BindingEntry = new BindingEntry(BoundTo.BOUND_TIME_Y, "Time Y", defaultParseObjectToBinding, defaultSaveBindingToObject, BoundToTimeY);
var be9: BindingEntry = new BindingEntry(BoundTo.BOUND_TIME_DROPDOWN, "Dropdown", defaultParseObjectToBinding, defaultSaveBindingToObject, BoundToTimeDropdown);
var be10: BindingEntry = new BindingEntry(BoundTo.BOUND_TIME_LIST, "List", defaultParseObjectToBinding, defaultSaveBindingToObject, BoundToTimeList);
var be11: BindingEntry = new BindingEntry(BoundTo.BOUND_TIME_SERIES, "Series", defaultParseObjectToBinding, defaultSaveBindingToObject, BoundToTimeSeries);
var be12: BindingEntry = new BindingEntry(BoundTo.BOUND_CONTINUOUS_X, "X", defaultParseObjectToBinding, defaultSaveBindingToObject, BoundToContinuousX);
var be13: BindingEntry = new BindingEntry(BoundTo.BOUND_CONTINUOUS_Y, "Y", defaultParseObjectToBinding, defaultSaveBindingToObject, BoundToContinuousY);
var be14: BindingEntry = new BindingEntry(BoundTo.BOUND_CONTINUOUS_COLOUR, "Colour", defaultParseObjectToBinding, defaultSaveBindingToObject, BoundToContinuousColour);
var be15: BindingEntry = new BindingEntry(BoundTo.BOUND_DISCRETE_SINGLE_MENU, "Single Menu", defaultParseObjectToBinding, defaultSaveBindingToObject, BoundToSingleMenu);
var be16: BindingEntry = new BindingEntry(BoundTo.BOUND_DISCRETE_MULTI_MENU, "Multi Menu", defaultParseObjectToBinding, defaultSaveBindingToObject, BoundToMultiMenu);
var be17: BindingEntry = new BindingEntry(BoundTo.BOUND_DISCRETE_LEVEL_MENU, "Level Menu", defaultParseObjectToBinding, defaultSaveBindingToObject, BoundToLevelMenu);
var be18: BindingEntry = new BindingEntry(BoundTo.BOUND_DISCRETE_CROSS_MULTIPLE, "Cross Sectional - Multiple", defaultParseObjectToBinding, defaultSaveBindingToObject, BoundToCrossMultiple);
var be19: BindingEntry = new BindingEntry(BoundTo.BOUND_DISCRETE_AREA, "Area", defaultParseObjectToBinding, defaultSaveBindingToObject, BoundToArea);



DimensionBindingRegister.registerState(be1);
DimensionBindingRegister.registerState(be2);
DimensionBindingRegister.registerState(be3);
DimensionBindingRegister.registerState(be4);
DimensionBindingRegister.registerState(be5);
DimensionBindingRegister.registerState(be6);
DimensionBindingRegister.registerState(be15);
DimensionBindingRegister.registerState(be16);
DimensionBindingRegister.registerState(be17);
DimensionBindingRegister.registerState(be19);
DimensionBindingRegister.registerState(be20);
console.log("Binding Entry");
console.log(be7);
TimeBindingRegister.registerState(be7);
TimeBindingRegister.registerState(be8);
TimeBindingRegister.registerState(be9);
TimeBindingRegister.registerState(be10);
TimeBindingRegister.registerState(be11);


MeasureBindingRegister.registerState(be12);
MeasureBindingRegister.registerState(be13);
MeasureBindingRegister.registerState(be14);
//MeasureBindingRegister.registerState(be15);
//MeasureBindingRegister.registerState(be16);
//MeasureBindingRegister.registerState(be17);

CrossSectionBindingRegister.registerState(be1);
CrossSectionBindingRegister.registerState(be2);
CrossSectionBindingRegister.registerState(be4);
CrossSectionBindingRegister.registerState(be5);
CrossSectionBindingRegister.registerState(be18);



