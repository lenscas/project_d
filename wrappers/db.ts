import { Pool,  PoolConnection } from "promise-mysql";
import { QueryOptions } from "mysql";

export default class {
	private pool : Pool
	private connection : PoolConnection | undefined
	private inTransaction : boolean
	private failedAQuery : boolean;
	public constructor(pool : Pool) {
		this.pool = pool;
		this.failedAQuery = false;
		this.inTransaction = false
	}
	private _getCon = async()=>{
		if(!this.connection) {
			this.connection = await this.pool.getConnection();
			return this.connection
		} else {
			return this.connection
		}

	}
	private _query = async <T={ [value : string] : unknown }> (data : QueryOptions) : Promise<T|boolean> =>  {
		if(this.inTransaction && this.failedAQuery){
			return false;
		}
		try{
			const connection =  await this._getCon()
			return await connection.query(data) as T;
		}
		catch(e){
			console.error(e);
			if(this.inTransaction){
				this.failedAQuery = true;
			}
			throw(e)
		}
	}
	public beginTransactionAuto = async () => {
		this.inTransaction = true
		return await this.beginTransaction();
	}
	public beginTransaction = async ()=>{
		const connection  = await this._getCon()
		await connection.beginTransaction();
		return this;
	}
	public endTransactionAuto = async ()=>{
		this.inTransaction = false;
		await this.endTransaction(!this.failedAQuery);
		this.failedAQuery  = false;
	}
	public endTransaction = async (success=true) => {
		const connection = await this._getCon()
		if(success){
			await connection.commit();
		} else {
			await connection.rollback();
		}
		return this;
	}
	public setAutoTransactionStatus = (status:boolean) => {
		this.failedAQuery = status
	}
	public query = async (data :QueryOptions) => {
		return await this._query(data);
	}
	simpleInsert = async(data :insertData )=>{

		const queryData : QueryOptions = {
			sql : "INSERT INTO ?? (??) VALUES (?)",
			values : [
				data.table,
				[],
				[],
			]
		}
		Object.keys(data.values).forEach((value)=>{
			queryData.values[1].push(value);
			queryData.values[2].push(data.values[value]);
		});
		return await this.query(queryData);
	}
	release = async ()=> {
		if(this.connection){
			this.pool.releaseConnection(this.connection);
			this.connection = undefined;
		}
	}
}
export type insertData = {
	table : string,
	values : {
		[name : string] : string
	}
}