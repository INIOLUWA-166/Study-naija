const fs = require('fs');
const path = require('path');

const questionsFile = path.join(__dirname, '../data/questions.json');
const currentQuestions = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));

const seenTexts = new Set(currentQuestions.map(q => q.question.trim().toLowerCase().replace(/\s+/g, ' ')));
const seenIds = new Set(currentQuestions.map(q => q.id));

function addQ(subId, subName, topic, q, a, b, c, d, ans, exp, diff = 'Medium') {
  const norm = q.trim().toLowerCase().replace(/\s+/g, ' ');
  if (seenTexts.has(norm)) return;
  seenTexts.add(norm);

  const id = `jamb-${subId}-${Date.now().toString(36).slice(-4)}-${Math.random().toString(36).substring(2, 6)}`;
  seenIds.add(id);

  currentQuestions.push({
    id,
    subjectId: subId,
    subjectName: subName,
    topic,
    examType: 'JAMB',
    year: 2024,
    question: q,
    options: { A: a, B: b, C: c, D: d },
    correctOption: ans,
    explanation: exp,
    difficulty: diff,
    educationLevel: 'secondary'
  });
}

// 1. BIOLOGY (Boost from 32 to 55+)
addQ('biology', 'Biology', 'Nutrition & Digestion', 'Which vitamin is essential for the synthesis of prothrombin in the liver, crucial for normal blood clotting?', 'Vitamin K', 'Vitamin C', 'Vitamin D', 'Vitamin A', 'A', 'Vitamin K (phylloquinone) is a necessary cofactor for the carboxylation of prothrombin and factors VII, IX, and X in hepatic blood clotting synthesis.');
addQ('biology', 'Biology', 'Plant Physiology & Photosynthesis', 'The splitting of water molecules into hydrogen ions, electrons, and oxygen gas in the presence of sunlight during photosynthesis is known as:', 'Photolysis', 'Glycolysis', 'Hydrolysis', 'Plasmolysis', 'A', 'Photolysis of water occurs in the grana thylakoids during the light-dependent stage of photosynthesis: 2H₂O + light -> 4H⁺ + 4e⁻ + O₂.');
addQ('biology', 'Biology', 'Cell Biology & Organization', 'Which of the following structures is present in plant cells but absent in typical animal cells?', 'Cellulose cell wall and large central vacuole', 'Mitochondria and nucleus', 'Ribosomes and Golgi body', 'Endoplasmic reticulum and cytoplasm', 'A', 'Plant cells have rigid cellulose walls, chloroplasts, and a large central vacuole with tonoplast, which animal cells lack.');
addQ('biology', 'Biology', 'Respiratory System', 'During vigorous exercise in humans, anaerobic respiration in skeletal muscles produces an accumulation of:', 'Lactic acid and oxygen debt', 'Ethanol and carbon dioxide', 'Acetic acid and urea', 'Uric acid and glycogen', 'A', 'Under anaerobic conditions (insufficient oxygen), pyruvic acid is reduced to lactic acid by lactate dehydrogenase, creating an oxygen debt that causes muscle fatigue.');
addQ('biology', 'Biology', 'Genetics & Heredity', 'A cross between a red-flowered plant and a white-flowered plant produces all pink-flowered offspring in the F1 generation. This phenomenon illustrates:', 'Incomplete dominance', 'Codominance', 'Complete dominance', 'Epistasis', 'A', 'Incomplete dominance occurs when neither allele is completely dominant over the other, producing an intermediate blend (heterozygous pink).');
addQ('biology', 'Biology', 'Ecology & Adaptation', 'Which adaptation enables camel and desert mammals to survive prolonged periods without drinking water?', 'Production of concentrated hypertonic urine and dry feces', 'Copious sweating to cool body temperature', 'Storage of water in subcutaneous adipose tissue', 'Frequent respiration through open mouth', 'A', 'Desert mammals possess exceptionally long loops of Henle in juxtamedullary nephrons to reabsorb maximum water and excrete concentrated urine.');
addQ('biology', 'Biology', 'Coordination & Sense Organs', 'The sensory receptor cells responsible for detecting colored vision and sharp acuity in the human retina are the:', 'Cones', 'Rods', 'Bipolar cells', 'Ganglion cells', 'A', 'Cones operate under bright photopic light and detect color wavelengths (red, green, blue). Rods are responsible for low-light scotopic and monochromatic vision.');
addQ('biology', 'Biology', 'Excretory & Circulatory Systems', 'Which nitrogenous excretory waste requires the greatest volume of water for its excretion and is typical of bony freshwater fishes?', 'Ammonia', 'Urea', 'Uric acid', 'Creatinine', 'A', 'Ammonia is highly toxic and soluble, necessitating large amounts of water for excretion (ammonotelism). Terrestrial birds and reptiles excrete insoluble uric acid to conserve water.');
addQ('biology', 'Biology', 'Reproduction in Plants & Animals', 'The transfer of pollen grains from the anther of a flower to the stigma of a different flower on the same plant is called:', 'Geitonogamy', 'Autogamy', 'Xenogamy', 'Cleistogamy', 'A', 'Geitonogamy is pollination between two flowers on the same individual plant. Autogamy is self-pollination within the same flower.');
addQ('biology', 'Biology', 'Plant Nutrition & Minerals', 'Yellowing of older leaves between leaf veins (chlorosis) in green plants is most commonly caused by a deficiency of:', 'Magnesium', 'Calcium', 'Sodium', 'Lead', 'A', 'Magnesium is the central coordinating metallic ion in the porphyrin ring of the chlorophyll molecule. Deficiency causes interveinal chlorosis.');
addQ('biology', 'Biology', 'Microorganisms & Disease', 'Which of the following human pathogens is a flagellated protozoan transmitted by the bite of the tsetse fly (Glossina)?', 'Trypanosoma gambiense (Sleeping sickness)', 'Plasmodium falciparum (Malaria)', 'Entamoeba histolytica (Amoebiasis)', 'Vibrio cholerae (Cholera)', 'A', 'Trypanosoma is the flagellate causative agent of African trypanosomiasis (sleeping sickness), transmitted by tsetse flies in tropical Africa.');
addQ('biology', 'Biology', 'Transport & Circulatory Systems', 'In the human heart, the tricuspid valve prevents the backflow of deoxygenated blood from the:', 'Right ventricle into the right atrium', 'Left ventricle into the left atrium', 'Pulmonary artery into the right ventricle', 'Aorta into the left ventricle', 'A', 'The atrioventricular tricuspid valve is situated between the right atrium and right ventricle, preventing backflow during ventricular systole.');
addQ('biology', 'Biology', 'Ecology & Biomes', 'The vegetation zone in Nigeria characterized by tall grasses, scattered drought-resistant deciduous trees (such as baobab and acacia), and annual bush burning is the:', 'Guinea savanna', 'Mangrove swamp', 'Tropical rain forest', 'Montane vegetation', 'A', 'The savanna biome covers the largest area in Nigeria, characterized by drought-adapted grasses and fire-tolerant deciduous trees.');
addQ('biology', 'Biology', 'Evolution & Natural Selection', 'The theory of evolution through the inheritance of acquired characteristics and the law of use and disuse was proposed by:', 'Jean-Baptiste Lamarck', 'Charles Darwin', 'Gregor Mendel', 'Alfred Russel Wallace', 'A', 'Lamarck published his evolutionary theory in 1809, proposing that organs developed through use and degenerated through disuse, and changes were passed to offspring.');

