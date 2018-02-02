import * as visual from './visual';
import * as data from '../sdmx/data';
import * as structure from '../sdmx/structure';
import * as collections from 'collections';
import * as model from 'model';
import * as sdmxtime from '../sdmx/time';
import * as bindings from './bindings';
import * as Chartist from '../chartist';

console.log('13');
export class AdapterRegistry{
  
    private adapters = [];
    
    constructor(){
        this.adapters.push(new SparklineAdapter());
    }
    public getList() { return this.adapters; }
    
}

export interface Model {
    render(s: string);
    unrender(s: string);
}
export interface Adapter {
    getName(): string;
    canCreateModelFromVisual(v: visual.Visual): boolean;
    createModel(v: visual.Visual, cube: data.Cube): Model;
    setSingleValues(key: data.PartialKey): void;
    addSingleDataPoint(key: data.PartialKey): void;
    addCrossSectionalDataPoint(key: data.PartialKey, crossSections: collections.Dictionary): void;

}
export class SparklineAdapter implements Adapter {
    private singleValues: data.PartialKey = null;
    private visual: visual.Visual = null;
    private min: number = null;
    private max: number = null;
    private minDate: Date = null;
    private maxDate: Date = null;

    private model = new ChartistSparklineModel();
    
    constructor() {
    }

