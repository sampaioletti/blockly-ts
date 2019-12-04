import {BlockInit} from "./Block"
import { InputInit } from "./ValueInput"
import Blockly = require("blockly")
export class BlocklyDef{
    name:string=""
    init?:BlockInit
    values:{id:string,type:"value",check:string,init?:InputInit}[]=[]
    output:{id:string,check:string}
    generate():void{
        let def=this
        Blockly.Blocks[def.name]={
            init(){
                if(def.init){
                    def.init(this)
                }
                def.values.forEach(v=>{
                    switch (v.type) {
                        case "value":
                            let input=this.appendValueInput(v.id)
                            if(v.init){
                                v.init(input)
                            }

                            break;
                    
                        default:
                            break;
                    }
                })
            }
        }
    }
}