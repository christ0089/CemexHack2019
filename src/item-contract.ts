/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { StatusCompra, Status, Approved } from './item';

@Info({ title: 'ItemContract', description: 'My Smart Contract' })
export class StatusCompraContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async itemExists(ctx: Context, itemId: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(itemId);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction()
    public async createItem(ctx: Context, itemId: string, value: string, encargado: string, provedor: string): Promise<void> {
        const exists = await this.itemExists(ctx, itemId);
        if (exists) {
            throw new Error(`The item ${itemId} already exists`);
        }
        const item = new StatusCompra();
        item.value = value;
        item.encargado = encargado;
        item.provedor = provedor;
        item.tiempo = Date.now();
        item.status = Status.CREADO;
        item.histStatus = [];
        item.state = Approved.PROCESSING;
        item.id = itemId;
        const buffer = Buffer.from(JSON.stringify(item));
        await ctx.stub.putState(itemId, buffer);
    }

    @Transaction(false)
    @Returns('Item')
    public async readItem(ctx: Context, itemId: string): Promise<StatusCompra> {
        const exists = await this.itemExists(ctx, itemId);
        if (!exists) {
            throw new Error(`The item ${itemId} does not exist`);
        }
        const buffer = await ctx.stub.getState(itemId);
        const item = JSON.parse(buffer.toString()) as StatusCompra;
        return item;
    }

    @Transaction()
    public async updateItem(ctx: Context, itemId: string, newValue: string): Promise<void> {
        const exists = await this.itemExists(ctx, itemId);
        if (!exists) {
            throw new Error(`The item ${itemId} does not exist`);
        }
        const item = await this.readItem(ctx, itemId);
        item.value = newValue;
        if (item.status !== Status.CONFIRMACION) {
            item.status++;
        } else {
            item.status = Status.PAGO;
            item.state = Approved.APPROVED;
            item.histState.push({
                encargado: item.encargado,
                state: item.state,
                updateTime: Date.now()
            })
        }

        item.histStatus.push({
            encargado: item.encargado,
            status: item.status,
            updateTime: item.tiempo,
        });
        item.tiempo = Date.now();

        const buffer = Buffer.from(JSON.stringify(item));
        await ctx.stub.putState(itemId, buffer);
    }

    @Transaction()
    public async updateStateItem(ctx: Context, itemId: string, approved: number) {
        const exist = await this.itemExists(ctx, itemId);
        if (!exist) {
            throw new Error(`The item ${itemId} does not exist`);
        }
        const item = await this.readItem(ctx, itemId);
        item.histState.push({
            encargado: item.encargado,
            state: item.state,
            updateTime: Date.now(),
        })

        if (item.state == Approved.CANCELLED) {
            throw new Error(`The item ${itemId} was already cancellled`);
        }
        item.state = approved as Approved;
        item.tiempo = Date.now();

        const buffer = Buffer.from(JSON.stringify(item));
        await ctx.stub.putState(itemId, buffer);
    }

    @Transaction()
    public async deleteItem(ctx: Context, itemId: string): Promise<void> {
        const exists = await this.itemExists(ctx, itemId);
        if (!exists) {
            throw new Error(`The item ${itemId} does not exist`);
        }
        await ctx.stub.deleteState(itemId);
    }

}
