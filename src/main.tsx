import {h, render} from 'preact';
import SdmxClient from './SdmxClient';
import * as sdmx from './sdmx';
render(<SdmxClient name="test"/>, document.querySelector('#app'));
sdmx.SdmxIO.connect("ABS").getRemoteRegistry().listDataflows().then(function (dfs) {
    alert(JSON.stringify(dfs));
});
