import { dbConnect } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import UserModel from "@/models/user.model";

const getPremiumStatus = async ()=>{
    await dbConnect();
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user;

        if(!session || !user){
            return Response.json({
                success:false,
                message:'user not authenticated '
            },{status:403})  
        }

        const UserID = user._id;
        const userFound = await UserModel.findById(UserID);

        if(!userFound){
            return Response.json({
                success:false,
                message:'user not found'
            },{status:404})
        }

        return Response.json({
            success:true,
            message:'premium status fetched successfully',
            premiumTaken:user.premiumTaken
        },{status:404})


        
    } catch (error) {
        console.error('error occured while fetching premium taken status ',error);
        return Response.json({
            success:false,
            message:'error occured while fetching premium taken status '
        },{status:500})
    }
}


const updatePremiumStatus = async(request:Request)=>{
    await dbConnect();
    // TODO: we have to update this wrt to payment 
    try {

        const session = await getServerSession(authOptions)
        const user = session?.user;

        if(!session || !user){
            return Response.json({
                success:false,
                message:'user not authenticated '
            },{status:403})  
        }

        const UserID = user._id;
        const userFound = await UserModel.findById(UserID);

        if(!userFound){
            return Response.json({
                success:false,
                message:'user not found'
            },{status:404})
        }


        
    } catch (error) {
        console.error('error occured while updating premium taken status ',error);
        return Response.json({
            success:false,
            message:'error occured while updating premium taken status '
        },{status:500})
    }
}

export {getPremiumStatus as GET,updatePremiumStatus as POST}



