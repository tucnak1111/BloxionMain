//import { NextResponse } from "next/server";
//import { prisma } from "../../../../../prisma/Client";

//export async function GET(req: Request){
    // read header
    //const apikey: string = req.headers.get("x-api-key");
    //if (apikey == null) {
        //return NextResponse.json(
            //{ error: "Unauthorized, missing Api key" },
            //{ status: 401}
        //);
    //}
    //let token = apikey;
    //if (apikey.startsWith("Bearer ")) {
        //token = apikey.slice("Bearer ".length);
    //}
    // TODO: compare with api key in the database
    //if (token !== correct_key) {
        //return NextResponse.json(
            //{ error: "Wrong key. ensure your key is correct." };
            //{ status: 401}
       // );
    //}
    // parse request body
   // let body;
   // try {
    //    body = await.req.json();
   // } catch {
     //   return NextResponse.json(
      //      { error: "invalid body." },
      //      { status: 400 }
      //  );
   // }


// paste code 


export async function GET(){
    return NextResponse.json(
        { error: "example API; nothing to get" },
        { status: 404}
    );
}