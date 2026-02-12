import {NextResponse} from "next/server";
export async function POST(req: Request){
    const formData = await req.formData();

    const image = formData.get('image') as File;

    if(!image){
        return NextResponse.json({error: "no image"}, {status: 400});
        }

    const backendForm = new FormData();
    backendForm.append("file", image);
    const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: backendForm,

    });

    const data = await res.json();
    return NextResponse.json(data);
}