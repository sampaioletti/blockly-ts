import Blockly = require("blockly")
import { MetaData } from "./Metadata"
import "reflect-metadata"
export declare type InputInit=(input:Blockly.Input)=>void


export function ValueInput(init?:InputInit){
    return function(target:any,key:string){
        let def=MetaData.get(target)
        let type=Reflect.getMetadata("design:type",target,key) as string
        def.values.push({type:"value",id:key,check:type,init})
    }


}