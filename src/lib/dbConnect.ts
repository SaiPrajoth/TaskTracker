import mongoose from "mongoose";

interface ConnectionObject{
    isConnected?:number
}

const connection : ConnectionObject = {}

export const dbConnect = async ()=>{
    try {
        if(connection.isConnected){
            console.log('database is already connected');
            return;
        }

        const response = await mongoose.connect(process.env.MONGODB_URL||'');
        connection.isConnected=response.connections[0].readyState;

        console.log('database connection successfull');

    } catch (error) {
        console.error('error occured while connecting to the database ',error);
        process.exit(1);
    }
}