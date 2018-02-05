console.log("0.1");
import * as message from "../sdmx/message";
console.log("0.2");
import * as sdmx from "../sdmx";
console.log("0.3");
import * as interfaces from "../sdmx/interfaces";
console.log("0.4");
import * as adapter from "../visual/adapter";
console.log("0.5");
import * as model from "../visual/model";
console.log("0.6");
import * as data from "../sdmx/data";
console.log("0.7");
import * as common from "../sdmx/common";
console.log("0.8");
import * as structure from "../sdmx/structure";
console.log("0.9");
import * as commonreferences from "../sdmx/commonreferences";
console.log("1.0");
import * as bindings from "../visual/bindings";
console.log("1.1");
console.log('17');
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

    private visualId:string = "#render";
    private controlsId:string = "#controls";


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
        return this.getDataStructure().getDataStructureComponents().getDimensionList().getDimensions().length;
    }
    public dimSize(): number {
        return this.getDataStructure().getDataStructureComponents().getDimensionList().getDimensions().length;
    }
    public init() {
        this.query = new data.Query(this.df,this.queryable.getRemoteRegistry().getLocalRegistry());
        this.bindings = [];
        this.bindingsColumnMapper = new data.FlatColumnMapper();
        for (var i: number = 0; i < this.dimSize(); i++) {
            var dim: structure.Dimension = this.getDataStructure().getDataStructureComponents().getDimensionList().getDimensions()[i];
            var b: bindings.BoundTo = new bindings.BoundToDropdown(this, dim.getId().toString());
            this.bindingsColumnMapper.registerColumn(dim.getId().toString(), data.AttachmentLevel.OBSERVATION);
            this.bindings.push(b);
        }
        var b2:bindings.BoundTo = new bindings.BoundToContinuousY(this, this.getDataStructure().getDataStructureComponents().getMeasureList().getPrimaryMeasure().getId().toString());
        this.values = [];
        this.values.push(b2);
        if (this.getDataStructure().getDataStructureComponents().getDimensionList().getTimeDimension() != null) {
            var b3:bindings.BoundTo = new bindings.BoundToTimeX(this, this.getDataStructure().getDataStructureComponents().getDimensionList().getTimeDimension().getId().toString());
            this.time=b3;
        }
        if (this.getDataStructure().getDataStructureComponents().getDimensionList().getMeasureDimension()!=null) {
            //var b4:bindings.BoundTo = new bindings.Bound
            //this.crossSection=b4;
        }
    }
    public isDirty() { return this.dirty; }
    public setDirty(dirty: boolean) {
        this.dirty = dirty;
    }
    public setRequery(requery: boolean) {
        this.requery = requery;
    }

   public getCube(){
       if(this.isDirty()&&this.dataMessage!=null){
           this.doCube();
           return this.cube;
       }
       if(this.isRequery()){
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

    public doCube() {
        this.model=null;
        this.dirty=false;
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
                this.dataMessage=msg;
                return this.doCube();
            }.bind(this));
        }
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
        } else {
        console.log(this.query);
        console.log("Returning null from "+concept);
        
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
    public getValues():Array<bindings.BoundToContinuous> {
        return this.values;
    }
    public clearTime(){}
    /*
    public getCrossSection():bindings.BoundToCrossSection {
        return this.crossSection;
    }
    */
   public getBindings() { return this.bindings; }
   public getVisualId(){  return this.visualId; }
   public getControlsId() { return this.controlsId; }
   public setVisualId(s:string) { this.visualId=s; }
   public setControlsId(s:string) { this.controlsId=s; }
   public setAdapter(ad:adapters.Adapter) {
       if(ad.canCreateModelFromVisual(this) ) {
           this.adapter=ad;
           this.render();
       }
   }
   public render() {
       console.log(this.query);
       var p = null;
       if(this.isRequery()) {
           this.model=null;
           p=this.doUpdate();
       }
       if(this.isDirty()){
           this.model=null;
           if(p!=null){
               p=p.then(function(msg){return this.doCube();}.bind(this));
           }else{
               doCube();
           }
       }
       if(this.model!=null ) {return this.model;}
       if(p!=null){
          p=p.then(function(cube){this.model=this.adapter.createModel(this,this.cube);this.model.render(this.visualId,this.controlsId) }.bind(this));
       }
       else{
          this.model=this.adapter.createModel(this,this.cube);
          this.model.render(this.visualId,this.controlsId)
       }
   }
   public renderVisual() {
       var p = null;
       if(this.isRequery()) {
           if(this.model!=null){this.model.unrender(this.visualId,null);}
           this.model=null;
           p=this.doUpdate();
       }
       if(this.isDirty()){
           if(this.model!=null){this.model.unrender(this.visualId,null);
           this.model=null;
           // Shouldn't Need To DoCube again
           //this.doCube();
           this.model=this.adapter.createModel(this,this.cube);
           this.model.render(this.visualId,null)
           }
       }
       if(this.model!=null ) {return this.model;}
       if(p!=null){
          p=p.then(function(cube){
              this.model=this.adapter.createModel(this,this.cube);
              this.model.render(this.visualId,null) }.bind(this));
       }
   }
   public getPercentOf() {
       for(var i:number = 0; i<this.bindings.length;i++) {
           if( this.bindings[i].getPercentOf!=null&&this.bindings[i].getPercentOf()!=null){ return this.bindings[i];}
       }
       if( this.time!=null&&this.time.getPercentOf!=null&&this.time.getPercentOf()!=null ){ return this.time;}
       for(var i:number = 0; i<this.values.length;i++) {
           if( this.values[i].getPercentOf!=null&&this.values[i].getPercentOf()!=null){ return this.values[i];}
       }
   }
   public getPrimaryMeasure() {
       return this.findBinding(this.getDataStructure().getDataStructureComponents().getMeasureList().getPrimaryMeasure().getId().toString());
   }
   public getSeries():bindings.BoundTo {
       for(var i:number = 0; i<this.bindings.length;i++) {
           if( this.bindings[i].getBoundTo()==bindings.BoundTo.BOUND_DISCRETE_SERIES){ return this.bindings[i];}
       }
       if( this.time!=null&&this.time.getBoundTo()==bindings.BoundTo.BOUND_TIME_SERIES) ){ return this.time;}
       if( this.crossSection!=null&&this.crossSection.getBoundTo()==bindings.BoundTo.BOUND_MEASURES_SERIES) ){ return this.crossSection;}
       return null;
   }
   public getX():bindings.BoundTo {
       for(var i:number = 0; i<this.bindings.length;i++) {
           if( this.bindings[i].getBoundTo()==bindings.BoundTo.BOUND_DISCRETE_X){ return this.bindings[i];}
       }
       if( this.time!=null&&this.time.getBoundTo()==bindings.BoundTo.BOUND_TIME_X) ){ return this.time;}
       if( this.crossSection!=null&&this.crossSection.getBoundTo()==bindings.BoundTo.BOUND_MEASURES_X) ){ return this.crossSection;}
       return null;
   }
}