// 2. CHEMISTRY (Boost from 35 to 55+)
addQ('chemistry', 'Chemistry', 'Chemical Kinetics & Equilibrium', 'A catalyst accelerates the rate of a chemical reaction primarily by:', 'Providing an alternative reaction pathway with lower activation energy', 'Increasing the kinetic energy of reactant molecules', 'Increasing the total enthalpy change of the reaction', 'Shifting the equilibrium position toward the products', 'A', 'Catalysts lower the activation energy barrier without being consumed or altering the equilibrium constant ΔG or ΔH.');
addQ('chemistry', 'Chemistry', 'Periodic Table & Periodicity', 'Which of the following elements has the HIGHEST first ionization energy?', 'Helium (He)', 'Fluorine (F)', 'Cesium (Cs)', 'Oxygen (O)', 'A', 'Helium has the highest ionization energy of all elements (2372 kJ/mol) due to its 1s² closed-shell configuration and minimal shielding.');
addQ('chemistry', 'Chemistry', 'Acids, Bases & Salts', 'Which of the following solutions acts as an ACIDIC buffer system?', 'A mixture of ethanoic acid (CH₃COOH) and sodium ethanoate (CH₃COONa)', 'A mixture of hydrochloric acid and sodium chloride', 'A mixture of aqueous ammonia and ammonium chloride', 'A mixture of sulfuric acid and potassium sulfate', 'A', 'An acidic buffer consists of a weak acid and its conjugate base (salt). CH₃COOH/CH₃COONa resists changes in pH upon addition of small amounts of acid or base.');
addQ('chemistry', 'Chemistry', 'Organic Chemistry (Polymers)', 'The polymer nylon-6,6 is synthesized through condensation polymerization between:', 'Hexanedioic acid and hexane-1,6-diamine', 'Ethene and propene', 'Phenol and methanal', 'Tetrafluoroethene monomers', 'A', 'Nylon-6,6 is a polyamide formed by condensation of hexanedioic (adipic) acid and 1,6-diaminohexane with elimination of water molecules.');
addQ('chemistry', 'Chemistry', 'Electrochemistry & Redox', 'According to Faraday\'s first law of electrolysis, the mass (m) of a substance liberated at an electrode is directly proportional to the:', 'Quantity of electric charge (Q = I × t) passed through the electrolyte', 'Temperature of the electrolytic cell', 'Resistance of the electrode wires', 'Surface area of the electrolytic tank', 'A', 'Faraday\'s First Law: m = Z × Q = Z × I × t, where Z is the electrochemical equivalent and Q is electric charge in coulombs.');
addQ('chemistry', 'Chemistry', 'Non-metals & their Compounds', 'The brown ring test in analytical inorganic chemistry is the confirmatory test for the presence of:', 'Trioxonitrate(V) ions (NO₃⁻)', 'Tetraoxosulfate(VI) ions (SO₄²⁻)', 'Chloride ions (Cl⁻)', 'Carbonate ions (CO₃²⁻)', 'A', 'When freshly prepared FeSO₄ and concentrated H₂SO₄ are added to a nitrate solution, a brown ring of [Fe(H₂O)₅(NO)]²⁺ forms at the liquid interface.');
addQ('chemistry', 'Chemistry', 'Organic Chemistry (Alkanols)', 'Primary alkanols are oxidized by acidified potassium dichromate(VI) through an aldehyde intermediate to yield:', 'Alkanoic acids (Carboxylic acids)', 'Ketones', 'Esters', 'Alkenes', 'A', 'Primary alcohols oxidize: R-CH₂OH -> R-CHO (aldehyde) -> R-COOH (carboxylic acid). Secondary alcohols oxidize only to ketones.');
addQ('chemistry', 'Chemistry', 'Chemical Bonding', 'The coordinate (dative) covalent bond in an ammonium ion (NH₄⁺) is formed by:', 'The donation of a lone pair of electrons from nitrogen to a hydrogen ion (H⁺)', 'The equal sharing of electrons between nitrogen and hydrogen', 'The complete transfer of an electron from nitrogen to hydrogen', 'Electrostatic attraction between opposite dipoles', 'A', 'In NH₄⁺, the ammonia molecule donates its unshared lone pair of electrons on nitrogen into the empty 1s orbital of a proton (H⁺).');
addQ('chemistry', 'Chemistry', 'Metals & Metallurgy', 'In the extraction of iron in the blast furnace, limestone (CaCO₃) is added primarily to:', 'Act as a flux to remove sand impurities as molten slag (CaSiO₃)', 'Reduce iron(III) oxide to metallic iron', 'Produce carbon monoxide fuel', 'Cool down the molten iron pool', 'A', 'CaCO₃ decomposes to CaO, which reacts with silica (sand, SiO₂) to form calcium silicate slag (CaSiO₃), which floats on molten iron and is easily tapped off.');
addQ('chemistry', 'Chemistry', 'Stoichiometry & Gas Laws', 'Calculate the volume of hydrogen gas evolved at STP when 2.4 g of magnesium reacts completely with excess hydrochloric acid. (Mg = 24 g/mol; Molar volume at STP = 22.4 dm³)', '2.24 dm³', '4.48 dm³', '1.12 dm³', '0.24 dm³', 'A', 'Mg + 2HCl -> MgCl₂ + H₂. Moles of Mg = 2.4 / 24 = 0.1 mol. 1 mol Mg yields 1 mol H₂. Volume of H₂ = 0.1 × 22.4 dm³ = 2.24 dm³.');
addQ('chemistry', 'Chemistry', 'Water & Solutions', 'Temporary hardness of water is caused by the presence of dissolved:', 'Calcium hydrogentrioxocarbonate(IV) [Ca(HCO₃)₂]', 'Calcium tetraoxosulfate(VI) [CaSO₄]', 'Magnesium chloride [MgCl₂]', 'Sodium trioxocarbonate(IV) [Na₂CO₃]', 'A', 'Temporary hardness is caused by soluble bicarbonates Ca(HCO₃)₂ and Mg(HCO₃)₂, which decompose into insoluble carbonates upon boiling.');

