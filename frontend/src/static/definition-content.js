import React, { Fragment } from "react";

const definitionContent = {
  en: [
    {
      i: "Bean Equivalent (MT-BE)",
      t: "Bean Equivalent (MT-BE)",
      d: (
        <Fragment>
          <div>
            <b>
              <u>Bean Equivalent:</u>
            </b>{" "}
            Amount of cocoa beans necessary to produce a certain amount of
            semi-finished cocoa products such as cocoa liquor, nibs, butter,
            powder, or to cover the cocoa content within cocoa-containing
            products.
          </div>
          <br />
          <div>
            <b>
              <u>MT-BE:</u>
            </b>{" "}
            MT-BE stands for &quot;metric tons bean equivalents&quot; of a
            certain quantity of semi-finished cocoa products or cocoa-containing
            products. In other words, the MT-BE represents the corresponding
            volume of cocoa beans sourced, expressed in metric tons. Conversion
            to MT-BE, of cocoa sourced in different forms, is to be done using
            the ICCO conversion factors; being: 1,33 for cocoa butter (1804),
            1,25 for cocoa paste/liquor (18031), and 1,18 for cocoa powder and
            cake (1805, 18032).
          </div>
        </Fragment>
      ),
    },
    {
      i: "Farming household",
      t: "Farming household",
      d: "The farming household corresponds to a smallholder cocoa producing family. The number of farming households, thus corresponds to the number of (smallholder) cocoa farms.",
    },
    {
      i: "Reached (farming households reached)",
      t: "Reached (farming households reached)",
      d: "The term &quot;reached&quot; (in &quot;farming households reached&quot;) is contextual, it could mean d&quot;engaged ind&quot;, d&quot;benefitingd&quot;, etc. Each data collection, for d&quot;# of farming households reachedd&quot;, shall to the extent possible be linked to an activity, output or outcome of the cocoa sustainability project or initiative; such linking thus contextualizes the implication of and/or benefits for the concerned farming household.",
    },
    {
      i: "Farming land",
      t: "Farming land",
      d: "Farming land comprises all land available for exploitation by the cocoa farming household(s); whatever the ownership, share cropping, rental or user right arrangements are. Size of the farming land is to be expressed in hectares (Ha).",
    },
    {
      i: "Farming land under cocoa cultivation",
      t: "Farming land under cocoa cultivation",
      d: "&quot;Farming land under cocoa cultivation&quot; corresponds to (parts of the household's) farming land where cocoa is produced as the main crop, whatever the type of cocoa cultivation applied.",
    },
    {
      i: "Sustainability project",
      t: "Sustainability project",
      d: "A cocoa sustainability project is defined as a program, project or initiative targeting (aspects of) sustainability in cocoa production, processing and/or supply chains.",
    },
    {
      i: "Lesson learned",
      t: "Lesson learned",
      d: "With &quot;lesson learned&quot;, we refer her to any (set of) lesson(s) learned from activities/strategies/studies with respect to sustainability in the cocoa sector that were documented reporting actor and that are pertinent for other actors in the cocoa sector.",
    },
    {
      i: "Supply origin transparency level",
      t: "Supply origin transparency level",
      d: (
        <Fragment>
          The &quot;supply origin transparency level&quot; is about the extent
          that detailed information on the origin of cocoa is being documented
          at the initial stages of the sourcing process, with such information
          remaining available at later stages of the supply chain.
          <br />
          Distinction is made between the following supply origin transparency
          levels:
          <br />
          <br />
          <table>
            <tbody>
              <tr>
                <td width="20%">
                  <b>Score 1</b>
                </td>
                <td>origin unknown or only country of origin known </td>
              </tr>
              <tr>
                <td width="20%">
                  <b>Score 2</b>
                </td>
                <td>country and region of origin known </td>
              </tr>
              <tr>
                <td width="20%">
                  <b>Score 3</b>
                </td>
                <td>
                  country, region and municipality/cooperative of origin known
                </td>
              </tr>
              <tr>
                <td width="20%">
                  <b>Score 4</b>
                </td>
                <td>
                  farm known, in addition to the country, region and
                  municipality/cooperative of origin
                </td>
              </tr>
              <tr>
                <td width="20%">
                  <b>Score 5</b>
                </td>
                <td>
                  farm known and having point coordinates of the farm household
                  (farm mapping)
                </td>
              </tr>
              <tr>
                <td width="20%">
                  <b>Score 5+</b>
                </td>
                <td>farm known and having polygon boundaries of the farm. </td>
              </tr>
              <tr>
                <td width="20%">
                  <b>Score 6</b>
                </td>
                <td>
                  farm known, having polygon boundaries of the farm and farm
                  fields verified as not in a protected forest and as not
                  comprising land that was deforested since 2018. Having a high
                  origin transparency score still allows for massing and mixing
                  of beans at later stages (during transport and/or processing)!
                </td>
              </tr>
            </tbody>
          </table>
        </Fragment>
      ),
    },
    {
      i: "Direct supply",
      t: "Direct supply",
      d: "For cocoa to be categorized as “cocoa soured through a direct supply chain”, there shall be a relative stable partnership and collaboration, conceived to span at least 3 years, between the cocoa sourcing company and the cocoa producer. Such partnership and collaboration may cover issues such as price, quality, good agricultural practices, social, human rights and environmental issues, certification requirements, etc. This partnership and collaboration between the cocoa sourcing company and the producers (cocoa farming households) may be conducted through cooperatives, farmer organizations and/or other intermediaries embedded within the direct supply chain.",
    },
    {
      i: "Conventional (traceability level 0)",
      t: "Conventional (traceability level 0)",
      d: "Cocoa sourced without conforming to the traceability requirements of ‘mass balance’, ‘segregated’, or ‘identity preserved’ - please refer to the corresponding definitions.",
    },
    {
      i: "Mass balance (traceability level 1)",
      t: "Mass balance (traceability level 1)",
      d: "The mass balance system administratively monitors the trade (transaction) of conforming cocoa throughout the entire supply chain. The mass balance system requires a transparent documentation and justification of the origin and quantity of conforming cocoa (= certified or independently verified cocoa) purchased by the first buyer. The mass balance system allows mixing conforming and nonconforming cocoa in next stages of the cocoa supply and value chain (e.g. transport, processing, manufacturing). Cocoa supply chain actors can sell a certain mass of conforming cocoa, or an equivalent volume of conforming cocoa-containing products, to the extent that the actual volumes of sales of conforming products are tracked and audited through the supply chain and that these volumes do not exceed the cocoa bean equivalents of conforming cocoa bought at origin.  (Definition drafted using elements borrowed from ISO-CEN and Fairtrade)",
    },
    {
      i: "Segregated (traceability level 2)",
      t: "Segregated (traceability level 2)",
      d: "Segregated cocoa - Certified or independently verified cocoa meeting the segregation requirements. As per the mass-balance system, segregation requires a transparent documentation and justification of the origin and quantity of conforming cocoa (this is certified or independently verified cocoa) purchased by the first buyer. Conforming cocoa is kept segregated from nonconforming cocoa, including during transport, storage, processing cocoa, and manufacturing of cocoa-containing products. Segregation does allow mixing cocoa from different origins, to the extent that all cocoa being mixed qualifies as conforming cocoa (as per the certification standard or verified company scheme being applied). The cocoa supply chain actors shall demonstrate that they have taken the required measures to avoid mixing conforming cocoa with nonconforming cocoa. (Definition drafted using elements borrowed from ISO-CEN and Rainforest Alliance)",
    },
    {
      i: "Identity preserved (traceability level 3)",
      t: "Identity preserved (traceability level 3)",
      d: "Identity preserved is the highest traceability type. There is no mixing of cocoa, neither with non-conforming cocoa, nor with cocoa from other origins. If the ‘single origin’ is set at cooperative level or at cocoa-producing area (combining different cooperatives), then conforming cocoa from this broader origin may be combined. In other words, the “identity preserved” system meets all requirements of “segregated cocoa” but it does not allow mixing cocoa from different origins. ",
    },
    {
      i: "Certified or independently verified cocoa",
      t: "Certified or independently verified cocoa",
      d: (
        <Fragment>
          <div>
            Cocoa produced in compliance with the requirements of accepted
            certification standards or independently verified company schemes on
            sustainable cocoa. <br />
            The list of accepted certification standards and independently
            verified company schemes currently comprises the following:
            <ul style={{ marginLeft: "25px" }}>
              <li>Rainforest Alliance</li>
              <li>Fairtrade</li>
              <li>Organic</li>
              <li>Naturland</li>
              <li>Company schemes (to be specified)</li>
            </ul>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Premiums granted to the farmer",
      t: "Premiums granted to the farmer",
      d: "The amount of 'premiums granted' does not necessary correspond to the amount of 'premiums paid in cash'. Part of the premiums granted could be deducted for payment as 'withholding' for reimbursement of (a) loan(s) to the farmer or as 'payment for services' provided to the farmer. ",
    },
    {
      i: "Strategy to promote diversified and sustainable farming systems, as a contribution to environmental sustainability",
      t: "Strategy to promote diversified and sustainable farming systems, as a contribution to environmental sustainability",
      d: "Having a &quot;strategy to promote diversified and sustainable farming systems, as a contribution to environmental sustainability&quot; implies that the cocoa sustainability project (program/ project/ initiative) targets changes in farming practices or systems used by cocoa farming households. Such strategy may target (a) reducing or mitigating the adverse environmental effects of existing farming practices or systems or (b) the adoption by the farming households reached of other farming practices and systems that have positive effects for the environment. This may include targets with respect the usage of natural resources, soil quality, pesticides, biodiversity, climate resilience, forest coverage, etc. Such strategy  should be somehow documented and explicit, but it does not have to be a separate specific strategic document on these topics. The strategy may be part of a project document, a project&apos;s theory of change, etc.",
    },
    {
      i: "Agroforestry System for Cocoa Production (Description)",
      t: "Agroforestry System for Cocoa Production (Description)",
      d: (
        <Fragment>
          <div>
            The term AGROFRORESTRY refers to farming fields in which cacao trees
            are deliberately combined with preferably native non-cocoa tree
            species that have proven to be useful for AGROFORESTRY in a
            stratified spatial arrangement and temporal sequence. This includes
            other agricultural crops on the same land management unit,
            triggering ecological, economic, social and sociocultural benefits.
            AGROFORESTRY approaches should be locally adapted and should
            consider the ecologic, economic, social and cultural environment.
          </div>
          <br />
          <div>
            The functions of AGROFORESTRY systems are to enable long term,
            sustainable cocoa production which preserves biodiversity, prevents
            erosion, protects the climate and natural genetic resources,
            diversifies and sustains production to the benefit of all land
            users. Cocoa AGROFORESTRY systems can be developed from different
            starting points, in different ecologic environments. AGROFORESTRY
            systems aim to provide diversified sources of income, can reduce
            costs and can create co-benefits to increase the economic and
            climate change related resilience and to food supply of particularly
            smallholder farmers and local communities living in rural areas.
          </div>
          <br />
          <div>
            Cocoa farmers play a crucial role for the definition, adoption and
            longevity of agroforestry systems. A joint process where the needs,
            capabilities, preferences and experiences of farmers are taken into
            account and in which the farmers are actively supported (technical
            assistance, development plan, capacity building) is very important
            to maintain and improve the existing production system towards
            long-term sustainability.
          </div>
          <br />
          <div>
            Banana plants / plantains do not count as trees / tree species.*
            <br />
            *Only botanically classified trees count towards an agroforestry
            system, other plants, such as forbs (in Deutsch: Stauden) (incl.
            banana trees / plantains), therefore, do not count.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Agroforestry - Categories for Cocoa Agroforestry systems",
      t: "Agroforestry - Categories for Cocoa Agroforestry systems",
      d: (
        <Fragment>
          <div>
            <b>
              <u>Entry level for AGROFORESTRY (1):</u>
            </b>
            <br />
            At least 16 (non-cocoa) trees per ha with a minimum of 3 different
            tree species, that are preferably native This entry level for
            AGROFORESTRY systems corresponds to CFI and WCF indicators on
            AGROFORESTRY
          </div>
          <br />
          <div>
            <b>
              <u>Basic Category for AGROFERSTRY (2):</u>
            </b>
            <br />
            At least 40% shade canopy cover with a minimum of 5 different native
            tree species. This category for AGROFORESTRY is in accordance with
            Rainforest Alliance’s shade coverage and species diversity reference
            parameters.
          </div>
          <br />
          <div>
            <b>
              <u>Advanced Category for AGROFORESTRY (3):</u>
            </b>
            <br />
            At least 40% shade canopy cover
            <ul style={{ marginLeft: "25px" }}>
              <li>
                Minimum of 12 different native tree species (pioneer specied
                excluded)
              </li>
              <li>At least 15% native vegetation coverage</li>
              <li>
                2 strata or stories and shade species should attain a minimum of
                12-15 meters in height
              </li>
            </ul>
            In this category a special focus is given to the landscape approach
            on AGROFORESTRY. This category is in alignment with the
            recommendations of the VOICE Network.
          </div>
          <br />
          <div>
            <b>
              <u>Dynamic AGROFORESTRY Systems (4):</u>
            </b>
            <br />
            These systems are characterized by a very high density of trees per
            hectare. There is an abundance of different tree species, high
            biodiversity, plant communities with different life cycles that
            serve different purposes (carbon sequestration, income sources, food
            etc.). They grow in different stories (strata) without competition.
            There are at least 3 different stories (strata), regenerative
            practices are used, and food security and income sources outside of
            cocoa are guaranteed. This system mimics the natural habitat of
            cacao in a highly developed cultivation system. Chocolats
            Halba&apos;s Dynamic AGROFORESTRY Projects are seen as a model for
            this category.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Hazardous Pesticides",
      t: "Hazardous Pesticides",
      d: (
        <Fragment>
          Hazardous pesticides include as minimum requirement all substances
          which: <br />
          <br />
          <ol type="1" style={{ marginLeft: "1.5rem" }}>
            <li>
              are listed as <b>persistent organic pollutants (POPs)</b> in the
              Stockholm Convention within the Annex III of the Rotterdam
              Convention and/or the Montreal Protocol
            </li>
            <li>
              are classified by WHO as A1 or 1B, (3) are listed in the{" "}
              <b>Dirty Dozen</b> of PAN, or
            </li>
            <li>
              are identified by UN-GHS as substances with{" "}
              <b>chronic toxicity</b>.
            </li>
          </ol>
          <br />
          In addition, specifically for cocoa cultivation, they include
          pesticides that are not permitted for use in export goods to EU
          countries.
          <br />
          <br />
          (The definition is currently under revision, <i>Nov. 2020</i>)
        </Fragment>
      ),
    },
  ],

  de: [
    {
      i: "Bean Equivalent (MT-BE)",
      t: "Bohnenäquivalent (MT-BE)",
      d: (
        <Fragment>
          <div>
            <b>
              <u>Bohnenäquivalent:</u>
            </b>{" "}
            Menge an Kakaobohnen, die für die Herstellung einer bestimmten Menge
            an halbfertigen Kakaoerzeugnissen wie Kakaomasse, -nibs, -butter und
            -pulver notwendig sind oder die den Kakaogehalt in kakaohaltigen
            Produkten abdeckt.
          </div>
          <br />
          <div>
            <b>
              <u>MT-BE:</u>
            </b>{" "}
            MT-BE steht für „metrische Tonnen an Bohnenäquivalenten“ einer
            bestimmten Menge halbfertiger Kakaoerzeugnisse oder kakaohaltiger
            Produkte. Damit gibt MT-BE Auskunft über das entsprechende Volumen
            an beschafften Kakaobohnen in Tonnen. Die Umrechnung in MT-BE von in
            verschiedenen Formen bezogenem Kakao erfolgt über die
            ICCO-Umrechnungsfaktoren; 1,33 für Kakaobutter (1804), 1,25 für
            Kakaomasse (18031) und 1,18 für Kakaopulver und Presskuchen (1805,
            18032).
          </div>
        </Fragment>
      ),
    },
    {
      i: "Farming household",
      t: "Bäuerlicher Haushalt",
      d: "Der bäuerliche Haushalt entspricht einer kleinbäuerlichen kakaoproduzierenden Familie. Die Anzahl der bäuerlichen Haushalte entspricht somit der Anzahl der (kleinbäuerlichen) Kakaobetriebe.",
    },
    {
      i: "Reached (farming households reached)",
      t: "erreicht&quot; (&quot;erreichte bäuerliche Haushalte&quot;)",
      d: "Der Begriff &quot;erreicht&quot; (&quot;erreichte bäuerliche Haushalte&quot;) ist kontextabhängig, er könnte &quot;involviert in&quot;, &quot;profitieren&quot; usw. bedeuten. Jede Datensammlung für &quot;Anzahl der erreichten landwirtschaftlichen Haushalte&quot; wird so weit wie möglich mit einer Aktivität, einem Output oder einem Ergebnis des Kakao-Nachhaltigkeitsprojekts oder der Kakao-Nachhaltigkeitsinitiative verknüpft; eine solche Verknüpfung kontextualisiert somit die Auswirkungen und/oder Vorteile für den betreffenden landwirtschaftlichen Haushalt.",
    },
    {
      i: "Farming land",
      t: "Anbaufläche",
      d: "Als Anbauflächen gelten alle Flächen, die für die Nutzung durch den/die kakaoanbauenden Haushalt(e) zur Verfügung stehen, unabhängig von den Eigentums-, Anbau-, Pacht- oder Nutzungsrechtsverhältnissen. Die Größe des Anbaulandes ist in Hektar (Ha) anzugeben.",
    },
    {
      i: "Farming land under cocoa cultivation",
      t: "Anbaufläche für Kakaoanbau",
      d: "&quot;Anbaufläche für Kakaoanbau&quot; entspricht dem Teil der Anbaufläche (des Haushalts), auf der Kakao als Hauptkulturpflanze angebaut wird, unabhängig von der Art des Kakaoanbaus.",
    },
    {
      i: "Sustainability project",
      t: "Nachhaltigkeitsprojekt",
      d: "Ein Kakao-Nachhaltigkeitsprojekt ist definiert als ein Programm, Projekt oder eine Initiative, die auf (Aspekte der) Nachhaltigkeit in der Kakaoproduktion, -verarbeitung und/oder der/den Lieferketten abzielt.",
    },
    {
      i: "Lesson learned",
      t: "Lesson learned",
      d: "Mit &quot;gelernte Lektion(en)&quot; beziehen wir uns auf jede (Reihe von) Lektion(en), die aus Aktivitäten/Strategien/Studien in Bezug auf Nachhaltigkeit im Kakaosektor gelernt wurde(n), die von einem berichtenden Mitglied dokumentiert wurde(n) und die für andere Akteure im Kakaosektor relevant ist/sind.",
    },
    {
      i: "Supply origin transparency level",
      t: "Supply origin transparency level",
      d: (
        <Fragment>
          Beim supply origin transparency level (Level der Herkunftstransparenz)
          geht es darum, inwieweit detaillierte Informationen über die Herkunft
          des Kakaos in den ersten Phasen des Beschaffungsprozesses dokumentiert
          werden, wobei diese Informationen in späteren Stufen der Lieferkette
          verfügbar bleiben.
          <ul className="list-unstyled">
            <li>Stufe 1: Ursprung unbekannt oder nur Anbauland bekannt</li>
            <li>Stufe 2: Anbauland und Anbauregion bekannt</li>
            <li>
              Stufe 3: Land, Region und Gemeinde/Ursprungskooperative bekannt
            </li>
            <li>
              Stufe 4: Betrieb bekannt, zusätzlich zu Land, Region und
              Gemeinde/Ursprungskooperative
            </li>
            <li>
              Stufe 5: Betrieb bekannt mit Punktkoordinaten des
              landwirtschaftlichen Betriebs (Betriebskartierung)
            </li>
            <li>
              Stufe 5+: Betrieb bekannt mit Polygongrenzen des
              landwirtschaftlichen Betriebs
            </li>
            <li>
              Stufe 6: Betrieb bekannt, die Polygongrenzen des Betriebs und der
              Felder des Betriebs wurden verifiziert und liegen nachweislich
              nicht in einem geschützten Wald und nicht auf Land, das seit 2018
              abgeholzt wurde.
            </li>
          </ul>
        </Fragment>
      ),
    },
    {
      i: "Direkte Lieferkette",
      t: "Direkte Lieferkette",
      d: "Damit Kakao als &quot;über eine direkte Lieferkette bezogener Kakao&quot; kategorisiert werden kann, muss eine relativ stabile Partnerschaft bzw. Zusammenarbeit zwischen dem Unternehmen und den Kakaoproduzenten bestehen, die sich über mindestens 3 Jahre erstrecken soll. Diese Partnerschaft bzw. Zusammenarbeit kann sich auf Themen wie Preis, Qualität, gute landwirtschaftliche Praktiken, soziale, menschenrechtliche und ökologische Fragen, Zertifizierungsanforderungen usw. beziehen. Diese Partnerschaft bzw. Zusammenarbeit zwischen dem Unternehmen und den Erzeugern (kakaoanbauenden Haushalten) kann über Kooperativen, Bauernorganisationen und/oder andere in die direkte Lieferkette eingebettete Vermittler erfolgen.",
    },
    {
      i: "Conventional (traceability level 0)",
      t: "Konventionell (Rückverfolgbarkeitslevel 0)",
      d: "Kakao, der beschafft wurde, ohne den Rückverfolgbarkeitsanforderungen &quot;Mengenausgleich&quot;, &quot;segregated&quot; oder &quot;identity preserved&quot; zu entsprechen - bitte beziehen Sie sich auf die entsprechenden Definitionen.",
    },
    {
      i: "Mass balance (traceability level 1)",
      t: "Mass balance (Rückverfolgbarkeitslevel 1)",
      d: "Der Mengenausgleich (mass balance) überwacht administrativ den Handel (Transaktion) von konformem Kakao über die gesamte Lieferkette. Das Mengenausgleichssystem erfordert eine transparente Dokumentation und Nachweise über Herkunft und Menge des vom Erstkäufer gekauften konformen Kakaos (= zertifizierter oder unabhängig verifizierter Kakao). Das Mengenausgleichssystem ermöglicht das Mischen von konformem und nicht konformem Kakao in den nachfolgenden Stufen der Liefer- und Wertschöpfungskette (z.B. Transport, Verarbeitung, Herstellung). Die Akteure der Kakaolieferkette können eine bestimmte Masse an konformem Kakao oder ein äquivalentes Volumen konformer kakaohaltiger Produkte verkaufen, sofern die tatsächlichen Verkaufsmengen konformer Produkte über die gesamte Lieferkette verfolgt und geprüft werden und diese Mengen die Kakaobohnenäquivalente des im Ursprung gekauften konformen Kakaos nicht übersteigen. (Definition wurde unter Verwendung von Elementen erstellt, die von ISO-CEN und Fairtrade übernommen wurden)",
    },
    {
      i: "Segregated (traceability level 2)",
      t: "Segregiert (Rückverfolgbarkeitslevel 2)",
      d: "Segregierter Kakao ('segregated') - Zertifizierter oder unabhängig überprüfter Kakao, der die Segregationsanforderungen erfüllt. Gemäss dem Mengenausgleichssystem erfordert die Segregation eine transparente Dokumentation und Nachweis der Herkunft und Menge des vom Erstkäufer gekauften konformen Kakaos (dies ist zertifizierter oder unabhängig überprüfter Kakao). Konformer Kakao wird von nicht konformem Kakao getrennt gehalten, auch während des Transports, der Lagerung, der Verarbeitung von Kakao und der Herstellung kakaohaltiger Produkte. Die Trennung ermöglicht das Mischen von Kakao unterschiedlicher Herkunft, soweit der gesamte Kakao, der gemischt wird, als konformer Kakao gilt (gemäß dem angewandten Zertifizierungsstandard oder verifizierten Unternehmensprogramm). Die Akteure der Lieferkette für Kakao müssen nachweisen, dass sie die erforderlichen Maßnahmen ergriffen haben, um zu vermeiden, dass konformer Kakao mit nicht konformem Kakao gemischt wird (Definition unter Verwendung von Elementen, die von ISO-CEN und Rainforest Alliance übernommen wurden).",
    },
    {
      i: "Identity preserved (traceability level 3)",
      t: "&quot;Identity preserved&quot; (Rückverfolgbarkeitslevel 3)",
      d: "&quot;Identity preserved&quot; ist die höchste Art der Rückverfolgbarkeit. Es gibt keine Vermischung von Kakao, weder mit nicht-konformem Kakaonoch mit Kakao anderer Herkunft. Wenn der &quot;einzige Ursprung&quot; auf Kooperativenebene oder in einem Kakaoanbaugebiet (das verschiedene Kooperativen zusammenfasst) festgelegt wird, dann kann konformer Kakao aus diesem breiteren Ursprung kombiniert werden. Mit anderen Worten, das &quot;identity preserved&quot; System erfüllt alle Anforderungen an &quot;segregierten Kakao&quot;, erlaubt aber nicht das Mischen von Kakao aus verschiedenen Ursprüngen. ",
    },
    {
      i: "Certified or independently verified cocoa",
      t: "Zertifiziert oder unabhängig überprüfter Kakao",
      d: (
        <Fragment>
          Kakao, der unter Erfüllung der Anforderungen von anerkannten
          Zertifizierungsstandards oder unabhängig überprüften
          Unternehmensprogrammen für nachhaltigen Kakao produziert wurde. Die
          Liste der anerkannten Nachhaltigkeitsstandards und unabhängig
          überprüfter Unternehmensprogramme umfasst derzeit die folgenden:
          <ul style={{ marginLeft: "25px" }}>
            <li>Rainforest Alliance</li>
            <li>Fairtrade</li>
            <li>Bio</li>
            <li>Naturland</li>
            <li>Unternehmensprogramme (zu spezifizieren)</li>
          </ul>
        </Fragment>
      ),
    },
    {
      i: "Premiums granted to the farmer",
      t: "Gewährte Prämien an die Bäuerinnen und Bauern",
      d: "Der Betrag der &quot;gewährten Prämien&quot; entspricht nicht notwendigerweise dem Betrag der &quot;bar bezahlten Prämien&quot;. Ein Teil der gewährten Prämien könnte zur Zahlung als &quot;Einbehaltung&quot; für die Rückzahlung eines oder mehrerer Darlehen an den Bauern/die Bäuerin oder als &quot;Zahlung für an den Bauern/die Bäuerin erbrachte Dienstleistungen&quot; abgezogen werden.",
    },
    {
      i: "Strategy to promote diversified and sustainable farming systems, as a contribution to environmental sustainability",
      t: "Strategie zur Förderung diversifizierter und nachhaltiger Anbausysteme als Beitrag zur ökologischen Nachhaltigkeit",
      d: "Eine &quot;Strategie zur Förderung diversifizierter und nachhaltiger Anbausysteme als Beitrag zur ökologischen Nachhaltigkeit&quot; bedeutet, dass das Kakao-Nachhaltigkeitsprojekt (Programm/Projekt/Initiative) auf Veränderungen der Anbaupraktiken oder -systeme abzielt, die von kakaoanbauenden Haushalten verwendet werden. Eine solche Strategie kann darauf abzielen, (a) die negativen Umweltauswirkungen bestehender Anbaupraktiken oder -systeme zu verringern oder abzuschwächen oder (b) die Verwendung anderer Anbaupraktiken und -systeme, die positive Auswirkungen auf die Umwelt haben durch die bäuerlichen Haushalte zu erreichen.  Dies kann Ziele in Bezug auf die Nutzung natürlicher Ressourcen, Bodenqualität, Pestizide, biologische Vielfalt, Klimaresistenz, Waldbedeckung usw. beinhalten. Eine solche Strategie sollte in irgendeiner Weise dokumentiert und explizit ausformuliert sein, aber es muss sich dabei nicht um ein separates, spezifisches strategisches Dokument zu diesen Themen handeln. Die Strategie kann Teil eines Projektdokuments, der Veränderungstheorie eines Projekts usw. sein.",
    },
    {
      i: "Agroforestry System for Cocoa Production (Description)",
      t: "Agroforstsystem im Kakaoanbau (Beschreibung)",
      d: (
        <Fragment>
          <div>
            Der Begriff Agroforstwirtschaft bezieht sich auf Anbauflächen, auf
            denen Kakaobäume bewusst mit vorzugsweise einheimischen und sich für
            AGROFORSTSYSTEME eignende Nicht-Kakaobaumarten kombiniert werden.
            Dabei handelt es sich in der Regel um andere Nutzpflanzen, wodurch
            ökologische, ökonomische, soziale und soziokulturelle Vorteile
            entstehen können. Agroforstansätze sollten lokal angepasst sein und
            das ökologische, ökonomische, soziale und kulturelle Umfeld
            berücksichtigen.
          </div>
          <br />
          <div>
            AGROFORSTSYSTEME ermöglichen eine ökologisch und wirtschaftlich
            nachhaltige Kakaoproduktion, welche die biologische Artenvielfalt
            erhält, Erosion verringert, das Klima und die natürlichen Ressourcen
            schützt und den Anbau diversifiziert - zum Vorteil von Bäuerinnen
            und Bauern. AGROFORSTSYSTEME zielen darauf ab, das Einkommen von
            Bäuerinnen und Bauern zu diversifizieren, gegebenenfalls
            Produktionskosten zu reduzieren, die wirtschaftliche und
            klimawandelbezogene Resilienz von kakaoanbauenden Betrieben zu
            erhöhen und die Nahrungsmittelversorgung im ländlichen Raum zu
            verbessern.
          </div>
          <br />
          <div>
            Kakaobäuerinnen und -bauern spielen eine entscheidende Rolle für die
            Akzeptanz, Verbreitung und Nachhaltigkeit von AGROFORSTSYSTEMEN. Ein
            gemeinschaftlicher Prozess, in dem die Bedürfnisse, Präferenzen und
            Erfahrungen der Bäuerinnen und Bauern berücksichtigt werden und sie
            aktiv unterstützt werden (über technische Unterstützung,
            Entwicklungspläne, Kapazitätsaufbau), ist essenziell, um bestehende
            Anbausysteme nachhaltiger auszugestalten.
          </div>
          <br />
          <div>
            Bananenpflanzen / Kochbananen zählen nicht als Bäume / Baumarten.*
            <br />
            *Lediglich botanisch klassifizierte Bäume werden als „Bäume“
            gewertet, andere Pflanzen wie Stauden (so auch
            (Koch-)Bananenstauden), zählen daher nicht.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Agroforestry - Categories for Cocoa Agroforestry systems",
      t: "Agroforst-Kategorien für Kakao-Agroforstsysteme",
      d: (
        <Fragment>
          <div>
            <b>
              <u>Einstiegstufe für AGROFORSTSYSTEME (1):</u>
            </b>
            <br />
            Mindestens 16 Nicht-Kakaobäume pro Hektar mit mindestens 3
            verschiedenen – vorzugsweise einheimischen – Baumarten. Diese
            Einstiegsstufe für AGROFORSTSYSTEME entspricht den
            Agroforstindikatoren von CFI und WCF.
          </div>
          <br />
          <div>
            <b>
              <u>Basiskategorie für AGROFORSTSYSTEME (2):</u>
            </b>
            <br />
            Mindestens 40 % Überschirmungsgrad und mindestens 5 verschiedene
            einheimische Baumarten. Diese Kategorie für AGROFORSTSYSTEME
            entspricht den Rainforest Alliance Referenzparametern für
            Beschattung und biologischer Artenvielfalt.
          </div>
          <br />
          <div>
            <b>
              <u>Fortgeschrittene Kategorie für AGROFORSTSYSTEME (3):</u>
            </b>
            <br />
            Mindestens 40% Überschirmungsgrad,
            <ul style={{ marginLeft: "25px" }}>
              <li>
                mindestens 12 verschiedene einheimische Baumarten (nicht:
                Pionierbaumarten)
              </li>
              <li>Mindestens 15% einheimische Vegetationsbedeckung</li>
              <li>
                2 Stockwerke / Baumstrata und eine Mindesthöhe der Schattenbäume
                von 12-15 Metern
              </li>
            </ul>
            In dieser Kategorie wird ein besonderer Fokus auf den
            landschaftlichen Ansatz der Agroforstwirtschaft gelegt. Sie
            orientiert sich an den Empfehlungen des VOICE-Netzwerks.
          </div>
          <br />
          <div>
            <b>
              <u>Dynamische AGROFORSTSYSTEME (4):</u>
            </b>
            <br />
            Diese Systeme zeichnen sich durch eine sehr hohe Baumdichte pro
            Hektar aus. Das Anbausystem beherbergt viele verschiedene Baum- und
            Pflanzenarten mit unterschiedlichen Lebenszyklen, die verschiedene
            Zwecke erfüllen (Kohlenstoffbindung, alternative Einkommensquellen,
            Nahrung etc.). Sie gedeihen in verschiedenen Schichten ohne
            Konkurrenz zueinander. Es gibt mindestens 3 verschiedene Stockwerke
            / Strata, es werden regernative landwirtschaftliche Praktiken
            angewendet und die Nahrungsmittelsicherheit sowie alternative
            Einkommensquellen außerhalb des Kakaos sind gesichert. Dieses System
            ahmt den natürlichen Lebensraum des Kakaos in einem hoch
            entwickelten Anbausystem nach, wobei die dynamischen
            Agroforstprojekte von Chocolats Halba als Vorbild gelten.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Hazardous Pesticides",
      t: "Gefährliche Pestizide",
      d: (
        <Fragment>
          Gefährliche Pestizide umfassen als Mindestanforderung alle Substanzen,
          die
          <br />
          <br />
          <ol type="1" style={{ marginLeft: "1.5rem" }}>
            <li>
              als{" "}
              <b>
                <i>Persistent Organic Pollutants</i> (POPs)
              </b>{" "}
              in der Stockholm Konvention geführt sind, im Annex III der
              Rotterdam Konvention bzw. im Mont-real Protokoll geführt sind,
            </li>
            <li>von der WHO als 1A oder 1B klassifiziert sind,</li>
            <li>
              auf der Liste der{" "}
              <b>
                <i>Dirty Dozen</i>
              </b>{" "}
              der PAN geführt sind, oder die
            </li>
            <li>
              im UN-GHS als Substanzen mit{" "}
              <b>
                <i>Chronic Toxicity</i>
              </b>{" "}
              ausgewiesen werden.
            </li>
          </ol>
          Zudem spezifisch für den Kakaoanbau solche Pestizide, deren Verwendung
          für Exportgut in EU-Staaten nicht zugelassen sind.
          <br />
          <br /> (Die Definition ist derzeit in Überarbeitung, <i>Nov.2020</i>.)
        </Fragment>
      ),
    },
  ],
};

export default definitionContent;
