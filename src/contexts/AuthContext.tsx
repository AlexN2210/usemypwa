import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, userType: 'professional' | 'individual', profession?: string, siret?: string, companyName?: string) => Promise<void>;
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
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      clearTimeout(timeoutId);

      if (error) {
        console.error('❌ Erreur lors du chargement du profil:', error);
        console.error('Détails:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Gestion des erreurs d'authentification
        if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('401')) {
          console.warn('⚠️ Session expirée ou non authentifiée');
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          setSession(null);
        }
        return false;
      }

      if (data) {
        console.log('✅ Profil chargé:', data.full_name);
        setProfile(data);
        return true;
      }
      
      console.log('ℹ️ Aucun profil trouvé pour cet utilisateur');
      return false;
    } catch (err: unknown) {
      console.error('❌ Erreur inattendue lors du chargement du profil:', err);
      if (err instanceof Error) {
        if (err.name === 'AbortError' || err.message?.includes('timeout')) {
          console.warn('⚠️ Timeout - Le profil pourrait ne pas être créé ou la connexion est lente');
        }
      } else if (typeof err === 'object' && err !== null) {
        const maybeName = (err as { name?: unknown }).name;
        const maybeMessage = (err as { message?: unknown }).message;
        if (maybeName === 'AbortError' || (typeof maybeMessage === 'string' && maybeMessage.includes('timeout'))) {
          console.warn('⚠️ Timeout - Le profil pourrait ne pas être créé ou la connexion est lente');
        }
      }
      return false;
    }
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

    const initSession = async () => {
      try {
        console.log('🔄 Initialisation de la session...');
        
        // Timeout de sécurité : si le chargement prend plus de 3 secondes, on arrête FORTEMENT
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('⚠️ TIMEOUT - Arrêt forcé du loader après 3 secondes');
            console.warn('💡 Supabase ne répond pas - Vérifiez :');
            console.warn('   1. Projet Supabase actif ? (Dashboard → Settings)');
            console.warn('   2. Variables .env chargées ?');
            console.warn('   3. Connexion Internet ?');
            setLoading(false);
            setSession(null);
            setUser(null);
          }
        }, 6000); // Augmenter à 6 secondes pour correspondre au timeout de getSession

        console.log('🔍 Appel à supabase.auth.getSession()...');
        
        // Diagnostics : Vérifier la configuration Supabase
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        console.log('🔧 Diagnostics Supabase:', {
          url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NON DÉFINIE',
          hasKey: !!supabaseKey,
          keyLength: supabaseKey?.length || 0,
          localStorageAvailable: typeof localStorage !== 'undefined'
        });
        
        // Test de connectivité rapide avant d'appeler getSession
        let canConnect = false;
        try {
          const testUrl = supabaseUrl?.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          
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
          
          clearTimeout(timeoutId);
          canConnect = testResponse.ok || testResponse.status < 500;
          console.log(canConnect ? '✅ Test de connectivité réussi' : '⚠️ Test de connectivité échoué');
        } catch (testError) {
          console.warn('⚠️ Impossible de tester la connectivité Supabase:', testError);
          console.warn('💡 Supabase peut être inaccessible ou votre connexion est lente');
        }
        
        // Utiliser Promise.race avec un timeout plus long (5 secondes) pour les connexions lentes
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout getSession')), 5000);
        });
        
        let sessionResult: Awaited<ReturnType<typeof supabase.auth.getSession>> = { data: { session: null }, error: null };
        
        try {
          sessionResult = await Promise.race([sessionPromise, timeoutPromise]);
        } catch (timeoutError: unknown) {
          if (timeoutError instanceof Error) {
            if (timeoutError.message === 'Timeout getSession') {
              console.warn('⚠️ TIMEOUT : supabase.auth.getSession() ne répond pas (5s)');
              console.warn('💡 Diagnostics:');
              console.warn('   - URL Supabase:', supabaseUrl || 'NON DÉFINIE');
              console.warn('   - Clé API:', supabaseKey ? '✅ Définie' : '❌ NON DÉFINIE');
              console.warn('   - Connectivité:', canConnect ? '✅ OK' : '❌ ÉCHEC');
              console.warn('💡 Vérifiez votre connexion Internet et la configuration Supabase');
              console.warn('💡 Continuation sans session - l\'application fonctionnera en mode déconnecté');
              // Garder sessionResult avec session: null
            } else {
              console.error('❌ Erreur inattendue:', timeoutError);
            }
          } else {
            console.error('❌ Erreur inattendue (non-Error):', timeoutError);
          }
        }
        
        clearTimeout(timeoutId);
        
        const { data: { session }, error } = sessionResult;
        
        if (error) {
          console.error('❌ Erreur lors de la récupération de la session:', error);
        }
        
        if (!mounted) return;
        
        console.log('📋 Session récupérée:', session ? '✅ Session active' : '❌ Aucune session');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Utilisateur trouvé, chargement du profil...');
          // Ne pas bloquer sur le profil si ça prend trop de temps
          loadProfile(session.user.id).catch(err => {
            console.warn('⚠️ Erreur lors du chargement du profil (non bloquant):', err);
          });
        } else {
          console.log('ℹ️ Aucun utilisateur connecté - Affichage de l\'écran de connexion');
          setProfile(null);
        }
      } catch (err) {
        console.error('❌ Erreur lors de l\'initialisation de la session:', err);
      } finally {
        clearTimeout(timeoutId);
        if (mounted) {
          console.log('✅ Chargement terminé - Arrêt du loader');
          setLoading(false);
        }
      }
    };

    initSession();

    // Éviter les déclenchements multiples de onAuthStateChange
    let initSessionDone = false;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (!mounted) return;

        // Ignorer les événements initiaux si on vient de terminer initSession
        // pour éviter les chargements en double
        if (!initSessionDone && event === 'INITIAL_SESSION') {
          console.log('ℹ️ onAuthStateChange INITIAL_SESSION ignoré (déjà géré par initSession)');
          return;
        }

        console.log(`🔄 onAuthStateChange: ${event}`, session?.user?.id || 'no user');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('❌ Erreur dans onAuthStateChange:', err);
      }
    });
    
    // Marquer initSession comme terminé après un court délai
    setTimeout(() => {
      initSessionDone = true;
    }, 1000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    userType: 'professional' | 'individual', 
    profession?: string, 
    siret?: string, 
    companyName?: string
  ) => {
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

    // Inscription avec métadonnées pour le trigger
    const { data, error } = await supabase.auth.signUp({ 
      email: email.trim(), 
      password: password,
      options: {
        emailRedirectTo: `${window.location.origin}`,
        data: {
          full_name: fullName.trim(),
          user_type: userType
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

    // Attendre que le profil soit créé par le trigger ou le créer manuellement
    const profileExists = await waitForProfile(data.user.id);

    if (!profileExists) {
      // Vérifier la session avant création manuelle
      const { data: { session: checkSession } } = await supabase.auth.getSession();
      if (!checkSession) {
        throw new Error('Session non disponible. Veuillez vous reconnecter.');
      }

      console.log('📝 Création manuelle du profil pour:', data.user.id);
      
      const profileData: Partial<Profile> = {
        id: data.user.id,
        full_name: fullName,
        user_type: userType
      };
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (profileError) {
        console.error('❌ Erreur lors de la création du profil:', profileError);
        throw profileError;
      }
      console.log('✅ Profil créé avec succès');
    }

    // Création du profil professionnel si nécessaire
    if (userType === 'professional' && profession && siret && companyName) {
      const { error: professionalError } = await supabase
        .from('professional_profiles')
        .insert({
          user_id: data.user.id,
          profession,
          siret,
          company_name: companyName,
        });

      if (professionalError) {
        console.error('❌ Erreur lors de la création du profil professionnel:', professionalError);
        throw professionalError;
      }
    }

    // Charger le profil final
    await loadProfile(data.user.id);
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