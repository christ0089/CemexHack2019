
import { Object, Property } from 'fabric-contract-api';


export enum Status {
    CREADO = 0, 
    AUTORIZACIOM,
    CONFIRMACION,
    ENTREGA,
    RECEPCTION,
    ENVIO,
    COTEJO,
    PAGO,
}

export enum Approved {
    APPROVED = 0,
    REJECTED,
    PROCESSING,
    CANCELLED,
}

interface IHistory {
    status : Status;
    updateTime : number;
    encargado: string;
}

interface IHistoryState {
    state : Approved;
    updateTime : number;
    encargado: string;
}


@Object()
export class StatusCompra {

    @Property()
    public value: string;
    
    public encargado: string;

    public provedor: string;

    public tiempo: number;

    public status: Status;

    public state: Approved;

    public histStatus: IHistory[];

    public histState: IHistoryState[];

    public id: string;
}