// 3. PHYSICS (Boost from 42 to 55+)
addQ('physics', 'Physics', 'Mechanics & Newton Laws', 'A force of 50 N acts on a body of mass 10 kg initially at rest. Calculate the speed acquired after 4 seconds.', '20 m/s', '10 m/s', '40 m/s', '5 m/s', 'A', 'Acceleration a = F / m = 50 N / 10 kg = 5 m/s². Final velocity v = u + at = 0 + (5 × 4) = 20 m/s.');
addQ('physics', 'Physics', 'Circular Motion & Gravitation', 'According to Newton\'s universal law of gravitation, if the distance between two masses is doubled, the gravitational force of attraction between them becomes:', 'One-fourth of the original force', 'One-half of the original force', 'Twice the original force', 'Four times the original force', 'A', 'Gravitational force F ∝ 1 / r². If r is doubled (2r), F becomes 1/(2)² = 1/4 of its initial value (inverse-square law).');
addQ('physics', 'Physics', 'Elasticity & Hooke\'s Law', 'A spring is stretched by 4 cm when a mass of 200 g is suspended from it. What extension will be produced by a mass of 500 g within the elastic limit?', '10 cm', '8 cm', '6 cm', '12 cm', 'A', 'Hooke\'s Law: F ∝ e => e₂ / e₁ = m₂ / m₁. e₂ = 4 cm × (500 g / 200 g) = 4 × 2.5 = 10 cm.');
addQ('physics', 'Physics', 'Heat Energy & Expansion', 'A brass rod 100 cm long is heated from 20°C to 70°C. Calculate its increase in length if the linear expansivity of brass is 1.9 × 10⁻⁵ K⁻¹.', '0.095 cm', '0.190 cm', '0.050 cm', '0.019 cm', 'A', 'Increase in length ΔL = L₀ × α × ΔT = 100 cm × (1.9 × 10⁻⁵) × (70 - 20) = 100 × 1.9 × 10⁻⁵ × 50 = 0.095 cm.');
addQ('physics', 'Physics', 'Optics & Light', 'The image formed by a plane mirror is always:', 'Virtual, erect, laterally inverted, and the same size as the object', 'Real, inverted, and magnified', 'Virtual, inverted, and diminished', 'Real, erect, and enlarged', 'A', 'Plane mirrors produce virtual images behind the mirror that cannot be projected on a screen, with unit magnification and lateral inversion.');
addQ('physics', 'Physics', 'Current Electricity', 'Three identical capacitors, each of capacitance 6 μF, are connected in series. What is the equivalent capacitance of the combination?', '2 μF', '18 μF', '9 μF', '3 μF', 'A', 'In series: 1/C_eq = 1/C₁ + 1/C₂ + 1/C₃ = 1/6 + 1/6 + 1/6 = 3/6 = 1/2 => C_eq = 2 μF.');
addQ('physics', 'Physics', 'Magnetism & Induction', 'Lenz\'s law of electromagnetic induction states that the direction of the induced electromotive force (emf) is such that it:', 'Opposes the change in magnetic flux producing it', 'Aids the rate of change of magnetic flux', 'Depends on the resistance of the magnet', 'Is parallel to the applied magnetic lines', 'A', 'Lenz\'s Law is a consequence of the principle of conservation of energy: the induced current creates a magnetic field that opposes the motion or flux change that created it.');
addQ('physics', 'Physics', 'Fluids & Archimedes Principle', 'A solid body of mass 80 g displaces 50 cm³ of water when completely immersed. What is the density of the body?', '1.6 g/cm³', '0.625 g/cm³', '4.0 g/cm³', '0.8 g/cm³', 'A', 'By Archimedes\' principle, volume of body = volume of displaced water = 50 cm³. Density = Mass / Volume = 80 g / 50 cm³ = 1.6 g/cm³.');

