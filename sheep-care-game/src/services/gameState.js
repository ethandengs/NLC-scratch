import { supabase, supabaseUrl, supabaseKey } from './supabaseClient';
import { calculateOfflineDecay, sanitizeSheep } from '../utils/gameLogic';

export const gameState = {
    // Load all data (User + Sheep) and apply offline logic
    // Now accepts userId (LINE ID string) directly
    async loadGame(userId) {
        if (!userId) return null;

        // 1. Get User Profile (Using 'line_id' from user schema)
        let { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('line_id', userId)
            .single();

        if (!profile) {
            // Create profile if missing
            const { data: newProfile, error } = await supabase
                .from('users')
                .insert([{ line_id: userId, name: 'Shepherd', coins: 0 }])
                .select()
                .single();

            if (error) {
                console.error('Error creating profile:', error);
                // Return fallback structure
                return { user: { line_id: userId, name: 'Shepherd', coins: 0 }, sheep: [] };
            }
            profile = newProfile;
        }

        // 2. Get Sheep (Using 'user_id' text)
        const { data: sheepList, error: sheepError } = await supabase
            .from('sheep')
            .select('*')
            .eq('user_id', userId);

        if (sheepError) {
            console.error('Error loading sheep:', sheepError);
            return { user: profile, sheep: [] };
        }

        // 3. Calculate Offline Decay
        const now = new Date();
        const updatedSheepList = sheepList.map(s => {
            let visual = s.visual || s.visual_data || {};
            // Schema has 'last_login'
            const lastTime = new Date(s.updated_at || profile.last_login || now);
            const diffHours = (now - lastTime) / (1000 * 60 * 60);

            let updatedSheep = s;
            if (diffHours > 0.1) {
                const sheepForCalc = { ...s, visual };
                if (s.status !== 'dead') {
                    updatedSheep = calculateOfflineDecay(sheepForCalc, diffHours);
                }
            }

            updatedSheep = sanitizeSheep({ ...updatedSheep, visual });
            return updatedSheep;
        });

        // 4. Update Last Login (Schema: 'last_login')
        await supabase
            .from('users')
            .update({ last_login: now.toISOString() })
            .eq('line_id', userId);

        return { user: profile, sheep: updatedSheepList };
    },

    async saveSheep(sheep) {
        const payload = {
            ...sheep,
            updated_at: new Date().toISOString()
        };
        // Ensure mapping
        if (sheep.visual) {
            payload.visual = sheep.visual;
            payload.visual_data = sheep.visual;
        }

        const { error } = await supabase
            .from('sheep')
            .upsert(payload);

        if (error) console.error('Error saving sheep:', error);
    },

    async saveAllSheep(sheepList) {
        if (!sheepList || sheepList.length === 0) return;

        const payload = sheepList.map(s => ({
            ...s,
            visual: s.visual,
            visual_data: s.visual,
            updated_at: new Date().toISOString()
        }));

        const { error } = await supabase
            .from('sheep')
            .upsert(payload);

        if (error) console.error('Error batch saving sheep:', error);
    },

    async saveUserProfile(userId, updates) {
        const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('line_id', userId);

        if (error) console.error('Error saving user profile:', error);
    },

    async createSheep(sheep) {
        if (!sheep.user_id) {
            console.error("createSheep requires user_id");
            return null;
        }

        const payload = {
            ...sheep,
            visual: sheep.visual,
            visual_data: sheep.visual,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        if (!payload.id) delete payload.id;

        // Insert
        const { data, error } = await supabase
            .from('sheep')
            .insert([payload])
            .select()
            .single();

        if (error) {
            console.error('Error creating sheep:', error);
            return null;
        }
        return data;
    },

    async deleteSheep(id) {
        const { error } = await supabase
            .from('sheep')
            .delete()
            .eq('id', id);
        if (error) console.error('Error deleting sheep:', error);
    },

    // NUCLEAR OPTION: Synchronous XHR for absolute reliability on close
    saveGameSync(userId, sheepList, userProfile) {
        if (!userId) return;

        // 1. Save Profile
        if (userProfile) {
            try {
                const url = `${supabaseUrl}/rest/v1/users?line_id=eq.${userId}`;
                const xhr = new XMLHttpRequest();
                xhr.open('PATCH', url, false); // FALSE = Synchronous
                xhr.setRequestHeader('apikey', supabaseKey);
                xhr.setRequestHeader('Authorization', `Bearer ${supabaseKey}`);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Prefer', 'return=minimal');
                xhr.send(JSON.stringify(userProfile));
            } catch (e) {
                console.error("Sync Save Profile Failed", e);
            }
        }

        // 2. Save Sheep
        if (sheepList && sheepList.length > 0) {
            try {
                const sheepPayload = sheepList.map(s => ({
                    ...s,
                    user_id: s.user_id || userId,
                    visual: s.visual,
                    visual_data: s.visual,
                    updated_at: new Date().toISOString()
                }));

                const url = `${supabaseUrl}/rest/v1/sheep`;
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url, false); // FALSE = Synchronous
                xhr.setRequestHeader('apikey', supabaseKey);
                xhr.setRequestHeader('Authorization', `Bearer ${supabaseKey}`);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Prefer', 'resolution=merge-duplicates,return=minimal');
                xhr.send(JSON.stringify(sheepPayload));
            } catch (e) {
                console.error("Sync Save Sheep Failed", e);
            }
        }
    }
};
