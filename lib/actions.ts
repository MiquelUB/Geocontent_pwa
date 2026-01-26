'use server'

import { createClient, supabaseAdmin } from '@/lib/supabase/server'
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

  console.log('SERVER getLegends found:', data?.length)
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
  // Use admin client to bypass RLS
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
  console.log('SERVER createLegend called with formData:', Array.from(formData.keys()));
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const location_name = formData.get('location_name') as string
  const latitude = parseFloat(formData.get('latitude') as string)
  const longitude = parseFloat(formData.get('longitude') as string)
  // Read URLs directly since they are now uploaded client-side
  const image_url = formData.get('image_url') as string || ''
  const hero_image_url = formData.get('hero_image_url') as string || ''
  const audio_url = formData.get('audio_url') as string || ''
  const video_url = formData.get('video_url') as string || ''

  // 4. Insert into DB
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
  const title = formData.get('title') as string
  const category = formData.get('category') as string
  const location_name = formData.get('location_name') as string
  const latitude = parseFloat(formData.get('latitude') as string)
  const longitude = parseFloat(formData.get('longitude') as string)
  // Read URLs directly since they are now uploaded client-side
  const image_url = formData.get('image_url') as string
  const hero_image_url = formData.get('hero_image_url') as string
  const audio_url = formData.get('audio_url') as string

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
    const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

    if (existingUser) {
        return { success: true, user: existingUser };
    }

    // Create new pseudo-user (using a random UUID since we aren't using Auth.users)
    // Note: In a real app we'd use Auth.signUp, but for this "No Password" MVP we treat profiles as the user table.
    // However, profiles usually reference auth.users.id. 
    // To make this work without real auth, we'll generate a UUID.
    // BUT 'profiles.id' references 'auth.users.id'. We might hit a constraint if we insert a random UUID that isn't in auth.users.
    // CHECK: duplicate_key_value violates unique constraint "profiles_pkey" ? No, FK constraint "profiles_id_fkey".
    
    // workaround: We will try to create a "dummy" auth user or check if we can remove the FK constraint.
    // OR BETTER: Use Supabase Admin to create a real Auth user with a random password we don't tell the user, 
    // effectively "ghosting" them, then return that ID.
    
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: 'ChangeMe123!' + Math.random(), // Random password
        email_confirm: true,
        user_metadata: { username: name }
        // We will store the name in metadata
    });


    if (authError) {
        console.error("FULL AUTH ERROR:", JSON.stringify(authError));
        
        // Broaden the check: Check message OR status 422 OR known strings
        const isDuplicate = authError.message?.toLowerCase().includes('already registered') || 
                            authError.message?.toLowerCase().includes('unique constraint') ||
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (authError as any).status === 422;

        if (isDuplicate) {
             console.log("User exists in Auth but not Profiles. Attempting recovery...");
             
             const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
             
             if (listError) {
                console.error("List users error:", listError);
                return { success: false, error: "Recovery failed: Cannot list users." };
             }
             
             // Find user (case insensitive email check)
             const existingAuthUser = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
             
             if (existingAuthUser) {
                 console.log("Recovered user ID:", existingAuthUser.id);
                 
                 // Found the ghost user! Let's ensure their profile exists.
                 const { error: upsertError } = await supabaseAdmin.from('profiles').upsert({
                    id: existingAuthUser.id,
                    username: name,
                    email: email,
                    role: 'user',
                    xp: 0,
                    level: 1
                 });
                 
                 if (upsertError) {
                    // CRITICAL DEBUG LOG
                    console.error("CRITICAL: Recovery upsert failed!", JSON.stringify(upsertError));
                    return { success: false, error: "Profile creation failed: " + upsertError.message };
                 } else {
                    console.log("CRITICAL: Upsert success for recovery.");
                 }

                 
                 return { success: true, user: { id: existingAuthUser.id, username: name, email } };
             } else {
                 console.error("User said duplicate but email not found in listUsers");
             }
             
             return { success: false, error: "User exists but could not be recovered. Please contact support." };
        }
        console.error('Auth error creating user:', authError);
        return { success: false, error: authError.message };
    }




    if (!authUser.user) return { success: false, error: 'Failed to create user' };

    // Now create profile (Trigger might handle it, but let's be safe/explicit if trigger depends on something else)
    // Our trigger 'on_auth_user_created' inserts into profiles. 
    // So we just need to update it with the specific name if the trigger didn't catch metadata correctly or just wait.
    // Let's manually upsert to be sure and add the email column we just added.
    
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: authUser.user.id,
            username: name,
            email: email,
            role: 'user',
            xp: 0,
            level: 1
        });
        
    if (profileError) {
        console.error('Profile error:', profileError);
        return { success: false, error: 'Created user but failed profile.' };
    }

    return { success: true, user: { id: authUser.user.id, username: name, email } };
}

export async function getUserProfile(userId: string) {
    noStore();
    const { data, error } = await supabaseAdmin
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


export async function recordVisit(userId: string, legendId: string, gpsData?: { lat: number; lng: number; accuracy: number }) {
    // 1. Check if already visited
    const { data: existing } = await supabaseAdmin
        .from('visited_legends')
        .select('id')
        .eq('user_id', userId)
        .eq('legend_id', legendId)
        .single();

    if (existing) return { success: true, message: 'Already visited' };

    // 2. Record visit with GPS data if provided
    const { error: visitError } = await supabaseAdmin
        .from('visited_legends')
        .insert({ 
            user_id: userId, 
            legend_id: legendId,
            lat: gpsData?.lat,
            lng: gpsData?.lng,
            accuracy: gpsData?.accuracy
        });

    if (visitError) {
        console.error('Visit error:', visitError);
        return { success: false, error: visitError.message };
    }

    // 3. Award XP (50 XP)
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
    .select(`
      *,
      visited_legends (
        *,
        legend:legends(*)
      ),
      ratings (*)
    `)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching all profiles:', error)
    return []
  }

  return data
}

export async function saveRating(userId: string, legendId: string, rating: number, comment?: string) {
    const { error } = await supabaseAdmin
        .from('ratings')
        .upsert({
            user_id: userId,
            legend_id: legendId,
            rating,
            comment
        }, { onConflict: 'user_id,legend_id' });

    if (error) {
        console.error('Error saving rating:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function updateVisitDuration(userId: string, legendId: string, additionalSeconds: number) {
    // Increment duration_seconds for the specific visit
    // Using a raw RPC or a read-update for simplicity in MVP
    const { data: visit, error: fetchError } = await supabaseAdmin
        .from('visited_legends')
        .select('duration_seconds')
        .eq('user_id', userId)
        .eq('legend_id', legendId)
        .single();
    
    if (fetchError || !visit) return { success: false };

    const { error: updateError } = await supabaseAdmin
        .from('visited_legends')
        .update({ duration_seconds: (visit.duration_seconds || 0) + additionalSeconds })
        .eq('user_id', userId)
        .eq('legend_id', legendId);

    if (updateError) {
        console.error('Error updating duration:', updateError);
        return { success: false };
    }

    return { success: true };
}

export async function updateLastLogin(userId: string) {
    const { error } = await supabaseAdmin
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);

    if (error) {
        console.error('Error updating last login:', error);
    }
}