// 4. MATHEMATICS (Boost from 49 to 65+)
addQ('mathematics', 'Mathematics', 'Trigonometry & Identities', 'If sin θ = cos θ and θ lies in the first quadrant (0° < θ < 90°), what is the value of θ?', '45°', '30°', '60°', '90°', 'A', 'Divide both sides by cos θ: sin θ / cos θ = 1 => tan θ = 1. In the first quadrant, θ = 45°.');
addQ('mathematics', 'Mathematics', 'Algebra & Polynomials', 'Find the remainder when x³ - 4x² + 5x - 2 is divided by x - 1.', '0', '2', '-2', '4', 'A', 'By Remainder Theorem: R = P(1) = 1³ - 4(1)² + 5(1) - 2 = 1 - 4 + 5 - 2 = 0. (x - 1 is an exact factor).');
addQ('mathematics', 'Mathematics', 'Statistics & Probability', 'A bag contains 4 white, 5 red, and 6 black balls. If a ball is drawn at random, what is the probability that it is NOT red?', '2/3', '1/3', '1/5', '3/5', 'A', 'Total balls = 4 + 5 + 6 = 15. Balls that are not red = 4 + 6 = 10. Probability = 10/15 = 2/3.');
addQ('mathematics', 'Mathematics', 'Coordinate Geometry', 'Find the midpoint of the line segment joining the points A(-3, 8) and B(5, -2).', '(1, 3)', '(-1, 3)', '(1, -3)', '(4, 3)', 'A', 'Midpoint = ((x₁ + x₂)/2, (y₁ + y₂)/2) = ((-3 + 5)/2, (8 + (-2))/2) = (2/2, 6/2) = (1, 3).');
addQ('mathematics', 'Mathematics', 'Geometry & Mensuration', 'The angle of a sector of a circle of radius 14 cm is 90°. Find the perimeter of the sector. (Take π = 22/7)', '50 cm', '22 cm', '44 cm', '36 cm', 'A', 'Arc length L = (90/360) × 2πr = (1/4) × 2 × (22/7) × 14 = 22 cm. Perimeter of sector = Arc length + 2r = 22 + 2(14) = 22 + 28 = 50 cm.');
addQ('mathematics', 'Mathematics', 'Calculus (Integration)', 'Evaluate ∫ (from 0 to π/2) cos x dx.', '1', '0', '-1', '2', 'A', 'Antiderivative of cos x is sin x. [sin x] from 0 to π/2 = sin(π/2) - sin(0) = 1 - 0 = 1.');
addQ('mathematics', 'Mathematics', 'Matrices & Determinants', 'If matrix A = [[2, 1], [3, 4]], calculate the determinant of A (det A).', '5', '11', '-5', '8', 'A', 'det A = (2 × 4) - (1 × 3) = 8 - 3 = 5.');
addQ('mathematics', 'Mathematics', 'Indices & Logarithms', 'Simplify: (64)^(2/3) × (16)^(-1/2).', '8', '4', '16', '2', 'A', '(64)^(2/3) = (∛64)² = 4² = 16. (16)^(-1/2) = 1 / √16 = 1/4. 16 × (1/4) = 4. (Standard index manipulation).');

