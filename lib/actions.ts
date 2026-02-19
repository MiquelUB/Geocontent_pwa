'use server'

import { createClient, supabaseAdmin } from '@/lib/database/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath, unstable_noStore as noStore } from 'next/cache'

// Helper to get a default municipality (TEMPORARY)
// Helper to get a default municipality (TEMPORARY)
export async function getDefaultMunicipalityId() {
  const { data } = await supabaseAdmin.from('municipalities').select('id').limit(1).single();
  return data?.id;
}

export async function getLegends() {
  noStore(); // Force no caching
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch routes with their POIs and Municipality
  const { data: routes, error } = await supabase
    .from('routes')
    .select(`
      *,
      pois(*),
      municipality:municipalities(*)
    `)
    
  if (error) {
    console.error('Error fetching routes (legends):', JSON.stringify(error, null, 2))
    return []
  }

  // Map Routes to "Legends" interface
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return routes.map((route: any) => {
    const mainPoi = route.pois && route.pois.length > 0 ? route.pois[0] : {};
    return {
      id: route.id,
      title: route.title,
      description: route.description,
      category: route.theme_id, // Map theme_id to category
      location_name: route.municipality?.name || 'Unknown',
      latitude: mainPoi.latitude || 0,
      longitude: mainPoi.longitude || 0,
      image_url: mainPoi.image_before_url || '',
      hero_image_url: mainPoi.image_before_url || '', // Using same image for hero for now
      audio_url: mainPoi.audio_url || '',
      video_url: mainPoi.video_url || '',
      is_active: true
    };
  });
}

export async function getLegendById(id: string) {
  noStore();
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: route, error } = await supabase
    .from('routes')
    .select(`
      *,
      pois(*),
      municipality:municipalities(*)
    `)
    .eq('id', id)
    .single()
    
  if (error) {
    console.error('Error fetching route (legend):', JSON.stringify(error, null, 2))
    return null
  }

  const mainPoi = route.pois && route.pois.length > 0 ? route.pois[0] : {};

  return {
      id: route.id,
      title: route.title,
      description: route.description,
      category: route.theme_id,
      location_name: route.municipality?.name || 'Unknown',
      latitude: mainPoi.latitude || 0,
      longitude: mainPoi.longitude || 0,
      image_url: mainPoi.image_before_url || '',
      hero_image_url: mainPoi.image_before_url || '',
      audio_url: mainPoi.audio_url || '',
      video_url: mainPoi.video_url || '',
      is_active: true
  };
}


