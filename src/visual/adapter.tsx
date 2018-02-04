//import * as collections from 'collections';
import * as React from 'preact-compat';
import { h } from 'preact';
import * as visual from './visual';
import * as sdmxdata from '../sdmx/data';
import * as commonreferences from '../sdmx/commonreferences';
import * as structure from '../sdmx/structure';

import * as model from 'model';
import * as sdmxtime from '../sdmx/time';
import * as bindings from './bindings';
import * as Chartist from '../chartist';
import Controls from './controls';


export interface Model {
    render(s: string, c: string);
    unrender(s: string, c: string);
}
export interface Adapter {
    getName(): string;
    canCreateModelFromVisual(v: visual.Visual): boolean;
    createModel(v: visual.Visual, cube: sdmxdata.Cube): Model;
    setSingleValues(key: data.PartialKey): void;
    addSingleDataPoint(key: data.PartialKey): void;
    addCrossSectionalDataPoint(key: data.PartialKey, crossSections: collections.Dictionary): void;
}
export class SparklineAdapter implements Adapter {
    private singleValues: sdmxdata.PartialKey = null;
    private visual: visual.Visual = null;
    private min: number = null;
    private max: number = null;
    private minDate: Date = null;
    private maxDate: Date = null;
    private model = new ChartistSparklineModel();
    constructor() {
    }

    public createModel(visual: visual.Visual, cube: sdmxdata.Cube): model.Model {
        this.visual = visual;
        this.model = new ChartistSparklineModel();
        this.model.setVisual(visual);
        this.min = null;
        this.max = null;
        this.minDate = null;
        this.maxDate = null;
        if (cube.then != null) {
            return cube.then(function(cube2) {
                var cu: CubeWalkUtils = new CubeWalkUtils();
                cu.visitRoot(cube2, visual, this);
                if (visual.getValues()[0].getSharedMaximum()) {
                    this.model.setHigh(this.max);
                }
                if (visual.getValues()[0].getZeroOrigin()) {
                    this.model.setLow(this.min);
                }
                return this.model;
            }.bind(this));
        } else {
            var cu: CubeWalkUtils = new CubeWalkUtils();
            cu.visitRoot(cube, visual, this);
            if (visual.getValues()[0].getSharedMaximum()) {
                this.model.setHigh(this.max);
            }
            if (visual.getValues()[0].getZeroOrigin()) {
                this.model.setLow(this.min);
            }
            return this.model;
        }
    }

    public canCreateModelFromVisual(visual: visual.Visual): boolean {
        var singleBinds: number = 0;
        var multiBinds: number = 0;
        var continuousBinds: number = 0;
        var time: number = 0;
        var series: number = 0;
        var list: number = 0;
        for (var i: number = 0; i < visual.size(); i++) {
            var b = visual.getBinding(i);
            if (b.expectValues() > 1) {
                multiBinds++;
            } else {
                singleBinds++;
            }
            if (b instanceof bindings.BoundToTimeSeries) {
                series++;
                return false;
            }
            if (b instanceof bindings.BoundToTimeList) {
                list++;
                return false;
            }
            if (b instanceof bindings.BoundToSeries) {
                series++;
                return false;
            }
            if (b instanceof bindings.BoundToList) {
                list++;
                return false;
            }
        }
        if (visual.getTime() != null && visual.getTime() instanceof bindings.BoundToTimeX) {
            time = 1;
        }
        if (time == 1 && visual.getValues().length == 1) {
            return true;
        }
        return false;
    }

    public getName(): string {
        return "SingleSparkline";
    }

    public setSingleValues(key: sdmxdata.PartialKey): void {
        this.singleValues = key;
    }