// 5. ECONOMICS (Boost from 24 to 50+)
addQ('economics', 'Economics', 'Price Theory: Demand & Supply', 'A simultaneous increase in consumer income and an improvement in production technology for a normal good will result in:', 'An ambiguous change in equilibrium price and an increase in equilibrium quantity', 'A definite increase in equilibrium price and quantity', 'A decrease in both equilibrium price and quantity', 'No change in equilibrium quantity', 'A', 'Both events shift supply right (lowering price, increasing quantity) and demand right (raising price, increasing quantity). Quantity unambiguously increases; price change depends on relative shift magnitudes.');
addQ('economics', 'Economics', 'National Income Accounting', 'The Circular Flow of Income in a closed two-sector economy illustrates the exchange between:', 'Households and Business firms', 'Government and Foreign sector', 'Central bank and Commercial banks', 'Wholesalers and Retailers', 'A', 'The basic two-sector model portrays payments of factor rewards (wages, rent, interest, profit) from firms to households in exchange for factor services.');
addQ('economics', 'Economics', 'Public Finance & Taxation', 'When a government intentionally spends more money on development projects than it collects in tax revenue, the resulting budget is called a:', 'Deficit budget', 'Surplus budget', 'Balanced budget', 'Supplementary budget', 'A', 'A deficit budget occurs when government expenditures exceed government revenues during a fiscal year, requiring borrowing or reserve financing.');
addQ('economics', 'Economics', 'International Trade', 'A government policy that imposes physical limits on the quantity of a specific commodity that may be imported into the country over a given period is called an:', 'Import quota', 'Import tariff', 'Embargo', 'Export subsidy', 'A', 'An import quota is a non-tariff quantitative barrier restricting the physical volume of imported goods.');
addQ('economics', 'Economics', 'Money, Banking & Monetary Policy', 'Commercial banks create money (credit creation) through the process of:', 'Granting loans and advances from fractional demand deposits', 'Printing legal tender currency notes', 'Fixing the monetary policy rate', 'Holding gold bullion in central vaults', 'A', 'By the fractional reserve system, commercial banks keep a cash reserve ratio and lend out the remainder, multiplying demand deposits across the banking system.');
addQ('economics', 'Economics', 'Theory of Consumer Behavior', 'An indifference curve is convex to the origin because of the:', 'Diminishing marginal rate of substitution (MRSxy)', 'Law of increasing returns', 'Constant price ratio of commodities', 'Rising marginal utility of money', 'A', 'As a consumer substitutes good X for good Y, they are willing to give up progressively fewer units of Y for an extra unit of X, causing the curve to be bowed inward (convex).');
addQ('economics', 'Economics', 'Inflation & Macroeconomics', 'Cost-push inflation in Nigeria is most commonly triggered by:', 'Sharp increases in transportation fuel costs, electricity tariffs, and imported input costs', 'Excessive growth in private credit demand during booms', 'A massive reduction in total public expenditure', 'A rapid appreciation of the naira exchange rate', 'A', 'Cost-push inflation occurs when production input costs (such as fuel, electricity, wages, or imported raw materials) rise, forcing suppliers to increase consumer prices.');

