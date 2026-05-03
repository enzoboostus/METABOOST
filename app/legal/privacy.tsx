import LegalPage from '@/components/LegalPage';

const SECTIONS = [
  {
    title: '1. Responsable du traitement',
    content:
      '[À COMPLÉTER — Nom Prénom / Société]\n' +
      'Adresse : [À COMPLÉTER]\n' +
      'E-mail : [À COMPLÉTER — contact@metaboost.fr]\n\n' +
      'En tant que responsable du traitement de vos données personnelles, nous nous engageons à respecter la réglementation européenne applicable, notamment le Règlement (UE) 2016/679 du 27 avril 2016 (RGPD) et la loi Informatique et Libertés n° 78-17 du 6 janvier 1978 modifiée.',
  },
  {
    title: '2. Données collectées',
    content:
      'Nous collectons les catégories de données suivantes :\n\n' +
      '— Données d\'identification :\n' +
      '• Prénom\n' +
      '• Genre (homme / femme)\n\n' +
      '— Données de santé (Art. 9 RGPD — catégorie particulière) :\n' +
      '• Poids corporel (kg)\n' +
      '• Taille (cm)\n' +
      '• Tour de ventre (cm)\n' +
      '• Tour de cuisse (cm) — optionnel\n' +
      '• Tour de bras (cm) — optionnel\n\n' +
      '— Données d\'activité physique :\n' +
      '• Nombre de pas quotidiens\n' +
      '• Séances sportives (effort, ressenti, durée)\n\n' +
      '— Données nutritionnelles :\n' +
      '• Photos de repas et leur catégorie nutritionnelle\n\n' +
      '— Données techniques :\n' +
      '• Identifiant utilisateur (généré localement)\n' +
      '• Date et heure des enregistrements',
  },
  {
    title: '3. Finalités et base légale du traitement',
    content:
      'Vos données sont traitées aux fins suivantes :\n\n' +
      '• Personnalisation de votre profil morphologique et de votre avatar\n' +
      '  → Base légale : Consentement (Art. 6.1.a RGPD)\n\n' +
      '• Suivi de votre progression physique et corporelle\n' +
      '  → Base légale : Consentement (Art. 6.1.a RGPD)\n\n' +
      '• Traitement des données de santé (mesures corporelles)\n' +
      '  → Base légale : Consentement explicite (Art. 9.2.a RGPD)\n\n' +
      '• Recommandations de programmes sportifs personnalisés\n' +
      '  → Base légale : Consentement (Art. 6.1.a RGPD)\n\n' +
      '• Amélioration du service\n' +
      '  → Base légale : Intérêt légitime (Art. 6.1.f RGPD)\n\n' +
      'Le traitement de vos données de santé repose sur votre consentement explicite, librement donné lors de la saisie de vos mesures. Vous pouvez retirer ce consentement à tout moment.',
  },
  {
    title: '4. Durée de conservation',
    content:
      'Vos données sont conservées pendant toute la durée d\'utilisation active du compte, et supprimées dans un délai de 30 jours suivant la suppression du compte ou la demande d\'effacement.\n\n' +
      'Les données de santé sont supprimées immédiatement en cas de retrait du consentement.',
  },
  {
    title: '5. Destinataires des données',
    content:
      'Vos données ne sont pas vendues à des tiers.\n\n' +
      'Nous faisons appel aux sous-traitants suivants, liés par des clauses contractuelles garantissant un niveau de protection adéquat :\n\n' +
      '— Supabase Inc. (base de données)\n' +
      'Rôle : hébergement et gestion de la base de données\n' +
      'Pays : États-Unis\n' +
      'Garantie : Clauses Contractuelles Types (CCT) de la Commission européenne\n\n' +
      '— Vercel Inc. (hébergement web)\n' +
      'Rôle : hébergement de l\'application web\n' +
      'Pays : États-Unis\n' +
      'Garantie : Clauses Contractuelles Types (CCT) + EU-US Data Privacy Framework',
  },
  {
    title: '6. Transferts hors Union européenne',
    content:
      'Vos données sont susceptibles d\'être transférées vers les États-Unis, pays ne disposant pas d\'une décision d\'adéquation générale de la Commission européenne.\n\n' +
      'Ces transferts sont encadrés par des garanties appropriées :\n' +
      '• Clauses Contractuelles Types (CCT) adoptées par la Commission européenne\n' +
      '• EU-US Data Privacy Framework (Décision d\'adéquation du 10 juillet 2023)\n\n' +
      'Vous pouvez obtenir une copie de ces garanties en nous contactant.',
  },
  {
    title: '7. Vos droits (RGPD)',
    content:
      'Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :\n\n' +
      '• Droit d\'accès (Art. 15) : obtenir une copie de vos données\n' +
      '• Droit de rectification (Art. 16) : corriger vos données inexactes\n' +
      '• Droit à l\'effacement (Art. 17) : "droit à l\'oubli"\n' +
      '• Droit à la limitation du traitement (Art. 18)\n' +
      '• Droit à la portabilité (Art. 20) : recevoir vos données dans un format structuré\n' +
      '• Droit d\'opposition (Art. 21) : vous opposer au traitement\n' +
      '• Droit de retrait du consentement : à tout moment, sans frais\n\n' +
      'Pour exercer ces droits, contactez-nous à : [À COMPLÉTER — contact@metaboost.fr]\n\n' +
      'Nous nous engageons à répondre dans un délai d\'un mois.\n\n' +
      'En cas d\'insatisfaction, vous pouvez introduire une réclamation auprès de la CNIL :\n' +
      'Commission Nationale de l\'Informatique et des Libertés\n' +
      '3 Place de Fontenoy — TSA 80715 — 75334 Paris Cedex 07\n' +
      'www.cnil.fr · Tél. : 01 53 73 22 22',
  },
  {
    title: '8. Sécurité des données',
    content:
      'Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte, destruction ou altération :\n\n' +
      '• Chiffrement des données en transit (TLS/HTTPS)\n' +
      '• Chiffrement des données au repos (AES-256 via Supabase)\n' +
      '• Accès aux données limité aux personnes habilitées\n' +
      '• Authentification sécurisée via Supabase Auth (OAuth 2.0)\n\n' +
      'En cas de violation de données susceptible d\'engendrer un risque élevé pour vos droits, nous vous en informerons dans les 72 heures conformément à l\'Art. 34 RGPD.',
  },
  {
    title: '9. Données des mineurs',
    content:
      'MetaBoost n\'est pas destiné aux enfants de moins de 16 ans. Nous ne collectons pas sciemment de données personnelles provenant de personnes de moins de 16 ans. Si vous êtes parent et avez connaissance qu\'un mineur nous a transmis des données sans votre consentement, contactez-nous afin que nous procédions à la suppression.',
  },
  {
    title: '10. Modification de la politique',
    content:
      'Nous nous réservons le droit de modifier la présente politique de confidentialité. Toute modification substantielle vous sera notifiée par e-mail ou par notification dans l\'application au moins 30 jours avant son entrée en vigueur.\n\n' +
      'La poursuite de l\'utilisation de l\'application après notification vaut acceptation des modifications.',
  },
  {
    title: '11. Contact & DPO',
    content:
      'Pour toute question relative à la présente politique ou à la protection de vos données :\n\n' +
      'E-mail : [À COMPLÉTER — dpo@metaboost.fr]\n' +
      'Adresse : [À COMPLÉTER]\n\n' +
      'Autorité de contrôle compétente :\n' +
      'CNIL — Commission Nationale de l\'Informatique et des Libertés\n' +
      'www.cnil.fr',
  },
];

export default function Privacy() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      subtitle="Conforme RGPD (UE) 2016/679 · Loi Informatique et Libertés"
      lastUpdated="Mai 2025"
      sections={SECTIONS}
    />
  );
}
