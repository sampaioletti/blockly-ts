
import * as Blockly from "blockly"
import "reflect-metadata"
import {snakeCase} from "lodash"
import {MetaData} from "./Metadata"
export declare type BlockInit=(block:Blockly.Block)=>void

export function Block(init?:BlockInit){
    return function<T extends {new(...args:any[]):{}}>(constructor:T){
        let def=MetaData.get(constructor.prototype)
        def.name=snakeCase(constructor.name)
        def.init=init
    }
}