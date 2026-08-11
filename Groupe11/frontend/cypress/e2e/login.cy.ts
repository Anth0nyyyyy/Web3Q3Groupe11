// /frontend/cypress/e2e/login.cy.ts

describe('Scénario de Connexion', () => {

  // Avant chaque test, on s'assure que notre application est prête
  beforeEach(() => {
    // On dit à Cypress de visiter notre page de login
    // Note : Cypress est intelligent et attendra que la page soit chargée
    cy.visit('http://localhost:5173/login');
  });

  it('devrait refuser la connexion avec de mauvais identifiants', () => {
    // On trouve le champ de l'email par son 'placeholder' et on y tape du texte
    cy.get('input[placeholder="Email"]').type('mauvais@test.com');

    // On trouve le champ du mot de passe et on y tape du texte
    cy.get('input[placeholder="Mot de passe"]').type('mauvaispassword');

    // On trouve le bouton qui contient le texte "Se connecter" et on clique dessus
    cy.contains('button', 'Se connecter').click();

    // On vérifie qu'une alerte d'erreur est bien apparue
    cy.get('.MuiAlert-standardError').should('be.visible');
    // Et qu'elle contient le bon message
    cy.contains('Identifiants invalides.').should('be.visible');
  });

  it('devrait connecter un utilisateur avec succès et le rediriger vers le dashboard', () => {
    // On tape les bons identifiants
    // NOTE : Pour un vrai projet, on ne mettrait jamais les identifiants en clair ici.
    // On utiliserait des variables d'environnement Cypress.
    cy.get('input[placeholder="Email"]').type('professeur@helha.be');
    cy.get('input[placeholder="Mot de passe"]').type('password123');

    // On clique sur le bouton de connexion
    cy.contains('button', 'Se connecter').click();

    // On vérifie que l'URL a bien changé pour inclure "/dashboard"
    cy.url().should('include', '/dashboard');

    // On vérifie qu'un élément spécifique au dashboard est bien visible,
    // par exemple le titre de la page.
    cy.contains('h6', 'Projets').should('be.visible');
  });

});