    public addSingleDataPoint(key: sdmxdata.PartialKey): void {
        var time: string = this.visual.getTime().getConcept();
        var val: string = this.visual.getPrimaryMeasure().getConcept();
        var timeVal: string = structure.NameableType.toIDString(key.getComponent(time));
        var v1: number = parseFloat(key.getComponent(val));
        if (this.min == null || v1 < this.min) {
            this.min = v1;
        }
        if (this.max == null || v1 > this.max) {
            this.max = v1;
        }
        var s: string = structure.NameableType.toIDString(timeVal);
        var freq: string = structure.NameableType.toString(this.singleValues.getComponent("FREQ"));
        if (freq == null || "" == freq) {
            freq = structure.NameableType.toString(this.singleValues.getComponent("FREQUENCY"));
        }
        if (freq == null || "" == freq) {
            freq = structure.NameableType.toString(this.singleValues.getComponent("TIME_FORMAT"));
        }
        if (freq == null || "" == freq) {
            freq = structure.NameableType.toString(key.getComponent("FREQ"));
        }
        if (freq == null || "" == freq) {
            freq = structure.NameableType.toString(key.getComponent("FREQUENCY"));
        }
        if (freq == null || "" == freq) {
            freq = structure.NameableType.toString(key.getComponent("TIME_FORMAT"));
        }
        var rtd: sdmxtime.RegularTimePeriod = sdmxtime.TimeUtil.parseTime(freq, s);
        if (rtd != null) {
            var d: Date = new Date(rtd.getFirstMillisecond());
            if (this.minDate == null || this.minDate.getTime() > d.getTime()) {
                this.minDate = d;
            }
            if (this.maxDate == null || this.maxDate.getTime() < d.getTime()) {
                this.maxDate = d;
            }
        }
        this.model.addPoint(timeVal, v1);
    }

    addCrossSectionalDataPoint(key: sdmxdata.PartialKey, crossSections: collections.Dictionary): void {

    }

}

