/**
 * Script Node.js pour créer des professionnels via l'API Supabase Admin
 * 
 * Ce script utilise l'API Supabase Admin pour créer des utilisateurs et leurs profils
 * 
 * PRÉREQUIS:
 * 1. Installer les dépendances: npm install @supabase/supabase-js
 * 2. Configurer les variables d'environnement:
 *    - SUPABASE_URL: URL de votre projet Supabase
 *    - SUPABASE_SERVICE_ROLE_KEY: Clé service_role (trouvable dans Settings > API)
 * 
 * USAGE:
 * npx ts-node insert-professionals-api.ts
 * ou
 * node insert-professionals-api.js (après compilation)
 */

import { createClient } from '@supabase/supabase-js';

// Configuration - REMPLACER par vos valeurs
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://neucmsawqhaglkuxsfag.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'VOTRE_CLE_SERVICE_ROLE';

// Initialiser le client Supabase Admin
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Liste des professionnels à créer avec leurs SIRET réels
interface ProfessionalData {
  email: string;
  password: string;
  fullName: string;
  firstname: string;
  lastname: string;
  civility: 'Mr' | 'Mme' | 'Autre';
  address: string;
  postalCode: string;
  city: string;
  phone?: string;
  companyName: string;
  siret: string;
  category: string;
  apeCode: string;
}

const professionals: ProfessionalData[] = [
  {
    email: 'sephora.test@example.com',
    password: 'Test123456!',
    fullName: 'SEPHORA GARDEZ',
    firstname: 'SEPHORA',
    lastname: 'GARDEZ',
    civility: 'Mr',
    address: 'Centre Commercial Grand Garde',
    postalCode: '30100',
    city: 'ALES',
    companyName: 'SEPHORA GARDEZ (SEPHORA BEAUTY)',
    siret: '92886899100011',
    category: 'Beauté & Esthétique',
    apeCode: '47.75Z' // Commerce de détail de parfumerie et de produits de beauté
  },
  {
    email: 'champagne.bonnet@example.com',
    password: 'Test123456!',
    fullName: 'CHAMPAGNE F.BONNET P.& F.',
    firstname: 'CHAMPAGNE',
    lastname: 'F.BONNET P.& F.',
    civility: 'Mr',
    address: 'REIMS 12 ALLEE DU VIGNOBLE',
    postalCode: '51100',
    city: 'REIMS',
    companyName: 'CHAMPAGNE F.BONNET P.& F.',
    siret: '09555049700036',
    category: 'Vins & Spiritueux',
    apeCode: '11.02A' // Fabrication de vins effervescents
  },
  {
    email: 'boulangerie.test@example.com',
    password: 'Test123456!',
    fullName: 'BOULANGERIE PARISIENNE',
    firstname: 'BOULANGERIE',
    lastname: 'PARISIENNE',
    civility: 'Mr',
    address: '123 RUE DE LA REPUBLIQUE',
    postalCode: '75001',
    city: 'PARIS',
    companyName: 'BOULANGERIE PARISIENNE',
    siret: '12345678901234', // REMPLACER par un vrai SIRET
    category: 'Alimentation',
    apeCode: '10.71Z' // Fabrication de pain et de pâtisserie
  },
  {
    email: 'restaurant.test@example.com',
    password: 'Test123456!',
    fullName: 'RESTAURANT LE GOURMET',
    firstname: 'RESTAURANT',
    lastname: 'LE GOURMET',
    civility: 'Mr',
    address: '45 AVENUE DES CHAMPS ELYSEES',
    postalCode: '75008',
    city: 'PARIS',
    companyName: 'RESTAURANT LE GOURMET',
    siret: '98765432109876', // REMPLACER par un vrai SIRET
    category: 'Restauration',
    apeCode: '56.10A' // Restauration traditionnelle
  },
  {
    email: 'coiffeur.test@example.com',
    password: 'Test123456!',
    fullName: 'SALON DE COIFFURE ELEGANCE',
    firstname: 'SALON',
    lastname: 'DE COIFFURE ELEGANCE',
    civility: 'Mr',
    address: '78 BOULEVARD SAINT-GERMAIN',
    postalCode: '75005',
    city: 'PARIS',
    companyName: 'SALON DE COIFFURE ELEGANCE',
    siret: '11223344556677', // REMPLACER par un vrai SIRET
    category: 'Beauté & Esthétique',
    apeCode: '96.02Z' // Coiffure et soins de beauté
  }
];

