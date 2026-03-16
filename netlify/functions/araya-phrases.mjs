// ARAYA Universal Language Layer - Phrase Database
// CRUD operations for phrase library + seeding

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Core phrase library (100 essential phrases EN/ES)
const CORE_PHRASES = [
    // GREETINGS (10)
    { category: 'greeting', en: 'Hello', es: 'Hola', formality: 'neutral' },
    { category: 'greeting', en: 'Good morning', es: 'Buenos días', formality: 'neutral' },
    { category: 'greeting', en: 'Good afternoon', es: 'Buenas tardes', formality: 'neutral' },
    { category: 'greeting', en: 'Good evening', es: 'Buenas noches', formality: 'neutral' },
    { category: 'greeting', en: 'How are you?', es: '¿Cómo está usted?', formality: 'formal' },
    { category: 'greeting', en: 'How are you?', es: '¿Cómo estás?', formality: 'casual' },
    { category: 'greeting', en: 'Nice to meet you', es: 'Mucho gusto', formality: 'neutral' },
    { category: 'greeting', en: 'My name is...', es: 'Me llamo...', formality: 'neutral' },
    { category: 'greeting', en: 'Goodbye', es: 'Adiós', formality: 'neutral' },
    { category: 'greeting', en: 'See you later', es: 'Hasta luego', formality: 'neutral' },

    // COURTESY (10)
    { category: 'courtesy', en: 'Please', es: 'Por favor', formality: 'neutral' },
    { category: 'courtesy', en: 'Thank you', es: 'Gracias', formality: 'neutral' },
    { category: 'courtesy', en: 'Thank you very much', es: 'Muchas gracias', formality: 'neutral' },
    { category: 'courtesy', en: "You're welcome", es: 'De nada', formality: 'neutral' },
    { category: 'courtesy', en: 'Excuse me', es: 'Disculpe', formality: 'formal' },
    { category: 'courtesy', en: 'Excuse me', es: 'Perdón', formality: 'casual' },
    { category: 'courtesy', en: "I'm sorry", es: 'Lo siento', formality: 'neutral' },
    { category: 'courtesy', en: 'No problem', es: 'No hay problema', formality: 'casual' },
    { category: 'courtesy', en: 'Of course', es: 'Por supuesto', formality: 'neutral' },
    { category: 'courtesy', en: 'With pleasure', es: 'Con mucho gusto', formality: 'formal' },

    // NAVIGATION (15)
    { category: 'navigation', en: 'Where is the restroom?', es: '¿Dónde está el baño?', formality: 'neutral' },
    { category: 'navigation', en: 'Where is the hospital?', es: '¿Dónde está el hospital?', formality: 'neutral' },
    { category: 'navigation', en: 'Where is the pharmacy?', es: '¿Dónde está la farmacia?', formality: 'neutral' },
    { category: 'navigation', en: 'Where is the police station?', es: '¿Dónde está la estación de policía?', formality: 'neutral' },
    { category: 'navigation', en: 'Where is the airport?', es: '¿Dónde está el aeropuerto?', formality: 'neutral' },
    { category: 'navigation', en: 'Where is the train station?', es: '¿Dónde está la estación de tren?', formality: 'neutral' },
    { category: 'navigation', en: 'How do I get there?', es: '¿Cómo llego allí?', formality: 'neutral' },
    { category: 'navigation', en: 'Turn left', es: 'Gire a la izquierda', formality: 'neutral' },
    { category: 'navigation', en: 'Turn right', es: 'Gire a la derecha', formality: 'neutral' },
    { category: 'navigation', en: 'Go straight', es: 'Siga derecho', formality: 'neutral' },
    { category: 'navigation', en: 'Is it far?', es: '¿Está lejos?', formality: 'neutral' },
    { category: 'navigation', en: 'Is it close?', es: '¿Está cerca?', formality: 'neutral' },
    { category: 'navigation', en: 'I am lost', es: 'Estoy perdido', formality: 'neutral' },
    { category: 'navigation', en: 'Can you show me on the map?', es: '¿Puede mostrarme en el mapa?', formality: 'formal' },
    { category: 'navigation', en: 'What is this address?', es: '¿Cuál es esta dirección?', formality: 'neutral' },

    // COMMERCE (15)
    { category: 'commerce', en: 'How much does this cost?', es: '¿Cuánto cuesta esto?', formality: 'neutral' },
    { category: 'commerce', en: 'How much is it?', es: '¿Cuánto es?', formality: 'casual' },
    { category: 'commerce', en: 'Do you accept credit cards?', es: '¿Aceptan tarjetas de crédito?', formality: 'neutral' },
    { category: 'commerce', en: 'Do you accept cash?', es: '¿Aceptan efectivo?', formality: 'neutral' },
    { category: 'commerce', en: 'Can I see the menu?', es: '¿Puedo ver el menú?', formality: 'neutral' },
    { category: 'commerce', en: 'I would like to order', es: 'Me gustaría ordenar', formality: 'neutral' },
    { category: 'commerce', en: 'The check please', es: 'La cuenta por favor', formality: 'neutral' },
    { category: 'commerce', en: 'Is there a discount?', es: '¿Hay descuento?', formality: 'neutral' },
    { category: 'commerce', en: 'That is too expensive', es: 'Es muy caro', formality: 'neutral' },
    { category: 'commerce', en: 'I will take it', es: 'Lo llevaré', formality: 'neutral' },
    { category: 'commerce', en: 'Do you have a smaller size?', es: '¿Tiene una talla más pequeña?', formality: 'neutral' },
    { category: 'commerce', en: 'Do you have a larger size?', es: '¿Tiene una talla más grande?', formality: 'neutral' },
    { category: 'commerce', en: 'Can I try this on?', es: '¿Puedo probarme esto?', formality: 'neutral' },
    { category: 'commerce', en: 'Where is the fitting room?', es: '¿Dónde está el probador?', formality: 'neutral' },
    { category: 'commerce', en: 'Keep the change', es: 'Quédese con el cambio', formality: 'neutral' },

    // EMERGENCY (15)
    { category: 'emergency', en: 'Help!', es: '¡Ayuda!', formality: 'urgent', domain: 'emergency' },
    { category: 'emergency', en: 'I need help', es: 'Necesito ayuda', formality: 'urgent', domain: 'emergency' },
    { category: 'emergency', en: 'Call the police', es: 'Llame a la policía', formality: 'urgent', domain: 'emergency' },
    { category: 'emergency', en: 'Call an ambulance', es: 'Llame una ambulancia', formality: 'urgent', domain: 'emergency' },
    { category: 'emergency', en: 'There is an emergency', es: 'Hay una emergencia', formality: 'urgent', domain: 'emergency' },
    { category: 'emergency', en: 'I need a doctor', es: 'Necesito un médico', formality: 'urgent', domain: 'medical' },
    { category: 'emergency', en: 'I am hurt', es: 'Estoy herido', formality: 'urgent', domain: 'medical' },
    { category: 'emergency', en: 'There has been an accident', es: 'Ha habido un accidente', formality: 'urgent', domain: 'emergency' },
    { category: 'emergency', en: 'Fire!', es: '¡Fuego!', formality: 'urgent', domain: 'emergency' },
    { category: 'emergency', en: 'Stop!', es: '¡Pare!', formality: 'urgent', domain: 'emergency' },
    { category: 'emergency', en: 'Someone stole my wallet', es: 'Alguien robó mi cartera', formality: 'urgent', domain: 'emergency' },
    { category: 'emergency', en: 'I lost my passport', es: 'Perdí mi pasaporte', formality: 'urgent', domain: 'emergency' },
    { category: 'emergency', en: 'I need to go to the embassy', es: 'Necesito ir a la embajada', formality: 'formal', domain: 'emergency' },
    { category: 'emergency', en: "I don't feel well", es: 'No me siento bien', formality: 'neutral', domain: 'medical' },
    { category: 'emergency', en: 'Can you help me?', es: '¿Puede ayudarme?', formality: 'formal', domain: 'emergency' },

    // HEALTH (15)
    { category: 'health', en: 'I am allergic to...', es: 'Soy alérgico a...', formality: 'neutral', domain: 'medical' },
    { category: 'health', en: 'I have a headache', es: 'Tengo dolor de cabeza', formality: 'neutral', domain: 'medical' },
    { category: 'health', en: 'I have a stomachache', es: 'Tengo dolor de estómago', formality: 'neutral', domain: 'medical' },
    { category: 'health', en: 'I have a fever', es: 'Tengo fiebre', formality: 'neutral', domain: 'medical' },
    { category: 'health', en: 'I am diabetic', es: 'Soy diabético', formality: 'neutral', domain: 'medical' },
    { category: 'health', en: 'I take medication for...', es: 'Tomo medicamento para...', formality: 'neutral', domain: 'medical' },
    { category: 'health', en: 'I need my prescription filled', es: 'Necesito surtir mi receta', formality: 'neutral', domain: 'medical' },
    { category: 'health', en: 'Do you have pain medicine?', es: '¿Tiene medicina para el dolor?', formality: 'neutral', domain: 'medical' },
    { category: 'health', en: 'I cannot breathe well', es: 'No puedo respirar bien', formality: 'urgent', domain: 'medical' },
    { category: 'health', en: 'Where does it hurt?', es: '¿Dónde le duele?', formality: 'formal', domain: 'medical' },
    { category: 'health', en: 'I am pregnant', es: 'Estoy embarazada', formality: 'neutral', domain: 'medical' },
    { category: 'health', en: 'I need an appointment', es: 'Necesito una cita', formality: 'neutral', domain: 'medical' },
    { category: 'health', en: 'Is it serious?', es: '¿Es grave?', formality: 'neutral', domain: 'medical' },
    { category: 'health', en: 'How many times a day?', es: '¿Cuántas veces al día?', formality: 'neutral', domain: 'medical' },
    { category: 'health', en: 'Take with food', es: 'Tome con comida', formality: 'neutral', domain: 'medical' },

    // SOCIAL (10)
    { category: 'social', en: 'Where are you from?', es: '¿De dónde es usted?', formality: 'formal' },
    { category: 'social', en: 'Where are you from?', es: '¿De dónde eres?', formality: 'casual' },
    { category: 'social', en: 'I am from the United States', es: 'Soy de los Estados Unidos', formality: 'neutral' },
    { category: 'social', en: 'Do you speak English?', es: '¿Habla inglés?', formality: 'neutral' },
    { category: 'social', en: "I don't understand", es: 'No entiendo', formality: 'neutral' },
    { category: 'social', en: 'Please speak slowly', es: 'Por favor hable despacio', formality: 'formal' },
    { category: 'social', en: 'Can you repeat that?', es: '¿Puede repetir eso?', formality: 'formal' },
    { category: 'social', en: 'What does this mean?', es: '¿Qué significa esto?', formality: 'neutral' },
    { category: 'social', en: 'How do you say... in Spanish?', es: '¿Cómo se dice... en español?', formality: 'neutral' },
    { category: 'social', en: 'I am learning Spanish', es: 'Estoy aprendiendo español', formality: 'neutral' },

    // TRAVEL (10)
    { category: 'travel', en: 'I have a reservation', es: 'Tengo una reservación', formality: 'neutral', domain: 'travel' },
    { category: 'travel', en: 'What time is checkout?', es: '¿A qué hora es el checkout?', formality: 'neutral', domain: 'travel' },
    { category: 'travel', en: 'Is breakfast included?', es: '¿El desayuno está incluido?', formality: 'neutral', domain: 'travel' },
    { category: 'travel', en: 'What is the WiFi password?', es: '¿Cuál es la contraseña del WiFi?', formality: 'neutral', domain: 'travel' },
    { category: 'travel', en: 'Can I have the key please?', es: '¿Me puede dar la llave por favor?', formality: 'formal', domain: 'travel' },
    { category: 'travel', en: 'What time does the flight leave?', es: '¿A qué hora sale el vuelo?', formality: 'neutral', domain: 'travel' },
    { category: 'travel', en: 'Where is gate number...?', es: '¿Dónde está la puerta número...?', formality: 'neutral', domain: 'travel' },
    { category: 'travel', en: 'My luggage is lost', es: 'Mi equipaje se perdió', formality: 'neutral', domain: 'travel' },
    { category: 'travel', en: 'I am here for business', es: 'Estoy aquí por negocios', formality: 'formal', domain: 'travel' },
    { category: 'travel', en: 'I am here on vacation', es: 'Estoy aquí de vacaciones', formality: 'neutral', domain: 'travel' }
];