    public createModel(visual: visual.Visual, cube: data.Cube): model.Model {
        this.visual = visual;
        this.min = null;
        this.max = null;
        return true;
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
            if (b.getBoundTo() == bindings.BoundTo.BOUND_TIME_X) {
                time = 1;
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
        if (time == 1 && visual.getValues().length==1) {
            return true;
        }
        return false;
    }

    public getName(): string {
        return "SingleSparkline";
    }

    public setSingleValues(key: data.PartialKey): void {
        this.singleValues = key;
    }

    public addSingleDataPoint(key: data.PartialKey): void {
        var time: string = this.visual.getTime().getConcept();
        var val: string = this.visual.getPrimaryMeasure().getConcept();
        var timeVal: string = key.getComponent(time);
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
        this.model.addPoint(timeVal,v1);
    }

    addCrossSectionalDataPoint(key: data.PartialKey, crossSections: collections.Dictionary): void {

    }

}

export class ChartistSparklineModel implements Model {
    private data = {
        labels: [],
        series: []
    };
    private options = {
        axisX: {
        }
    };
    public addPoint(x:string,y:number) {
        this.data.labels.push(x);
        if (this.data.series.length == 0) {
           this.data.series.push({data: []});
        }
        this.data.series[0].data.push(y);
        }
    public render(s: string) {
        new Chartist.Line(s, this.data, this.options, {} as any);
    }
    public unrender(s: string) {
    }
}
/*

export class SeriesSparklineAdapter implements Adapter {


}
export class ListSparklineAdapter implements Adapter {


}
*/


/*
public class CubeWalkUtils {

    private static boolean clearedTime = false;

    public synchronized static void visit(Cube cube, Bindings bindings, Adapter adapter) {
        //System.out.println("Walking Cube");
        PartialKey singles = new PartialKey();
        PartialKey multiples = new PartialKey();
        if (cube == null) {
            return;
        }
        CubeDimension current = cube.getRootCubeDimension();

        // No Observations!!
        if (current.getSubDimension() == null) {
            return;
        }
        clearedTime = false;
        BoundTo innerbd = bindings.findBinding(current.getSubDimension());
        if (innerbd.isClientSide()) {
            innerbd.getPossibleValues().clear();
            Iterator<CubeDimension> it = current.listSubDimensions().iterator();
            boolean inCurrentValue = false;
            while (it.hasNext()) {
                CubeDimension dim = it.next();
                if (innerbd.isInCurrentValues(dim.getValue())) {
                    inCurrentValue = true;
                }
                ItemType itm2 = (ItemType) getComponent(bindings, dim.getConcept(), dim.getValue());
                innerbd.getPossibleValues().add(itm2);
            }
            if (!inCurrentValue) {
                if (innerbd.getPossibleValues().size() > 0) {
                    //System.out.println("Setting value:" + innerbd.getPossibleValues().get(0).toString());
                    innerbd.setCurrentValue(innerbd.getPossibleValues().get(0));
                }
            }
        }
        Iterator<CubeDimension> it = current.listSubDimensions().iterator();
        while (it.hasNext()) {
            CubeDimension dim = it.next();
            visit(cube, bindings, dim, adapter, singles, multiples);
        }
    }

    public static void visit(Cube cube, Bindings bindings, CubeDimension dim, Adapter adapter, PartialKey singles, PartialKey multiples) {

        String concept = dim.getConcept();
        String val = dim.getValue();
        //System.out.println("Visit:"+concept+":"+val);
        BoundTo bd = bindings.findBinding(concept);
        if (bd.isInCurrentValues(val)) {
            Object itm = getComponent(bindings, bd.getConcept(), val);
            if (bd.expectValues() == 1) {
                singles.setComponent(concept, itm);
            } else {
                multiples.setComponent(concept, itm);
            }

            BoundTo innerbd = bindings.findBinding(dim.getSubDimension());
            if (innerbd.isClientSide()) {
                innerbd.getPossibleValues().clear();
                Iterator<CubeDimension> it = dim.listSubDimensions().iterator();
                boolean inCurrentValue = false;
                while (it.hasNext()) {
                    CubeDimension inner = it.next();
                    if (innerbd.getCurrentValue().getId().equals(inner.getValue())) {
                        //System.out.println("In Current Value!:" + innerbd.getCurrentValue() + ":" + inner.getValue());
                        inCurrentValue = true;
                    } else {
                        //System.out.println("Not In Current Value:" + innerbd.getConcept() + ":" + innerbd.getCurrentValue() + ":" + inner.getValue());
                    }
                    ItemType itm2 = (ItemType) getComponent(bindings, inner.getConcept(), inner.getValue());
                    innerbd.getPossibleValues().add(itm2);
                }
                if (innerbd.isClientSide() && !inCurrentValue) {
                    if (innerbd.getPossibleValues().size() > 0) {
                        //System.out.println("Setting value:" + innerbd.getPossibleValues().get(0).toString());
                        innerbd.setCurrentValue(innerbd.getPossibleValues().get(0));
                    }
                }
            }
            TimeCubeDimension latest = null;
            RegularTimePeriod latestTime = null;
            String freq = NameableType.toIDString(singles.getComponent("FREQ"));
            if (freq == null) {
                freq = NameableType.toIDString(singles.getComponent("TIME_FORMAT"));
            }
            if (freq == null) {
                freq = NameableType.toIDString(multiples.getComponent("FREQ"));
            }
            if (freq == null) {
                freq = NameableType.toIDString(multiples.getComponent("TIME_FORMAT"));
            }
            Iterator<CubeDimension> it = dim.listSubDimensions().iterator();
            while (it.hasNext()) {
                CubeDimension inner = it.next();
                if (inner instanceof TimeCubeDimension) {
                    if (((BoundToTime) innerbd).isSingleLatestTime()) {
                        if (latest == null) {
                            latest = (TimeCubeDimension) inner;
                            latestTime = TimeUtil.parseTime(freq, NameableType.toIDString(inner.getValue()));
                        }
                        RegularTimePeriod timePeriod = TimeUtil.parseTime(freq, NameableType.toIDString(inner.getValue()));
                        if (timePeriod.getStart().after(latestTime.getStart())) {
                            latestTime = timePeriod;
                            latest = (TimeCubeDimension) inner;
                        }
                    } else {
                        visit(cube, bindings, (TimeCubeDimension) inner, adapter, singles, multiples);
                    }
                } else {
                    visit(cube, bindings, inner, adapter, singles, multiples);
                }
            }
            if (latest != null) {
                visit(cube, bindings, latest, adapter, singles, multiples);
            }
        }
    }

    public static void visit(Cube cube, Bindings bindings, TimeCubeDimension dim, Adapter adapter, PartialKey singles, PartialKey multiples) {
        String concept = dim.getConcept();
        String val = dim.getValue();
        // This is for time drop down list
        // clearedTime clears all the time's possible values
        //System.out.println("Visit:"+concept+":"+val);
        if (!clearedTime) {
            bindings.clearTime();
            clearedTime = true;
        }
        // This code adds the current time to the possible values
        if (bindings.getTime() != null) {
            if (!bindings.getTime().isDiscrete()) {
                // Time has Codelist
                bindings.getTime().addTime(ValueTypeResolver.resolveCode(bindings.getQueryable().getRegistry(), bindings.getDataStructure(), concept, val));
            } else {
                // Time has no codelist
                CodeType t = new CodeType();
                t.setId(new IDType(val));
                bindings.getTime().addTime(t);
            }
        }
        BoundTo bd = bindings.findBinding(concept);
        Object itm = getComponent(bindings, bd.getConcept(), val);
        if (bd.isInCurrentValues(val)) {
            if (bd.expectValues() == 1) {
                singles.setComponent(concept, itm);
            } else {
                multiples.setComponent(concept, itm);
            }
        }
        //}//
        if (bd.isInCurrentValues(val)) {
            BoundTo cross = bindings.getCrossSection();
            if (cross != null && cross.getBoundTo() == BoundTo.BOUND_MEASURES_INDIVIDUAL) {
                HashMap<String, String> crossSections = new HashMap<String, String>();
                Collection<CubeObservation> obsList = dim.listObservations();
                Iterator<CubeObservation> it = obsList.iterator();
                while (it.hasNext()) {
                    CubeObservation ob = it.next();
                    visit(cube, bindings, ob, adapter, singles, multiples, crossSections);
                }
                adapter.setSingleValues(singles);
                adapter.setMultipleValues(multiples, crossSections);
            } else {
                Collection<CubeObservation> obsList = dim.listObservations();
                Iterator<CubeObservation> it = obsList.iterator();
                while (it.hasNext()) {
                    CubeObservation ob = it.next();
                    visit(cube, bindings, ob, adapter, singles, multiples);
                }
            }
        }
    }

    public static void visit(Cube cube, Bindings binds, CubeObservation dim, Adapter adapter, PartialKey singles, PartialKey multiples) {
        //System.out.println("Visit:" + dim.getConcept());
        if (dim.getCrossSection() != null) {
            //System.out.println("Cross" + dim.getConcept() + ":" + dim.getCrossSection());
            BoundTo crossSection = binds.findBinding(dim.getConcept());
            if (!crossSection.isInCurrentValues(dim.getCrossSection())) {
                return;
            }
            multiples.setComponent(dim.getConcept(), getComponent(binds, dim.getConcept(), dim.getCrossSection()));
        }
        multiples.clearAttributes();
        String concept = dim.getObservationConcept();
        multiples.setComponent(concept, dim.getValue());
        Iterator<CubeAttribute> it = dim.listAttributes().iterator();
        while (it.hasNext()) {
            CubeAttribute att = it.next();
            multiples.setAttribute(att.getConcept(), getComponent(binds, att.getConcept(), att.getValue()));
        }
        if (binds.getPercentOf() != null) {
            BoundToDiscrete percentOf = binds.getPercentOf();
            if (percentOf.getPercentOfItemType()!= null) {
                FullKey key = new FullKey((LinkedHashMap<String, Object>) multiples.getKeyMap().clone());
                key.getKeyMap().putAll(singles.getKeyMap());
                key.setComponent(percentOf.getConcept(), percentOf.getPercentOfItemType());
                CubeObservation obs = cube.find(key.toStringKey());
                if( obs == null ) {
                    System.out.println("Can't Find Percent Of Observation for key:"+key.toString());
                    return;
                }else{
                    double percent = Double.parseDouble(dim.getValue())/Double.parseDouble(obs.getValue());
                    percent*=100;
                    multiples.setComponent(concept, Double.toString(percent));
                }
            }
        }
        adapter.setSingleValues(singles);
        adapter.setMultipleValues(multiples);
    }

    public static void visit(Cube cube, Bindings binds, CubeObservation dim, Adapter adapter, PartialKey singles, PartialKey multiples, HashMap crossSections) {
        //System.out.println("Visit:" + dim.getConcept());
        if (dim.getCrossSection() != null) {
            //System.out.println("Cross" + dim.getConcept() + ":" + dim.getCrossSection());
            BoundTo crossSection = binds.findBinding(dim.getConcept());
            if (!crossSection.isInCurrentValues(dim.getCrossSection())) {
                //     System.out.println("Cross Section not in current values, returning");
                return;
            }
            multiples.setComponent(dim.getConcept(), getComponent(binds, dim.getConcept(), dim.getCrossSection()));
        }
        multiples.clearAttributes();
        String concept = dim.getObservationConcept();
        multiples.setComponent(concept, dim.getValue());
        Iterator<CubeAttribute> it = dim.listAttributes().iterator();
        while (it.hasNext()) {
            CubeAttribute att = it.next();
            multiples.setAttribute(att.getConcept(), getComponent(binds, att.getConcept(), att.getValue()));
        }
        crossSections.put(dim.getCrossSection(), dim.getValue());
    }

    public static Object getComponent(Bindings bindings, String concept, String val) {
        BoundTo b = bindings.findBinding(concept);
        if (b == null) {
            ItemType itm = ValueTypeResolver.resolveCode(bindings.getQueryable().getRegistry(), bindings.getDataStructure(), concept, val);
            return itm;
        } else if (b.isDiscrete()) {
            ItemType itm = ValueTypeResolver.resolveCode(bindings.getQueryable().getRegistry(), bindings.getDataStructure(), concept, val);
            if (itm == null) {
                return val;
            }
            return itm;
        } else {
            //System.out.println("Returning val:"+concept+":"+val);
            return val;
        }
    }
}
*/