export class ChartistSparklineModel implements Model {
    private visual: visual.Visual = null;
    private chartist = null;
    private controls = null;
    private data = {
        labels: [],
        series: []
    };
    private options = {
        width: "700px",
        height: "700px",
        lineSmooth: Chartist.Interpolation.cardinal({
            tension: 0.2
        }),
        fullWidth: true,
        chartPadding: {
            right: 40
        },
        high: 100,
        low: 0
    };
    public addPoint(x: string, y: number) {
        this.data.labels.push(x);
        if (this.data.series.length == 0) {
            this.data.series.push({ data: [] });
        }
        this.data.series[0].data.push(y);
    }
    public render(s: string, c: string) {
        if (s != null) {
            this.chartist = new Chartist.Line(s, this.data, this.options, {} as any);
        }
        if (c != null) { React.render(<Controls visual={this.visual} />, document.querySelector(c)); }
    }
    public unrender(s: string, c: string) {
        if (s != null) {
            if (this.chartist != null) {
                this.chartist.detach();
            }
            //document.querySelector(s).html="";
        }
        if (c != null) { document.querySelector(c).html = ""; }
    }
    private setVisual(v: visual.Visual) {
        this.visual = v;
    }
    public setHigh(n: number) {
        this.options.high = n;
    }
    public setLow(n: number) {
        this.options.low = n;
    }
}/*
export class SeriesSparklineAdapter implements Adapter {
    private singleValues: sdmxdata.PartialKey = null;
    private visual: visual.Visual = null;
    private min: number = null;
    private max: number = null;
    private minDate: Date = null;
    private maxDate: Date = null;
    private model = new ChartistSeriesSparklineModel();
    constructor() {
    }

    public createModel(visual: visual.Visual, cube: sdmxdata.Cube): model.Model {
        this.visual = visual;
        this.model = new ChartistSeriesSparklineModel();
        this.model.setVisual(visual);
        this.min = null;
        this.max = null;
        this.minDate = null;
        this.maxDate = null;
        if (cube.then != null) {
            return cube.then(function(cube2) {
                var cu: CubeWalkUtils = new CubeWalkUtils();
                cu.visitRoot(cube2, visual, this);
                if (visual.getValues()[0].getSharedMaximum()) {
                    this.model.setHigh(this.max);
                }
                if (visual.getValues()[0].getZeroOrigin()) {
                    this.model.setLow(this.min);
                }
                return this.model;
            }.bind(this));
        } else {
            var cu: CubeWalkUtils = new CubeWalkUtils();
            cu.visitRoot(cube, visual, this);
            if (visual.getValues()[0].getSharedMaximum()) {
                this.model.setHigh(this.max);
            }
            if (visual.getValues()[0].getZeroOrigin()) {
                this.model.setLow(this.min);
            }
            return this.model;
        }
    }

    public canCreateModelFromVisual(visual: visual.Visual): boolean {
        var singleBinds: number = 0;
        var multiBinds: number = 0;
        var continuousBinds: number = 0;
        var time: number = 0;
        var series: number = 0;
        var list: number = 0;
        for (var i: number = 0; i < visual.size(); i++) {
            var b = visual.getBinding(i);
            if (b.expectValues() > 1) {
                multiBinds++;
            } else {
                singleBinds++;
            }
            if (b instanceof bindings.BoundToTimeSeries) {
                series++;
                return false;
            }
            if (b instanceof bindings.BoundToTimeList) {
                list++;
                return false;
            }
            if (b instanceof bindings.BoundToSeries) {
                series++;
            }
            if (b instanceof bindings.BoundToList) {
                list++;
                return false;
            }
        }
        if (visual.getTime() != null && visual.getTime() instanceof bindings.BoundToTimeX) {
            time = 1;
        }
        if (time == 1 && visual.getValues().length == 1 && series == 1) {
            return true;
        }
        return false;
    }

    public getName(): string {
        return "SeriesSparkline";
    }

    public setSingleValues(key: sdmxdata.PartialKey): void {
        this.singleValues = key;
    }

    public addSingleDataPoint(key: sdmxdata.PartialKey): void {
        var time: string = this.visual.getTime().getConcept();
        var val: string = this.visual.getPrimaryMeasure().getConcept();
        var timeVal: string = structure.NameableType.toIDString(key.getComponent(time));
        var v1: number = parseFloat(key.getComponent(val));
        var ser: string = key.getComponent(this.visual.getSeries().getConcept());
        if (this.min == null || v1 < this.min) {
            this.min = v1;
        }
        if (this.max == null || v1 > this.max) {
            this.max = v1;
        }
        var s: string = structure.NameableType.toIDString(timeVal);
        var freq: string = structure.NameableType.toString(this.singleValues.getComponent("FREQ"));
        if (freq == null || "" == freq) {
            freq = structure.NameableType.toString(this.singleValues.getComponent("FREQUENCY"));
        }
        if (freq == null || "" == freq) {
            freq = structure.NameableType.toString(this.singleValues.getComponent("TIME_FORMAT"));
        }
        if (freq == null || "" == freq) {
            freq = structure.NameableType.toString(key.getComponent("FREQ"));
        }
        if (freq == null || "" == freq) {
            freq = structure.NameableType.toString(key.getComponent("FREQUENCY"));
        }
        if (freq == null || "" == freq) {
            freq = structure.NameableType.toString(key.getComponent("TIME_FORMAT"));
        }
        var rtd: sdmxtime.RegularTimePeriod = sdmxtime.TimeUtil.parseTime(freq, s);
        if (rtd != null) {
            var d: Date = new Date(rtd.getFirstMillisecond());
            if (this.minDate == null || this.minDate.getTime() > d.getTime()) {
                this.minDate = d;
            }
            if (this.maxDate == null || this.maxDate.getTime() < d.getTime()) {
                this.maxDate = d;
            }
        }
        this.model.addPoint(ser, timeVal, v1);
    }

    addCrossSectionalDataPoint(key: sdmxdata.PartialKey, crossSections: collections.Dictionary): void {

    }

}

export class ChartistSeriesSparklineModel implements Model {
    private visual: visual.Visual = null;
    private chartist = null;
    private controls = null;
    private data = {
        labels: [],
        series: []
    };
    private options = {
        width: "700px",
        height: "700px",
        lineSmooth: Chartist.Interpolation.cardinal({
            tension: 0.2
        }),
        fullWidth: true,
        chartPadding: {
            right: 40
        },
        high: 100,
        low: 0
    };
    public addPoint(ser: string, x: string, y: number) {
        if (!collections.arrays.contains(this.data.labels, x)) {
            this.data.labels.push(x);
        }
        if (this.data.series[ser] == null) {
            this.data.series[ser] = { data: [] };
        }
        this.data.series[ser].data.push(y);
    }
    public render(s: string, c: string) {
        if (s != null) {
            this.chartist = new Chartist.Line(s, this.data, this.options, {} as any);
        }
        if (c != null) { React.render(<Controls visual={this.visual} />, document.querySelector(c)); }
    }
    public unrender(s: string, c: string) {
        if (s != null) {
            if (this.chartist != null) {
                this.chartist.detach();
            }
            //document.querySelector(s).html="";
        }
        if (c != null) { document.querySelector(c).html = ""; }
    }
    private setVisual(v: visual.Visual) {
        this.visual = v;
    }
    public setHigh(n: number) {
        this.options.high = n;
    }
    public setLow(n: number) {
        this.options.low = n;
    }
}*/
/*
 
 export class SeriesSparklineAdapter implements Adapter {
 
 
 }
 export class ListSparklineAdapter implements Adapter {
 
 
 }
 */
