import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const cookiesList = await cookies();
		const history = cookiesList.get("wordHistory");
		return NextResponse.json(history ? JSON.parse(history.value) : []);
	} catch (error) {
		console.error("Error reading history:", error);
		return NextResponse.json([]);
	}
}

export async function POST(request: Request) {
	try {
		const data = await request.json();
		const cookiesList = await cookies();
		const existingHistory = cookiesList.get("wordHistory");
		const currentHistory = existingHistory
			? JSON.parse(existingHistory.value)
			: [];

		// Merge new data with existing history
		const updatedHistory = [...data, ...currentHistory].slice(0, 10);

		const response = NextResponse.json({ success: true });

		// Set the cookie in the response
		response.cookies.set({
			name: "wordHistory",
			value: JSON.stringify(updatedHistory),
			maxAge: 30 * 24 * 60 * 60, // 30 days
			path: "/",
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
		});

		return response;
	} catch (error) {
		console.error("Error saving history:", error);
		return NextResponse.json({ success: false }, { status: 500 });
	}
}
