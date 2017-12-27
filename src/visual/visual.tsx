import * as structure from "../sdmx/structure";
import * as sdmx from "../sdmx";
import * as interfaces from "../sdmx/interfaces";
import * as adapter from "../visual/adapter";
import * as model from "../visual/model";
import * as data from "../sdmx/data";
import * as common from "../sdmx/common";
import * as message from "../sdmx/message";
import * as commonreferences from "../sdmx/commonreferences";
import * as bindings from "../visual/bindings";
import * as bindingsX from './bindingsX';
export class Visual {

    private bindings: Array<bindings.BoundTo> = [];
    private bindingsColumnMapper = new data.FlatColumnMapper();
    private time: bindings.BoundToTime = null;
    private crossSection: bindings.BoundTo = null;
    private values: Array<bindings.BoundToContinuous> = [];

    private loc: string = "en";
    private dataservice: string = "OECD";
    private dataflowAgency: string = "";
    private dataflowId: string = "";
    private dataflowVersion: string = "";
    private dataflowName: string = "";
    private structureAgency: string = "";
    private structureId: string = "";
    private structureVersion: string = "";
    // Derived from above fields   
    private df: structure.Dataflow = null;


    private requery: boolean = true;
    private dirty: boolean = true;

    private dataMessage: message.DataMessage = null;
    private cube: data.Cube = null;
    private query: data.Query = null;
    private adapter: adapter.Adapter = null;
    private model: model.Model = null;

    private queryable: interfaces.Queryable = null;

    public constructor() {

    }
    public transient(obj, k) {
        if (obj.hasOwnProperty(k)) {
            var v = obj[k]
            if (typeof v != "object") {
                throw "Does not work well with integral types.";
            }
            delete obj[k];
            if (!obj.__proto__.__transientninja__) {
                obj.__proto__ = {
                    "__proto__": obj.__proto__,
                    "__transientninja__": true
                }
            }
            obj.__proto__[k] = v;
        }
    }

    public setQueryable(q: interfaces.Queryable) {
        this.queryable = q;
    }
    public setDataflow(df: structure.Dataflow) {
        this.df = df;
    }
    getRegistry(): interfaces.LocalRegistry {
        return this.getQueryable().getRemoteRegistry().getLocalRegistry();
    }
    getDataflow(): structure.Dataflow {
        if (this.df != null) return this.df;
        var df: structure.Dataflow = new structure.Dataflow();
        df.setAgencyId(new commonreferences.NestedNCNameID(this.dataflowAgency));
        df.setNames([new common.Name(this.dataflowName, 'en')]);
        df.setVersion(new commonreferences.Version(this.dataflowVersion));
        df.setId(new commonreferences.ID(this.dataflowId));
        var ref: commonreferences.Ref = new commonreferences.Ref();
        ref.setAgencyId(new commonreferences.NestedNCNameID(this.structureAgency));
        ref.setId(new commonreferences.ID(this.structureId));
        ref.setVersion(new commonreferences.Version(this.structureVersion));
        var reference: commonreferences.Reference = new commonreferences.Reference(ref, null);
        df.setStructure(reference);
        this.df = df;
        return df;
    }
    getDataStructure(): structure.DataStructure {
        return this.queryable.getRemoteRegistry().getLocalRegistry().findDataStructure(this.df.getStructure());
    }
    public size(): number {
        return this.getDataStructure().getDataStructureComponents().getDimensionList().getDimensions().length +
            (this.getDataStructure().getDataStructureComponents().getDimensionList().getMeasureDimension() != null ? 1 : 0) +
            (this.getDataStructure().getDataStructureComponents().getDimensionList().getTimeDimension() != null ? 1 : 0);
    }
    public dimSize(): number {
        return this.getDataStructure().getDataStructureComponents().getDimensionList().getDimensions().length;
    }
    public init() {
        this.bindings = [];
        this.bindingsColumnMapper = new data.FlatColumnMapper();
        for (var i: number = 0; i < this.dimSize(); i++) {
            var dim: structure.Dimension = this.getDataStructure().getDataStructureComponents().getDimensionList().getDimensions()[i];
            var b: bindings.BoundTo = new bindings.BoundToDropdown(this, dim.getId().toString());
            this.bindingsColumnMapper.registerColumn(dim.getId().toString(), data.AttachmentLevel.OBSERVATION);
            this.bindings.push(b);
        }

    }
    public setDirty(dirty: boolean) {
        this.dirty = dirty;
    }
    public setRequery(requery: boolean) {
        this.requery = requery;
    }

