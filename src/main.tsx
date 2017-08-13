import {h, render} from 'preact';
import SdmxClient from './SdmxClient';
import * as sdmx from './sdmx';
render(<SdmxClient/>, document.querySelector('#app'));
