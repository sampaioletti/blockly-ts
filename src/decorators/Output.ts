import { MetaData } from "./Metadata"
import "reflect-metadata"


export function Output(check:boolean=false){
    return function(target:any,key:string){
        let def=MetaData.get(target)
        let type=Reflect.getMetadata("design:type",target,key) as string
        def.output={id:key,check:check?type:null}
    }
}