export class CubeWalkUtils {
    private clearedTime: boolean = false;
    visitRoot(cube: sdmxdata.Cube, visual: visual.Visual, adapter: Adapter) {
        var singles = new sdmxdata.PartialKey();
        var multiples = new sdmxdata.PartialKey();
        if (cube == null) {
            return;
        }
        var current: sdmxdata.RootCubeDimension = cube.getRootCubeDimension();
        // No Observations!!
        if (current.getSubDimension() == null) {
            return;
        }
        this.clearedTime = false;
        var innerbd: bindings.BoundTo = visual.findBinding(current.getSubDimension());
        if (innerbd.isClientSide()) {
            innerbd.getPossibleValues().clear();
            for (var i: number = 0; i < current.listSubDimensions().length) {
                var it = current.listSubDimensions()[i];
                var inCurrentValue: boolean = false;
                var dim: sdmxdata.CubeDimension = it;
                if (innerbd.isInCurrentValues(dim.getValue())) {
                    inCurrentValue = true;
                }
                var itm2: structure.ItemType = this.getComponent(visual, dim.getConcept(), dim.getValue()) as structure.ItemType;
                innerbd.getPossibleValues().push(itm2);
            }
            if (!inCurrentValue) {
                if (innerbd.getPossibleValues().size() > 0) {
                    //System.out.println("Setting value:" + innerbd.getPossibleValues().get(0).toString());
                    innerbd.setCurrentValue(innerbd.getPossibleValues()[0]);
                }
            }
        }
        for (var i: number = 0; i < current.listSubDimensions().length; i++) {
            var dim: sdmxdata.CubeDimension = current.listSubDimensions()[i];
            this.visit(cube, visual, dim, adapter, singles, multiples);
        }
    }
    public getComponent(visual: visual.Visual, concept: string, val: string): object {
        var b: bindings.BoundTo = visual.findBinding(concept);
        if (b == null) {
            var itm: structure.ItemType = sdmxdata.ValueTypeResolver.resolveCode(visual.getQueryable().getRemoteRegistry().getLocalRegistry(), visual.getDataStructure(), concept, val);
            return itm;
        } else if (b.isDiscrete()) {
            var itm: structure.ItemType = sdmxdata.ValueTypeResolver.resolveCode(visual.getQueryable().getRemoteRegistry().getLocalRegistry(), visual.getDataStructure(), concept, val);
            if (itm == null) {
                return val;
            }
            return itm;
        } else {
            //System.out.println("Returning val:"+concept+":"+val);
            return val;
        }
    }
    public visit(cube: sdmxdata.Cube, visual: visual.Visual, current: data.CubeDimension, adapter: Adapter, singles: sdmxdata.PartialKey, multiples: sdmxdata.PartialKey) {
        var concept: string = current.getConcept();
        var val: string = current.getValue();
        //System.out.println("Visit:"+concept+":"+val);
        var bd: bindings.BoundTo = visual.findBinding(concept);
        if (bd.isInCurrentValues(val)) {
            var itm: object = this.getComponent(visual, bd.getConcept(), val);
            if (bd.expectValues() == 1) {
                singles.setComponent(concept, itm);
            } else {
                multiples.setComponent(concept, itm);
            }
            var innerbd: bindings.BoundTo = visual.findBinding(current.getSubDimension());
            if (innerbd.isClientSide()) {
                innerbd.getPossibleValues().clear();
                for (var i: number = 0; i < current.listSubDimensions().length) {
                    var it = current.listSubDimensions()[i];
                    var inCurrentValue: boolean = false;
                    var dim: sdmxdata.CubeDimension = it;
                    if (innerbd.isInCurrentValues(dim.getValue())) {
                        inCurrentValue = true;
                    }
                    var itm2: structure.ItemType = this.getComponent(visual, dim.getConcept(), dim.getValue()) as structure.ItemType;
                    innerbd.getPossibleValues().push(itm2);
                }
                if (!inCurrentValue) {
                    if (innerbd.getPossibleValues().size() > 0) {
                        //System.out.println("Setting value:" + innerbd.getPossibleValues().get(0).toString());
                        innerbd.setCurrentValue(innerbd.getPossibleValues()[0]);
                    }
                }
            }
            var latest: sdmxdata.TimeCubeDimension = null;
            var latestTime: sdmxtime.RegularTimePeriod = null;
            var freq: string = structure.NameableType.toIDString(singles.getComponent("FREQ"));
            if (freq == null) {
                freq = structure.NameableType.toIDString(singles.getComponent("TIME_FORMAT"));
            }
            if (freq == null) {
                freq = structure.NameableType.toIDString(multiples.getComponent("FREQ"));
            }
            if (freq == null) {
                freq = structure.NameableType.toIDString(multiples.getComponent("TIME_FORMAT"));
            }
            for (var k: number = 0; k < current.listSubDimensions().length; k++) {
                var inner: sdmxdata.CubeDimension = current.listSubDimensions()[k];
                var innerbd: bindings.BoundTo = visual.findBinding(inner.getConcept());
                if (inner instanceof sdmxdata.TimeCubeDimension) {
                    if ((innerbd as bindings.BoundToTime).isSingleLatestTime()) {
                        if (latest == null) {
                            latest = inner as data.TimeCubeDimension;
                            latestTime = sdmxtime.TimeUtil.parseTime(freq, structure.NameableType.toIDString(inner.getValue()));
                        }
                        var timePeriod: sdmxtime.RegularTimePeriod = sdmxtime.TimeUtil.parseTime(structure.NameableType.toIDString(inner.getValue());
                        if (timePeriod.getStart().after(latestTime.getStart())) {
                            latestTime = timePeriod;
                            latest = inner as sdmxdata.TimeCubeDimension;
                        }
                    } else {
                        this.visitTime(cube, visual, inner as TimeCubeDimension, adapter, singles, multiples);
                    }
                } else {
                    this.visit(cube, visual, inner, adapter, singles, multiples);
                }
            }
        }
    }
    public visitTime(cube: sdmxdata.Cube, visual: visual.Visual, dim: sdmxdata.TimeCubeDimension, adapter: Adapter, singles: sdmxdata.PartialKey, multiples: sdmxdata.PartialKey) {
        var concept: string = dim.getConcept();
        var val: string = dim.getValue();
        // This is for time drop down list
        // clearedTime clears all the time's possible values
        //System.out.println("Visit:"+concept+":"+val);
        if (!this.clearedTime) {
            visual.clearTime();
            this.clearedTime = true;
        }
        // This code adds the current time to the possible values
        if (visual.getTime() != null) {
            if (!visual.getTime().isDiscrete()) {
                // Time has Codelist
                visual.getTime().addTime(sdmxdata.ValueTypeResolver.resolveCode(visual.getQueryable().getRemoteRegistry().getLocalRegistry(), visual.getDataStructure(), concept, val));
            } else {
                // Time has no codelist
                var t: structure.CodeType = new structure.CodeType();
                t.setId(new commonreferences.ID(val));
                visual.getTime().addTime(t);
            }
        }
        var bd: bindings.BoundTo = visual.findBinding(concept);
        var itm: object = this.getComponent(visual, bd.getConcept(), val);
        if (bd.isInCurrentValues(val)) {
            if (bd.expectValues() == 1) {
                singles.setComponent(concept, itm);
            } else {
                multiples.setComponent(concept, itm);
            }
        }
        if (visual.getValues().length > 1) {
            /*
             var cross:bindings.BoundTo = bindings.getCrossSection();
             if (cross != null && cross.getBoundTo() == BoundTo.BOUND_MEASURES_INDIVIDUAL) {
             HashMap < String, String > crossSections = new HashMap < String, String > ();
             Collection < CubeObservation > obsList = dim.listObservations();
             Iterator < CubeObservation > it = obsList.iterator();
             while (it.hasNext()) {
             CubeObservation ob = it.next();
             visit(cube, bindings, ob, adapter, singles, multiples, crossSections);
             */
            //adapter.setSingleValues(singles);
            //adapter.addSingleDataPoint(multiples);
        }
        var obsList = dim.listObservations();
        for (var l: number = 0; l < obsList.length; l++) {
            var ob: sdmxdata.CubeObservation = obsList[l];
            this.visitObservation(cube, visual, ob, adapter, singles, multiples);
        }
    }
    public visitObservation(cube: sdmxdata.Cube cube, visual: visual.Visual, dim: sdmxdata.CubeObservation, adapter: adapter.Adapter, singles: sdmxdata.PartialKey, multiples: sdmxdata.PartialKey) {
        //System.out.println("Visit:" + dim.getConcept());
        if (dim.getCrossSection() != null) {
            /*
             //System.out.println("Cross" + dim.getConcept() + ":" + dim.getCrossSection());
             BoundTo crossSection = visual.findBinding(dim.getConcept());
             if (!crossSection.isInCurrentValues(dim.getCrossSection())) {
             return;
             */
        }
        multiples.setComponent(dim.getConcept(), this.getComponent(visual, dim.getConcept(), dim.getCrossSection()));
        multiples.clearAttributes();
        var concept: string = dim.getObservationConcept();
        multiples.setComponent(concept, dim.getValue());
        for (var a: number = 0; a < dim.listAttributes().length; a++) {
            var att: sdmxdata.CubeAttribute = dim.listAttributes()[a];
            multiples.setAttribute(att.getConcept(), this.getComponent(visual, att.getConcept(), att.getValue()));
        }
        if (visual.getPercentOf() != null) {
            var percentOf: bindings.BoundToDiscrete = visual.getPercentOf();
            if (percentOf.getPercentOfItemType() != null) {
                var key: sdmxdata.FullKey = new sdmxdata.FullKey(multiples);
                key.getDict().putAll(singles.getDict());
                key.setComponent(percentOf.getConcept(), percentOf.getPercentOfItemType());
                var obs: sdmxdata.CubeObservation = cube.findObservation(key);
                if (obs == null) {
                    System.out.println("Can't Find Percent Of Observation for key:" + key.toString());
                    return;
                } else {
                    var percent = parseFloat(dim.getValue()) / parseFloat(obs.getValue());
                    percent *= 100;
                    multiples.setComponent(concept, percent.toString());
                }
            }
        }
        adapter.setSingleValues(singles);
        adapter.addSingleDataPoint(multiples);
    }
    /*
     public visitCrossSection(cube: sdmxdata.Cube, visual: visual.Visual, dim: sdmxdata.CubeObservation, adapter: Adapter, singles: sdmxdata.PartialKey, multiples: sdmxdata.PartialKey, crossSections: collections.Dictionary) {
     //System.out.println("Visit:" + dim.getConcept());
     if (dim.getCrossSection() != null) {
     //System.out.println("Cross" + dim.getConcept() + ":" + dim.getCrossSection());
     var crossSection: bindings.BoundTo = visual.findBinding(dim.getConcept());
     if (!crossSection.isInCurrentValues(dim.getCrossSection())) {
     //     System.out.println("Cross Section not in current values, returning");
     return;
     }
     multiples.setComponent(dim.getConcept(), CubeWalkUtils.getComponent(binds, dim.getConcept(), dim.getCrossSection()));
     }
     multiples.clearAttributes();
     var concept: string = dim.getObservationConcept();
     multiples.setComponent(concept, dim.getValue());
     for (var a: number = 0; a & lt; dim.listAttributes().length; a++) {
     var att: sdmxdata.CubeAttribute = dim.listAttributes()[a];
     multiples.setAttribute(att.getConcept(), getComponent(visual, att.getConcept(), att.getValue()));
     }
     crossSections.put(dim.getCrossSection(), dim.getValue());
     }*/
}
export var adapters: Array<Adapter> = [];
this.adapters.push(new SparklineAdapter());
export class AdapterRegistrySingleton {
    static getList() { return adapters; }
}