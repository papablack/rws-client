import { Observable } from "@microsoft/fast-element";

export function handleExternalChange(_target: any, $prop: string)
{       
    if(!!_target['externalChanged']){
        _target['externalChanged'].call(_target, $prop, null, _target[$prop]);
    } 
}