/**
 * Crée un professionnel complet (utilisateur + profil + profil professionnel)
 */
async function createProfessional(data: ProfessionalData): Promise<void> {
  try {
    console.log(`\n📝 Création du professionnel: ${data.companyName}`);
    
    // 1. Créer l'utilisateur via l'API Admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // Confirmer automatiquement l'email
      user_metadata: {
        full_name: data.fullName,
        user_type: 'professionnel'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`⚠️  Utilisateur ${data.email} existe déjà, récupération de l'ID...`);
        // Récupérer l'utilisateur existant
        const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
        const user = existingUser?.users.find(u => u.email === data.email);
        if (!user) {
          throw new Error(`Impossible de trouver l'utilisateur ${data.email}`);
        }
        authData.user = user;
      } else {
        throw authError;
      }
    }

    if (!authData.user) {
      throw new Error('Impossible de créer ou récupérer l\'utilisateur');
    }

    const userId = authData.user.id;
    console.log(`✅ Utilisateur créé: ${userId}`);

    // 2. Créer le profil
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        user_type: 'professionnel',
        full_name: data.fullName,
        firstname: data.firstname,
        lastname: data.lastname,
        civility: data.civility,
        birth_date: '1990-01-01',
        phone: data.phone || '0000000000',
        address: data.address,
        postal_code: data.postalCode,
        city: data.city,
        points: 0
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      throw new Error(`Erreur lors de la création du profil: ${profileError.message}`);
    }
    console.log(`✅ Profil créé`);

    // 3. Créer le profil professionnel
    const { error: professionalError } = await supabaseAdmin
      .from('professional_profiles')
      .upsert({
        user_id: userId,
        company_name: data.companyName,
        siret: data.siret,
        category: data.category,
        ape_code: data.apeCode,
        verified: true
      }, {
        onConflict: 'user_id'
      });

    if (professionalError) {
      throw new Error(`Erreur lors de la création du profil professionnel: ${professionalError.message}`);
    }
    console.log(`✅ Profil professionnel créé (SIRET: ${data.siret}, APE: ${data.apeCode})`);

    console.log(`✅ Professionnel créé avec succès: ${data.companyName}`);
  } catch (error: any) {
    console.error(`❌ Erreur lors de la création de ${data.companyName}:`, error.message);
    throw error;
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Début de la création des professionnels...\n');
  console.log(`📊 Nombre de professionnels à créer: ${professionals.length}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const professional of professionals) {
    try {
      await createProfessional(professional);
      successCount++;
    } catch (error: any) {
      console.error(`❌ Échec pour ${professional.companyName}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉSUMÉ');
  console.log('='.repeat(50));
  console.log(`✅ Succès: ${successCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
  console.log(`📝 Total: ${professionals.length}`);

  // Afficher tous les professionnels créés
  console.log('\n📋 Liste des professionnels dans la base:');
  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      id,
      full_name,
      user_type,
      address,
      city,
      professional_profiles (
        company_name,
        siret,
        category,
        ape_code,
        verified
      )
    `)
    .eq('user_type', 'professionnel')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération:', error.message);
  } else {
    profiles?.forEach((profile: any) => {
      const pro = profile.professional_profiles?.[0];
      console.log(`\n- ${profile.full_name}`);
      if (pro) {
        console.log(`  Entreprise: ${pro.company_name}`);
        console.log(`  SIRET: ${pro.siret}`);
        console.log(`  Catégorie: ${pro.category}`);
        console.log(`  Code APE: ${pro.ape_code}`);
      }
    });
  }
}

// Exécuter le script
main().catch(console.error);

