// app/api/example/route.ts
import { cookies, headers } from 'next/headers';
import {PrivyClient} from '@privy-io/server-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const privy = new PrivyClient('cm7j4qece01fmheomgv58yr4g', '3qSQnmf3bpgSKh5Taf3VzqtWUw1BsKSLRUtG1MNaHxcGoeMAU6ReS79NUfYAdbtFPNFFisgCMoGZN6amXy46Eokx', {

    });
    const accessToken = headers().get('authorization')?.replace('Bearer ', '');
    console.log("accessToken", accessToken);
    if (!accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const verifiedClaims = await privy.verifyAuthToken(accessToken);
    console.log("verifiedClaims", verifiedClaims);
    // Get identity token from cookie
    // const cookieStore = cookies();
    // const _idToken = cookieStore.get('privy-id-token')?.value;
    // console.log("idToken", _idToken);
    // const headersList = headers();
    // const idToken = headersList.get('privy-id-token');
    // // Or from header if sent that way
    // // const headersList = headers();
    // // const idToken = headersList.get('privy-id-token');
    // console.log("idToken", idToken);
    // if (!idToken) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }
    
    // Parse and verify the token
    // const user = await getUser({ idToken });
    
    // Now you can use the user data
    return NextResponse.json({ 
      // userId: user.id,
      // Other user data...
    });
  } catch (error) {
    console.error('Error verifying identity token:', error);
    return NextResponse.json(
      { message: "Invalid token" },
      { status: 401 },
    );
  }
}
