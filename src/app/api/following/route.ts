import { type NextRequest, NextResponse } from 'next/server'
import { farcasterService } from '@/services/farcaster'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fidParam = searchParams.get('fid')

    // Validate fid parameter
    if (!fidParam) {
      return NextResponse.json(
        { error: 'Missing required parameter: fid' },
        { status: 400 }
      )
    }

    const fid = Number.parseInt(fidParam, 10)
    if (Number.isNaN(fid) || fid <= 0) {
      return NextResponse.json(
        { error: 'Invalid fid: must be a positive integer' },
        { status: 400 }
      )
    }

    // Get Farcaster service instance and fetch following
    const following = await farcasterService.getUserFollowing(fid)

    return NextResponse.json({
      success: true,
      data: {
        fid,
        following,
        count: following.length
      }
    }, {
      headers: {
        // Cache for 1 hour on Vercel's edge
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
        // Cache for 5 minutes in browser
        'CDN-Cache-Control': 'max-age=300',
        // Vary by fid parameter
        'Vary': 'Accept'
      }
    })

  } catch (error) {
    console.error('Error fetching user following:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      // Check if it's a Neynar API error
      if (error.message.includes('404') || error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid API key' },
          { status: 401 }
        )
      }
      
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 