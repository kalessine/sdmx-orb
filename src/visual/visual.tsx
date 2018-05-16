import * as message from "../sdmx/message";
import * as sdmx from "../sdmx";
import * as interfaces from "../sdmx/interfaces";
import * as adapter from "../visual/adapter";
import * as model from "../visual/model";
import * as data from "../sdmx/data";
import * as common from "../sdmx/common";
import * as structure from "../sdmx/structure";
import * as commonreferences from "../sdmx/commonreferences";
import * as bindings from "../visual/bindings";
export var embed = function (v) {
    var vis = new Visual();
    vis.parseVisualObject(v);
}
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

    private visualId: string = "render";

    private requery: boolean = true;
    private dirty: boolean = true;

    private dataMessage: message.DataMessage = null;
    private cube: data.Cube = null;
    private query: data.Query = null;
    private adapterInstance: adapter.Adapter = null;
    private model: adapter.Model = null;
    private modelWrapper: adapter.ModelWrapper = null;

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
        this.dataservice = q.getDataService();
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
        return this.getQueryable().getRemoteRegistry().getLocalRegistry().findDataStructure(this.df.getStructure());
    }
    public size(): number {
        return this.getDataStructure().getDataStructureComponents().getDimensionList().getDimensions().length;
    }
    public dimSize(): number {
        return this.getDataStructure().getDataStructureComponents().getDimensionList().getDimensions().length;
    }
    public init() {
        this.query = new data.Query(this.df, this.queryable.getRemoteRegistry().getLocalRegistry());
        this.bindings = [];
        this.bindingsColumnMapper = new data.FlatColumnMapper();
        for (var i: number = 0; i < this.dimSize(); i++) {
            var dim: structure.Dimension = this.getDataStructure().getDataStructureComponents().getDimensionList().getDimensions()[i];
            var b: bindings.BoundTo = new bindings.BoundToDropdown(this, dim.getId().toString());
            this.bindingsColumnMapper.registerColumn(dim.getId().toString(), data.AttachmentLevel.OBSERVATION);
            this.bindings.push(b);
        }

        if (this.getDataStructure().getDataStructureComponents().getDimensionList().getTimeDimension() != null) {
            var b3: bindings.BoundTo = new bindings.BoundToTimeX(this, this.getDataStructure().getDataStructureComponents().getDimensionList().getTimeDimension().getId().toString());
            this.time = b3 as bindings.BoundToTime;
        }
        if (this.getDataStructure().getDataStructureComponents().getDimensionList().getMeasureDimension() != null) {
            var b4: bindings.BoundTo = new bindings.BoundToDropdown(this, this.getDataStructure().getDataStructureComponents().getDimensionList().getMeasureDimension().getId().toString());
            this.crossSection = b4;
        }
        var b2: bindings.BoundTo = new bindings.BoundToContinuousY(this, this.getDataStructure().getDataStructureComponents().getMeasureList().getPrimaryMeasure().getId().toString());
        this.values = [];
        this.values.push(b2 as bindings.BoundToContinuous);
    }
    public isDirty() {return this.dirty;}
    public setDirty(dirty: boolean) {
        this.dirty = dirty;
    }
    public setRequery(requery: boolean) {
        this.requery = requery;
    }

    public getCube() {
        if (this.isDirty() && this.dataMessage != null) {
            this.doCube();
            return this.cube;
        }
        if (this.isRequery()) {
            this.doQuery();
            return this.doUpdate();
        }
        return this.cube;
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
            this.time = b as bindings.BoundToTime;
        }
        if (this.crossSection != null && this.crossSection.getConcept() == concept) {
            this.crossSection = b;
            if (this.crossSection.getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_CROSS_MULTIPLE) {
                this.values = [];
                for (var i: number = 0; i < this.crossSection.getAllValues().length; i++) {
                    var bc = new bindings.BoundToContinuous(this, this.crossSection.getAllValuesString()[i]);
                    this.values.push(bc);
                }
            } else {
                this.values = [];
                var bc = new bindings.BoundToContinuous(this, this.getDataStructure().getDataStructureComponents().getMeasureList().getPrimaryMeasure().getId().toString());
                this.values.push(bc);
            }
        }
        for (var i: number = 0; i < this.values.length; i++) {
            if (this.values[i].getConcept() == concept) {
                this.values[i] = b as bindings.BoundToContinuous;
            }
        }
        return;
    }

    public getQueryable(): interfaces.Queryable {
        if (this.queryable == null) {
            this.queryable = sdmx.SdmxIO.connect(this.dataservice);
        }
        return this.queryable;
    }

    public getModel(): model.Model {
        return this.model;
    }
    public doQuery(): Promise<message.DataMessage> {
        return this.dataMessage = this.getQueryable().getRepository().query(this.query);
    }

    public doCube() {
        this.model = null;
        this.dirty = false;
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
            return p.then(function (msg: message.DataMessage) {
                this.setDirty(true);
                this.setRequery(false);
                this.dataMessage = msg;
                return this.doCube();
            }.bind(this));
        }
    }

    /**
     * @return the adapter
     */
    public getAdapter(): adapter.Adapter {
        return this.adapterInstance;
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
        var result: Array<structure.ItemType> = [];
        for (var i: number = 0; i < this.query.getQueryKey(concept).size(); i++) {
            result.push(this.query.getQueryKey(concept).getItemScheme().findItemString(this.query.getQueryKey(concept).get(i)));
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
        if (this.query.getQueryKey(concept).size() > 0) {
            return data.ValueTypeResolver.resolveCode(this.queryable.getRemoteRegistry().getLocalRegistry(), this.getDataStructure(), concept, this.query.getQueryKey(concept).getValues()[0]);
        } else {
            console.log(this.query);
            console.log("Returning null from " + concept);

            return null;
        }
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
    public getBinding(idx: number): bindings.BoundTo {
        return this.bindings[idx];
    }
    public getDataService(): string {
        return this.dataservice;
    }
    public setDataService(s: string) {
        this.dataservice = s;
    }
    public getTime() {
        return this.time;
    }
    public getValues(): Array<bindings.BoundToContinuous> {
        return this.values;
    }
    public clearTime() {}
    public getCrossSection(): bindings.BoundTo {
        return this.crossSection;
    }
    public getBindings() {return this.bindings;}
    public getVisualId() {return this.visualId;}
    public setVisualId(s: string) {this.visualId = s;}
    public setAdapter(ad: adapter.Adapter) {
        if (ad.canCreateModelFromVisual(this)) {
            this.adapterInstance = ad;
        }
    }
    public render() {
        console.log(this.query);
        var p = null;
        if (this.isRequery()) {
            this.model = null;
            p = this.doUpdate();
        }
        if (this.isDirty()) {
            this.model = null;
            if (p != null) {
                p = p.then(function (msg) {return this.doCube();}.bind(this));
            } else {
                this.doCube();
            }
        }
        if (this.model != null) {return this.model;}
        if (p != null) {
            p = p.then(function (cube) {
                this.model = this.adapterInstance.createModel(this, this.cube);
                if (this.modelWrapper == null) {this.modelWrapper = new adapter.ModelWrapper();}
                this.modelWrapper.setModel(this.model);
                this.modelWrapper.setVisual(this);
                this.modelWrapper.render(this.visualId);
            }.bind(this));
        }
        else {
            this.model = this.adapterInstance.createModel(this, this.cube);
            if (this.modelWrapper == null) {this.modelWrapper = new adapter.ModelWrapper();}
            this.modelWrapper.setModel(this.model);
            this.modelWrapper.setVisual(this);
            this.modelWrapper.render(this.visualId);
        }
    }
    public renderVisual() {
        var p = null;
        if (this.isRequery()) {
            if (this.model != null) {}
            this.model = null;
            p = this.doUpdate();
        }
        if (this.isDirty()) {
            if (this.model != null) {
                this.model = null;
                // Shouldn't Need To DoCube again
                //this.doCube();
                this.model = this.adapterInstance.createModel(this, this.cube);
                if (this.modelWrapper == null) {this.modelWrapper = new adapter.ModelWrapper();}
                this.modelWrapper.setModel(this.model);
                this.modelWrapper.setVisual(this);
                this.modelWrapper.render(this.visualId);
            }
        }
        if (this.model != null) {return this.model;}
        if (p != null) {
            p = p.then(function (cube) {
                this.model = this.adapterInstance.createModel(this, this.cube);
                if (this.modelWrapper == null) {this.modelWrapper = new adapter.ModelWrapper();}
                this.modelWrapper.setModel(this.model);
                this.modelWrapper.setVisual(this);
                this.modelWrapper.render(this.visualId);
            }.bind(this));
        }
    }
    public getPercentOf(): bindings.BoundTo {
        for (var i: number = 0; i < this.bindings.length; i++) {
            if (typeof this.bindings[i].getPercentOfId === "function" && this.bindings[i].getPercentOfId() != null) {return this.bindings[i];}
        }
        if (this.crossSection != null && typeof this.crossSection.getPercentOfId === "function" && this.crossSection.getPercentOfId() != null) {return this.crossSection;}
        if (this.time != null && typeof this.time.getPercentOfId === "function" && this.time.getPercentOfId() != null) {return this.time;}

        for (var i: number = 0; i < this.values.length; i++) {
            if (typeof this.values[i].getPercentOfId === "function" && this.values[i].getPercentOfId() != null) {return this.values[i];}
        }
        return null;
    }
    public getPrimaryMeasure() {
        return this.findBinding(this.getDataStructure().getDataStructureComponents().getMeasureList().getPrimaryMeasure().getId().toString());
    }
    public getSeries(): bindings.BoundTo {
        for (var i: number = 0; i < this.bindings.length; i++) {
            if (this.bindings[i].getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_SERIES) {return this.bindings[i];}
        }
        if (this.time != null && this.time.getBoundTo() == bindings.BoundTo.BOUND_TIME_SERIES) {return this.time;}
        if (this.crossSection != null && this.crossSection.getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_SERIES) {return this.crossSection;}
        return null;
    }
    public getArea(): bindings.BoundToArea {
        for (var i: number = 0; i < this.bindings.length; i++) {
            if (this.bindings[i].getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_AREA) {return this.bindings[i];}
        }
        return null;
    }
    public getX(): bindings.BoundTo {
        for (var i: number = 0; i < this.bindings.length; i++) {
            if (this.bindings[i].getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_X) {return this.bindings[i];}
        }
        if (this.time != null && this.time.getBoundTo() == bindings.BoundTo.BOUND_TIME_X) {return this.time;}
        return null;
    }
    public getMenu(k: number) {
        var j: number = -1;
        for (var i: number = 0; i < this.bindings.length; i++) {
            if (this.bindings[i].getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_SINGLE_MENU) {
                j++;
                if (j == k) {
                    return this.bindings[i];
                }
            }
        }
        if (this.time != null && this.time.getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_SINGLE_MENU) {
            j++;
            if (j == k) {
                return this.time;
            }
        }

        if (this.crossSection != null && this.crossSection.getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_SINGLE_MENU) {
            j++;
            if (j == k) {
                return this.crossSection;
            }
        }
        for (var i: number = 0; i < this.bindings.length; i++) {
            if (this.bindings[i].getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_MULTI_MENU) {
                j++;
                if (j == k) {
                    return this.bindings[i];
                }
            }
        }
        if (this.time != null && this.time.getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_MULTI_MENU) {
            j++;
            if (j == k) {
                return this.time;
            }
        }

        if (this.crossSection != null && this.crossSection.getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_MULTI_MENU) {
            j++;
            if (j == k) {
                return this.crossSection;
            }
        }
        for (var i: number = 0; i < this.bindings.length; i++) {
            if (this.bindings[i].getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_LEVEL_MENU) {
                j++;
                if (j == k) {
                    return this.bindings[i];
                }
            }
        }
        if (this.time != null && this.time.getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_LEVEL_MENU) {
            j++;
            if (j == k) {
                return this.time;
            }
        }

        if (this.crossSection != null && this.crossSection.getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_LEVEL_MENU) {
            j++;
            if (j == k) {
                return this.crossSection;
            }
        }
        return null;
    }
    public getMenuCount() {
        var j: number = 0;
        for (var i: number = 0; i < this.bindings.length; i++) {
            if (this.bindings[i].getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_SINGLE_MENU) {
                j++;
            }
        }
        if (this.time != null && this.time.getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_SINGLE_MENU) {
            j++;
        }

        if (this.crossSection != null && this.crossSection.getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_SINGLE_MENU) {
            j++;
        }
        for (var i: number = 0; i < this.bindings.length; i++) {
            if (this.bindings[i].getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_MULTI_MENU) {
                j++;
            }
        }
        if (this.time != null && this.time.getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_MULTI_MENU) {
            j++;
        }

        if (this.crossSection != null && this.crossSection.getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_MULTI_MENU) {
            j++;
        }
        for (var i: number = 0; i < this.bindings.length; i++) {
            if (this.bindings[i].getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_LEVEL_MENU) {
                j++;
            }
        }
        if (this.time != null && this.time.getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_LEVEL_MENU) {
            j++;
        }

        if (this.crossSection != null && this.crossSection.getBoundTo() == bindings.BoundTo.BOUND_DISCRETE_LEVEL_MENU) {
            j++;
        }
        return j;
    }
    public getTitle() {
        return structure.NameableType.toString(this.df);
    }
    public containsValue(b: string, item: structure.ItemType): boolean {
        return this.query.getQueryKey(b).containsValue(item.getId().toString());
    }
    public getItemScheme(concept: string) {
        return this.findBinding(concept).getCodelist();
    }
    public getVisualObject(): object {
        var obj = {};
        if (this.getDataflow() != null) {
            obj["dataservice"] = this.getDataService();
            obj["dataflowAgency"] = this.getDataflow().getAgencyId().toString();
            obj["dataflowId"] = this.getDataflow().getId().toString();
            obj["dataflowVersion"] = this.getDataflow().getVersion().toString();
            obj["dataflowName"] = this.getDataflow().getNames()[0].getText();
            obj["dataflowNameLang"] = this.getDataflow().getNames()[0].getLang();
            obj["structureAgency"] = this.getDataflow().getStructure().getAgencyId().toString();
            obj["structureId"] = this.getDataflow().getStructure().getMaintainableParentId().toString();
            obj["structureVersion"] = this.getDataflow().getStructure().getVersion().toString();
        }
        var struct: structure.DataStructure = this.getDataStructure();
        obj['dimensions'] = {};
        for (var i: number = 0; i < struct.getDataStructureComponents().getDimensionList().getDimensions().length; i++) {
            var dim: structure.Dimension = struct.getDataStructureComponents().getDimensionList().getDimensions()[i];
            var b = this.findBinding(dim.getConceptIdentity().getId().toString());
            var be: bindings.BindingEntry = bindings.BindingRegisterUtil.findBindingEntry(b.getBoundTo());
            obj['dimensions'][b.getConcept()] = be.getSaveBindingToObject()(b);
        }
        var tdim: structure.TimeDimension = struct.getDataStructureComponents().getDimensionList().getTimeDimension();
        if (tdim != null) {
            var tb = this.findBinding(tdim.getConceptIdentity().getId().toString());
            var tbe: bindings.BindingEntry = bindings.BindingRegisterUtil.findBindingEntry(tb.getBoundTo());
            obj['time'] = tbe.getSaveBindingToObject()(tb);
        }
        var cross: structure.MeasureDimension = struct.getDataStructureComponents().getDimensionList().getMeasureDimension();
        if (cross != null) {
            var cb = this.findBinding(cross.getConceptIdentity().getId().toString());
            var cbe: bindings.BindingEntry = bindings.BindingRegisterUtil.findBindingEntry(cb.getBoundTo());
            obj['cross'] = cbe.getSaveBindingToObject()(cb);
        }
        obj['values'] = [];
        for (var i: number = 0; i < this.getValues().length; i++) {
            var b2 = this.getValues()[i];
            var be: bindings.BindingEntry = bindings.BindingRegisterUtil.findBindingEntry(b2.getBoundTo());
            obj['values'][i] = be.getSaveBindingToObject()(b2);
        }
        obj['adapter'] = adapter.adapter2Object(this.adapterInstance);
        return obj;
    }
    public parseVisualObject(obj) {
        this.setDataService(obj["dataservice"]);
        var ref = sdmx.SdmxIO.reference(obj["structureAgency"], obj["structureId"], obj["structureVersion"], null);
        var df: structure.Dataflow = new structure.Dataflow();
        df.setAgencyId(obj["dataflowAgency"]);
        df.setId(obj["dataflowId"]);
        df.setVersion(obj["dataflowVersion"]);
        df.setNames([new common.Name(obj["dataflowNameLang"], obj["dataflowName"])]);
        df.setStructure(ref);
        this.setDataflow(df);
        var struct = this.getQueryable().getRemoteRegistry().findDataStructure(df.getStructure()).then(function (struct) {
            this.init();
            for (var i: number = 0; i < struct.getDataStructureComponents().getDimensionList().getDimensions().length; i++) {
                var dim: structure.Dimension = struct.getDataStructureComponents().getDimensionList().getDimensions()[i];
                console.log("TypeId=" + obj["dimensions"][dim.getId().toString()].typeid);
                var be: bindings.BindingEntry = bindings.BindingRegisterUtil.findBindingEntry(obj["dimensions"][dim.getId().toString()].typeid);
                var b = be.getParseObjectToBinding()(obj["dimensions"][dim.getId().toString()], this);
                this.setBinding(b);
            }
            var tdim: structure.TimeDimension = struct.getDataStructureComponents().getDimensionList().getTimeDimension();
            if (tdim != null) {
                var tbe: bindings.BindingEntry = bindings.BindingRegisterUtil.findBindingEntry(obj["time"].typeid);
                var tb = be.getParseObjectToBinding()(obj["time"], this);
                tb.init();
                console.log("Time");
                console.log(tb);
                console.log(tbe);
                this.setBinding(tb);
            }
            var cross: structure.MeasureDimension = struct.getDataStructureComponents().getDimensionList().getMeasureDimension();
            if (cross != null) {
                var cb: bindings.BindingEntry = bindings.BindingRegisterUtil.findBindingEntry(obj["cross"].typeid);
                var cbp = be.getParseObjectToBinding()(obj["cross"], this);
                this.setBinding(cbp);
            }
            for (var i: number = 0; i < obj["values"].length; i++) {
                var val = obj["values"][i];
                var bep: bindings.BindingEntry = bindings.BindingRegisterUtil.findBindingEntry(obj["values"][i].typeid);
                var v = bep.getParseObjectToBinding()(obj["values"][i], this);
                this.setBinding(v);
            }
            this.adapterInstance = adapter.object2Adapter(obj["adapter"]);
            this.check();
            this.renderVisual();
        }.bind(this));
    }
    public check() {

        for (var i: number = 0; i < this.dimSize(); i++) {
            var dim: structure.Dimension = this.getDataStructure().getDataStructureComponents().getDimensionList().getDimensions()[i];
            var b: bindings.BoundTo = this.findBinding(dim.getId().toString());
            if (b == null) {
                throw new Error("Unable to find Dimension:" + dim.getId().toString());
            }
        }

        if (this.getDataStructure().getDataStructureComponents().getDimensionList().getTimeDimension() != null) {
            var tdim: structure.TimeDimension = this.getDataStructure().getDataStructureComponents().getDimensionList().getTimeDimension();
            var b3: bindings.BoundTo = this.findBinding(tdim.getId().toString());
            if (b3 == null) {
                throw new Error("Unable to find Dimension:" + tdim.getId().toString());
            }
        }
        if (this.getDataStructure().getDataStructureComponents().getDimensionList().getMeasureDimension() != null) {
            var mdim: structure.MeasureDimension = this.getDataStructure().getDataStructureComponents().getDimensionList().getMeasureDimension();
            var b4: bindings.BoundTo = this.findBinding(mdim.getId().toString());
            if (b4 == null) {
                throw new Error("Unable to find Dimension:" + mdim.getId().toString());
            }
        }
        if (this.getCrossSection() != null && this.getCrossSection().getBoundTo() == bindings.BoundTo.BOUND_MEASURES_INDIVIDUAL) {
            for (var i: number = 0; i < this.getCrossSection().getAllValues().length; i++) {
                var m: structure.ItemType = this.getCrossSection().getAllValues()[i];
                var b6: bindings.BoundTo = this.findBinding(m.getId().toString());
                if (b6 == null) {
                    throw new Error("Unable to find Dimension:" + m.getId().toString());
                }
            }
        } else {
            var pm: structure.PrimaryMeasure = this.getDataStructure().getDataStructureComponents().getMeasureList().getPrimaryMeasure();
            var b5: bindings.BoundTo = this.findBinding(pm.getId().toString());
            if (b5 == null) {
                throw new Error("Unable to find Dimension:" + pm.getId().toString());
            }
        }
    }
}
