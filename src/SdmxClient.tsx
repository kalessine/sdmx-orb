import {h, Component} from 'preact';
import Services from './sdmxclient/Services';
import Toolbar from './sdmxclient/Toolbar';
import * as interfaces from './sdmx/interfaces';
export interface SdmxClientProps {
    name: string
}

export default class SdmxClient extends Component<SdmxClientProps, any> {
    connect(q:interfaces.Queryable){
        
    }
    render (props) {
        return <div class="orb-container orb-blue"><Services /><Toolbar name=""/></div>
    }
}