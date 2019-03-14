export default interface Thing {
    name : string
    on : boolean
    actionIndex : number
    
    switchOn() : void;
    switchOff() : void;
    setAction(actionIndex : number) : void;
}