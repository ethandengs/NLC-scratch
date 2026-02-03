// Setup:
// 1. supabase functions new notify-plans
// 2. Set Env: LINE_CHANNEL_ACCESS_TOKEN

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Init Supabase Client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 2. Calculate Time Range (Now ~ Now + 10 mins)
        // We run this Cron every 10 mins.
        // To be safe, we look ahead 15 mins to avoid missing edge cases.
        const now = new Date()
        const future = new Date(now.getTime() + 15 * 60 * 1000)

        console.log(`[Notify] Checking plans between ${now.toISOString()} and ${future.toISOString()}`)

        // 3. Query Plans
        const { data: plans, error } = await supabaseClient
            .from('spiritual_plans')
            .select('*')
            .is('is_notified', false)
            .not('scheduled_time', 'is', null) // Only valid times
            .lte('scheduled_time', future.toISOString()) // Include past un-notified too? Yes, catch up.
            // Ideally we filter out very old ones (e.g. > 24 hours ago) so we don't spam outdated stuff if cron failed for a day.
            // Let's add .gte('scheduled_time', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
            .gt('scheduled_time', new Date(now.getTime() - 60 * 60 * 1000).toISOString()) // Only catch up 1 hour back
            .order('scheduled_time')

        if (error) throw error

        console.log(`[Notify] Found ${plans.length} plans to notify`)

        if (!plans || plans.length === 0) {
            return new Response(JSON.stringify({ message: 'No plans to notify' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const results = []

        // 4. Iterate and Send Push
        const LINE_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')
        if (!LINE_ACCESS_TOKEN) {
            throw new Error("Missing LINE_CHANNEL_ACCESS_TOKEN Env Var")
        }

        for (const plan of plans) {
            // Construct Message
            const timeString = new Date(plan.scheduled_time).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })
            const message = {
                type: 'text',
                text: `📅 牧養提醒：${timeString}\n行動：${plan.action}\n地點：${plan.location || '無地點'}\n\n加油！願神與你同在！💪`
            }

            // Send to LINE
            const resp = await fetch('https://api.line.me/v2/bot/message/push', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`
                },
                body: JSON.stringify({
                    to: plan.user_id,
                    messages: [message]
                })
            })

            const resultText = await resp.text()
            const success = resp.ok
            console.log(`[Notify Plan ${plan.id}] Send result: ${success} - ${resultText}`)

            results.push({ id: plan.id, success, apiRes: resultText })

            // 5. Update DB if success
            if (success) {
                await supabaseClient
                    .from('spiritual_plans')
                    .update({ is_notified: true })
                    .eq('id', plan.id)
            } else {
                // Log failure but don't stop others
                console.error(`Failed to send LINE message for plan ${plan.id}`)
            }
        }

        return new Response(JSON.stringify({ processed: results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (err: any) {
        console.error(err)
        return new Response(JSON.stringify({ error: err.message || 'Unknown error' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
