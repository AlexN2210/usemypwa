import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, userType: 'professional' | 'individual', profession?: string, siret?: string, companyName?: string, address?: string, postalCode?: string, city?: string, phone?: string, apeCode?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string): Promise<boolean> => {
    try {
      console.log('📥 Chargement du profil pour:', userId);
      
      // Utiliser Promise.race pour gérer le timeout de manière plus fiable
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('TIMEOUT: La requête de chargement du profil a pris plus de 5 secondes'));
        }, 5000);
      });
      
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('🔍 Exécution de la requête Supabase...');
      const startTime = Date.now();
      
      try {
        const result = await Promise.race([profilePromise, timeoutPromise]) as any;
        const duration = Date.now() - startTime;
        console.log(`⏱️ Requête terminée en ${duration}ms`);
        
        return await handleProfileResult(result, userId);
      } catch (timeoutError: unknown) {
        const duration = Date.now() - startTime;
        console.error(`⏱️ TIMEOUT après ${duration}ms`);
        throw timeoutError;
      }
    } catch (err: unknown) {
      console.error('❌ Erreur inattendue lors du chargement du profil:', err);
      if (err instanceof Error) {
        if (err.name === 'AbortError' || err.message?.includes('timeout') || err.message?.includes('TIMEOUT')) {
          console.error('⏱️ TIMEOUT: La requête a pris trop de temps');
          console.error('💡 Causes possibles:');
          console.error('   - Problème de connexion Internet');
          console.error('   - Problème avec Supabase (vérifiez le statut)');
          console.error('   - Le profil n\'existe pas et la requête bloque');
          console.error('💡 Solution: Vérifiez que le profil existe dans la base de données');
          console.error('💡 Script SQL disponible: create-profile-for-user.sql');
        } else {
          console.error('💡 Erreur:', err.message);
        }
      } else if (typeof err === 'object' && err !== null) {
        const maybeName = (err as { name?: unknown }).name;
        const maybeMessage = (err as { message?: unknown }).message;
        if (maybeName === 'AbortError' || (typeof maybeMessage === 'string' && (maybeMessage.includes('timeout') || maybeMessage.includes('TIMEOUT')))) {
          console.error('⏱️ TIMEOUT: La requête a pris trop de temps');
          console.error('💡 Solution: Vérifiez que le profil existe dans la base de données');
        }
      }
      return false;
    }
  };

  const handleProfileResult = async (result: any, userId: string): Promise<boolean> => {
    const { data, error } = result;

    if (error) {
      console.error('❌ Erreur lors du chargement du profil:', error);
      console.error('📋 Détails complets:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // Gestion des erreurs d'authentification
      if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('401')) {
        console.warn('⚠️ Session expirée ou non authentifiée - Déconnexion automatique');
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
      }
      return false;
    }

    if (data) {
      console.log('✅ Profil chargé avec succès:', data.full_name || 'Sans nom');
      console.log('📋 Informations du profil:', {
        id: data.id?.substring(0, 8) + '...',
        user_type: data.user_type,
        full_name: data.full_name,
        has_firstname: !!data.firstname,
        has_lastname: !!data.lastname,
        has_civility: !!data.civility
      });
      setProfile(data);
      return true;
    }
    
    console.warn('⚠️ Aucun profil trouvé pour cet utilisateur:', userId);
    console.warn('💡 Le profil doit être créé dans la base de données');
    console.warn('💡 Vérifiez que le trigger handle_new_user fonctionne ou créez le profil manuellement');
    console.warn('💡 Script SQL disponible: create-profile-for-user.sql');
    return false;
  };

  // Fonction utilitaire pour attendre qu'un profil existe (avec retry)
  const waitForProfile = async (userId: string, maxAttempts = 5, delayMs = 500): Promise<boolean> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        console.log(`✅ Profil trouvé après ${attempt + 1} tentative(s)`);
        return true;
      }

      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    return false;
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    let sessionReceived = false;

    // Utiliser onAuthStateChange comme source principale (plus fiable que getSession)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (!mounted) return;

        console.log(`🔄 onAuthStateChange: ${event}`, session?.user?.id || 'no user');
        
        sessionReceived = true;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Arrêter le loader IMMÉDIATEMENT après avoir reçu la session
        // Ne pas attendre le chargement du profil (non-bloquant)
        if (mounted) {
          clearTimeout(timeoutId);
          setLoading(false);
          console.log('✅ Chargement terminé - Arrêt du loader (via onAuthStateChange)');
        }
        
        // Charger le profil en arrière-plan (non-bloquant)
        if (session?.user) {
          console.log('👤 Utilisateur trouvé via onAuthStateChange, chargement du profil...');
          
          // Attendre un peu avant de charger le profil (pour éviter les timeouts juste après création)
          setTimeout(async () => {
            if (!mounted) return;
            
            const profileLoaded = await loadProfile(session.user.id);
            
            // Si aucun profil n'est trouvé après plusieurs tentatives, c'est une situation anormale
            if (!profileLoaded && mounted) {
              console.warn('⚠️ Profil non trouvé - Nouvelle tentative dans 2 secondes...');
              
              // Réessayer une fois après 2 secondes
              setTimeout(async () => {
                if (!mounted) return;
                
                const retryLoaded = await loadProfile(session.user.id);
                if (!retryLoaded && mounted) {
                  console.error('❌ ERREUR: Utilisateur avec session mais sans profil après 2 tentatives');
                  console.error('💡 Le profil doit être créé dans la base de données');
                  console.error('💡 Script SQL disponible: create-profile-for-user.sql');
                  // Ne pas déconnecter automatiquement - laisser l'utilisateur voir l'erreur
                }
              }, 2000);
            }
          }, 1000); // Attendre 1 seconde avant de charger le profil
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('❌ Erreur dans onAuthStateChange:', err);
        // S'assurer que le loader s'arrête même en cas d'erreur
        if (mounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    });

    // Essayer getSession() en arrière-plan (non-bloquant)
    const initSession = async () => {
      try {
        console.log('🔄 Initialisation de la session...');
        
        // Timeout de sécurité : si onAuthStateChange ne répond pas dans 3 secondes
        timeoutId = setTimeout(() => {
          if (mounted && !sessionReceived) {
            console.warn('⚠️ TIMEOUT - onAuthStateChange n\'a pas répondu dans les 3 secondes');
            console.warn('💡 Arrêt du loader - l\'application continuera en mode déconnecté');
            setLoading(false);
            setSession(null);
            setUser(null);
          }
        }, 3000);

        // Diagnostics : Vérifier la configuration Supabase
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        console.log('🔧 Diagnostics Supabase:', {
          url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NON DÉFINIE',
          hasKey: !!supabaseKey,
          keyLength: supabaseKey?.length || 0,
          localStorageAvailable: typeof localStorage !== 'undefined'
        });
        
        // Test de connectivité rapide
        try {
          const testUrl = supabaseUrl?.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`;
          const controller = new AbortController();
          const testTimeoutId = setTimeout(() => controller.abort(), 2000);
          
          const testResponse = await Promise.race([
            fetch(`${testUrl}/rest/v1/`, { 
              method: 'HEAD',
              headers: { 'apikey': supabaseKey || '' },
              signal: controller.signal
            }),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Test timeout')), 2000)
            )
          ]);
          
          clearTimeout(testTimeoutId);
          const canConnect = testResponse.ok || testResponse.status < 500;
          console.log(canConnect ? '✅ Test de connectivité réussi' : '⚠️ Test de connectivité échoué');
        } catch (testError) {
          console.warn('⚠️ Impossible de tester la connectivité Supabase:', testError);
        }
        
        // Essayer getSession() en arrière-plan (non-bloquant, ne bloque pas le loader)
        console.log('🔍 Tentative de récupération de session via getSession() (non-bloquant)...');
        supabase.auth.getSession()
          .then(({ data: { session }, error }) => {
            if (!mounted || sessionReceived) return; // Ignorer si onAuthStateChange a déjà répondu
            
            if (error) {
              console.error('❌ Erreur lors de getSession():', error);
              return;
            }
            
            if (session) {
              console.log('📋 Session récupérée via getSession() (fallback)');
              setSession(session);
              setUser(session.user);
              if (session.user) {
                loadProfile(session.user.id).catch(err => {
                  console.warn('⚠️ Erreur lors du chargement du profil:', err);
                });
              }
            } else {
              console.log('ℹ️ Aucune session trouvée via getSession()');
            }
            
            if (mounted && !sessionReceived) {
              clearTimeout(timeoutId);
              setLoading(false);
              console.log('✅ Chargement terminé - Arrêt du loader (via getSession fallback)');
            }
          })
          .catch(err => {
            console.warn('⚠️ getSession() a échoué (non bloquant):', err);
            // Ne pas bloquer - onAuthStateChange devrait gérer
          });
        
      } catch (err) {
        console.error('❌ Erreur lors de l\'initialisation de la session:', err);
        if (mounted && !sessionReceived) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    initSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Vérifier que l'utilisateur a un profil après connexion
    if (data.user) {
      const profileExists = await loadProfile(data.user.id);
      if (!profileExists) {
        // Si pas de profil, déconnecter l'utilisateur
        console.warn('⚠️ Aucun profil trouvé après connexion - Déconnexion');
        await supabase.auth.signOut();
        throw new Error('Aucun profil trouvé. Veuillez vous inscrire à nouveau.');
      }
    }
  };

  const signUp = async (
    email: string, 
    password: string,
    fullName: string, 
    userType: 'professional' | 'individual', 
    profession?: string, 
    siret?: string, 
    companyName?: string,
    address?: string,
    postalCode?: string,
    city?: string,
    phone?: string,
    apeCode?: string
  ) => {
    // Log des données de localisation et téléphone reçues
    console.log('📍 Données reçues dans signUp:', {
      address: address || 'non défini',
      postalCode: postalCode || 'non défini',
      city: city || 'non défini',
      phone: phone || 'non défini',
      userType
    });
    
    // Validation des données avant l'inscription
    if (!email || !email.includes('@')) {
      throw new Error('Email invalide');
    }
    if (!password || password.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères');
    }
    if (!fullName || fullName.trim().length === 0) {
      throw new Error('Le nom complet est requis');
    }

    // Mapper userType vers les valeurs attendues par la base de données
    // 'individual' -> 'particulier', 'professional' -> 'professionnel'
    const dbUserType = userType === 'individual' ? 'particulier' : 'professionnel';
    
    // Inscription avec métadonnées pour le trigger
    const { data, error } = await supabase.auth.signUp({ 
      email: email.trim(), 
      password: password,
      options: {
        emailRedirectTo: `${window.location.origin}`,
        data: {
          full_name: fullName.trim(),
          user_type: dbUserType
        }
      }
    });
    
    if (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      console.error('Détails de l\'erreur:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      
      // Messages d'erreur plus clairs
      if (error.message.includes('Email signups are disabled') || error.message.includes('signups are disabled')) {
        throw new Error('L\'inscription par email est désactivée dans Supabase. Veuillez contacter l\'administrateur ou activer l\'inscription dans les paramètres Supabase (Authentication → Settings → Enable email signups).');
      }
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        throw new Error('Cet email est déjà enregistré');
      }
      if (error.message.includes('Invalid email')) {
        throw new Error('Email invalide');
      }
      if (error.message.includes('Password')) {
        throw new Error('Le mot de passe ne respecte pas les critères de sécurité');
      }
      
      throw new Error(error.message || 'Erreur lors de l\'inscription');
    }
    
    if (!data.user) {
      throw new Error('Inscription échouée : aucun utilisateur créé');
    }

    // Si email confirmation est requis, data.session sera null
    // Dans ce cas, le trigger créera le profil et l'utilisateur devra confirmer son email
    if (!data.session) {
      console.log('📧 Email de confirmation requis - Le profil sera créé après confirmation');
      // Le trigger créera le profil même sans session
      // L'utilisateur devra confirmer son email pour se connecter
      throw new Error('Un email de confirmation a été envoyé. Veuillez vérifier votre boîte mail et confirmer votre compte.');
    }

    // Attendre que la session soit établie
    let attempts = 0;
    let currentSession = null;
    while (attempts < 10 && !currentSession) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        currentSession = session;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 300));
      attempts++;
    }

    if (!currentSession) {
      console.warn('⚠️ Session non établie après inscription');
    }

    // Le profil DOIT être créé avant de confirmer l'inscription
    // Attendre que le profil soit créé par le trigger ou le créer manuellement
    const profileExists = await waitForProfile(data.user.id);

    if (!profileExists) {
      // Vérifier la session avant création manuelle
      const { data: { session: checkSession } } = await supabase.auth.getSession();
      if (!checkSession) {
        throw new Error('Session non disponible. Veuillez vous reconnecter.');
      }

      console.log('📝 Création manuelle du profil pour:', data.user.id);
      
      // Mapper userType vers les valeurs attendues par la base de données
      // 'individual' -> 'particulier', 'professional' -> 'professionnel'
      const dbUserType = userType === 'individual' ? 'particulier' : 'professionnel';
      
      // Extraire le prénom et le nom de famille
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || 'Utilisateur';
      const lastName = nameParts.slice(1).join(' ') || 'Utilisateur';
      
      // Utiliser les données de localisation et téléphone si disponibles (pour particuliers et professionnels)
      const profileData: any = {
        id: data.user.id,
        full_name: fullName,
        user_type: dbUserType,
        firstname: firstName,
        lastname: lastName,
        civility: 'Mr',
        birth_date: '1990-01-01',
        // Utiliser le téléphone récupéré via SIRET ou valeur par défaut
        phone: phone || '0000000000',
        // Utiliser les données de localisation si disponibles (récupérées via SIRET pour les professionnels)
        address: address || 'Non renseigne',
        postal_code: postalCode || '00000',
        city: city || 'Non renseigne',
        points: 0
      };
      
      console.log('📋 Données du profil à créer:', {
        address: profileData.address,
        postal_code: profileData.postal_code,
        city: profileData.city,
        phone: profileData.phone
      });
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (profileError) {
        console.error('❌ Erreur lors de la création du profil:', profileError);
        console.error('📋 Détails de l\'erreur:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });
        // Si on ne peut pas créer le profil, annuler l'inscription
        await supabase.auth.signOut();
        throw new Error('Impossible de créer le profil. L\'inscription a été annulée.');
      }
      console.log('✅ Profil créé avec succès');
      
      // Attendre un peu pour que Supabase indexe le profil avant de le charger
      console.log('⏳ Attente de 1 seconde pour l\'indexation...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      // Le profil existe déjà (créé par le trigger)
      // Mettre à jour les données de localisation et téléphone si elles sont disponibles et différentes des valeurs par défaut
      const shouldUpdate = (address && address !== 'Non renseigne' && address.trim() !== '') ||
                          (phone && phone !== '0000000000' && phone.trim() !== '');
      
      if (shouldUpdate) {
        console.log('📍 Mise à jour des informations du profil:', {
          address,
          postalCode,
          city,
          phone
        });
        
        const updateData: any = {};
        if (address && address !== 'Non renseigne') updateData.address = address;
        if (postalCode && postalCode !== '00000') updateData.postal_code = postalCode;
        if (city && city !== 'Non renseigne') updateData.city = city;
        if (phone && phone !== '0000000000' && phone.trim() !== '') updateData.phone = phone;
        
        if (Object.keys(updateData).length > 0) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', data.user.id);
          
          if (updateError) {
            console.error('⚠️ Erreur lors de la mise à jour du profil:', updateError);
          } else {
            console.log('✅ Informations du profil mises à jour:', updateData);
          }
        }
      }
    }
    
    // Ne pas appeler loadProfile immédiatement car cela peut causer un timeout
    // Le profil sera chargé automatiquement par onAuthStateChange
    console.log('✅ Inscription terminée - Le profil sera chargé automatiquement');

    // Création du profil professionnel si nécessaire
    if (userType === 'professional' && profession && siret && companyName) {
      console.log('📝 Création du profil professionnel pour:', data.user.id);
      console.log('📋 Données:', { profession, siret, companyName, apeCode });
      
      // Préparer les données avec 'category' (pas 'profession') et 'ape_code'
      const professionalData: any = {
        user_id: data.user.id,
        category: profession, // IMPORTANT: Utiliser 'category' et non 'profession'
        siret,
        company_name: companyName,
      };
      
      // Ajouter le code APE si disponible
      if (apeCode && apeCode.trim() !== '') {
        professionalData.ape_code = apeCode;
        console.log('✅ Code APE ajouté aux données:', apeCode);
      } else {
        console.log('⚠️ Code APE non disponible ou vide:', apeCode);
      }
      
      console.log('📤 Données envoyées à professional_profiles:', professionalData);
      
      const { error: professionalError } = await supabase
        .from('professional_profiles')
        .insert(professionalData);

      if (professionalError) {
        console.error('❌ Erreur lors de la création du profil professionnel:', professionalError);
        console.error('📋 Détails:', {
          code: professionalError.code,
          message: professionalError.message,
          details: professionalError.details,
          hint: professionalError.hint
        });
        
        // Gestion des erreurs spécifiques
        if (professionalError.code === 'PGRST205' || professionalError.message?.includes('Could not find the table')) {
          throw new Error('La table professional_profiles n\'existe pas dans la base de données. Veuillez exécuter le script SQL create-professional-profiles-table.sql dans Supabase.');
        }
        
        if (professionalError.code === 'PGRST204' || professionalError.message?.includes("Could not find the 'profession' column")) {
          throw new Error('Erreur de schéma : la colonne "profession" n\'existe pas. Utilisez "category" à la place. Veuillez vider le cache de votre navigateur et réessayer.');
        }
        
        throw professionalError;
      }
      
      console.log('✅ Profil professionnel créé avec succès');
    }

    // Ne pas charger le profil ici - il sera chargé automatiquement par onAuthStateChange
    // Cela évite les timeouts lors de la création du profil
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}