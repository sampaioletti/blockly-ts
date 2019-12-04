
import * as Blockly from "blockly"
import {Block,GetDef, Output,TsGen} from "blockly-ts"
import { ValueInput } from "blockly-ts";
declare module "blockly"{
    var Blocks:{[key:string]:{init(this:Blockly.Block):void}}
}

@Block((block:Blockly.Block)=>{
    block.setOutput(true, 'Number');
    block.setColour(160);
    block.setTooltip('Returns number of letters in the provided text.');
    block.setHelpUrl('http://www.w3schools.com/jsref/jsref_length_string.asp');
})
class StringLength{
    @ValueInput((input:Blockly.Input)=>{
        input.appendField("length of")
            .setCheck('String')
    })
    input:string
    @Output()
    output:number
}
let gen=new TsGen()
console.log(gen)
//@ts-ignore
window.generate=()=>{
    //@ts-ignore
    var code=gen.workspaceToCode(window.workspace)
    console.log(code)
}
window.onload=()=>{
    let el=document.getElementById("workspace");
    Blockly.Blocks['string_length1']= {
        init: function() {
          this.appendValueInput('VALUE')
              .setCheck('String')
              .appendField('length of');
          this.setOutput(true, 'Number');
          this.setColour(160);
          this.setTooltip('Returns number of letters in the provided text.');
          this.setHelpUrl('http://www.w3schools.com/jsref/jsref_length_string.asp');
        }
      };
    // let test=new StringLength()

    let def=GetDef(StringLength)
    console.log(def)
    def.generate()
    let toolbox:ToolBoxCategorys=[
        {name:"Control",items:[
            "controls_if",
            "logic_compare",
            "controls_repeat_ext"
        ]},
        {name:"Custom",items:[
            "string_length",
            "string_length1"
        ]}
    ]
    //@ts-ignore
    window.workspace=Blockly.inject(el,{toolbox:genToolbox(toolbox)})

    // workspace.newBlock()
}

function genToolbox(t:ToolBoxCategorys|ToolBoxItems):string{

    let output=[`<xml>`]
    t.forEach(i=>{
        output.push(...build(i))
    })

    output.push(`</xml>`)
    return output.join("")

}
function build(item:ToolBoxItem|ToolBoxCategory):string[]{
    let output=[]
    if(isItem(item)){
        //item
        if(typeof item=="string"){
            output.push(`<block type="${item}"></block>`)
        }else{
            output.push(`<block type="${item.type}"></block>`)
        }
        
    }else{
        //category
        if(item.custom){
            output.push(`<category name="${item.name}" custom="${item.custom}"></category>`)
        }else{
            output.push(`<category name="${item.name}">`)
            if(item.items){
                item.items.forEach(i=>{
                    output.push(build(i))
                })
            }
            if(item.sub){
                item.sub.forEach(s=>{
                    output.push(build(s))
                })
            }
            output.push(`</category>`)
        }

    }
    return output
}
function isItem(item:ToolBoxItem|ToolBoxCategory): item is ToolBoxItem{
    return typeof item=="string"||"type" in item
}
export type ToolBoxItems=ToolBoxItem[]
export type ToolBoxCategorys=ToolBoxCategory[]

export interface ToolBoxItem{
    type:string
}

export interface ToolBoxCategory{
    name:string
    sub?:ToolBoxCategorys
    custom?:string
    items?:ToolBoxItems|string[]
}

/*        <xml xmlns="https://developers.google.com/blockly/xml" id="toolbox" style="display: none">
            <block type="controls_if"></block>
            <block type="logic_compare"></block>
            <block type="controls_repeat_ext"></block>
            <block type="math_number">
              <field name="NUM">123</field>
            </block>
            <block type="math_arithmetic"></block>
            <block type="text"></block>
            <block type="text_print"></block>
          </xml>


*/