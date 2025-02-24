import mongoose,{Schema,Document} from 'mongoose';

// interface Labels {
//     p1:string,
//     p2:string,
//     p3:string
// }

export interface Task extends Document{
    title:string,
    description?:string,
    deadline:Date

    // labels:Labels[]
}

export interface User extends Document{
    firstname:string,
    lastname?:string,
    username:string,
    email:string,
    password:string,
    isVerified:boolean,
    premiumTaken:boolean,
    verifyCode:string,
    verifyCodeExpiry:Date,
    tasks:Task[]


}

const TaskSchema:Schema<Task> =new Schema({
    title:{
        type:String,
        required:[true,'task title is required'],
        min:[2,'task title should be atleast of 2 characters'],
        max:[20,'task title should be atmost of 20 characters']
    },
    description:{
        type:String,
      
        min:[2,'task description should be atleast of 2 characters'],
        max:[40,'task description should be atmost of 40 characters']
    },
    deadline:{
        type:Date,
        
    }
})

const UserSchema : Schema<User> = new Schema({
    firstname:{
        type:String,
        required:[true,'firstname is required'],
        min:[2,'first name should be atleast of 2 characters'],
        max:[20,'first name should be atmost of 20 characters']
    },
    lastname:{
        type:String
    },
    username:{
        type:String,
        required:[true,'username is required'],
        min:[2,'username should be atleast of 2 characters'],
        max:[20,'username should be atmost of 2 characters']
    },
    email:{
        type:String,
        required:[true,'email is required'],
        match:[/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/,'please provide valid email']
       
    },
    password:{
        type:String,
        required:[true,'password is required'],
        
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    premiumTaken:{
        type:Boolean,
        default:false
    },
    verifyCode:{
        type:String,
        required:[true,'verification code is required'],
    },
    verifyCodeExpiry:{
        type:Date,
        required:[true,'verification code expiry is required'],
    },
    tasks:[TaskSchema]

})


const UserModel = (mongoose.models.User as mongoose.Model<User>) || (mongoose.model<User>('User',UserSchema));

export default UserModel;