// 6. GOVERNMENT (Boost from 24 to 50+)
addQ('government', 'Government', 'Constitutional Development (1922-1999)', 'The 1979 Constitution of Nigeria replaced the British parliamentary system with:', 'An American-style Executive Presidential system', 'A unitary military dictatorship', 'A confederal alliance of regions', 'A one-party socialist state', 'A', 'The Constitution of the Second Republic (1979) introduced an executive president serving as both Head of State and Head of Government.');
addQ('government', 'Government', 'Concepts of State & Sovereignty', 'A body of citizens organized under a single government inhabiting a definite territory with sovereignty is defined as a:', 'State', 'Nation', 'Society', 'Government', 'A', 'The state is characterized by four defining legal elements: population, defined territory, government, and sovereignty.');
addQ('government', 'Government', 'Pre-colonial Systems in Nigeria', 'In the pre-colonial Igbo segmentary political system, political decisions at the village level were made through:', 'Direct democracy and consensus by the village assembly (Oha-na-eze) and elders (Ndichie)', 'Absolute authoritarian decrees by the traditional king', 'Military commands issued by the age grade warrior', 'Religious verdicts passed solely by oracle priests', 'A', 'The traditional Igbo society was egalitarian and acephalous (stateless), relying on village democracy, consensus, Ndichie elders, and title-holders.');
addQ('government', 'Government', 'Arms & Forms of Government', 'The power of the judiciary to review legislative statutes and executive actions and declare them unconstitutional if they violate the constitution is called:', 'Judicial Review', 'Judicial Precedent', 'Stare Decisis', 'Writ of Habeas Corpus', 'A', 'Judicial Review empowers superior courts to interpret the constitution and invalidate ultra vires actions of the executive or legislature.');
addQ('government', 'Government', 'Nigerian Foreign Policy', 'The non-aligned movement (NAM) adopted by Nigeria and other developing nations during the Cold War meant:', 'Refusing to align militarily with either the Western capitalist bloc (USA/NATO) or the Eastern communist bloc (USSR/Warsaw Pact)', 'Declining to join the United Nations Organization', 'Refusing all forms of international foreign aid', 'Maintaining closed borders against neighboring nations', 'A', 'Non-alignment was a diplomatic doctrine of maintaining independence and peace without binding military alliance to either Cold War superpower.');
addQ('government', 'Government', 'Civil Service & Public Administration', 'Which principle dictates that civil servants must serve the government of the day faithfully, regardless of which political party holds power?', 'Political neutrality (Impartiality)', 'Bureaucratic secrecy', 'Civil immunity', 'Hierarchical promotion', 'A', 'Political neutrality requires civil servants to remain non-partisan and execute lawful government policies with objective professionalism.');
addQ('government', 'Government', 'Electoral Systems', 'An electoral system where parliamentary seats are awarded to political parties in direct proportion to the percentage of total popular votes won nationwide is:', 'Proportional Representation', 'First-Past-The-Post (Simple Plurality)', 'Alternative Vote', 'Run-off Electoral System', 'A', 'Proportional Representation ensures minority parties gain legislative voice proportional to their vote share, preventing the "winner-takes-all" bias of single-member districts.');