    public findBinding(concept: string): bindings.BoundTo {
        for (var i: number = 0; i < this.bindings.length; i++) {
            //console.log("Compare:" + this.bindings[i].getConcept());
            if (this.bindings[i].getConcept() == concept) {
                //console.log("Returning:"+concept);
                return this.bindings[i];
            }
        }
        if (this.time != null && this.time.getConcept() == concept) {
            return this.time;
        }
        if (this.crossSection != null && this.crossSection.getConcept() == concept) {
            return this.crossSection;
        }
        for (var i: number = 0; i < this.values.length; i++) {
            if (this.values[i].getConcept() == concept) {
                return this.values[i];
            }
        }
        //console.log("Can't Find:"+concept);
        return null;
    }
    public setBinding(b: bindings.BoundTo) {
        var concept: string = b.getConcept();
        for (var i: number = 0; i < this.bindings.length; i++) {
            if (this.bindings[i].getConcept() == concept) {
                this.bindings[i] = b;
            }
        }
        if (this.time != null && this.time.getConcept() == concept) {
            this.time = b;
        }
        if (this.crossSection != null && this.crossSection.getConcept() == concept) {
            this.crossSection = b;
        }
        for (var i: number = 0; i < this.values.length; i++) {
            if (this.values[i].getConcept() == concept) {
                this.values[i] = b;
            }
        }
        return;
    }

    public getQueryable(): interfaces.Queryable {
        if (this.queryable == null) {
            this.queryable = sdmx.SdmxIO.connect(this.dataservice);
            this.queryable.getRemoteRegistry().findDataStructure(this.getDataflow().getStructure());
        }
        return this.queryable;
    }

    public getModel(): model.Model {
        return this.model;
    }
    public doQuery(): Promise<message.DataMessage> {
        return this.dataMessage = this.getQueryable().getRepository().query(this.query);
    }

    public update() {
        this.doCube();
        this.cube.dump();
    }
    public doCube() {
        this.cube = new data.Cube(this.getDataStructure(), this.getRegistry());
        for (var i: number = 0; i < this.dataMessage.getDataSet(0).size(); i++) {
            this.cube.putObservation(null, this.dataMessage.getDataSet(0).getColumnMapper(), this.dataMessage.getDataSet(0).getFlatObs(i));
        }
        return this.cube;
    }

    public doUpdate() {
        // If Message has 0 observations, cube.getRootCubeDimension() is null
        var p: Promise<message.DataMessage> = null;
        if (this.model == null || this.isRequery() || this.cube == null || this.cube.getRootCubeDimension() == null) {
            p = this.doQuery();
            p.then(function (msg: message.DataMessage) {
                this.setDirty(true);
                this.update();
            });
            return p;
        }
    }

    /**
     * @return the dirty
     */
    public isDirty(): boolean {
        return this.dirty;
    }

    /**
     * @return the adapter
     */
    public getAdapter(): adapter.Adapter {
        return this.adapter;
    }

    /**
     * @return the requery
     */
    public isRequery(): boolean {
        return this.requery;
    }

    public getQuery(): data.Query {
        return this.query;
    }
    public getBindingCurrentValues(concept: string): Array<structure.ItemType> {
        var array = this.query.getQueryKey(concept).getValues();
        var result: Array<structure.ItemType> = [];
        for (var i: number = 0; i < array.length; i++) {
            result.push(this.query.getQueryKey(concept).getItemScheme().findItemString(array[i]));
        }
        return result;
    }
    public setBindingCurrentValues(concept: string, items: Array<structure.ItemType>) {
        this.setRequery(true);
        this.setDirty(true);
        this.query.getQueryKey(concept).clear();
        for (var i: number = 0; i < items.length; i++) {
            this.query.getQueryKey(concept).addValue(items[i].getId().toString());
        }
    }
    public setBindingCurrentValue(concept: string, item: structure.ItemType) {
        this.setRequery(true);
        this.setDirty(true);
        this.query.getQueryKey(concept).clear();
        this.query.getQueryKey(concept).addValue(item.getId().toString());
    }
    public setBindingCurrentValuesString(concept: string, items: Array<string>) {
        this.query.getQueryKey(concept).clear();
        for (var i: number = 0; i < items.length; i++) {
            this.query.getQueryKey(concept).addValue(items[i]);
        }
    }
    public getBindingCurrentValuesString(concept: string): Array<string> {
        var array = this.query.getQueryKey(concept).getValues();
        return array;
    }
    public getBindingCurrentValue(concept: string): structure.ItemType {
        if (this.query.getQueryKey(concept).getValues().length > 0) {
            return data.ValueTypeResolver.resolveCode(this.queryable.getRemoteRegistry().getLocalRegistry(), this.getDataStructure(), concept, this.query.getQueryKey(concept).getValues()[0]);
        } else return null;
    }
    public addBindingCurrentValue(concept: string, value: string) {
        this.setRequery(true);
        this.setDirty(true);
        return this.query.getQueryKey(concept).addValue(value);

    }
    public removeBindingCurrentValue(concept: string, value: string) {
        this.setRequery(true);
        this.setDirty(true);
        return this.query.getQueryKey(concept).removeValue(value);
    }
    public getDimensionBinding(i: number): bindings.BoundTo {
        return this.bindings[i];
    }
    public getBinding(c: string): bindings.BoundTo {
        for (var i: number = 0; i < this.bindings.length; i++) {
            if (this.bindings[i].getConcept() == c) return this.bindings[i];
        }
        if (this.time != null && this.time.getConcept() == c) return this.time;
        if (this.crossSection != null && this.crossSection.getConcept() == c) {
            return this.crossSection;
        }
        return null;
    }
    public getDataService(): string {
        return this.dataservice;
    }
    public setDataService(s: string) {
        this.dataservice = s;
    }
}
