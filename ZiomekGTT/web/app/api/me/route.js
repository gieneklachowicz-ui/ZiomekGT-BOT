import { NextResponse } from "next/server";
import { getSession } from "../../../lib";
export async function GET(){
  const s=await getSession();
  if(!s)return NextResponse.json({authenticated:false},{status:401});
  return NextResponse.json({authenticated:true,user:{
    id:s.userId,username:s.username,globalName:s.globalName,avatar:s.avatar
  }});
}
