'use server'

import { createClient, supabaseAdmin } from '@/lib/database/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath, unstable_noStore as noStore } from 'next/cache'

export async function getLegends() {
  noStore(); // Force no caching
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from('legends')
    .select('*')
    .eq('is_active', true) 
    
  if (error) {
    console.error('Error fetching legends:', error)
    return []
  }

  return data
}

export async function getLegendById(id: string) {
  noStore();
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from('legends')
    .select('*')
    .eq('id', id)
    .single()
    
  if (error) {
    console.error('Error fetching legend:', error)
    return null
  }

  return data
}


export async function deleteLegend(id: string) {
  const { error } = await supabaseAdmin
    .from('legends')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting legend:', error)
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
  const location_name = formData.get('location_name') as string
  const latitude = parseFloat(formData.get('latitude') as string)
  const longitude = parseFloat(formData.get('longitude') as string)
  const image_url = formData.get('image_url') as string || ''
  const hero_image_url = formData.get('hero_image_url') as string || ''
  const audio_url = formData.get('audio_url') as string || ''
  const video_url = formData.get('video_url') as string || ''

  const { error } = await supabaseAdmin
    .from('legends')
    .insert({
      title,
      description,
      category,
      location_name,
      latitude,
      longitude,
      image_url,
      hero_image_url,
      audio_url,
      video_url,
      is_active: true
    })

  if (error) {
    console.error('Error creating legend:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}


export async function updateLegend(id: string, formData: FormData) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: any = {
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
    location_name: formData.get('location_name'),
    latitude: parseFloat(formData.get('latitude') as string),
    longitude: parseFloat(formData.get('longitude') as string),
    video_url: formData.get('video_url'), 
    updated_at: new Date().toISOString()
  }

  const image_url = formData.get('image_url') as string
  const hero_image_url = formData.get('hero_image_url') as string
  const audio_url = formData.get('audio_url') as string

  if (image_url) updates.image_url = image_url;
  if (hero_image_url) updates.hero_image_url = hero_image_url;
  if (audio_url) updates.audio_url = audio_url;

  const { error } = await supabaseAdmin
    .from('legends')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('Error updating legend:', error)
    return { success: false, error: error.message }
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
