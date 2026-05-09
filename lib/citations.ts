export interface Citation {
  id: string;
  authors: string;
  year: number;
  title: string;
  journal: string;
  note?: string;
}

export const CITATIONS: Citation[] = [
  { id: 'taylor1993', authors: 'Taylor, J.B.', year: 1993, title: 'Discretion versus policy rules in practice', journal: 'Carnegie-Rochester Conference Series on Public Policy, 39, 195–214' },
  { id: 'bernanke1997', authors: 'Bernanke, B. & Mishkin, F.S.', year: 1997, title: 'Inflation targeting: A new framework for monetary policy?', journal: 'Journal of Economic Perspectives, 11(2), 97–116' },
  { id: 'laubach2003', authors: 'Laubach, T. & Williams, J.C.', year: 2003, title: 'Measuring the natural rate of interest', journal: 'Review of Economics and Statistics, 85(4), 1063–1070' },
  { id: 'holston2017', authors: 'Holston, K., Laubach, T. & Williams, J.C.', year: 2017, title: 'Measuring the natural rate of interest: International trends and determinants', journal: 'Journal of International Economics, 108, S59–S75' },
  { id: 'sargent1971', authors: 'Sargent, T.J.', year: 1971, title: 'A note on the accelerationist controversy', journal: 'Journal of Money, Credit and Banking, 3(3), 721–725' },
  { id: 'fuhrer1997', authors: 'Fuhrer, J.C.', year: 1997, title: 'The (un)importance of forward-looking behavior in price specifications', journal: 'Journal of Money, Credit and Banking, 29(3), 338–350' },
  { id: 'smets2007', authors: 'Smets, F. & Wouters, R.', year: 2007, title: 'Shocks and frictions in US business cycles: A Bayesian DSGE approach', journal: 'American Economic Review, 97(3), 586–606' },
  { id: 'anderson2003', authors: 'Anderson, J.E. & van Wincoop, E.', year: 2003, title: 'Gravity with gravitas: A solution to the border puzzle', journal: 'American Economic Review, 93(1), 170–192' },
  { id: 'head2014', authors: 'Head, K. & Mayer, T.', year: 2014, title: 'Gravity equations: Workhorse, toolkit, and cookbook', journal: 'Handbook of International Economics, Vol. 4, 131–195' },
  { id: 'minsky1986', authors: 'Minsky, H.P.', year: 1986, title: 'Stabilizing an Unstable Economy', journal: 'Yale University Press', note: 'Origin of the financial instability hypothesis' },
  { id: 'reinhart2009', authors: 'Reinhart, C.M. & Rogoff, K.S.', year: 2009, title: 'This Time Is Different: Eight Centuries of Financial Folly', journal: 'Princeton University Press' },
  { id: 'bernanke1999', authors: 'Bernanke, B., Gertler, M. & Gilchrist, S.', year: 1999, title: 'The financial accelerator in a quantitative business cycle framework', journal: 'Handbook of Macroeconomics, Vol. 1C, 1341–1393' },
  { id: 'nakamoto2008', authors: 'Nakamoto, S.', year: 2008, title: 'Bitcoin: A peer-to-peer electronic cash system', journal: 'Bitcoin.org white paper' },
  { id: 'mundell1963', authors: 'Mundell, R.A.', year: 1963, title: 'Capital mobility and stabilization policy under fixed and flexible exchange rates', journal: 'Canadian Journal of Economics and Political Science, 29(4), 475–485' },
  { id: 'fleming1962', authors: 'Fleming, J.M.', year: 1962, title: 'Domestic financial policies under fixed and under floating exchange rates', journal: 'IMF Staff Papers, 9(3), 369–380' },
  { id: 'friedman1968', authors: 'Friedman, M.', year: 1968, title: 'The role of monetary policy', journal: 'American Economic Review, 58(1), 1–17' },
  { id: 'phelps1968', authors: 'Phelps, E.S.', year: 1968, title: 'Money-wage dynamics and labor-market equilibrium', journal: 'Journal of Political Economy, 76(4), 678–711' },
  { id: 'okun1962', authors: "Okun, A.M.", year: 1962, title: "Potential GNP: Its measurement and significance", journal: "Proceedings of the Business and Economics Statistics Section, ASA, 98–104" },
  { id: 'fisher1933', authors: 'Fisher, I.', year: 1933, title: 'The debt-deflation theory of great depressions', journal: 'Econometrica, 1(4), 337–357' },
  { id: 'atkinson1970', authors: 'Atkinson, A.B.', year: 1970, title: 'On the measurement of inequality', journal: 'Journal of Economic Theory, 2(3), 244–263' },
  { id: 'theil1967', authors: 'Theil, H.', year: 1967, title: 'Economics and Information Theory', journal: 'North-Holland Publishing Company' },
  { id: 'imf2022', authors: 'IMF', year: 2022, title: 'Global Financial Stability Report: Navigating the High-Inflation Environment', journal: 'International Monetary Fund' },
];