export async function deleteLegend(id: string) {
  const { error } = await supabaseAdmin
    .from('routes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting route (legend):', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

export async function createLegend(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  // location_name is derived from municipality, ignoring input for now or could store in description?
  const latitude = parseFloat(formData.get('latitude') as string)
  const longitude = parseFloat(formData.get('longitude') as string)
  const image_url = formData.get('image_url') as string || ''
  // hero_image_url not used in POI directly, falling back to image_url
  const audio_url = formData.get('audio_url') as string || ''
  const video_url = formData.get('video_url') as string || ''

  // Map category to valid theme_id
  const validThemes = ['mountain', 'coast', 'city', 'interior', 'bloom'];
  let themeId = category.toLowerCase();
  
  if(!validThemes.includes(themeId)) {
      if(category === "Criatures") themeId = "mountain";
      else if(category === "Fantasmes") themeId = "interior";
      else if(category === "Tresors") themeId = "coast";
      else if(category === "Màgia") themeId = "bloom";
      else themeId = "mountain"; // Fallback
  }

  const municipalityId = await getDefaultMunicipalityId();
  if (!municipalityId) {
      return { success: false, error: "No municipality found. Please seed the database." };
  }

  const { data: route, error: routeError } = await supabaseAdmin
    .from('routes')
    .insert({
      municipality_id: municipalityId,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now(),
      description,
      theme_id: themeId,
      is_premium: false
    })
    .select()
    .single()

  if (routeError) {
    console.error('Error creating route:', routeError)
    return { success: false, error: routeError.message }
  }

  const { error: poiError } = await supabaseAdmin
    .from('pois')
    .insert({
      route_id: route.id,
      title,
      description,
      latitude,
      longitude,
      image_before_url: image_url,
      audio_url,
      video_url,
      sort_order: 0
    })

  if (poiError) {
    console.error('Error creating POI:', poiError)
    return { success: false, error: poiError.message }
  }

  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}


export async function updateLegend(id: string, formData: FormData) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routeUpdates: any = {
    title: formData.get('title'),
    description: formData.get('description'),
    updated_at: new Date().toISOString()
  }

  const category = formData.get('category') as string;
  if(category) {
      const validThemes = ['mountain', 'coast', 'city', 'interior', 'bloom'];
      let themeId = category.toLowerCase();
      if(!validThemes.includes(themeId)) {
          if(category === "Criatures") themeId = "mountain";
          else if(category === "Fantasmes") themeId = "interior";
          else if(category === "Tresors") themeId = "coast";
          else if(category === "Màgia") themeId = "bloom";
          else themeId = "mountain"; 
      }
      routeUpdates.theme_id = themeId;
  }

  const { error: routeError } = await supabaseAdmin
    .from('routes')
    .update(routeUpdates)
    .eq('id', id)

  if (routeError) {
    console.error('Error updating route:', routeError)
    return { success: false, error: routeError.message }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const poiUpdates: any = {
      title: formData.get('title'),
      description: formData.get('description'),
      latitude: parseFloat(formData.get('latitude') as string),
      longitude: parseFloat(formData.get('longitude') as string),
      video_url: formData.get('video_url')
  };

  const image_url = formData.get('image_url') as string
  const audio_url = formData.get('audio_url') as string
  
  if (image_url) poiUpdates.image_before_url = image_url;
  if (audio_url) poiUpdates.audio_url = audio_url;

  const { error: poiError } = await supabaseAdmin
      .from('pois')
      .update(poiUpdates)
      .eq('route_id', id);

  if (poiError) {
      console.error('Error updating POIs:', poiError);
      return { success: false, error: poiError.message };
  }

  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}



export async function loginOrRegister(name: string, email: string) {
    // 1. Check if user exists in Supabase Auth (source of truth for emails)
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
        console.error('Error listing users:', listError);
        return { success: false, error: listError.message };
    }

    const existingAuthUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (existingAuthUser) {
        // 2. If Auth user exists, check if Profile exists
        const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', existingAuthUser.id)
            .single();

        if (existingProfile) {
            return { success: true, user: existingProfile };
        }

        // 3. If Auth exists but Profile missing, create Profile (NO EMAIL FIELD)
        const { data: newProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: existingAuthUser.id,
                username: name,
                // email: email, // REMOVED per PXX Schema audit
                role: 'user',
                xp: 0,
                level: 1
            })
            .select()
            .single();

        if (profileError) {
             return { success: false, error: profileError.message };
        }
        return { success: true, user: newProfile };
    }

    // 4. If User does not exist, Create Auth User
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: 'ChangeMe123!' + Math.random(),
        email_confirm: true,
        user_metadata: { username: name }
    });

    if (authError) {
        return { success: false, error: authError.message };
    }

    if (!authUser.user) return { success: false, error: 'Failed to create user' };

    // 5. Create Profile for new User (NO EMAIL FIELD)
    const { data: finalProfile, error: finalProfileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: authUser.user.id,
            username: name,
            // email: email, // REMOVED per PXX Schema audit
            role: 'user',
            xp: 0,
            level: 1
        })
        .select()
        .single();
        
    if (finalProfileError) return { success: false, error: finalProfileError.message };

    return { success: true, user: finalProfile };
}

export async function getUserProfile(userId: string) {
    noStore();
    const { data } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return data;
}

export async function updateProfileAvatar(userId: string, avatarUrl: string) {
    const { error } = await supabaseAdmin
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);

    if (error) {
        console.error('Error updating avatar:', error);
        return { success: false, error: error.message };
    }
    
    revalidatePath('/profile');
    return { success: true };
}


export async function recordVisit(userId: string, legendId: string) {
    const { data: existing } = await supabaseAdmin
        .from('visited_legends')
        .select('id')
        .eq('user_id', userId)
        .eq('legend_id', legendId)
        .single();

    if (existing) return { success: true, message: 'Already visited' };

    const { error: visitError } = await supabaseAdmin
        .from('visited_legends')
        .insert({ user_id: userId, legend_id: legendId });

    if (visitError) {
        console.error('Visit error:', visitError);
        return { success: false, error: visitError.message };
    }

    const { data: profile } = await supabaseAdmin.from('profiles').select('xp, level').eq('id', userId).single();
    
    if (profile) {
        const newXp = (profile.xp || 0) + 50;
        let newLevel = profile.level;
        
        if (newXp >= 1000) newLevel = 4;
        else if (newXp >= 500) newLevel = 3;
        else if (newXp >= 200) newLevel = 2;
        else newLevel = 1;

        await supabaseAdmin
            .from('profiles')
            .update({ xp: newXp, level: newLevel })
            .eq('id', userId);
            
        return { success: true, newXp, newLevel, leveledUp: newLevel > profile.level };
    }

    return { success: true };
}

export async function getVisitedLegends(userId: string) {
    noStore();
    const { data, error } = await supabaseAdmin
        .from('visited_legends')
        .select(`
            *,
            legend:legends(*)
        `)
        .eq('user_id', userId)
        .order('visited_at', { ascending: false });

    if (error) {
        console.error('Error fetching visited:', error);
        return [];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((item: any) => ({
        ...item.legend,
        visited_at: item.visited_at
    }));
}


export async function getAllProfiles() {
  noStore();
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    
  if (error) {
    console.error('Error fetching all profiles:', error)
    return []
  }

  return data
}