// 7. COMMERCE, ACCOUNTING, LITERATURE, CRS, IRS, CIVIC, AGRIC, GEO, COMPUTER, FURTHER MATHS
// Boost each to 20-30+ questions!
const otherSubjects = [
  {
    sub: 'literature', name: 'Literature in English',
    items: [
      { t: 'Poetic Devices', q: 'A poem of fourteen lines, typically written in iambic pentameter with a formal rhyme scheme, is known as a:', a: 'Sonnet', b: 'Ode', c: 'Elegy', d: 'Ballad', ans: 'A', exp: 'A sonnet has 14 lines, following either the Petrarchan (abba abba cde cde) or Shakespearean (abab cdcd efef gg) structure.' },
      { t: 'Literary Devices', q: 'The direct address of an absent person, an abstract quality, or an inanimate object as though it were alive and present is called:', a: 'Apostrophe', b: 'Allusion', c: 'Metonymy', d: 'Synecdoche', ans: 'A', exp: 'Apostrophe directly addresses an absent entity (e.g., "O Death, where is thy sting?").' },
      { t: 'Dramatic Terms', q: 'The emotional purging or release of pity and fear experienced by the audience at the end of a tragedy is termed:', a: 'Catharsis', b: 'Hamartia', c: 'Hubris', d: 'Nemesis', ans: 'A', exp: 'Aristotle defined catharsis in his "Poetics" as the purification of emotions through pity and terror in tragedy.' },
      { t: 'African Poetry', q: 'In Gabriel Okara\'s poem "Piano and Drums", the drums symbolize:', a: 'Traditional African cultural heritage, warmth, and intuitive connection', b: 'Modern Western technological complexity', c: 'Military violence and armed conflict', d: 'Christian church musical services', ans: 'A', exp: 'The raw, rhythmic African drums represent authentic ancestral culture, contrasted with the complex, labyrinthine Western piano.' }
    ]
  },
  {
    sub: 'commerce', name: 'Commerce',
    items: [
      { t: 'Production & Trade', q: 'Production is not complete until the manufactured goods:', a: 'Reach the ultimate consumer', b: 'Leave the factory warehouse', c: 'Are displayed on retail shelves', d: 'Are insured against fire and transit theft', ans: 'A', exp: 'In commercial economics, production encompasses creation of utility and is only complete when goods/services reach the end-user.' },
      { t: 'Banking & Finance', q: 'A crossed cheque differs from an open cheque because a crossed cheque:', a: 'Cannot be cashed over the bank counter and must be paid into a bank account', b: 'Requires no signature from the drawer', c: 'Can be cashed by any person holding it', d: 'Is valid for only 24 hours after issue', ans: 'A', exp: 'Two parallel transverse lines crossed on a cheque mandate that funds must be cleared through a bank account, providing safety against theft.' },
      { t: 'Warehousing & Logistics', q: 'A bonded warehouse is a specialized warehouse used for storing:', a: 'Dutiable imported goods on which customs tariffs have not yet been paid', b: 'Perishable agricultural commodities', c: 'Manufactured goods awaiting local wholesale distribution', d: 'Hazardous chemicals and explosives', ans: 'A', exp: 'Bonded warehouses operate under customs authority bonds until import duty is settled or goods are re-exported.' }
    ]
  },
  {
    sub: 'accounting', name: 'Financial Accounting',
    items: [
      { t: 'Books of Prime Entry', q: 'Credit purchases of merchandise meant for resale are originally recorded in the:', a: 'Purchases Day Book (Purchases Journal)', b: 'General Journal', c: 'Cash Book', d: 'Sales Day Book', ans: 'A', exp: 'The Purchases Day Book records credit purchases of trading stock from suppliers based on incoming purchase invoices.' },
      { t: 'Bank Reconciliation', q: 'An uncredited cheque in a bank reconciliation statement refers to a cheque that has been:', a: 'Deposited into the bank but not yet credited on the bank statement', b: 'Issued to a creditor but not yet presented at the bank for payment', c: 'Dishonored by the bank due to insufficient funds', d: 'Stolen or forged before presentation', ans: 'A', exp: 'Uncredited deposits (lodgments in transit) are cheques paid into the bank and debited in the cash book, but awaiting bank ledger credit.' },
      { t: 'Final Accounts', q: 'Cost of Goods Sold (COGS) is calculated as:', a: 'Opening Stock + Purchases - Closing Stock', b: 'Sales - Net Profit', c: 'Total Purchases + Carriage Outwards', d: 'Closing Stock + Purchases - Opening Stock', ans: 'A', exp: 'COGS = Opening Inventory + Net Purchases + Carriage Inwards - Closing Inventory.' }
    ]
  },
  {
    sub: 'crs', name: 'Christian Religious Studies',
    items: [
      { t: 'Old Testament History', q: 'Who led the Israelites across the Jordan River into the Promised Land of Canaan after the death of Moses?', a: 'Joshua', b: 'Caleb', c: 'Aaron', d: 'Gideon', ans: 'A', exp: 'Joshua son of Nun succeeded Moses and commanded the conquest of Jericho and settlement in Canaan (Joshua 1).' },
      { t: 'The Gospels', q: 'In the Gospel of John, what was the first miracle performed by Jesus Christ?', a: 'Turning water into wine at the wedding in Cana of Galilee', b: 'Healing the blind man Bartimaeus', c: 'Walking on the Sea of Galilee', d: 'Raising Lazarus from the dead', ans: 'A', exp: 'John 2:1-11 records the miracle at Cana as the "beginning of signs" manifested by Jesus.' }
    ]
  },
  {
    sub: 'irs', name: 'Islamic Religious Studies',
    items: [
      { t: 'Hadith Studies', q: 'The most authoritative and universally accepted compilation of authentic Hadith in Sunni Islam is Sahih al-:', a: 'Bukhari', b: 'Tirmidhi', c: 'Nasa\'i', d: 'Ibn Majah', ans: 'A', exp: 'Sahih al-Bukhari, compiled by Imam Muhammad al-Bukhari, is recognized as the most authentic collection of Hadith.' },
      { t: 'Islamic History', q: 'The Hijrah marks the historical migration of Prophet Muhammad (SAW) and his companions in 622 CE from:', a: 'Makkah to Madinah (Yathrib)', b: 'Madinah to Makkah', c: 'Makkah to Ta\'if', d: 'Madinah to Jerusalem', ans: 'A', exp: 'The Hijrah from Makkah to Madinah in 622 CE marks the beginning of the Islamic lunar calendar (AH).' }
    ]
  },
  {
    sub: 'civic', name: 'Civic Education',
    items: [
      { t: 'Democracy & Rule of Law', q: 'The principle of the Rule of Law emphasizes three core pillars: Supremacy of the law, Equality before the law, and:', a: 'Protection of fundamental human rights', b: 'Military subordination to police command', c: 'Absolute authority of the ruling political party', d: 'Compulsory military conscription for youth', ans: 'A', exp: 'A.V. Dicey\'s formulation of the Rule of Law comprises legal supremacy, equal submission of all persons, and protection of fundamental liberties by courts.' },
      { t: 'Social Issues', q: 'Which Nigerian agency is specifically charged with preventing, suppressing, and prosecuting trafficking in persons, especially women and children?', a: 'NAPTIP', b: 'NDLEA', c: 'NAFDAC', d: 'SON', ans: 'A', exp: 'NAPTIP (National Agency for the Prohibition of Trafficking in Persons) combats human trafficking and rehabilitates victims.' }
    ]
  },
  {
    sub: 'agricultural-science', name: 'Agricultural Science',
    items: [
      { t: 'Crop Production', q: 'The practice of planting leguminous cover crops (such as Mucuna or Centrosema) to replenish soil fertility is known as:', a: 'Green manuring', b: 'Liming', c: 'Mulching', d: 'Terracing', ans: 'A', exp: 'Green manuring involves growing quick-growing legumes and ploughing them into the soil to fix atmospheric nitrogen and add organic humus.' },
      { t: 'Pests & Diseases', q: 'The viral disease of cocoa trees transmitted by mealybugs (Pseudococcus) that causes dieback and leaf mosaic is:', a: 'Swollen shoot disease', b: 'Black pod disease', c: 'Witches\' broom', d: 'Root rot', ans: 'A', exp: 'Cocoa swollen shoot virus (CSSV) is transmitted by mealybugs and severely damages West African cocoa plantations.' }
    ]
  },
  {
    sub: 'geography', name: 'Geography',
    items: [
      { t: 'Landforms & Weathering', q: 'A crescent-shaped sand dune with horns pointing in the direction of the prevailing wind in desert environments is called a:', a: 'Barchan', b: 'Seif dune', b: 'Yardang', d: 'Zeugen', ans: 'A', exp: 'Barchans are transverse crescentic dunes formed in arid deserts where wind blows consistently from one direction.' },
      { t: 'Weather & Climate', q: 'The meteorological instrument used to measure atmospheric air pressure is the:', a: 'Barometer', b: 'Anemometer', c: 'Hygrometer', d: 'Wind vane', ans: 'A', exp: 'A mercury or aneroid barometer measures atmospheric pressure in millibars or millimeters of mercury (mmHg).' }
    ]
  },
  {
    sub: 'computer-studies', name: 'Computer Studies',
    items: [
      { t: 'Data Representation', q: 'How many bits make up one Byte in computer data storage?', a: '8 bits', b: '4 bits', c: '16 bits', d: '32 bits', ans: 'A', exp: 'A byte consists of 8 binary digits (bits), capable of representing 256 (2⁸) distinct values or characters in ASCII.' },
      { t: 'System Software', q: 'A computer program that translates high-level programming language code into machine code all at once before execution is a:', a: 'Compiler', b: 'Interpreter', c: 'Assembler', d: 'Device driver', ans: 'A', exp: 'A compiler translates the entire source code into an executable object binary, whereas an interpreter translates line-by-line.' }
    ]
  },
  {
    sub: 'further-maths', name: 'Further Mathematics',
    items: [
      { t: 'Binomial Theorem', q: 'What is the coefficient of x³ in the binomial expansion of (1 + 2x)⁵?', a: '80', b: '40', c: '160', d: '20', ans: 'A', exp: 'The r-th term is ⁵C₃ (1)² (2x)³ = 10 × 1 × 8x³ = 80x³. Coefficient is 80.' },
      { t: 'Vectors in 2D & 3D', q: 'Calculate the scalar (dot) product of vectors a = 2i + 3j and b = 4i - j.', a: '5', b: '8', c: '11', d: '-3', ans: 'A', exp: 'a · b = (2 × 4) + (3 × -1) = 8 - 3 = 5.' }
    ]
  }
];

otherSubjects.forEach(s => {
  s.items.forEach(item => {
    addQ(s.sub, s.name, item.t, item.q, item.a, item.b, item.c, item.d, item.ans, item.exp);
  });
});

console.log('Writing enriched data back to data/questions.json. Total count:', currentQuestions.length);
fs.writeFileSync(questionsFile, JSON.stringify(currentQuestions, null, 2), 'utf8');

const counts = {};
currentQuestions.forEach(q => counts[q.subjectId] = (counts[q.subjectId] || 0) + 1);
console.log('Updated subject distribution:\n', counts);
