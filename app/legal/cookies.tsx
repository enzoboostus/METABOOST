import LegalPage from '@/components/LegalPage';

const SECTIONS = [
  {
    title: '1. Qu\'est-ce qu\'un cookie ?',
    content:
      'Un cookie est un petit fichier texte déposé sur votre appareil lors de la consultation d\'un site ou d\'une application. Il permet de reconnaître votre appareil lors de vos prochaines visites et de mémoriser certaines informations.\n\n' +
      'La directive ePrivacy (2002/58/CE), transposée en France à l\'article 82 de la loi Informatique et Libertés, encadre le dépôt et la lecture des cookies. La CNIL précise les modalités de recueil du consentement.',
  },
  {
    title: '2. Cookies utilisés par MetaBoost',
    content:
      '— Cookies strictement nécessaires (aucun consentement requis)\n\n' +
      '• Cookie de session d\'authentification (Supabase Auth)\n' +
      '  Finalité : maintenir votre session de connexion active\n' +
      '  Durée : session + 1 heure (refresh token : 7 jours)\n' +
      '  Émetteur : Supabase Inc.\n\n' +
      '• Stockage local (AsyncStorage / localStorage)\n' +
      '  Finalité : sauvegarder vos données de profil en local (prénom, mesures, préférences)\n' +
      '  Durée : persistant jusqu\'à suppression du compte ou vidage du cache\n' +
      '  Émetteur : MetaBoost (stockage interne à l\'application)\n\n' +
      'Ces éléments de stockage sont indispensables au fonctionnement de l\'application. Ils ne peuvent pas être refusés sans compromettre les fonctionnalités essentielles.',
  },
  {
    title: '3. Cookies analytiques et publicitaires',
    content:
      'MetaBoost ne dépose actuellement aucun cookie à des fins de mesure d\'audience, de profilage publicitaire ou de pistage inter-sites.\n\n' +
      'Aucun outil d\'analyse tiers (Google Analytics, Mixpanel, Facebook Pixel, etc.) n\'est intégré dans l\'application à ce jour.\n\n' +
      'Si nous décidions d\'en intégrer à l\'avenir, nous mettrions à jour la présente politique et recueillerions votre consentement préalable conformément aux recommandations de la CNIL.',
  },
  {
    title: '4. Cookies tiers',
    content:
      'L\'application fait appel à des services tiers qui peuvent déposer leurs propres cookies :\n\n' +
      '• Supabase (authentification) — supabase.com\n' +
      '• Google (si vous utilisez la connexion Google OAuth) — google.com\n\n' +
      'Ces cookies sont soumis aux politiques de confidentialité de leurs émetteurs respectifs. Nous vous recommandons de les consulter.',
  },
  {
    title: '5. Durée de conservation des cookies',
    content:
      'Les cookies déposés ont les durées de conservation suivantes :\n\n' +
      '• Cookie de session Supabase : durée de la session active\n' +
      '• Refresh token Supabase : 7 jours\n' +
      '• Stockage local des préférences : jusqu\'à suppression manuelle ou effacement du cache\n\n' +
      'Conformément aux recommandations de la CNIL, aucun cookie de traçage ne dépasse 13 mois.',
  },
  {
    title: '6. Comment gérer les cookies ?',
    content:
      'Vous pouvez gérer ou supprimer les cookies à tout moment via :\n\n' +
      '— Dans l\'application MetaBoost :\n' +
      '• Profil → "Se déconnecter" : supprime le cookie de session\n' +
      '• Profil → "Se déconnecter" : efface les données locales\n\n' +
      '— Dans votre navigateur :\n' +
      '• Safari (iOS) : Réglages → Safari → Effacer l\'historique et les données de sites\n' +
      '• Chrome : Paramètres → Confidentialité → Effacer les données de navigation\n' +
      '• Firefox : Options → Vie privée → Supprimer des cookies spécifiques\n\n' +
      'La désactivation des cookies strictement nécessaires peut empêcher le fonctionnement de l\'application.',
  },
  {
    title: '7. Vos droits',
    content:
      'Conformément au RGPD et à la loi Informatique et Libertés, vous disposez d\'un droit d\'accès, de rectification et de suppression de vos données.\n\n' +
      'Pour exercer ces droits : [À COMPLÉTER — contact@metaboost.fr]\n\n' +
      'Réclamation auprès de la CNIL : www.cnil.fr',
  },
  {
    title: '8. Mise à jour de la politique',
    content:
      'La présente politique de gestion des cookies peut être mise à jour à tout moment pour refléter les évolutions légales ou techniques. La date de dernière mise à jour est indiquée en haut de page.\n\n' +
      'Nous vous recommandons de consulter régulièrement cette page.',
  },
];

export default function Cookies() {
  return (
    <LegalPage
      title="Politique de cookies"
      subtitle="Conforme directive ePrivacy · Recommandations CNIL"
      lastUpdated="Mai 2025"
      sections={SECTIONS}
    />
  );
}
