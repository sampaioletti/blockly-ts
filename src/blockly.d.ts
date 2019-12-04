
import * as Blockly from "blockly"

declare module "blockly"{
    var Blocks:{[key:string]:{init(this:Blockly.Block):void}}
}