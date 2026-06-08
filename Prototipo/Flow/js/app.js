window.addEventListener('DOMContentLoaded', () => {
  const taxa = parseFloat(localStorage.getItem('flow_taxaJuros'));
  if (!isNaN(taxa)) Pages.Mensalidades.TAXA_JUROS = taxa;

  const valorRep = parseFloat(localStorage.getItem('flow_valorReposicao'));
  if (!isNaN(valorRep)) Pages.Reposicoes.VALOR_REPOSICAO = valorRep;

  const gratis = parseInt(localStorage.getItem('flow_reposicoesGratis'));
  if (!isNaN(gratis)) Pages.Reposicoes.REPOSICOES_GRATIS_POR_SEMESTRE = gratis;

  if (localStorage.getItem('flow_darkmode') === '1') document.body.classList.add('dark');

  SeedUser.run();
  Seed.run();

  const user = Auth.current();
  if (user) Router.go('dashboard');
  else Router.go('login');
});
