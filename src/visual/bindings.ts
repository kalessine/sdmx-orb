/// <amd-module name='chiasm-cube/bindings'/>
import * as structure from "sdmx/structure";
import * as sdmx from "sdmx";
import * as visual from "visual/visual";
import * as data from "sdmx/data";
///<reference path="../../lodash.d.ts"/>
export class BoundTo {
    public static NOT_BOUND: number = -1;
    public static BOUND_CONTINUOUS_X: number = 0;
    public static BOUND_DISCRETE_X: number = 1;
    public static BOUND_CONTINUOUS_Y: number = 2;
    public static BOUND_DISCRETE_Y: number = 3;
    public static BOUND_AREA: number = 4;
    public static BOUND_CONTINUOUS_COLOUR: number = 5;
    public static BOUND_DISCRETE_COLOUR: number = 6;
    public static BOUND_CONTINUOUS_SIZE: number = 7;
    public static BOUND_DISCRETE_SIZE: number = 8;
    public static BOUND_TOOLTIP: number = 9;

    public static BOUND_DISCRETE_DROPDOWN: number = 10;
    public static BOUND_DISCRETE_LIST: number = 11;
    public static BOUND_DISCRETE_SLIDER: number = 12;
    public static BOUND_DISCRETE_STATIC: number = 13;
    public static BOUND_DISCRETE_SERIES: number = 14;

    public static BOUND_CONTINUOUS_BETWEEN: number = 15;
    public static BOUND_CONTINUOUS_GREATERTHAN: number = 16;
    public static BOUND_CONTINUOUS_LESSTHAN: number = 17;

    public static BOUND_TIME_X: number = 18;
    public static BOUND_TIME_Y: number = 19;
    public static BOUND_TIME_DROPDOWN: number = 20;

    public static BOUND_MEASURES_DROPDOWN: number = 21;
    public static BOUND_MEASURES_LIST: number = 22;
    public static BOUND_MEASURES_INDIVIDUAL: number = 23;
    public static BOUND_MEASURES_SERIES: number = 24;

    private concept: string = null;
    private boundTo: number = BoundTo.NOT_BOUND;
    private continuous: boolean = false;
    private queryAll: boolean = false;
    private walkAll: boolean = false;
    private clientSide: boolean = false;
    private currentValues: Array<structure.ItemType> = [];
    private possibleValues: Array<structure.ItemType> = null;

    private measureDescriptor: boolean = false;
    private visual: visual.Visual = null;

    constructor(visual:visual.Visual, concept: string) {
        this.concept = concept;
        this.visual= visual;
    }
    public static escape(s: string): string {
        if (s.indexOf("'") != -1) {
            s = s.replace("'", "\\'");
        }
        return s;
    }
    public static stripCRLFs(s: string) {
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

    public isMeasureDescriptor(): boolean {
        return this.measureDescriptor;
    }

    public setMeasureDescriptor(measureDescriptor: boolean) {
        this.measureDescriptor = measureDescriptor;
    }

    public getConceptName(): String {
        var loc: string = sdmx.SdmxIO.getLocale();
        var comp: structure.Component = this.visual.getDataStructure().findComponentString(this.concept);
        var concept: structure.ConceptType = this.visual.getRegistry().findConcept(comp.getConceptIdentity());
        return BoundTo.stripCRLFs(BoundTo.escape(structure.NameableType.toString(concept)));
    }

    public getCodelist(): structure.ItemSchemeType {
        var is: structure.ItemSchemeType = data.ValueTypeResolver.getPossibleCodes(this.visual.getRegistry(), this.visual.getDataStructure(), this.concept);
        return is;
    }

    public getValue(): string {
        var itm: structure.ItemType = this.getCurrentValue();
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
        if (itm != null) {
            var vals: Array<structure.ItemType> = this.getCurrentValues();
            vals.splice(0, vals.length);
            if (this.isClientSide()) {
                this.visual.setDirty(true);
            } else {
                this.visual.setRequery(true);
            }
        } else {
            this.getCurrentValues().length=0;
            if (this.isClientSide()) {
                this.visual.setDirty(true);
            } else {
                this.visual.setRequery(true);
            }
        }
    }

    public getCurrentValue(): structure.ItemType {
        if (this.getCurrentValues().length == 0) {
            return null;
        }
        return this.getCurrentValues()[0];
    }

    /**
     * @return the currentValues
     */
    public getCurrentValues(): Array<structure.ItemType> {
        //System.out.println(this.concept + ": values=" + currentValues);
        var result:Array<structure.ItemType> = [];
        for(var i:number=0;i<this.visual.getQuery().getQueryKey(this.concept).getValues().length;i++) {
            var s = this.visual.getQuery().getQueryKey(this.concept).getValues()[i];
            result.push(data.ValueTypeResolver.resolveCode(this.visual.getRegistry(), this.visual.getDataStructure(), this.concept,s));
        }
        return result;
    }

    /**
     * @return the currentValues
     */
    public getCurrentValuesString(): Array<string> {
        var list = this.getCurrentValues();
        var result: Array<string> = [];
        for (var i: number = 0; i < list.length; i++) {
            result.push(BoundTo.stripCRLFs(BoundTo.escape(structure.NameableType.toString(list[i]))));
        }
        return result;
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
        currentValues = this.removeDuplicates(currentValues);
        this.currentValues = currentValues;
        if (this.isClientSide()) {
            this.visual.setDirty(true);
        } else {
            this.visual.setRequery(true);
        }
    }
    public setCurrentValues2(currentValues: Array<structure.ItemType>) {
        currentValues = this.removeDuplicates(currentValues);
        this.currentValues = currentValues;
        this.visual.setDirty(true);
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
        if (this.possibleValues == null) {
            this.possibleValues = this.visual.getQuery().getQueryKey(this.concept).possibleValuesItems();
        }
        return this.possibleValues;
    }

    /**
     * @return the possibleValues
     */
    public setPossibleValues(list: Array<structure.ItemType>) {
        this.possibleValues = this.visual.getQuery().getQueryKey(this.concept).possibleValuesItems();
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
        for (var i: number = 0; i < this.currentValues.length; i++) {
            var item: structure.ItemType = this.currentValues[i];
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
            var current: Array<structure.ItemType> = this.getCurrentValues();
            current.push(this.getPossibleValues()[0]);
            this.setCurrentValues(current);
        }
    }

    public isTimeDimension(): boolean {
        var comp: structure.Component = this.getVisual().getDataStructure().findComponentString(this.concept);
        return comp instanceof structure.TimeDimension;
    }

    /**
     * @return the bindings
     */
    public getVisual(): visual.Visual{
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
}

export class BoundToDiscrete{}
export class BoundToTime{}
export class BoundToContinuous{}