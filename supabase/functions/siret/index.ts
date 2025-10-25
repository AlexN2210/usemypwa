import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const url = new URL(req.url);
  const siret = url.searchParams.get("siret");

  if (!siret || !/^\d{14}$/.test(siret)) {
    return new Response(JSON.stringify({ 
      valid: false, 
      error: "SIRET invalide - doit contenir exactement 14 chiffres" 
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 400,
    });
  }

  try {
    console.log(`🔍 Recherche SIRET: ${siret}`);
    
    const apiRes = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${siret}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Usemy-PWA/1.0'
      }
    });

    if (!apiRes.ok) {
      console.error(`❌ Erreur API: ${apiRes.status}`);
      return new Response(JSON.stringify({ 
        valid: false, 
        error: `Erreur API gouvernementale: ${apiRes.status}` 
      }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: apiRes.status,
      });
    }

    const data = await apiRes.json();
    console.log(`✅ Données reçues pour SIRET: ${siret}`);

    // Traiter les données selon la structure de l'API
    if (data.results && data.results.length > 0) {
      const entreprise = data.results[0];
      const siege = entreprise.siege || {};

      const result = {
        valid: true,
        company: {
          name: entreprise.nom_complet || entreprise.nom_raison_sociale || 'Nom non disponible',
          address: siege.adresse || 'Adresse non disponible',
          city: siege.libelle_commune || 'Ville non disponible',
          postalCode: siege.code_postal || 'Code postal non disponible',
          activity: entreprise.activite_principale || 'Activité non disponible'
        }
      };

      return new Response(JSON.stringify(result), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new Response(JSON.stringify({ 
      valid: false, 
      error: 'SIRET non trouvé dans la base de données' 
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 404,
    });

  } catch (error) {
    console.error(`❌ Erreur proxy SIRET:`, error);
    return new Response(JSON.stringify({ 
      valid: false, 
      error: "Service de validation SIRET temporairement indisponible" 
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 500,
    });
  }
});