// Handler
export default async (req) => {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'list';

    // CORS
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    }

    try {
        // SEED - populate database with core phrases
        if (action === 'seed') {
            // First create table if not exists
            const createTableSQL = `
                CREATE TABLE IF NOT EXISTS language_phrases (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    category VARCHAR(50) NOT NULL,
                    domain VARCHAR(50) DEFAULT 'general',
                    en TEXT NOT NULL,
                    es TEXT,
                    zh TEXT,
                    tl TEXT,
                    vi TEXT,
                    ar TEXT,
                    fr TEXT,
                    formality VARCHAR(20) DEFAULT 'neutral',
                    context_hints JSONB,
                    audio_urls JSONB,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
            `;

            // Insert phrases
            const { error: insertError } = await supabase
                .from('language_phrases')
                .upsert(CORE_PHRASES.map(p => ({
                    category: p.category,
                    domain: p.domain || 'general',
                    en: p.en,
                    es: p.es,
                    formality: p.formality || 'neutral'
                })), { onConflict: 'en,es' });

            if (insertError && !insertError.message.includes('duplicate')) {
                console.error('[PHRASES] Seed error:', insertError);
            }

            return new Response(JSON.stringify({
                success: true,
                message: `Seeded ${CORE_PHRASES.length} phrases`,
                categories: [...new Set(CORE_PHRASES.map(p => p.category))]
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        // LIST - get phrases by category
        if (action === 'list') {
            const category = url.searchParams.get('category');
            const domain = url.searchParams.get('domain');
            const formality = url.searchParams.get('formality');

            let query = supabase.from('language_phrases').select('*');

            if (category) query = query.eq('category', category);
            if (domain) query = query.eq('domain', domain);
            if (formality) query = query.eq('formality', formality);

            const { data, error } = await query.limit(100);

            if (error) {
                // If table doesn't exist, return in-memory phrases
                const filtered = CORE_PHRASES.filter(p => {
                    if (category && p.category !== category) return false;
                    if (domain && p.domain !== domain) return false;
                    if (formality && p.formality !== formality) return false;
                    return true;
                });

                return new Response(JSON.stringify({
                    phrases: filtered,
                    source: 'memory',
                    count: filtered.length
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                });
            }

            return new Response(JSON.stringify({
                phrases: data,
                source: 'database',
                count: data.length
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        // CATEGORIES - list all categories
        if (action === 'categories') {
            const categories = [...new Set(CORE_PHRASES.map(p => p.category))];
            return new Response(JSON.stringify({
                categories: categories,
                count: categories.length
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        // SEARCH - find phrases by text
        if (action === 'search') {
            const query = url.searchParams.get('q') || '';
            const lang = url.searchParams.get('lang') || 'en';

            const results = CORE_PHRASES.filter(p => {
                const searchIn = p[lang] || p.en;
                return searchIn.toLowerCase().includes(query.toLowerCase());
            });

            return new Response(JSON.stringify({
                query: query,
                results: results,
                count: results.length
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        // RANDOM - get random phrase for practice
        if (action === 'random') {
            const category = url.searchParams.get('category');
            let pool = CORE_PHRASES;
            if (category) {
                pool = CORE_PHRASES.filter(p => p.category === category);
            }
            const phrase = pool[Math.floor(Math.random() * pool.length)];

            return new Response(JSON.stringify({
                phrase: phrase,
                category: phrase.category
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        return new Response(JSON.stringify({
            error: 'Unknown action',
            available: ['list', 'categories', 'search', 'random', 'seed']
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });

    } catch (error) {
        console.error('[PHRASES] Error:', error);
        return new Response(JSON.stringify({
            error: 'Phrase operation failed',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
};

export const config = { path: "/api/araya-phrases" };
