import { NextResponse } from 'next/server';

const INSTAGRAM_API_URL = 'https://www.instagram.com/api/v1/users/web_profile_info/';

interface InstagramPost {
  node: {
    edge_liked_by: {
      count: number;
    };
    edge_media_to_comment: {
      count: number;
    };
  };
}

interface InstagramUser {
  edge_owner_to_timeline_media: {
    edges: InstagramPost[];
  };
  edge_followed_by: {
    count: number;
  };
  edge_follow: {
    count: number;
  };
  username: string;
  full_name: string;
}

interface InstagramData {
  data: {
    user: InstagramUser;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    console.log('Fetching data for username:', username);
    
    // First, get the user's profile page to get the cookies
    const profileResponse = await fetch(`https://www.instagram.com/${username}/`, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Dest': 'document',
        'Referer': 'https://www.instagram.com/',
      }
    });

    if (!profileResponse.ok) {
      console.error('Failed to fetch profile page:', profileResponse.status, profileResponse.statusText);
      throw new Error('Failed to fetch profile page');
    }

    const cookies = profileResponse.headers.get('set-cookie');
    console.log('Got cookies:', cookies ? 'yes' : 'no');

    // Now fetch the actual data with the cookies
    const response = await fetch(`${INSTAGRAM_API_URL}?username=${username}`, {
      headers: {
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'X-IG-App-ID': '936619743392459',
        'X-Requested-With': 'XMLHttpRequest',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Referer': `https://www.instagram.com/${username}/`,
        'Cookie': cookies || '',
      }
    });

    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      console.error('Failed to fetch Instagram data:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch Instagram data: ${response.status}`);
    }

    const data: InstagramData = await response.json();
    console.log('Successfully parsed response data');

    if (!data.data?.user) {
      console.error('No user data in response:', data);
      throw new Error('User not found');
    }

    const user = data.data.user;

    return NextResponse.json({
      username: user.username,
      fullName: user.full_name,
      followers: user.edge_followed_by.count,
      following: user.edge_follow.count,
      posts: user.edge_owner_to_timeline_media.edges.length,
      engagement: calculateEngagement(user),
      avgLikes: calculateAvgLikes(user),
      avgComments: calculateAvgComments(user),
    });
  } catch (error) {
    console.error('Error in Instagram API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Instagram data' },
      { status: 500 }
    );
  }
}

function calculateEngagement(user: InstagramUser) {
  const posts = user.edge_owner_to_timeline_media.edges;
  if (!posts.length) return 0;

  const totalEngagement = posts.reduce((sum: number, post: InstagramPost) => {
    return sum + post.node.edge_liked_by.count + post.node.edge_media_to_comment.count;
  }, 0);

  return (totalEngagement / posts.length / user.edge_followed_by.count) * 100;
}

function calculateAvgLikes(user: InstagramUser) {
  const posts = user.edge_owner_to_timeline_media.edges;
  if (!posts.length) return 0;

  const totalLikes = posts.reduce((sum: number, post: InstagramPost) => {
    return sum + post.node.edge_liked_by.count;
  }, 0);

  return Math.round(totalLikes / posts.length);
}

function calculateAvgComments(user: InstagramUser) {
  const posts = user.edge_owner_to_timeline_media.edges;
  if (!posts.length) return 0;

  const totalComments = posts.reduce((sum: number, post: InstagramPost) => {
    return sum + post.node.edge_media_to_comment.count;
  }, 0);

  return Math.round(totalComments / posts.length);
}
