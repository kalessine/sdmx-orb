import * as React from 'preact-compat';
import {h} from 'preact';
import * as structure from "../sdmx/structure";
import * as sdmx from "../sdmx";
import * as visual from "../visual/visual";
import * as data from "../sdmx/data";
import Checkbox from 'preact-material-components/Checkbox';
import Select from 'preact-material-components/Select';

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

    private concept: string;
    private boundTo: number = BoundTo.NOT_BOUND;
    private continuous: boolean = false;
    private queryAll: boolean = false;
    private walkAll: boolean = false;
    private clientSide: boolean = false;
    private possibleValues: Array<structure.ItemType> = null;
    private measureDescriptor: boolean = false;
    private visual: visual.Visual = null;

    public static DIMENSION = [BoundTo.BOUND_DISCRETE_X, BoundTo.BOUND_DISCRETE_Y, BoundTo.BOUND_DISCRETE_DROPDOWN, BoundTo.BOUND_DISCRETE_LIST, BoundTo.BOUND_DISCRETE_SERIES];
    public static TIME = [BoundTo.BOUND_TIME_X, BoundTo.BOUND_TIME_Y, BoundTo.BOUND_TIME_DROPDOWN];
    public static MEASURE = [BoundTo.BOUND_MEASURES_DROPDOWN, BoundTo.BOUND_MEASURES_LIST, BoundTo.BOUND_MEASURES_SERIES, BoundTo.BOUND_MEASURES_INDIVIDUAL];
    public static MEASURES = [BoundTo.BOUND_CONTINUOUS_X, BoundTo.BOUND_CONTINUOUS_Y, BoundTo.BOUND_CONTINUOUS_COLOUR, BoundTo.BOUND_CONTINUOUS_SIZE];

    constructor(visual: visual.Visual, concept: string) {
        this.concept = concept;
        this.visual = visual;
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
        if (itm != null) {
            var vals: Array<structure.ItemType> = this.getCurrentValues();
            vals.splice(0, vals.length);
            if (this.isClientSide()) {
                this.visual.setDirty(true);
            } else {
                this.visual.setRequery(true);
            }
        } else {
            this.getCurrentValues().length = 0;
            if (this.isClientSide()) {
                this.visual.setDirty(true);
            } else {
                this.visual.setRequery(true);
            }
        }
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
        var currentValues: Array<structure.ItemType> = this.removeDuplicates(currentValues);
        this.visual.setBindingCurrentValues(this.concept, currentValues);
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
    public findItemFromId(s:string) {
        for (var i: number = 0; i < this.getAllValues().length;i++) {
            if (this.getAllValues()[i].getId().toString()==s ) {
                return this.getAllValues()[i];
            }
        }
        return null;
    }
    public findItemFromName(s:string) {
        for (var i: number = 0; i < this.getAllValues().length;i++) {
            if (structure.NameableType.toString(this.getAllValues()[i])==s ) {
                return this.getAllValues()[i];
            }
        }
        return null;
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
export class BoundToTime extends BoundTo {
    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
    }
    public getBoundTo(): number {
        return BoundTo.NOT_BOUND;
    }
}
export class BoundToContinuous extends BoundTo {
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
}
export class BoundToSeries extends BoundToDiscrete {

    constructor(visual: visual.Visual, concept: string) {
        super(visual, concept);
        super.setQueryAll(true);
        super.setWalkAll(true);
    }
    public getBoundTo(): number {
        return BoundTo.BOUND_DISCRETE_SERIES;
    }
    public getBoundToString() {
        return "Series";
    }
}
export class BoundToDropdown extends BoundToDiscrete {
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
        return BoundTo.BOUND_DISCRETE_DROPDOWN;
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
    constructor(id: number, name: string, parse: Function, save: Function,createNew:Function) {
        this.id = id;
        this.name = name;
        this.parseObjectToBinding = parse;
        this.saveBindingToObject = save;
        this.createNew=createNew;
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
    public setCreateNew(c:Function) {this.createNew=c;}
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
    public static register: DimensionBindingRegister = new DimensionBindingRegister();
    public static registerState(be: BindingEntry) {
        DimensionBindingRegister.register.register(be);
    }
    public static getList(): Array<BindingEntry> {
        return DimensionBindingRegister.register.getList();
    }
}
export class TimeBindingRegister extends BindingRegister {
    public static register: TimeBindingRegister = new TimeBindingRegister();
    public static registerState(be: BindingEntry) {
        TimeBindingRegister.register.register(be);
    }
    public static getList(): Array<BindingEntry> {
        return TimeBindingRegister.getList();
    }
}
export class CrossSectionBindingRegister extends BindingRegister {
    public static register: CrossSectionBindingRegister = new CrossSectionBindingRegister();
    public static registerState(be: BindingEntry) {
        CrossSectionBindingRegister.register.register(be);
    }
    public static getList(): Array<BindingEntry> {
        return CrossSectionBindingRegister.getList();
    }
}
export class MeasureBindingRegister extends BindingRegister {
    public static register: MeasureBindingRegister = new MeasureBindingRegister();
    public static registerState(be: BindingEntry) {
        MeasureBindingRegister.register.register(be);
    }
    public static getList(): Array<BindingEntry> {
        return MeasureBindingRegister.getList();
    }
}
export class BindingRegisterUtil {
    public static findBindingEntry(i: number): BindingEntry {
        var list = DimensionBindingRegister.getList();
        for (var j: number = 0; j < list.length; j++) {
            
            if (list[j].getId() == i) {
                console.log("Found BindingEntry:"+i);
                console.log(list[j]);
                return list[j];
            }
        }
        console.log("Can't find bindingentry:"+i);
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
    public setBinding(b:BoundTo){
        this.props.o=b;
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
    public changeFlat(e){
        this.getBinding().setFlat(!this.getBinding().isFlat());
        super.setState({});
    }
    public changePercentId(e){
        this.getBinding().setPercentOfId(e);
    }
    listItems() {
        var options = [];
        options.push(<Select.Item value={null}>No Percent of Id</Select.Item>);
        this.props.o.getAllValues().map(function (item) {
            options.push(<Select.Item value={item}>{item}</Select.Item>);
        });
        return options;
    }
    public render(props, state) {
        return (<Checkbox checked={this.getBinding().isFlat()} id={this.getBinding().getConcept()+"_flat"} onclick={(evt) => {evt.stopPropagation(); this.changeFlat(evt)}} />
            <Select value={this.getBinding().getPercentOfId()} onChange={(a) => this.changePercentId(a)}>{this.listItems()}</Select>
        );
    }
    public getBinding(): BoundToDropdown {
        return (this.props.o as BoundToDropdown);
    }
}

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
    public getBinding(v: visual.Visual): BoundToDropdown{
        return parseObjectToBindingBoundToDropdown(this.props.o,v);
    }
    public setBinding(b: BoundTo) {
        this.props.o = b;
        this.props.concept=b.getConcept();
    }
  
}
function parseObjectToBindingBoundToDropdown(o: object, v: visual.Visual): BoundToDropdown {
    var b = new BoundToDropdown(v, o['concept']);
    b.setFlat(o['flat']);
    b.setClientSide(o['clientSide']);
    b.setPercentOfId(o['perCentOfId']);
    return b;
}
function saveBindingToObjectBoundToDropdown(b: BoundToDropdown): object {
    var o:any = {}
    o.concept = b.getConcept();
    o.typeid = b.getBoundTo();
    o.typename = "BoundToDropdown";
    o.clientSide = b.isClientSide();
    o.flat = b.isFlat();
    o.perCentOfId = b.getPercentOfId();
    return o;
    }
export function saveBindingToObjectBoundToDiscreteX(b: BoundToDiscreteX): object {
    var o:any = {};
    o.concept = b.getConcept();
    o.typeid = b.getBoundTo();
    o.typename = "BoundToDiscreteX";
    return o;
}
export function parseObjectToBindingBoundToDiscreteX(o: object, v: visual.Visual): BoundToDiscreteX {
    var b: BoundToDiscreteX = new BoundToDiscreteX(v, o['concept']);
    return b;
}

var be1: BindingEntry = new BindingEntry(BoundTo.BOUND_DISCRETE_DROPDOWN, "BoundToDiscreteDropDown", parseObjectToBindingBoundToDropdown, saveBindingToObjectBoundToDropdown,BoundToDropdown);
var be2: BindingEntry = new BindingEntry(BoundTo.BOUND_DISCRETE_X, "BoundToDiscreteX", parseObjectToBindingBoundToDiscreteX, saveBindingToObjectBoundToDiscreteX,BoundToDiscreteX);
DimensionBindingRegister.registerState(be1);
DimensionBindingRegister.registerState(be2);
