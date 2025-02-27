import React, { Fragment } from "react";
import { Table } from "antd";

const numberOfHHIndirectSupplyChainData = [
  ["Côte d'Ivoire", 3.0, 1521.6, 507.2],
  ["Ghana", 3.44, 1131.7, 329],
  ["Nigeria", 2.3, 630.89, 274.3],
  ["Cameroon", 3.3, 1592.58, 482.6],
  ["Ecuador", 5.8, 3840.18, 662.1],
];

const numberOfHHIndirectSupplyChainColumns = [
  {
    title: <b>Country</b>,
    dataIndex: "country",
    key: "country",
    width: "40%",
  },
  {
    title: (
      <b>Average land size in ha (Cocoa Barometer and CHIS Study in Ghana)</b>
    ),
    dataIndex: "avg_land_size",
    key: "avg_land_size",
    width: "20%",
  },
  {
    title: <b>Average annual yield</b>,
    dataIndex: "avg_annual_yield",
    key: "avg_annual_yield",
    width: "20%",
  },
  {
    title: (
      <b>
        Average yield in kg/ha in 2022*
        <br />
        <small>*2024 data available for Ghana</small>
      </b>
    ),
    dataIndex: "avg_yield",
    key: "avg_yield",
    width: "20%",
  },
];

const numberOfHHIndirectSupplyChainDataSource =
  numberOfHHIndirectSupplyChainData.map((item, index) => ({
    key: index,
    country: item[0],
    avg_land_size: item[1],
    avg_annual_yield: item[2],
    avg_yield: item[3],
  }));

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
            MT-BE stands for ”metric tons bean equivalents” of a certain
            quantity of semi-finished cocoa products or cocoa-containing
            products. In other words, the MT-BE represents the corresponding
            volume of cocoa beans sourced, expressed in metric tons. Conversion
            to MT-BE, of cocoa sourced in different forms, is to be done using
            the ICCO conversion factors; being: 1,33 for cocoa butter (1804),
            1,25 for cocoa paste/liquor (18031), and 1,18 for cocoa powder and
            cake (1805, 18032). With respect to the MT-BE of cocoa contained in
            consumer end products supplied to the national market in Europe,
            reporting is to be done by the consumer brands. For their own labels
            (brands), retailers are expected to report in the same way as the
            consumer brands. Of course, where required, these brands / retailers
            will rely on the corresponding information obtained from their
            suppliers.
          </div>
        </Fragment>
      ),
    },
    {
      i: "MT-BE",
      t: "MT-BE",
      d: "Metric Ton-Bean Equivalent: Please refer to the definition for “Bean equivalent”.",
    },
    {
      i: "Child Labour",
      t: "Child Labour",
      d: (
        <Fragment>
          <div>
            The term “child labour” is often defined as work that deprives
            children of their childhood, their potential and their dignity, and
            that is harmful to physical and mental development. It refers to
            work that:
            <ul style={{ marginLeft: "25px" }}>
              <li>
                is mentally, physically, socially or morally dangerous and
                harmful to children; and/or
              </li>
              <li>
                interferes with their schooling by: depriving them of the
                opportunity to attend school; obliging them to leave school
                prematurely; or requiring them to attempt to combine school
                attendance with excessively long and heavy work.
              </li>
            </ul>
            Whilst child labour takes many different forms, a priority is to
            eliminate without delay the worst forms of child labour as defined
            by Article 3 of ILO Convention No. 182:
            <ul style={{ marginLeft: "25px" }}>
              <li>
                all forms of slavery or practices similar to slavery, such as
                the sale and trafficking of children, debt bondage and serfdom
                and forced or compulsory labour, including forced or compulsory
                recruitment of children for use in armed conflict;
              </li>
              <li>
                the use, procuring or offering of a child for prostitution, for
                the production of pornography or for pornographic performances;
              </li>
              <li>
                the use, procuring or offering of a child for illicit
                activities, in particular for the production and trafficking of
                drugs as defined in the relevant international treaties;
              </li>
              <li>
                work which, by its nature or the circumstances in which it is
                carried out, is likely to harm the health, safety or morals of
                children.
              </li>
            </ul>
            <i>
              The definition builds on Convention No.138 on Minimum Age and
              Convention No. 182 on the Worst Forms of Child Labour.
              <br />
              Cited from: ILO (n.d.). What is child labour (IPEC) (ilo.org).
            </i>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Child Labour Monitoring and Remediation Systems (CLMRS)",
      t: "Child Labour Monitoring and Remediation Systems (CLMRS)",
      d: (
        <Fragment>
          <div>
            Child Labour Monitoring and Remediation Systems are a means of
            targeting prevention, mitigation and remediation assistance to
            children involved in or at-risk of child labour, as well as to their
            families and communities. To meet the definition of a{" "}
            <i>Child Labour Monitoring and Remediation Systems (CLMRS)</i> or
            equivalent, the system must implement the following core activities:
            <ol style={{ marginLeft: "25px" }} start={1}>
              <li>
                Raise awareness on child labour and resulting harm amongst
                farmers, children and the wider community.
              </li>
              <li>
                Identify children in child labour through active, regular and
                repeated monitoring, using standardized data collection tools.
              </li>
              <li>
                Provide support (prevention and remediation) to children in
                child labour, and others at risk, and document the support
                provided.
              </li>
              <li>
                Follow-up with children identified in child labour and continue
                to monitor their status on a regular basis until they have
                stopped engaging in child labour and have satisfactory
                alternatives.
              </li>
            </ol>
          </div>
        </Fragment>
      ),
    },
    {
      i: "CLMRS",
      t: "CLMRS",
      d: "Please refer to the definition of “Child Labour Monitoring and Remediation Systems (CLMRS)”",
    },
    {
      i: "Cocoa traceability levels",
      t: "Cocoa traceability levels",
      d: (
        <Fragment>
          <div>
            The cocoa traceability level concerns the level of information on
            the origin of cocoa being documented at the initial stage of the
            cocoa sourcing process, with such information remaining available at
            later stages of the value chain. The cocoa traceability level does
            not require segregation but can be applied also with a mass balance
            mechanism. Distinction is made between the following traceability
            levels:
            <ol style={{ marginLeft: "25px" }} start={1}>
              <li>
                Origin unknown, expressed in % of the total volume supplied/
                processed.
              </li>
              <li>
                Country known, expressed in % of the total volume supplied/
                processed.
              </li>
              <li>
                Cooperative known, expressed in % of the total volume supplied/
                processed.
              </li>
              <li value={4}>
                a. Farm known and having at least one coordination per farm
                (farm mapping), expressed in % of the total volume supplied/
                processed.
              </li>
              <li value={4}>
                b. Farm known, having point coordinates and /or polygons for
                plots less than 4ha and polygon boundaries of the plots bigger
                than 4ha, expressed in % of the total volume supplied/
                processed.
              </li>
            </ol>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Community Action Plan (CAP)",
      t: "Community Action Plan (CAP)",
      d: "A developed plan, based on a community needs assessment (CNA), prepared by or in participation with the community. The plan should include interventions that address important community development needs. The plan implementation should be led by the community with equitable and diverse community representation and with short-term external technical and financial support with, if applicable, a long-term plan to sustainably hand over all responsibility to the community including management and finance. The short-term plan should include the use of participatory tools to build the capacity of community members to act in accordance with the problems, needs, and potential of the community, to implement those plans.",
    },
    {
      i: "Community Needs Assessment (CNA)",
      t: "Community Needs Assessment (CNA)",
      d: "An assessment conducted with the participation of a community to identify and determine the priority short and long-term development needs of that community that includes research to understand community dynamics that are important to develop a relevant and sustainable community action plan.",
    },
    {
      i: "Conventional traceability of cocoa",
      t: "Conventional traceability of cocoa",
      d: "Conventional cocoa (traceability category 0) is cocoa sourced without conforming to the traceability requirements of ‘mass balance’, ‘segregated’, or ‘identity preserved’ - please refer to the corresponding definitions.",
    },
    {
      i: "Coverage (for CLMRS and similar systems)",
      t: "Coverage (for CLMRS and similar systems)",
      d: (
        <Fragment>
          <div>
            A household can be considered “covered” by a CLMRS or comparable
            system, if an assessment of child labour risk has been conducted at
            household level, EITHER:
            <ol type="i" style={{ marginLeft: "25px" }}>
              <li>
                through an in-person monitoring visit, including child
                interview, OR
              </li>
              <li>through assessment using a household-level risk model.</li>
            </ol>
            (ie. a systematic analysis of reliable data about the household to
            predict child labour, using a transparent, documented method of
            assessment)
          </div>
        </Fragment>
      ),
    },
    {
      i: "Deforestation",
      t: "Deforestation",
      d: (
        <Fragment>
          <div>
            The conversion of forest to other land use independently whether
            human -induced or not.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Deforestation-free cocoa",
      t: "Deforestation-free cocoa",
      d: (
        <Fragment>
          <div>
            Having polygons of the farm (&gt; 4 ha) and farm plots (&lt; 4 ha)
            verified as not in a protected forest and as not comprising land
            that was deforested since 31.12.2018 for GISCO and 31.12.2020 for
            the other ISCOs.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Degraded lands",
      t: "Degraded lands",
      d: (
        <Fragment>
          <div>
            “Land degradation: the deterioration or loss of the productive
            capacity of the soils for present and future.”
            <br />
            <i>(from the Global Environmental Facility)</i>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Farmer or farmer-based organisations",
      t: "Farmer or farmer-based organisations",
      d: "Farmer-based organizations (FBOs) are: “cooperatives”; “other professional groups of farmers”; other groups that are recognized formal or informal institutions with a cocoa aggregating and sale role and ideally provide support / technical services to members and influence cocoa farming or broader life in the community. A member can be an individual who, for example, pays a membership fee, is formally recognized by the organization as a member, or holds a formal position within the organization.",
    },
    {
      i: "Farming household",
      t: "Farming household",
      d: (
        <Fragment>
          The farming household corresponds to a smallholder cocoa producing
          family.
          <br />A farming household may correspond to a single farm or to more
          than one farm, each with their farm management characteristics and led
          by other members of the farming household (farmers).
        </Fragment>
      ),
    },
    {
      i: "Reached (farming households reached)",
      t: "Reached (farming households reached)",
      d: "The term “reached” (as in ”farming households reached”) is contextual, it could mean ”engaged in”, ”benefiting”, etc. Each data collection, for “# of farming households reached”, shall to the extent possible be linked to an activity, output or outcome of the cocoa sustainability project or initiative; such linking thus contextualizes the implication of and / or benefits for the concerned farming household.",
    },
    {
      i: "Farming land",
      t: "Farming land",
      d: "Farming land comprises all land available for exploitation by the cocoa farming household(s); whatever the ownership, share cropping, rental or user right arrangements are. Size of the farming land is to be expressed in hectares (Ha).",
    },
    {
      i: "Farming land under cocoa cultivation",
      t: "Farming land under cocoa cultivation",
      d: (
        <Fragment>
          <div>
            &quot;Farming land under cocoa cultivation&quot; corresponds to
            (parts of the household&apos;s) farming land (plots) where cocoa is
            produced as the main crop*, whatever the type of cocoa cultivation
            applied.
            <br /> (*if in special cases a significant amount of cocoa is
            produced on agricultural land (plots) where cocoa is only the
            secondary crop then this land can also be accounted for as farming
            land under cocoa cultivation)
          </div>
        </Fragment>
      ),
    },
    {
      i: "Direct supply",
      t: "Direct sourcing",
      d: "For cocoa to be categorized as “cocoa sourced through a direct supply chain”, there shall be a relatively stable partnership and collaboration, in which the individual cocoa farmers / farming families are known (registered).  Such partnership and collaboration may cover issues such as price, quality, good agricultural practices, social, human rights and environmental issues, certification requirements, etc. This partnership and collaboration between the ISCO cocoa sourcing company and the producers (cocoa farming households) may be conducted through cooperatives, farmer organisations and / or other intermediaries embedded within the direct supply chain.",
    },
    {
      i: "Mass balance",
      t: "Mass balance",
      d: (
        <Fragment>
          <div>
            The mass balance system administratively monitors the trade of
            conforming cocoa throughout the entire supply chain. The system
            requires transparent documentation and justification of the origin
            and quantity of conforming cocoa purchased by the first buyer. The
            mass balance system allows mixing conforming and non-conforming
            cocoa in later stages of the cocoa value chain (e.g. transport,
            processing, manufacturing). Cocoa value chain actors can sell a
            certain mass of conforming cocoa, or an equivalent volume of
            conforming cocoa-containing products, to the extent that the actual
            volumes of sales of conforming products are tracked and audited
            through the supply chain and providing that the bean equivalents of
            these volumes do not exceed the amount of conforming cocoa beans
            bought at origin.{" "}
            <i>
              (Definition drafted using elements borrowed from ISO-CEN and
              Fairtrade)
            </i>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Segregated",
      t: "Segregated",
      d: (
        <Fragment>
          <div>
            Certified or independently verified cocoa meeting the segregation
            requirements. As per the mass-balance system, segregation requires a
            transparent documentation and justification of the origin and
            quantity of conforming cocoa (this is certified or independently
            verified cocoa) purchased by the first buyer. Conforming cocoa is
            kept segregated from nonconforming cocoa, including during
            transport, storage, processing cocoa, and manufacturing of
            cocoa-containing products. Segregation does allow mixing cocoa from
            different origins to the extent that all cocoa being mixed qualifies
            as conforming cocoa (as per the certification standard or verified
            company scheme being applied). The cocoa supply chain actors shall
            demonstrate that they have taken the required measures to avoid
            mixing conforming cocoa with nonconforming cocoa.{" "}
            <i>
              (Definition drafted using elements borrowed from ISO-CEN and
              Rainforest Alliance)
            </i>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Identity preserved",
      t: "Identity preserved",
      d: "Identity preserved is the highest traceability category. There is no mixing of cocoa, neither with non-conforming cocoa, nor with cocoa from other origins. If the ‘single origin’ is set at cooperative level or at cocoa-producing area (combining different cooperatives), then conforming cocoa from this broader origin may be combined. In other words, the “identity preserved” system meets all requirements of “segregated cocoa”, but it does not allow mixing cocoa from different origins.",
    },
    {
      i: "Indirect supply",
      t: "Indirect Supply",
      d: "For cocoa to be categorized as “cocoa sourced through an indirect supply chain”, there is no or minimal contact, no partnership and no collaboration between the cocoa sourcing company and the cocoa producer. The cocoa is typically sourced through (several) intermediaries which do not disclose the individual farmers / farming families that produced the cocoa.",
    },
    {
      i: "Integrated Pest Management (IPM)",
      t: "Integrated Pest Management (IPM)",
      d: (
        <Fragment>
          <div>
            Integrated Pest Management (IPM) means the careful consideration of
            all available pest control techniques and subsequent integration of
            appropriate measures that discourage the development of pest
            populations and keep pesticides and other interventions to levels
            that are economically justified and reduce or minimize risks to
            human health and the environment. IPM emphasizes the growth of a
            healthy crop with the least possible disruption to agro-ecosystems
            and encourages natural pest control mechanisms. (FAO:{" "}
            <a
              href="http://www.fao.org/agriculture/crops/thematic-sitemap/theme/pests/ipm/en/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "14px" }}
            >
              http://www.fao.org/agriculture/crops/thematic-sitemap/theme/pests/ipm/en/{" "}
            </a>
            )
          </div>
        </Fragment>
      ),
    },
    {
      i: "Living Income",
      t: "Living Income",
      d: (
        <Fragment>
          <div>
            • Living income refers to the net annual income required for a
            household in a particular place to afford a decent standard of
            living for all members of that household. Elements of a decent
            standard of living include: food, water, housing, education,
            healthcare, transport, clothing, and other essential needs including
            provision for unexpected events.{" "}
            <i>(Living Income Community of Practice)</i>
            <br />
            <i>
              Any Living Income Benchmarks should be based on publications by or
              for the Living Income Community of Practice.
            </i>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Living income benchmarks",
      t: "Living income benchmarks",
      d: (
        <Fragment>
          <div>
            Please refer to the{" "}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "14px" }}
            >
              LICOP website
            </a>{" "}
            for an overview of living income benchmarks and studies. If there is
            no benchmark available for the region you are working in, please
            consult the
            <a
              href="https://c69aa8ac-6965-42b2-abb7-0f0b86c23d2e.filesusr.com/ugd/0c5ab3_4a0b8a8f12d74abc86b2260984a967ae.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "14px" }}
            >
              LICOP FAQ living income benchmarks
            </a>{" "}
            which provides guidance for using alternatives when there is no
            benchmark available.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Living Income Reference Price",
      t: "Living Income Reference Price",
      d: (
        <Fragment>
          <div>
            A Living Income Reference Price indicates the price needed for an
            average farmer household with a viable farm size and an adequate
            productivity level to make a living income from the sales of their
            crop. It can be calculated with the formula:
            <br />
            <code>
              Living Income Reference Price (LIRP) = Cost of decent living +
              cost of sustainable production / viable land area * sustainable
              yields
            </code>
            <br />
            For Fairtade the relevant price at farmgate is:
            <ul style={{ marginLeft: "25px" }}>
              <li>Ghana: 16.50 GHC / 2.12 USD per kg</li>
              <li>Côte d’Ivoire: 1.602 CFA / 2.39 USD per kg</li>
            </ul>
            For other origins, please indicate in the comment box, which LIRP
            you are using.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Living Income strategy",
      t: "Living Income Strategy",
      d: (
        <Fragment>
          <div>
            A living income strategy is a strategy with the explicit goal to
            enable cocoa farming households to earn a living income. A living
            income strategy includes a monitoring and learning component.
            <br />
            A living income strategy uses a combination, or “smart-mix” of
            strategies that target multiple income drivers. Multiple income
            drivers* are being assessed strategically for the purpose of closing
            the living income gap**. The interventions for each driver depend on
            the current situation of those drivers and to what extent addressing
            these drivers can help close the living income gap among different
            segments and profiles of farmers. Strategies that can improve income
            drivers go beyond addressing changes in the farm system and
            household behaviour. These strategies include improved procurement
            practices. They range from service delivery for improved production
            and processing, to brand and consumer engagement, and to improving
            the enabling environment.
            <br />
            <br />
            A living income strategy goes beyond income generating activities
            (IGAs) that do not have the explicit aim of closing living income
            gaps.
            <br />
            <br />
            *land size, yield, price, cost of production, diversified incomes
            <br />
            **the difference between the actual household income and the
            existing living income benchmark
          </div>
        </Fragment>
      ),
    },
    {
      i: "Certified or independently verified cocoa",
      t: "Certified or independently verified cocoa",
      d: (
        <Fragment>
          <div>
            Cocoa produced in compliance with the requirements of accepted
            certification standards or independently verified company schemes on
            sustainable cocoa.
            <br />
            The list of accepted certification standards and independently
            verified company schemes currently comprises the following:
            <ul style={{ marginLeft: "25px" }}>
              <li>Rainforest Alliance</li>
              <li>Fairtrade</li>
              <li>Organic - Bio Suisse</li>
              <li>Naturland</li>
              <li>
                Company schemes (for example Cocoa Life; to be specified below)
              </li>
            </ul>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Premiums granted to the farmer and / or coopertaive",
      t: "Premium granted",
      d: "A premium granted to a farmer and/or cooperative is an additional amount of money paid in addition to the regular market price paid to the producers or producer organizations. Premiums are here understood only as market or volume related payments and do hence not include payments such as 'payments for environmental services', conditional or unconditional cash payments etc. Please note that LIRP payments are covered in a separate question.",
    },
    {
      i: "Agroforestry System for Cocoa Production (Description)",
      t: "Agroforestry System for Cocoa Production (Description)",
      d: (
        <Fragment>
          <ul type="bullet" style={{ margin: 0, padding: 0 }}>
            <li>
              The term AGROFRORESTRY refers to farming fields in which cocoa
              trees are deliberately combined with preferably native non-cocoa
              tree species that have proven to be useful for AGROFORESTRY in a
              stratified spatial arrangement and temporal sequence. This
              includes other agricultural crops on the same land management
              unit, triggering ecological, economic, social, and sociocultural
              benefits. AGROFORESTRY approaches should be locally adapted and
              should consider the ecologic, economic, social, and cultural
              environment.
            </li>
            <li>
              The functions of AGROFORESTRY systems are to enable long-term,
              sustainable cocoa production which preserves biodiversity,
              prevents erosion, protects the climate and natural genetic
              resources, diversifies and sustains production to the benefit of
              all land users. Cocoa AGROFORESTRY systems can be developed from
              different starting points, in different ecologic environments.
              AGROFORESTRY systems aim to provide diversified sources of income,
              can reduce costs, and can create co-benefits to increase the
              economic and climate change related resilience and to food supply
              of particularly smallholder farmers and local communities living
              in rural areas.
            </li>
            <li>
              Cocoa farmers play a crucial role for the definition, adoption,
              and longevity of agroforestry systems. A joint process where the
              needs, capabilities, preferences, and experiences of farmers are
              taken into account and in which the farmers are actively supported
              (technical assistance, development plan, capacity building) is
              very important to maintain and improve the existing production
              system towards long-term sustainability.
            </li>
            <li>
              Banana plants / plantains do not count as trees / tree species.*
              <br />
              <small>
                *Only botanically classified trees count towards an agroforestry
                system, other plants, such as forbs (in Deutsch: Stauden) (incl.
                banana trees / plantains), therefore, do not count.
              </small>
            </li>
          </ul>
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
            <ul>
              <li>
                At least 16 (non-cocoa) trees per ha with a minimum of 3
                different tree species, that are preferably native. This entry
                level for AGROFORESTRY systems corresponds to CFI and WCF
                indicators on AGROFORESTRY.
              </li>
            </ul>
          </div>
          <br />
          <div>
            <b>
              <u>Basic Category for AGROFORESTRY (2):</u>
            </b>
            <ul>
              <li>
                At least 40% shade canopy cover with a minimum of 5 different
                native tree species. This category for AGROFORESTRY is in
                accordance with Rainforest Alliance’s shade coverage and species
                diversity reference parameters.
              </li>
            </ul>
          </div>
          <br />
          <div>
            <b>
              <u>Advanced Category for AGROFORESTRY (3):</u>
            </b>
            <ul>
              <li>
                At least 40% shade canopy cover
                <ul type="circle">
                  <li>
                    Minimum of 12 different native tree species (pioneer species
                    excluded),
                  </li>
                  <li>At least 15% native vegetation coverage,</li>
                  <li>
                    2 strata or stories and shade species should attain a
                    minimum of 12-15 meters in height.
                  </li>
                </ul>
              </li>
              <li>
                In this category a special focus is given to the landscape
                approach on AGROFORESTRY. This category is in alignment with the
                recommendations of the VOICE Network.
              </li>
            </ul>
          </div>
          <br />
          <div>
            <b>
              <u>Dynamic AGROFORESTRY Systems (4):</u>
            </b>
            <ul>
              <li>
                These systems are characterized by a very high density of trees
                per hectare. There is an abundance of different tree species,
                high biodiversity, plant communities with different life cycles
                that serve different purposes (carbon sequestration, income
                sources, food etc.). They grow in different stories (strata)
                without competition. There are at least 3 different stories
                (strata), regenerative practices are used, and food security and
                income sources outside of cocoa are guaranteed. This system
                mimics the natural habitat of cacao in a highly developed
                cultivation system.
              </li>
            </ul>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Hazardous Pesticides",
      t: "Hazardous Pesticides",
      d: (
        <Fragment>
          <div>
            Hazardous pesticides include as minimum requirement all substances
            which:
            <ol type="1" start={1} style={{ marginLeft: "1.5rem" }}>
              <li>
                are listed as <b>persistent organic pollutants (POPs)</b> in the
                Stockholm Convention within the Annex III of the Rotterdam
                Convention and / or the Montreal Protocol,
              </li>
              <li>are classified by WHO as 1A or 1B, </li>
              <li>
                are listed in the <b>Dirty Dozen</b> of PAN, or
              </li>
              <li>
                are identified by UN-GHS as substances with{" "}
                <b>chronic toxicity</b>.
              </li>
            </ol>
            In addition, specifically for cocoa cultivation, they include
            pesticides that are not permitted for use in goods for export to EU
            countries.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Household",
      t: "Household",
      d: "Please refer to the definition of “Farming Household”",
    },
    {
      i: "Multi-purpose trees",
      t: "Multi-purpose trees",
      d: "Tree species that are included on cocoa farms primarily to provide economical and / or ecological benefits to the farm. This may include tree crops such as fruit, oil palm, medicinal, fodder and / or timber / shade trees for later harvest.",
    },
    {
      i: "Native tree species",
      t: "Native tree species",
      d: (
        <Fragment>
          <div>
            A tree species occurring within its natural range (past or present)
            and dispersal potential (i.e., within the range it occupies
            naturally or could occupy without direct or indirect introduction or
            care by humans). (FAO:{" "}
            <a
              href="http://www.fao.org/3/I8661EN/i8661en.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "14px" }}
            >
              http://www.fao.org/3/I8661EN/i8661en.pdf
            </a>
            ).
          </div>
        </Fragment>
      ),
    },
    {
      i: "Net household income",
      t: "Net household income",
      d: (
        <Fragment>
          <div>
            • The amount of money that a household earns, or gains, each year
            after costs, taxes, and transfers. It represents the money available
            to a household for spending on goods or services and savings. This
            is currently calculated via: Production * producer price (including
            farmer sustainability premiums where relevant) – costs + non-cocoa
            income (such as non-agricultural income, income from rent, and
            remittances) - associated costs. <br /> <br />
            <u>Points of attention:</u>
            <br />
            <i>Costs to include:</i>
            <ul style={{ marginLeft: "25px" }}>
              <li>
                <i>
                  amortization of infrastructure and interests paid on loans,
                </i>
              </li>
              <li>
                <i>
                  share of revenues paid to (or part of the produce shared with)
                  landowners.
                </i>
              </li>
            </ul>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Off-farm",
      t: "Off-farm",
      d: "Areas that are not currently under cultivation (e.g., defined buffer areas between different cocoa (or other) farms, defined sloped areas, uncultivated watershed areas, fallow land). This does not include newly established cocoa agroforestry.",
    },
    {
      i: "Payments for Ecosystem / Environmental Services (PES)",
      t: "Payments for Ecosystem / Environmental Services (PES)",
      d: "Compensating individuals or communities for the adoption of targeted behaviours that increase the capacity of present ecosystems to provide beneficial services to local population (such as water filtration, erosion reduction, social value etc.). The activities must align with at least one of three core intervention areas: conservation, restoration, and agroforestry.  Interventions should also eliminate threats to or enhance the provision of ecosystem services including climate change mitigation, soil restoration, biodiversity, and watershed services. Compensation should offset and ideally exceed the opportunity and transactional costs of all participating individuals for adopting the targeted behaviour.",
    },
    {
      i: "Plot",
      t: "Plot",
      d: "Plot is the basic geospatial unit of land use. In cocoa, a farmer may possess (or otherwise operate) one or more plots. A farmer’s combined total number of plots is a “farm”, whether the plots are geographically contiguous or not. In Ghana, a plot may also be called a farm, thus a farm may be made up of smaller “farms”. In this situation extra attention must be paid by members to ensure enumerators measure and count farms mapped according to the correct definition of farm.",
    },
    {
      i: "Pre-financing",
      t: "Pre-financing",
      d: "An arrangement to have production activities paid in advance by a third party and to be repaid at a later date by a farmer based on agreement between the parties involved.",
    },
    {
      i: "Program",
      t: "Program",
      d: "Please refer to the definition of “Project”.",
    },
    {
      i: "Restoration of forests",
      t: "Restoration of forests",
      d: (
        <Fragment>
          <div>
            Replanting and / or regenerating trees across a defined landscape
            that incorporates native (preferably) and non-native tree species to
            restore the multiple ecological benefits of forests (with focus on
            achieving natural forest). (Source: Accountability Framework). Best
            practice is to develop a forest restoration plan based on an initial
            assessment (baseline) and action plan shared with the (local or
            national) government.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Risk assessment",
      t: "Risk assessment",
      d: "A systematic process of evaluating potential risk in a company’s current or future operations, supply chains, and investments. In the context of the Accountability Framework, this term refers to the assessment of risk of non-compliance with the company commitments or applicable law related to the Accountability Framework scope, as well as adverse impacts to internationally recognized human rights. This is different from the use of the term in a general business context, where it refers to assessment of financial risks and the drivers of such risk (e.g., legal risk, credit risk, reputation risk, and others). Risk of adverse social and environmental impacts, including non-compliance with company commitments, can be an important element of broader business risk.",
    },
    {
      i: "Sustainability commitments of companies",
      t: "Sustainability commitments of companies",
      d: (
        <Fragment>
          <div>
            A public statement by a company that specifies the actions that it
            intends to take or the goals, criteria, or targets that it intends
            to meet with regard to its management of or performance on
            environmental, social, and / or governance topics.
            <ul style={{ marginLeft: "25px" }}>
              <li>
                Commitments may also be titled or referred to as policies,
                pledges, or other terms.
              </li>
              <li>
                Commitments may be company-wide (e.g., a company-wide forest
                policy) or specific to certain commodities, regions, or business
                units. They may be topic-specific, or they may address multiple
                environmental, social, and/or governance topics.
              </li>
              <li>
                Commitments, as defined here, are distinct from the operational
                policies or procedures (e.g., sourcing codes, supplier
                requirements, manuals, and standard operation procedures) by
                which companies may operationalize their commitments or
                sustainability initiatives. Commitments are generally broader,
                more normative or aspirational, and take a multi-year view of
                company performance, whereas operational policies or procedures
                tend to focus on specific implementation details, parameters, or
                requirements.
              </li>
            </ul>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Project / Programme",
      t: "Project / Programme",
      d: (
        <Fragment>
          <div>
            A cocoa sustainability project / programme is defined as a
            programme, project or initiative targeting (aspects of)
            sustainability in cocoa production, processing and / or supply
            chains.
            <br />
            Under the label “sustainability project / programme”, the reporting
            system allows a member to report on any sustainability “programme,
            project or initiative”. Members with larger sustainability
            programmes can choose between: (a) reporting aggregated data on a
            large programme, with several intervention areas; or (b) reporting
            separately for underlying (for example country-specific) projects.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Traceability",
      t: "Traceability",
      d: (
        <Fragment>
          <div>
            Cocoa traceability may be defined as the ability to:
            <ol type="a" style={{ marginLeft: "1.5rem" }}>
              <li>ensure transparency on the origin of cocoa;</li>
              <li>
                link sustainability (and other) characteristics (measured at
                farm/community/area/… level) to the (produced and processed
                batches of) cocoa (including batches of cocoa-containing end
                products), and
              </li>
              <li>
                document and trace steps in (dis)aggregating, transporting and
                processing (batches of) cocoa and cocoa-containing products,
                while transferring information on cocoa origin and
                sustainability characteristics, all along the value chain,
                including feedback loops.
              </li>
            </ol>
            <i>
              Traceability can be an effective tool to foster sustainability in
              the cocoa sector and to allow companies to meet sustainability
              requirements.
            </i>
            <br />
            <br />
            <i>
              IDH, GISCO, C-lever.org, (2021) . <br />
              <a
                href="https://www.idhsustainabletrade.com/uploaded/2021/04/Cocoa-Traceability-Study_Highres.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "14px" }}
              >
                https://www.idhsustainabletrade.com/uploaded/2021/04/Cocoa-Traceability-Study_Highres.pdf
              </a>
            </i>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Verification",
      t: "Verification",
      d: (
        <Fragment>
          <div>
            Assessment and validation of compliance, performance, and / or
            actions relative to a stated commitment, standard, or target.
            Verification processes typically utilize monitoring data but may
            also include other sources of information and analysis.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Village Savings and Loans Association (VSLA)",
      t: "Village Savings and Loans Association (VSLA)",
      d: "Village Savings and Loans Association (VSLA) is a type of Accumulating Savings and Credit Association formed as a group of people who choose to work together and pool their savings. The money can then be borrowed with modest interest by members, over an agreed period. At the end of a predetermined term, the overall fund (which is made up of the savings and the interest payments) is paid out to the group members based on their percent of contribution to the savings pool. At that point members can decide whether to start a new cycle or whether to disband. Crucial activities that benefit VSLA members include (i) creating and maintaining a group dynamic to grow self-esteem and self-confidence, (ii) providing access to basic financial services (savings and credit), (iii) unlocking entrepreneurial potential by learning to identify, create, and manage an income generating activity.",
    },
    {
      i: "Women’s empowerment",
      t: "Women’s empowerment",
      d: (
        <Fragment>
          <div>
            The combined effect of changes in a women’s own consciousness,
            knowledge, skills and abilities (agency) and in the power relations
            and structures (norms, customs, institutions, policies, laws, etc.)
            that shape her access to rights and resources, choices and
            opportunities, and ultimately wellbeing. (WCF Gender Integration
            guidance note, Annex on Gender Principles and definitions).
          </div>
        </Fragment>
      ),
    },
    {
      i: "Yield (cocoa yield)",
      t: "Yield (cocoa yield)",
      d: "Total cocoa weight (typically expressed in kilograms) produced per unit area (typically expressed in hectare), in a given year.",
    },
    {
      i: "Youth",
      t: "Youth",
      d: (
        <Fragment>
          <div>
            Youth is best understood as a period of transition from the
            dependence of childhood to adulthood’s independence. That’s why, as
            a category, youth is more fluid than other fixed age-groups. Yet,
            age is the easiest way to define this group, particularly in
            relation to education and employment, because ‘youth’ is often
            referred to a person between the ages of leaving compulsory
            education, and finding their first job. <br />
            <br />
            <i>
              For Ghana & Côte d’Ivoire: Youth are persons between the ages of
              15 and 35 years. For other countries: Youth are persons between
              the ages of 15 and 24 years.
            </i>
            <br />
            <br />
            <i>
              United Nations Department of Economic and Social Affairs (2013).
              <br />
              <a
                href="https://www.un.org/esa/socdev/documents/youth/fact-sheets/youth-definition.pdf "
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "14px" }}
              >
                https://www.un.org/esa/socdev/documents/youth/fact-sheets/youth-definition.pdf
              </a>
            </i>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Youth empowerment",
      t: "Youth empowerment",
      d: (
        <Fragment>
          <div>
            Youth empowerment is defined as a process where youth are enabled to
            enjoy secure and sustainable livelihoods, fulfil their potential and
            decide on their future. With an emphasis on decent youth employment,
            skills development, business opportunities and participation in
            decision making. <br />
            (Fairtrade (n.d.))
          </div>
        </Fragment>
      ),
    },
    {
      i: "Methodology to calculate number of households in the indirect supply chain",
      t: "Methodology to calculate number of households in the indirect supply chain",
      d: (
        <Fragment>
          <div>
            Please calculate the number of households in your indirect supply
            chain by dividing the total volumes you sourced through the indirect
            supply chain by the average annual yield of farmers in your indirect
            supply chain. Please find the average annual yield for the largest
            cocoa producing countries in the table below. <br />
            <br />
            Example: 20.000 MT-BE are sourced from Ghana and 2.000 MT-BE are
            sourced from Ecuador
            <ul>
              <li>Ghana: (20.000/1104.6)*1.000 = 18.106 farmers</li>
              <li>Ecuador: (2.000/3840.18)*1.000 = 520 farmers</li>
              <li>Total: 18.626 farmers </li>
            </ul>
            <br />
            <Table
              columns={numberOfHHIndirectSupplyChainColumns}
              dataSource={numberOfHHIndirectSupplyChainDataSource}
              // tableLayout="auto"
              size="middle"
              pagination={false}
              bordered
            />
          </div>
        </Fragment>
      ),
    },
    {
      i: "Certified or cocoa covered through a company programm",
      t: "Certified or cocoa covered through a company programm",
      d: "Cocoa produced in compliance with the requirements of certification standards (such as Fairtrade or Rainforest Alliance) or company schemes on sustainable cocoa.",
    },
    {
      i: "Cocoa grower",
      t: "Cocoa grower",
      d: "A cocoa grower is an individual (member of a cocoa farming household or other individual) structurally involved in farming work related to the production of cocoa beans.",
    },
    {
      i: "Covered",
      t: "Covered",
      d: (
        <Fragment>
          <div>
            A household can be considered “covered” by a CLMRS or comparable
            system, if an assessment of child labour risk has been conducted at
            household level, EITHER:
            <ul>
              <li>
                through an in-person monitoring visit, including child
                interview, OR
              </li>
              <li>
                through assessment using a household-level risk model (ie. a
                systematic analysis of reliable data about the household to
                predict child labour, using a transparent, documented method of
                assessment)
              </li>
            </ul>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Data transfer from ICI",
      t: "Data transfer from ICI",
      d: (
        <Fragment>
          <div>
            The ISCOs and ICI conduct a data transfer on eight harmonized
            questions, ensuring that members that are part of both the ISCOs and
            ICI can choose to only report on child labour questions once.
            Members will be able to indicate in the ICI tool as well as the ISCO
            tool that they consent to their data being shared with the ISCOs.
            They will no longer need to report in the ISCO tool. If members do
            not want to share their data with the ISCOs via ICI, they will be
            required to report on child labour questions through the ISCO tool.
          </div>
          <img
            src="/images/definition-content/data-transfer-cli.jpg"
            width="90%"
          />
        </Fragment>
      ),
    },
    {
      i: "Evidence of impact of system to prevent and address child labour",
      t: "Evidence of impact of system to prevent and address child labour",
      d: "Evidence could include a robust impact study, where impact is demonstrated in this context, compared to a control group (e.g. through a randomized control trial (RCT), difference-in-difference analysis, regression discontinuity design etc.",
    },
    {
      i: "Identified in child labour",
      t: "Identified in child labour",
      d: "This means a child has been identified in a situation of child labour, in accordance with ILO conventions and national legislation (e.g. hazardous activity frameworks). The respective indicator counts the number of children currently covered ever identified in child labour. Even if the child has since stopped working, they should be counted here.",
    },
    {
      i: "Manufactured",
      t: "Manufactured",
      d: (
        <Fragment>
          <div>
            As ‘manufactured’ we typically understand, from semi-finished
            product or chocolate to chocolate end products, including moulding,
            filling & enrobing. The relevant HS- Codes for manufactured are:
            <ul>
              <li>
                <b>18063100</b> Chocolate and other preparations containing
                cocoa, in blocks, slabs or bars of &lt;= 2 kg, filled;
              </li>
              <li>
                <b>180632</b> Chocolate and other preparations containing cocoa,
                in blocks, slabs or bars of &lt;= 2 kg (excl. filled);
              </li>
              <li>
                <b>180690</b> Chocolate and other preparations containing cocoa,
                in containers or immediate packings of &lt;= 2 kg (excl. in
                blocks, slabs or bars and cocoa powder)
              </li>
            </ul>
          </div>
          <div>
            Please note: If you manufacture end products in a factory from beans
            and not semi-finished products, please report your volumes only once
            here and not in the next question. You can choose “n/a” in the tool,
            if this question is not relevant for your company/organization.
          </div>
          <div>
            Conversion to MT-BE, of cocoa sourced in different forms, is to be
            done using the ICCO conversion factors, being: 1,33 for cocoa butter
            (1804); 1,25 for cocoa paste/liquor (18031); and 1,18 for cocoa
            powder and cake (1805, 18032).
          </div>
        </Fragment>
      ),
    },
    {
      i: "Methodology # of farmers for which the LI gap is measured",
      t: "Methodology # of farmers for which the LI gap is measured",
      d: "The ISCOs do not require members to measure the income gap of every individual farmer in their supply chain, but for a representative sample of their supply chain. Members will be able to specify how they define a representative sample in a follow-up question.",
    },
    {
      i: "Methodology to calculate MT-BE",
      t: "Methodology to calculate MT-BE",
      d: "Conversion to MT-BE, of cocoa sourced in different forms, is to be done using the ICCO conversion factors, being: 1,33 for cocoa butter (1804); 1,25 for cocoa paste/liquor (18031); and 1,18 for cocoa powder and cake (1805, 18032). With respect to the MT-BE of cocoa contained in consumer end products supplied to the national market in Europe, reporting is to be done by the consumer brands. For their own labels (brands), retailers are expected to report in the same way as the consumer brands. Of course, where required, these brands/retailers will rely on the corresponding information obtained from their suppliers.",
    },
    {
      i: "Multiple-purpose trees",
      t: "Multiple-purpose trees",
      d: "Tree species that are included on cocoa farms primarily to provide economical and / or ecological benefits to the farm. This may include tree crops such as fruit, oil palm, medicinal, fodder and / or timber / shade trees for later harvest.",
    },
    {
      i: "Processed",
      t: "Processed",
      d: (
        <Fragment>
          <div>
            All semi-finished products (including mass, powder, butter and
            couverture) coming out of your national factories in whatever shape
            the cocoa entered. The relevant HS-Codes would be:
            <ul>
              <li>
                <b>1801</b> Cocoa beans, whole or broken, raw or roasted;
              </li>
              <li>
                <b>1802</b> Cocoa shells, husks, skins and other cocoa waste;
              </li>
              <li>
                <b>1803</b> Cocoa paste, whether or not defatted;
              </li>
              <li>
                <b>1804</b> Cocoa butter, fat and oil;
              </li>
              <li>
                <b>1805</b> Cocoa powder, not containing added sugar or other
                sweetening matter;
              </li>
              <li>
                <b>180610</b> Cocoa powder, sweetened;
              </li>
              <li>
                <b>180620</b> Chocolate and other food preparations containing
                cocoa, in blocks, slabs or bars weighing &gt; 2 kg or in liquid,
                paste, powder, granular or other bulk form, in containers or
                immediate packings of a content &gt; 2 kg (excl. cocoa powder).
              </li>
            </ul>
          </div>
          <div>
            Please note: You can choose “n/a” in the tool, if this question is
            not relevant for your company/organization. Conversion to MT-BE, of
            cocoa sourced in different forms, is to be done using the ICCO
            conversion factors, being: 1,33 for cocoa butter (1804); 1,25 for
            cocoa paste/liquor (18031); and 1,18 for cocoa powder and cake
            (1805, 18032).
          </div>
        </Fragment>
      ),
    },
    {
      i: "System to prevent and address child labour",
      t: "System to prevent and address child labour",
      d: 'A "system" is a set of interventions to assess risks, prevent and address child labour. An example of another type of system is a comprehensive community development approach.',
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
            18032). In Bezug auf die MT-BE von Kakao, der in
            Endverbraucherprodukten enthalten ist, die an den nationalen Markt
            in Europa geliefert werden, ist die Berichterstattung durch die
            Verbrauchermarken vorzunehmen. Von den Einzelhändlern wird erwartet,
            dass sie für ihre eigenen Labels (Marken) auf die gleiche Weise
            berichten wie die Verbrauchermarken. Natürlich stützen sich diese
            Marken/Einzelhändler bei Bedarf auf die entsprechenden
            Informationen, die sie von ihren Lieferanten erhalten.
          </div>
        </Fragment>
      ),
    },
    {
      i: "MT-BE",
      t: "MT-BE",
      d: "Metrische Tonnen an Bohnenäquivalenten: Siehe Definition „Bohnenäquivalent“",
    },
    {
      i: "Child Labour",
      t: "Kinderarbeit",
      d: (
        <Fragment>
          <div>
            Der Begriff „Kinderarbeit“ wird oft definiert als Arbeit, die Kinder
            ihrer Kindheit, ihres Potentials und ihrer Würde beraubt, und die
            schädlich für deren körperliche und geistige Entwicklung ist. Er
            bezieht sich auf Arbeit, die:
            <ul style={{ marginLeft: "25px" }}>
              <li>
                geistig, körperlich, sozial und / oder moralisch gefährlich oder
                schädlich für Kinder ist; und / oder
              </li>
              <li>
                deren Schulbildung dahingehend beeinträchtigt, dass: sie Kindern
                die Möglichkeit nimmt, zur Schule zu gehen; sie Kinder zwingt,
                frühzeitig von der Schule abzugehen; oder sie Kindern
                abverlangt, die Schulteilnahme mit der zeitintensiven und
                körperlich anstrengenden Arbeit zu vereinbaren.
              </li>
            </ul>
            Kinderarbeit kann viele Ausprägungen annehmen, dabei ist eine
            Priorität, die schlimmsten Formen der Kinderarbeit – definiert in
            Artikel 3 des ILO Übereinkommens Nr. 182 – unverzüglich zu
            beseitigen:
            <ul style={{ marginLeft: "25px" }}>
              <li>
                alle Formen der Sklaverei oder alle sklavereiähnlichen
                Praktiken, wie den Verkauf von Kindern und den Kinderhandel,
                Schuldknechtschaft und Leibeigenschaft sowie Zwangs- oder
                Pflichtarbeit, einschließlich der Zwangs- oder
                Pflichtrekrutierung von Kindern für den Einsatz in bewaffneten
                Konflikten;
              </li>
              <li>
                das Heranziehen, Vermitteln oder Anbieten eines Kindes zur
                Prostitution, zur Herstellung von Pornographie oder zu
                pornographischen Darbietungen;
              </li>
              <li>
                das Heranziehen, Vermitteln oder Anbieten eines Kindes zu
                unerlaubten Tätigkeiten, insbesondere zur Gewinnung von und zum
                Handel mit Drogen, wie diese in den einschlägigen
                internationalen Übereinkünften definiert sind;
              </li>
              <li>
                Arbeit, die ihrer Natur nach oder aufgrund der Umstände, unter
                denen sie verrichtet wird, voraussichtlich für die Gesundheit,
                die Sicherheit oder die Sittlichkeit von Kindern schädlich ist.
              </li>
            </ul>
            <i>
              Die Definition basiert auf den ILO Übereinkommen Nr. 138 über das
              Mindestalter für die Zulassung zur Beschäftigung und Nr. 182 über
              die schlimmsten Formen von Kinderarbeit.
              <br />
              Zitiert aus: ILO (1999). Übereinkommen 182: Übereinkommen über das
              Verbot und unverzügliche Maßnahmen zur Beseitigung der schlimmsten
              Formen der Kinderarbeit (ilo.org).
            </i>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Child Labour Monitoring and Remediation Systems (CLMRS)",
      t: "Child Labour Monitoring and Remediation Systems (CLMRS)",
      d: (
        <Fragment>
          <div>
            Systeme zur Überwachung und Abhilfe von Kinderarbeit (CLMRS) sind
            ein Mittel, um Kindern, die von Kinderarbeit betroffen oder bedroht
            sind, sowie ihren Familien und Gemeinschaften gezielt bei der
            Prävention, Milderung und Abhilfe zu helfen. Um die Definition eines
            Systems zur Überwachung und Abhilfe von Kinderarbeit (CLMRS) oder
            eines gleichwertigen Systems zu erfüllen, muss das System die
            folgenden Kernaktivitäten umsetzen:
            <ol style={{ marginLeft: "25px" }} start={1}>
              <li>
                Stärkung des Bewusstseins bei Bäuerinnen und Bauern, Kindern und
                der breiteren Bevölkerung bezüglich der Gefahren von
                Kinderarbeit
              </li>
              <li>
                Identifizierung von Kindern in Kinderarbeit durch aktives und
                regelmäßiges und wiederholtes Monitoring mithilfe
                standardisierter Methoden zur Datenerfassung.
              </li>
              <li>
                Unterstützung von Kindern in Kinderarbeit (Beendigung) und von
                gefährdeten Kindern (Prävention) und Dokumentation dieser
                Unterstützung.
              </li>
              <li>
                Follow-ups mit identifizierten Kindern in Kinderarbeit und
                regelmäßiges Überprüfen ihres Status, bis sie sich nicht mehr in
                Kinderarbeit befinden und zur Schule gehen.
              </li>
            </ol>
          </div>
        </Fragment>
      ),
    },
    {
      i: "CLMRS",
      t: "CLMRS",
      d: "Siehe Definition „Child Labour Monitoring and Remediation Systems (CLMRS)”",
    },
    {
      i: "Cocoa traceability levels",
      t: "Kakaorückverfolgbarkeitsstufen",
      d: (
        <Fragment>
          <div>
            Die Kakaorückverfolgbarkeitsstufe bezieht sich auf das Maß an
            Informationen über die Herkunft des Kakaos, die in der Anfangsphase
            des Beschaffungsprozesses dokumentiert werden, wobei diese
            Informationen auch in späteren Phasen der Wertschöpfungskette
            verfügbar bleiben. Die Rückverfolgbarkeitsstufe erfordert keine
            physische Trennung des Kakaos, sondern kann auch im Rahmen eines
            Massenbilanzsystems angewendet werden. Es wird zwischen folgenden
            Rückverfolgbarkeitsstufen unterschieden:
            <ol style={{ marginLeft: "25px" }} start={1}>
              <li>
                <b>Herkunft unbekannt</b> - ausgedrückt in % des insgesamt
                gelieferten/verarbeiteten Volumens.
              </li>
              <li>
                <b>Land bekannt</b> - ausgedrückt in % des insgesamt
                gelieferten/verarbeiteten Volumens.
              </li>
              <li>
                <b>Genossenschaft bekannt</b> - ausgedrückt in % des insgesamt
                gelieferten/verarbeiteten Volumens.
              </li>
              <li value={4}>
                a.{" "}
                <b>
                  Farm bekannt und mit mindestens einer Koordinierung pro Farm
                  (Farmkartierung)
                </b>{" "}
                - ausgedrückt in % des insgesamt gelieferten/verarbeiteten
                Volumens.
              </li>
              <li value={4}>
                b.{" "}
                <b>
                  Farm bekannt, mit Punktkoordinaten und/oder Polygonen für
                  Parzellen &lt;4 ha sowie Polygon-Grenzen für Parzellen &gt;4
                  ha
                </b>{" "}
                - ausgedrückt in % des insgesamt gelieferten/verarbeiteten
                Volumens.
              </li>
            </ol>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Community Action Plan (CAP)",
      t: "Gemeindeaktionsplan",
      d: "Ein Plan, der auf der Grundlage einer Bedarfsanalyse einer Gemeinde (Community Needs Assessment, CNA) von oder in Zusammenarbeit mit der Gemeinde entwickelt wird. Der Plan sollte Maßnahmen enthalten, die wichtige Entwicklungsbedürfnisse der Gemeinde adressieren. Er sollte von der Gemeinde unter Repräsentanz aller gesellschaftlicher Gruppen umgesetzt werden – gegebenenfalls mit kurzfristiger externer technischer und finanzieller Unterstützung. Der Plan sollte den Einsatz partizipatorischer Maßnahmen umfassen, um die Fähigkeit der Gemeindemitglieder zu stärken und sie zu ermächtigen, Verhaltensanpassungen entsprechend der identifizierten Probleme, Bedürfnisse und Potentiale der Gemeinde vorzunehmen.",
    },
    {
      i: "Community Needs Assessment (CNA)",
      t: "Bedarfsanalyse eine Gemeinde",
      d: "Eine unter Beteiligung einer Gemeinde durchgeführte Bewertung, um die vorrangigen kurz- und langfristigen Entwicklungsbedürfnisse dieser Gemeinde zu ermitteln. Diese sollte Untersuchungen zum besseren Verständnis der Gemeindedynamiken umfassen, welche für die Entwicklung eines wirksamen und nachhaltigen Gemeindeaktionsplans essentiell sind.",
    },
    {
      i: "Conventional traceability of cocoa",
      t: "Rückverfolgbarkeit von konventionellem Kakao",
      d: "Konventioneller Kakao (Rückverfolgbarkeits-Kategorie 0) ist beschaffter Kakao, der nicht den Rückverfolgbarkeitsanforderungen von „Mass Balance“, „Segregiert“ oder „Identity preserved“ entspricht – siehe die entsprechenden Definitionen.",
    },
    {
      i: "Coverage (for CLMRS and similar systems)",
      t: "Abdeckung (für CLMRS und vergleichbare Systeme)",
      d: (
        <Fragment>
          <div>
            Ein Haushalt kann als von einem System zur Überwachung und Abhilfe
            von Kinderarbeit (CLMRS) oder einem vergleichbaren System abgedeckt
            („covered“) betrachtet werden, wenn auf Haushaltsebene eine
            Bewertung des Kinderarbeitsrisikos durchgeführt wurde, ENTWEDER:
            <ol type="i" style={{ marginLeft: "25px" }}>
              <li>
                Durch einen persönlichen Kontrollbesuch, einschließlich einer
                Befragung des Kindes, ODER
              </li>
              <li>
                • Durch eine Bewertung anhand eines Risikomodells auf
                Haushaltsebene (d.h. eine systematische Analyse zuverlässiger
                Daten über den Haushalt zur Vorhersage von Kinderarbeit unter
                Verwendung einer transparenten, dokumentierten
                Bewertungsmethode)
              </li>
            </ol>
            Ein Kind kann als von einem CLMRS „abgedeckt“ betrachtet werden,
            wenn es aus einem Haushalt stammt, welcher die obigen Definitionen
            erfüllt.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Deforestation",
      t: "Entwaldung",
      d: (
        <Fragment>
          <div>
            Die Umwandlung von Wald in eine andere Landnutzung, unabhängig
            davon, ob sie durch den Menschen verursacht wurde oder nicht.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Deforestation-free cocoa",
      t: "Entwaldungsfreier Kakao",
      d: (
        <Fragment>
          <div>
            Polygone von landwirtschaftlichen Parzellen (&gt; 4 ha) und der
            landwirtschaftlichen Parzellen (&lt; 4 ha) als nicht in einem
            geschützten Wald liegend und als nicht entwaldetes Land seit dem
            31.12.2018 für GISCO und 31.12. 2020 für die anderen ISCOs.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Degraded lands",
      t: "Degradierte Böden",
      d: (
        <Fragment>
          <div>
            Bodendegradierung bezeichnet die Verschlechterung oder den Verlust
            der produktiven Kapazität des Bodens für die heutige und zukünftige
            landwirtschaftliche Nutzung.
            <br />
            <i>(aus The Global Environmental Facility)</i>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Farmer or farmer-based organisations",
      t: "Erzeugerorganisation",
      d: "Erzeugerorganisationen (farmer-based organisations, FBO) sind: Kooperativen; andere professionelle Zusammenschlüsse von Bäuerinnen und Bauern; oder sonstige Organisationsformen, die als formelle oder informelle Institutionen mit der Rolle fungieren, Kakao aufzukaufen und zu verkaufen, Unterstützung / technische Dienstleistungen für Mitglieder bereitzustellen und Einfluss auf den Kakaoanbau oder das Zusammenleben in der Gemeinde zu nehmen. Ein Mitglied kann ein Individuum sein, das einen Mitgliedsbeitrag bezahlt, das formell von der Erzeugerorganisation als Mitglied anerkannt ist und / oder das eine formelle Position innerhalb der Organisation innehat. ",
    },
    {
      i: "Farming household",
      t: "Bäuerlicher Haushalt",
      d: (
        <Fragment>
          Der Begriff „bäuerlicher Haushalt“ bezeichnet eine kleinbäuerliche
          kakaoanbauende Familie. Ein bäuerlicher Haushalt kann einen oder
          mehrere landwirtschaftliche Betriebe umfassen, die von verschiedenen
          Mitgliedern des bäuerlichen Haushalts (Bäuerinnen und Bauern) geführt
          werden.
        </Fragment>
      ),
    },
    {
      i: "Reached (farming households reached)",
      t: "erreicht („erreichte bäuerliche Haushalte“)",
      d: 'Der Begriff "erreicht" (im Sinne von "erreichte bäuerliche Haushalte") ist kontextabhängig, er könnte beispielsweise "involviert in" oder "profitierend von" bedeuten. Entsprechende Datenerhebungen sollten die Variable "Anzahl der erreichten bäuerlichen Haushalte" in Beziehung setzen zu einer Aktivität oder einer Wirkung/einem Ergebnis des Nachhaltigkeitsprojekts; Diese Verknüpfung kontextualisiert die Implikationen/Vorteile für die „erreichten“ bäuerlichen Haushalte.',
    },
    {
      i: "Farming land",
      t: "Anbaufläche",
      d: "Die Anbaufläche bezeichnet alle Flächen, die einem bäuerlichen Haushalt zur landwirtschaftlichen Nutzung zur Verfügung stehen, unabhängig von den Eigentums-, Anbau-, Pacht- oder Nutzungsrechtsverhältnissen. Die Größe der Anbaufläche sollte in Hektar (Ha) angegeben werden.",
    },
    {
      i: "Farming land under cocoa cultivation",
      t: "Kakaoanbaufläche",
      d: (
        <Fragment>
          <div>
            Die Kakaoanbaufläche entspricht dem Teil der Anbaufläche auf dem
            Kakao als Hauptkultur* angebaut wird, unabhängig von der Art des
            Kakaoanbaus.
            <br /> (*wenn in besonderen Fällen eine erhebliche Menge Kakao auf
            einer landwirtschaftlichen Fläche erzeugt wird, dieser aber nur eine
            „Nebenkultur“ darstellt, können diese Flächen ebenfalls als
            Kakaoanbaufläche gewertet werden.)
          </div>
        </Fragment>
      ),
    },
    {
      i: "Direct supply",
      t: "Direkte Lieferkette",
      d: "Damit Kakao als „durch eine direkte Lieferkette bezogener Kakao“ kategorisiert werden kann, muss eine stabile Partnerschaft bzw. Zusammenarbeit zwischen dem Unternehmen und den Kakaoproduzentinnen und -produzenten bestehen, in welcher die individuellen kakaoanabauenden Haushalte bekannt und registriert sind. Die Partnerschaft kann Themen wie Preise, Kakaoqualität, gute landwirtschaftliche Praktiken, soziale, menschenrechtliche und ökologische Fragen, Zertifizierungsanforderungen, etc. adressieren. Eine solche Partnerschaft bzw. Zusammenarbeit zwischen dem kakaobeschaffenden ISCO-Unternehmen und den Erzeugerinnen und Erzeugern kann auch über deren Kooperative / Erzeugerorganisation und / oder andere in die direkte Lieferkette eingebettete Akteure organisiert sein.",
    },
    {
      i: "Mass balance",
      t: "Mengenausgleich",
      d: (
        <Fragment>
          <div>
            Der Mengenausgleich (mass balance) überwacht administrativ den
            Handel von konformem Kakao (= zertifizierter oder unabhängig
            überprüfter Kakao) entlang der gesamten Lieferkette. Das
            Mengenausgleichssystem erfordert eine transparente Dokumentation und
            Nachweise über Herkunft und Mengen des vom Erstkäufer aufgekauften
            konformen Kakaos. Das Mengenausgleichssystem ermöglicht das
            Vermischen von konformem mit nicht-konformem Kakao in den
            nachgelagerten Stufen der Wertschöpfungskette (z.B. bei Transport
            oder Verarbeitung). Die Akteure der Kakaolieferkette können eine
            bestimmte Menge an konformem Kakao oder ein äquivalentes Volumen
            konformer kakaohaltiger Produkte verkaufen, sofern die tatsächlichen
            Mengen verkaufter konformer Produkte über die gesamte Lieferkette
            nachvollziehbar sind und auditiert werden und deren
            Kakaobohnenäquivalente die Mengen des im Ursprung eingekauften
            konformen Kakaos nicht übersteigen.{" "}
            <i>(Basierend auf Definitionen von ISO-CEN und Fairtrade)</i>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Segregated",
      t: "Segregiert",
      d: (
        <Fragment>
          <div>
            Segregierter („segregated“) Kakao bezeichnet zertifizierten oder
            unabhängig überprüften Kakao, der die Segregationsanforderungen
            erfüllt. Wie das Mengenausgleichssystem erfordert die Segregation
            eine transparente Dokumentation und Nachweise über Herkunft und
            Menge des vom Erstkäufer gekauften konformen Kakaos. Konformer Kakao
            wird von nicht-konformem Kakao (= nicht zertifizierter oder
            unabhängig überprüfter Kakao) getrennt gehalten – auch während des
            Transports, der Lagerung, der Verarbeitung von Kakao und der
            Herstellung kakaohaltiger Produkte. Jedoch ist das Vermischen von
            Kakao unterschiedlicher Herkünfte möglich, sofern der gesamte zu
            vermischende Kakao als konformer Kakao gilt. Die Akteure in der
            Kakaolieferkette müssen nachweisen, dass sie die erforderlichen
            Maßnahmen ergriffen haben, um zu vermeiden, dass konformer Kakao mit
            nicht-konformem Kakao vermischt wird.{" "}
            <i>
              (Basierend auf Definitionen von ISO-CEN und Rainforest Alliance)
            </i>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Identity preserved",
      t: "Identity preserved",
      d: '"Identity preserved" ist die höchste Rückverfolgbarkeitskategorie. Es erfolgt keine Vermischung des Kakaos, weder mit nicht-konformem Kakao (= nicht zertifiziert oder unabhängig überprüft) noch mit Kakao anderer Herkünfte. Wenn sich der Begriff "single Origin" auf ein Kakaoanbaugebiet (das verschiedene Kooperativen zusammenfasst) und nicht auf eine einzige Kooperative bezieht, dann kann konformer Kakao aus diesem breiteren Ursprung vermischt werden. Das "identity preserved" System erfüllt also alle Anforderungen für "segregierten Kakao", erlaubt aber darüber hinaus nicht das Vermischen von Kakao aus verschiedenen Ursprüngen.',
    },
    {
      i: "Indirect supply",
      t: "Indirekte Lieferkette",
      d: "Damit Kakao als „Kakao aus einer indirekten Lieferkette“ eingestuft wird, darf es keinen oder nur minimalen Kontakt, keine Partnerschaft und keine Zusammenarbeit zwischen dem kakaoverarbeitenden Unternehmen und den Kakaoproduzenten geben. Der Kakao wird in der Regel über (mehrere) Zwischenhändler bezogen, die die einzelnen Bauern oder landwirtschaftlichen Familien, die den Kakao produziert haben, nicht offenlegen.",
    },
    {
      i: "Integrated Pest Management (IPM)",
      t: "Integrierte Schädlingsbekämpfung (IPM)",
      d: (
        <Fragment>
          <div>
            Integrierte Schädlingsbekämpfung (Integrated Pest Management, IPM)
            umfasst die sorgfältige Prüfung aller verfügbaren
            Schädlingsbekämpfungsmethoden und die anschließende Auswahl und
            Anwendung von Ansätzen, welche der Entwicklung von
            Schädlingspopulationen entgegenwirken und zugleich den Einsatz von
            Pestiziden und andere Interventionen auf ein wirtschaftlich
            vertretbares Maß beschränken und die Risiken für die menschliche
            Gesundheit und die Umwelt minimieren. IPM strebt gesunde
            Anbaukulturen bei möglichst geringer Beeinträchtigung der
            landwirtschaftlichen Ökosysteme an und fördert natürliche Ansätze
            der Schädlingsbekämpfung. (FAO:
            <a
              href="http://www.fao.org/agriculture/crops/thematic-sitemap/theme/pests/ipm/en/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "14px" }}
            >
              http://www.fao.org/agriculture/crops/thematic-sitemap/theme/pests/ipm/en/
            </a>
            )
          </div>
        </Fragment>
      ),
    },
    {
      i: "Living Income",
      t: "Existenzsicherndes Einkommen",
      d: (
        <Fragment>
          <div>
            Ein existenzsicherndes Einkommen (Living Income) entspricht dem
            jährlichen Nettoeinkommen, das ein Haushalt in einer bestimmten
            Region benötigt, um allen Haushaltsmitgliedern einen angemessenen
            Lebensstandard zu ermöglichen. Ein angemessener Lebensstandard
            umfasst: Nahrung, Wasser, Unterkunft, Bildung,
            Gesundheitsversorgung, Verkehr, Kleidung und weitere
            Grundbedürfnisse einschließlich einer Rücklage für unerwartete
            Ereignisse. <i>(Living Income Community of Practice)</i>
            <br />
            <i>
              Alle genutzten Benchmarks (Richtwerte) für existenzsichernde
              Einkommen sollten auf Publikationen von oder für die Living Income
              Community of Practice beruhen.
            </i>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Living income benchmarks",
      t: "Benchmarks/Richtwerte für existenzsichernde Einkommen",
      d: (
        <Fragment>
          <div>
            Auf der{" "}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "14px" }}
            >
              ALIGN-Webseite
            </a>{" "}
            finden Sie einen Überblick über Benchmarks und Studien zum
            existenzsichernden Einkommen. Wenn für die Region, in der Sie
            arbeiten, keine Benchmark verfügbar ist, konsultieren Sie bitte die
            <a
              href="https://c69aa8ac-6965-42b2-abb7-0f0b86c23d2e.filesusr.com/ugd/0c5ab3_4a0b8a8f12d74abc86b2260984a967ae.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "14px" }}
            >
              Living Income Community of Practice
            </a>
            , die Anleitungen für die Verwendung von Alternativen enthalten,
            wenn keine Benchmark verfügbar ist.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Living Income Reference Price",
      t: "Referenzpreis für existenzsicherndes Einkommen",
      d: (
        <Fragment>
          <div>
            Ein Referenzpreis für existenzsicherndes Einkommen gibt den Preis
            an, den ein durchschnittlicher Bauernhaushalt mit einer rentablen
            Betriebsgröße und einem angemessenen Produktivitätsniveau benötigt,
            um ein existenzsicherndes Einkommen aus dem Verkauf seiner Ernte zu
            erzielen. Es kann mit der Formel berechnet werden:
            <br />
            <code>
              Referenzpreis für existenzsicherndes Einkommen (LIRP) = Kosten für
              menschenwürdiges Leben + Kosten für nachhaltige Produktion /
              lebensfähige Landfläche * nachhaltige Erträge
            </code>
            <br />
            Für Fairtrade lautet beispielsweise der LIRP (2022):
            <ul style={{ marginLeft: "25px" }}>
              <li>Ghana: 16,50 GHC / 2,12 USD pro kg</li>
              <li>Côte d‘Ivoire: 1.602 CFA / 2.39 USD pro kg</li>
            </ul>
            Für andere Ursprünge geben Sie bitte im Kommentarfeld an, welches
            LIRP Sie verwenden.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Living Income strategy",
      t: "Strategie für existenzsichernde Einkommen",
      d: (
        <Fragment>
          <div>
            Eine Strategie für existenzsichernde Einkommen (Living Income
            Strategy) ist eine Strategie mit dem expliziten Ziel,
            Kakaobauernhaushalten ein existenzsicherndes Einkommen zu
            ermöglichen. Eine Strategie für existenzsicherndes Einkommen
            beinhaltet eine Monitoring- und Lernkomponente.
            <br />
            Eine Strategie für existenzsichernde Einkommen verwendet eine
            Kombination oder einen „Smart-Mix“ von Strategien, die auf mehrere
            einkommensfördernde Faktoren abzielen. Faktoren, die das Einkommens
            erhöhen können* werden strategisch bewertet, um die Einkommenslücken
            zwischen tatsächlichen und existenzsichernden Einkommen zu
            schließen**.
            <br />
            Die Interventionen für jeden dieser Faktoren hängen von der
            aktuellen Situation ab und davon, inwieweit diese Faktoren die
            Einkommenslücke verschiedenen Typen von Bauern und Bäuerinnen
            adressieren. Einkommensfördernde Strategien gehen über Veränderungen
            in bäuerlichen Systemen und Haushalten hinaus und schließen
            Verbesserungen in unternehmerischen Beschaffungspraktiken ein. Sie
            reichen von der Erbringung von Dienstleistungen für eine verbesserte
            Produktion und Verarbeitung über die Marken- und Verbraucherbindung
            bis hin zur Verbesserung des „enabling environments“.
            <br />
            Eine Strategie für existenzsichernde Einkommen geht über generelle
            einkommensschaffende Aktivitäten (IGAs) hinaus, die nicht explizit
            das Ziel haben, die Einkommenslücken zwischen tatsächlichen und
            existenzsichernden Einkommen zu schließen.
          </div>
        </Fragment>
      ),
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
            <li>Bio - Bio Suisse</li>
            <li>Naturland</li>
            <li>Unternehmensprogramme (z.B. Cocoa Life, zu spezifizieren)</li>
          </ul>
        </Fragment>
      ),
    },
    {
      i: "Premiums granted to the farmer and / or coopertaive",
      t: "Prämien",
      d: "Eine an einen Landwirt und/oder eine Genossenschaft gewährte Prämie ist ein zusätzlicher Geldbetrag, der über den regulären Marktpreis hinaus an die Produzenten oder Produzentenorganisationen gezahlt wird. Prämien werden hier ausschließlich als markt- oder volumenbezogene Zahlungen verstanden und schließen daher keine Zahlungen wie „Zahlungen für Umweltleistungen“, bedingte oder unbedingte Geldtransfers usw. ein. Bitte beachten Sie, dass LIRP-Zahlungen in einer separaten Frage behandelt werden.",
    },
    {
      i: "Agroforestry System for Cocoa Production (Description)",
      t: "Agroforstsystem für die Kakaoproduktion (Beschreibung)",
      d: (
        <Fragment>
          <ul type="bullet" style={{ margin: 0, padding: 0 }}>
            <li>
              Der Begriff Agroforstwirtschaft bezieht sich auf Anbauflächen, auf
              denen Kakaobäume bewusst mit vorzugsweise einheimischen und sich
              für AGROFORSTSYSTEME eignende Nicht-Kakaobaumarten kombiniert
              werden. Dabei handelt es sich in der Regel um andere Nutzpflanzen,
              wodurch ökologische, ökonomische, soziale und soziokulturelle
              Vorteile entstehen können. Agroforstansätze sollten lokal
              angepasst sein und das ökologische, ökonomische, soziale und
              kulturelle Umfeld berücksichtigen.
            </li>
            <li>
              AGROFORSTSYSTEME ermöglichen eine ökologisch und wirtschaftlich
              nachhaltige Kakaoproduktion, welche die biologische Artenvielfalt
              erhält, Erosion verringert, das Klima und die natürlichen
              Ressourcen schützt und den Anbau diversifiziert - zum Vorteil von
              Bäuerinnen und Bauern. AGROFORSTSYSTEME zielen darauf ab, das
              Einkommen von Bäuerinnen und Bauern zu diversifizieren,
              gegebenenfalls Produktionskosten zu reduzieren, die
              wirtschaftliche und klimawandelbezogene Resilienz von
              kakaoanbauenden Betrieben zu erhöhen und die
              Nahrungsmittelversorgung im ländlichen Raum zu verbessern.
            </li>
            <li>
              Kakaobäuerinnen und -bauern spielen eine entscheidende Rolle für
              die Akzeptanz, Verbreitung und Nachhaltigkeit von
              AGROFORSTSYSTEMEN. Ein gemeinschaftlicher Prozess, in dem die
              Bedürfnisse, Präferenzen und Erfahrungen der Bäuerinnen und Bauern
              berücksichtigt werden und sie aktiv unterstützt werden (über
              technische Unterstützung, Entwicklungspläne, Kapazitätsaufbau),
              ist essenziell, um bestehende Anbausysteme nachhaltiger
              auszugestalten.
            </li>
            <li>
              Bananenpflanzen/Kochbananen zählen nicht als Bäume/Baumarten.*
              <br />
              <small>
                *Lediglich botanisch klassifizierte Bäume werden als „Bäume“
                gewertet, andere Pflanzen wie Stauden (so auch
                (Koch-)Bananenstauden), zählen daher nicht.
              </small>
            </li>
          </ul>
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
            <ul>
              <li>
                Mindestens 16 Nicht-Kakaobäume pro Hektar mit mindestens 3
                verschiedenen – vorzugsweise einheimischen – Baumarten
              </li>
              <li>
                Diese Einstiegsstufe für AGROFORSTSYSTEME entspricht den
                Agroforstindikatoren von CFI und WCF.
              </li>
            </ul>
          </div>
          <br />
          <div>
            <b>
              <u>Basiskategorie für AGROFORSTSYSTEME (2):</u>
            </b>
            <ul>
              <li>
                Mindestens 40 % Überschirmungsgrad und mindestens 5 verschiedene
                einheimische Baumarten. Diese Kategorie für AGROFORSTSYSTEME
                entspricht den Rainforest Alliance Referenzparametern für
                Beschattung und biologischer Artenvielfalt.
              </li>
            </ul>
          </div>
          <br />
          <div>
            <b>
              <u>Fortgeschrittene Kategorie für AGROFORSTSYSTEME (3):</u>
            </b>
            <ul>
              <li>Mindestens 40% Überschirmungsgrad,</li>
              <ul type="circle">
                <li>
                  mindestens 12 verschiedene einheimische Baumarten (nicht:
                  Pionierbaumarten),
                </li>
                <li>Mindestens 15% einheimische Vegetationsbedeckung,</li>
                <li>
                  2 Stockwerke / Baumstrata und eine Mindesthöhe der
                  Schattenbäume von 12-15 Metern.
                </li>
              </ul>
              <li>
                In dieser Kategorie wird ein besonderer Fokus auf den
                landschaftlichen Ansatz der Agroforstwirtschaft gelegt. Sie
                orientiert sich an den Empfehlungen des VOICE-Netzwerks.
              </li>
            </ul>
          </div>
          <br />
          <div>
            <b>
              <u>Dynamische AGROFORSTSYSTEME (4):</u>
            </b>
            <ul>
              <li>
                Diese Systeme zeichnen sich durch eine sehr hohe Baumdichte pro
                Hektar aus. Das Anbausystem beherbergt viele verschiedene Baum-
                und Pflanzenarten mit unterschiedlichen Lebenszyklen, die
                verschiedene Zwecke erfüllen (Kohlenstoffbindung, alternative
                Einkommensquellen, Nahrung etc.). Sie gedeihen in verschiedenen
                Schichten ohne Konkurrenz zueinander. Es gibt mindestens 3
                verschiedene Stockwerke/Strata, es werden regenerative
                landwirtschaftliche Praktiken angewendet und die
                Nahrungsmittelsicherheit sowie alternative Einkommensquellen
                außerhalb des Kakaos sind gesichert. Dieses System ahmt den
                natürlichen Lebensraum des Kakaos in einem hoch entwickelten
                Anbausystem nach.
              </li>
            </ul>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Hazardous Pesticides",
      t: "Gefährliche Pestizide",
      d: (
        <Fragment>
          <div>
            Gefährliche Pestizide umfassen mindestens alle Substanzen, die
            <ol type="1" start={1} style={{ marginLeft: "1.5rem" }}>
              <li>
                als <b>Persistent Organic Pollutants (POPs)</b> in der Stockholm
                Konvention, im Annex III der Rotterdam Konvention und / oder im
                Montreal Protokoll geführt sind,
              </li>
              <li>von der WHO als 1A oder 1B klassifiziert sind,</li>
              <li>
                auf der Liste der <b>Dirty Dozen</b> des PAN geführt sind, oder
                die
              </li>
              <li>
                im UN-GHS als Substanzen mit <b>chronischer Toxizität</b>{" "}
                ausgewiesen sind.
              </li>
            </ol>
            Zudem umfassen sie - spezifisch für den Kakaoanbau - jene Pestizide,
            deren Verwendung für Güter, die für den Export in EU-Staaten
            bestimmt sind, nicht zugelassen sind.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Household",
      t: "Haushalt",
      d: "Siehe Definition „Bäuerlicher Haushalt“",
    },
    {
      i: "Multi-purpose trees",
      t: "Mehrzweckbäume",
      d: "Baumarten, die zusätzlich auf Kakaoanbauflächen gepflanzt werden, vor allem um ökonomischen oder ökologischen Mehrwert zu generieren. Dabei kann es sich um Obstbäume, Ölpalmen, Heilpflanzen, Futtermittelpflanzen und / oder Schattenbäume für die spätere Holzernte handeln.",
    },
    {
      i: "Native tree species",
      t: "Einheimische Baumarten",
      d: (
        <Fragment>
          <div>
            Eine Baumart, die innerhalb ihres natürlichen Verbreitungsgebiets
            (früher oder heute) oder Verbreitungspotentials vorkommt (d.h.
            innerhalb des Gebiets, in dem sie natürlicherweise vorkommt oder
            ohne direkte oder indirekte Einwirkung oder Pflege durch den
            Menschen vorkommen könnte). (FAO:{" "}
            <a
              href="http://www.fao.org/3/I8661EN/i8661en.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "14px" }}
            >
              http://www.fao.org/3/I8661EN/i8661en.pdf
            </a>
            ).
          </div>
        </Fragment>
      ),
    },
    {
      i: "Net household income",
      t: "Haushaltsnettoeinkommen-Haushaltseinkommen",
      d: (
        <Fragment>
          <div>
            Der Geldbetrag, den ein Haushalt jedes Jahr nach Abzügen wie Kosten
            und Steuern verdient. Es stellt den Betrag dar, der einem Haushalt
            zur Verfügung steht, um Waren oder Dienstleistungen zu erwerben oder
            um zu sparen. Die Berechnung erfolgt über: Produktion * Ab-Hof-Preis
            (einschließlich Nachhaltigkeitsprämien) – Produktionskosten +
            Einkommen aus alternativen Quellen (z. B. nicht-landwirtschaftliches
            Einkommen, Mieteinnahmen etc.) abzüglich der damit verbundenen
            Kosten.
            <i>Zu den Kosten können gehören:</i>
            <ul style={{ marginLeft: "25px" }}>
              <li>
                <i>
                  Amortisierung von Infrastruktur und Zinszahlungen für Darlehen
                </i>
              </li>
              <li>
                <i>
                  Anteil der Einnahmen (oder Anteil der Erträge), der an die
                  Landbesitzer entrichtet werden muss.
                </i>
              </li>
            </ul>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Off-farm",
      t: "Off-farm",
      d: "Flächen, die derzeit nicht bewirtschaftet werden (z.B. festgelegte Pufferzonen zwischen verschiedenen Kakao- (oder anderen landwirtschaftlichen) Betrieben, nicht bewirtschaftete Wassereinzugsgebiete, Brachland, etc.). Beinhaltet nicht: Neu errichtete Kakao-Agroforstsysteme.",
    },
    {
      i: "Payments for Ecosystem / Environmental Services (PES)",
      t: "Zahlungen für Ökosystem- / Umweltleistungen",
      d: "Bezeichnet die Kompensation von Individuen oder Gemeinschaften für die Übernahme wünschenswerter Verhaltensweisen, welche die Fähigkeit von lokalen Ökosysteme erhöhen, der Bevölkerung wertvolle Dienste zu leisten (wie der Filterung von Wasser, der Verringerung von Erosion, Schaffung von sozialem Mehrwert, etc.). Die Aktivitäten müssen mindestens einem der drei Hauptinterventionsbereiche zuordenbar sein: Dem Erhalt oder der Wiederherstellung von Ökosystemen oder der Agroforstwirtschaft. Die Maßnahmen sollen Gefährdungen für Ökosystemleistungen beseitigen oder deren Wirksamkeit steigern und könnten Interventionen zum Klimaschutz, zur Sanierung degradierter Böden oder zur Förderung der Artenvielfalt umfassen. Die finanzielle Kompensation sollte die Opportunitäts- und Transaktionskosten aller Beteiligten für die Verhaltensanpassung abdecken und idealerweise übersteigen.",
    },
    {
      i: "Plot",
      t: "Parzelle",
      d: 'Eine Parzelle ist die übliche räumliche Einheit der Landnutzung. Im Kakaoanbau kann eine Bäuerin oder ein Bauer eine oder mehrere Parzellen besitzen und bewirtschaften. Die Gesamtzahl der Parzellen einer Bäuerin / eines Bauern ist ein landwirtschaftlicher Betrieb, unabhängig davon, ob die Parzellen aneinandergrenzen oder nicht. In Ghana kann eine Parzelle bereits als "Betrieb" angesehen werden, so dass ein Betrieb aus mehreren kleineren "Betrieben" bestehen kann. In solchen Fällen muss darauf geachtet werden, dass dies bei Erhebungen beispielsweise zur „Anzahl an kartierten Betrieben“ berücksichtigt wird.',
    },
    {
      i: "Pre-financing",
      t: "Vorfinanzierung",
      d: "Eine Vereinbarung, bei der die landwirtschaftliche Produktion von einem Dritten im Voraus bezahlt wird und der Betrag zu einem späteren Zeitpunkt von der Bäuerin oder dem Bauern zu den vereinbarten Konditionen zurückgezahlt wird.",
    },
    {
      i: "Program",
      t: "Programm",
      d: "Siehe Definition “Projekt”",
    },
    {
      i: "Restoration of forests",
      t: "Wiederaufforstung",
      d: (
        <Fragment>
          <div>
            Bezeichnet das Neupflanzen und/oder die Regenerierung von
            bestehenden Bäumen in einem bestimmten Gebiet unter Einbezug
            (vorzugsweise) einheimischer, aber auch nicht-einheimischer
            Baumarten, um die vielfältigen ökologischen Vorteile von Wäldern
            wiederherzustellen (mit dem Ziel, die Entstehung natürlicher Walder
            zu fördern). (Quelle: Accountability Framework). „Best practice“ ist
            die Entwicklung eines Plans zur Wiederherstellung des Waldes auf der
            Grundlage einer ersten Bewertung (Ausgangssituation) und eines mit
            der (lokalen oder nationalen) Regierung abgestimmten Aktionsplans.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Risk assessment",
      t: "Risikoanalyse",
      d: "Ein systematischer Prozess zur Bewertung potenzieller Risiken in Verbindung mit gegenwärtigen oder zukünftigen Aktivitäten, Lieferketten und Investitionen eines Unternehmens. Im Kontext des Accountability Framework bezieht sich dieser Begriff auf eine Bewertung des Risikos der Nichteinhaltung von Unternehmensselbstverpflichtungen oder geltendem Recht sowie auf potenzielle Verletzungen international anerkannter Menschenrechte. Dies unterscheidet sich von der Verwendung des Begriffs in einem allgemeinen geschäftlichen Kontext, wo er sich vorrangig auf die Bewertung finanzieller Risiken und deren Treiber (z.B. Rechtsrisiken, Kreditrisiken, Reputationsrisiken, etc.) bezieht. Das Risiko negativer sozialer und ökologischer Auswirkungen, einschließlich der Nichteinhaltung von Unternehmensselbstverpflichtungen, kann jedoch ein wichtiges Element des allgemeinen Geschäftsrisikos darstellen.",
    },
    {
      i: "Sustainability commitments of companies",
      t: "Nachhaltigkeitsselbstverpflichtungen von Unternehmen",
      d: (
        <Fragment>
          <div>
            Das öffentliche Statement eines Unternehmens, das die beabsichtigten
            Maßnahmen, Ziele, Kriterien oder Vorgaben spezifiziert, die es mit
            Blick auf das Management oder seine Performance in Bezug auf
            Umwelt-, Sozial- und / oder Governance-Themen zu implementieren
            beabsichtigt.
            <ul style={{ marginLeft: "25px" }}>
              <li>
                Unternehmensselbstverpflichtungen können unternehmensweit
                (beispielsweise eine unternehmensweite Forstpolitik) oder
                spezifisch für bestimmte Rohstoffe, Regionen oder
                Geschäftsbereiche sein. Sie können themenspezifisch sein oder
                sich auf mehrere Umwelt-, Sozial- und / oder Governance-Themen
                beziehen.
              </li>
              <li>
                Selbstverpflichtungen, wie sie hier definiert sind,
                unterscheiden sich von operativen Richtlinien oder Verfahren
                (z.B. Beschaffungsrichtlinien, Lieferantenanforderungen,
                Handbücher und Standardarbeitsverfahren), mit denen Unternehmen
                ihre Selbstverpflichtungen operationalisieren können.
                Selbstverpflichtungen sind in der Regel breiter angelegt, häufig
                normativer und ambitionierter Natur, und nehmen einen
                mehrjährigen Blick auf die Unternehmensperformance ein, während
                sich betriebliche Richtlinien oder Verfahren tendenziell auf
                spezifische Implementierungsdetails, -parameter oder
                -anforderungen beziehen.
              </li>
            </ul>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Project / Programme",
      t: "Projekt / Programm",
      d: (
        <Fragment>
          <div>
            Ein Kakao-Nachhaltigkeitsprojekt/-programm ist definiert als ein
            Programm, ein Projekt oder eine Initiative, welches/welche die
            Nachhaltigkeit (oder einzelne Aspekte der Nachhaltigkeit) in der
            Kakaoproduktion, -verarbeitung und/oder entlang der Lieferketten zu
            fördern versucht.
            <br />
            Unter der Bezeichnung &quot;Nachhaltigkeitsprojekt/-programm&quot;
            kann ein Mitglied über jedes &quot;Programm, Projekt oder
            Initiative&quot; im Bereich der Nachhaltigkeit berichten. Mitglieder
            mit größeren Nachhaltigkeitsprogrammen können wählen zwischen: (a)
            aggregierter Berichterstattung zu einem großen Programm mit mehreren
            Interventionsbereichen; oder (b) separater Berichterstattung für
            zugrunde liegende (z.B. länderspezifische) Projekte.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Traceability",
      t: "Rückverfolgbarkeit",
      d: (
        <Fragment>
          <div>
            Rückverfolgbarkeit von Kakao kann definiert werden als die
            Fähigkeit:
            <ol type="a" style={{ marginLeft: "1.5rem" }}>
              <li>
                Transparenz über die Herkunft des Kakaos gewährleisten zu
                können;
              </li>
              <li>
                Nachhaltigkeitsbezogene (und andere) Merkmale (auf Ebene des
                Betriebs / der Gemeinde / der Region) mit dem produzierten und
                verarbeiteten Kakao in Verbindung bringen zu können;
              </li>
              <li>
                Alle Schritte vom Aufkauf und der Aggregation der Bohnen über
                den Transport und die Verarbeitung des Kakaos bis hin zur
                Herstellung kakaohaltiger Produkte dokumentieren und
                rückverfolgen zu können, wobei Informationen über Herkunft und
                Nachhaltigkeitsmerkmale des Kakaos entlang der gesamten
                Wertschöpfungskette enthalten bleiben.
              </li>
            </ol>
            <i>
              Rückverfolgbarkeit ist eine wichtige Voraussetzung, um die
              Nachhaltigkeit im Kakaosektor zu fördern und Unternehmen zu
              ermöglichen, ihre Nachhaltigkeitspflichten zu erfüllen.
            </i>
            <br />
            <br />
            <i>
              IDH, GISCO, C-lever.org, (2021) . <br />
              <a
                href="https://www.idhsustainabletrade.com/uploaded/2021/04/Cocoa-Traceability-Study_Highres.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "14px" }}
              >
                https://www.idhsustainabletrade.com/uploaded/2021/04/Cocoa-Traceability-Study_Highres.pdf
              </a>
            </i>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Verification",
      t: "Verifizierung",
      d: (
        <Fragment>
          <div>
            Bewertung und Nachweis der Einhaltung, der Performance und / oder
            der Umsetzung von Maßnahmen in Verbindung mit einer veröffentlichten
            Selbstverpflichtung, einem Standard oder einem erklärten Ziel.
            Verifizierungsprozesse nutzen in der Regel Monitoring-Daten, können
            aber auch andere Informationsquellen nutzen.
          </div>
        </Fragment>
      ),
    },
    {
      i: "Village Savings and Loans Association (VSLA)",
      t: "Village Savings and Loans Association (VSLA)",
      d: "Eine Village Savings and Loans Association (VSLA) ist eine Art Spar- und Kreditvereinigung, die von einer Gruppe von Menschen gegründet wird, die zusammenarbeiten und ihre Ersparnisse zusammenlegen wollen. Das Geld kann dann von Mitgliedern mit moderaten Zinsen über einen vereinbarten Zeitraum geliehen werden. Am Ende einer vorher festgelegten Laufzeit wird der gesamte Fonds (zusammengesetzt aus den Ersparnissen und den angefallenen Zinszahlungen) an die Gruppenmitglieder auf der Grundlage ihres prozentualen Beitrags zum ursprünglichen Fonds ausgezahlt. Zu diesem Zeitpunkt können die Mitglieder entscheiden, ob sie einen neuen Zyklus beginnen oder die Aktivität einstellen wollen. Zu den wichtigsten Aktivitäten, die den VSLA-Mitgliedern zugutekommen, gehören (i) die Schaffung einer Gruppendynamik, die Selbstwirksamkeit und Selbstvertrauen stärkt, (ii) der Zugang zu grundlegenden Finanzdienstleistungen (Sparmöglichkeiten und Kredite), (iii) die Freisetzung unternehmerischen Potenzials, indem eine einkommensschaffende Aktivität identifiziert, gestaltet und umgesetzt wird.",
    },
    {
      i: "Women’s empowerment",
      t: "Empowerment von Frauen",
      d: (
        <Fragment>
          <div>
            Die kombinierte Wirkung von Veränderungen im Bewusstsein, Wissen,
            den Fähigkeiten und Kompetenzen einer Frau (<b>Eigenmacht</b>) sowie
            in den Machtverhältnissen und Strukturen (Normen, Bräuche,
            Institutionen, Richtlinien, Gesetze usw.), die ihren Zugang zu
            Rechten und Ressourcen, ihre Entscheidungsfreiheit und Chancen sowie
            letztlich ihr Wohlergehen beeinflussen. (WCF-Leitfaden zur
            Geschlechterintegration, Anhang zu Gender-Prinzipien und
            Definitionen).
          </div>
        </Fragment>
      ),
    },
    {
      i: "Yield (cocoa yield)",
      t: "Ertrag (Kakaoertrag)",
      d: "Gesamtgewicht des Kakaos (typischerweise angegeben in Kilogramm), der je Flächeneinheit (typischerweise in Hektar) in einem bestimmten Jahr erzeugt wird.",
    },
    {
      i: "Youth",
      t: "Jugend",
      d: (
        <Fragment>
          <div>
            Jugend lässt sich am besten beschreiben als eine Phase des Übergangs
            von der Abhängigkeit der Kindheit hin zur Unabhängigkeit des
            Erwachsenseins. Die Kategorie Jugend ist daher fluider als andere,
            festere Altersgruppen. Dennoch ist das Alter der einfachste Weg, um
            „Jugend“ zu definieren, insbesondere in Bezug auf Bildung und
            Beschäftigung; denn in der Regel werden Personen zwischen dem Ende
            der Schulpflicht und der Aufnahme der ersten Beschäftigung als
            „Jugendliche“ bezeichnet. <br />
            <br />
            <i>
              Für Ghana und Côte d&apos;Ivoire gilt: Jugendliche sind Personen
              im Alter zwischen 15 und 35 Jahren. Für andere Länder gilt:
              Jugendliche sind Personen im Alter zwischen 15 und 24 Jahren.
            </i>
            <br />
            <br />
            <i>
              United Nations Department of Economic and Social Affairs (2013).
              <br />
              <a
                href="https://www.un.org/esa/socdev/documents/youth/fact-sheets/youth-definition.pdf "
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "14px" }}
              >
                https://www.un.org/esa/socdev/documents/youth/fact-sheets/youth-definition.pdf
              </a>
            </i>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Youth empowerment",
      t: "Empowerment der Jugend",
      d: (
        <Fragment>
          <div>
            Empowerment der Jugend bezeichnet einen Prozess, in welchem
            Jugendliche in die Lage versetzt werden, ein sicheres Lebensumfeld
            genießen zu können, ihr Potenzial auszuschöpfen und selbst über ihre
            Zukunft entscheiden zu können. Schwerpunkte liegen dabei auf der
            Bereitstellung von angemessenen Beschäftigungsmöglichkeiten für
            Jugendliche, der Förderung ihrer Fähigkeiten und Kenntnisse, und der
            Beteiligung von Jugendlichen an Entscheidungsprozessen. <br />
            (Fairtrade (o.D.))
          </div>
        </Fragment>
      ),
    },
    {
      i: "Methodology to calculate number of households in the indirect supply chain",
      t: "Methodik zur Berechnung der Anzahl der Haushalte in der indirekten Lieferkette",
      d: (
        <Fragment>
          <div>
            Bitte berechnen Sie die Anzahl der Haushalte in der indirekten
            Lieferkette, indem Sie die Gesamtmenge, die Sie über die indirekte
            Lieferkette bezogen haben, durch den durchschnittlichen Jahresertrag
            der Bauern in Ihrer indirekten Lieferkette teilen. In der
            nachstehenden Tabelle finden Sie die durchschnittlichen
            Jahreserträge für einige die größten Kakaoanbauländer. Bitte
            beachten Sie: Die folgenden Zahlen beziehen sich auf das Jahr 2022.
            Die ISCOs werden sich bemühen, aktualisierte Zahlen in das
            Monitoring-Tool aufzunehmen.
            <br />
            <br />
            Beispiel: Aus Ghana werden 20.000 MT-BE bezogen, aus Ecuador 2.000
            MT-BE.
            <ul>
              <li>
                Ghana: (20.000/1.104,6)*1.000 = 18.106 Bäuerinnen und Bauern
              </li>
              <li>
                Ecuador: (2.000/3.840,18)*1.000 = 520 Bäuerinnen und Bauern
              </li>
              <li>Gesamt: 18.626 Bauern</li>
            </ul>
            Bitte beachten Sie: Die folgenden Zahlen beziehen sich auf das Jahr
            2022. Die ISCOs werden sich bemühen, aktualisierte Zahlen in das
            Monitoring-Tool aufzunehmen.
            <br />
            <Table
              columns={numberOfHHIndirectSupplyChainColumns}
              dataSource={numberOfHHIndirectSupplyChainDataSource}
              // tableLayout="auto"
              size="middle"
              bordered
              pagination={false}
            />
          </div>
        </Fragment>
      ),
    },
    {
      i: "Certified or cocoa covered through a company programm",
      t: "Zertifizierter oder durch Unternehmensprogramme unabhängig geprüfter Kakao",
      d: "Kakao, der gemäß den Anforderungen von Zertifizierungsstandards (wie Fairtrade oder Rainforest Alliance) oder durch Unternehmensprogramme für nachhaltigen Kakao produziert wurde.",
    },
    {
      i: "Cocoa grower",
      t: "Kakaobauer/-bäuerin",
      d: "Ein Kakaobauer oder eine Kakaobäuerin ist eine Person (Mitglied eines Kakaobauernhaushalts oder eine andere Einzelperson), die strukturell in landwirtschaftliche Arbeiten im Zusammenhang mit der Produktion von Kakaobohnen eingebunden ist.",
    },
    {
      i: "Covered",
      t: "Abgedeckt („covered“)",
      d: (
        <Fragment>
          <div>
            Ein Haushalt kann als von einem System zur Überwachung und Abhilfe
            von Kinderarbeit (CLMRS) oder einem vergleichbaren System abgedeckt
            („covered“) betrachtet werden, wenn auf Haushaltsebene eine
            Bewertung des Kinderarbeitsrisikos durchgeführt wurde, ENTWEDER:
            <ul>
              <li>
                Durch einen persönlichen Kontrollbesuch, einschließlich einer
                Befragung des Kindes, ODER
              </li>
              <li>
                Durch eine Bewertung anhand eines Risikomodells auf
                Haushaltsebene (d.h. eine systematische Analyse zuverlässiger
                Daten über den Haushalt zur Vorhersage von Kinderarbeit unter
                Verwendung einer transparenten, dokumentierten
                Bewertungsmethode)
              </li>
            </ul>
          </div>
        </Fragment>
      ),
    },
    {
      i: "Data transfer from ICI",
      t: "Datenübermittlung von ICI",
      d: (
        <Fragment>
          <div>
            Die ISCOs und ICI führen einen Datentransfer zu acht harmonisierten
            Fragen durch, um sicherzustellen, dass Mitglieder, die sowohl Teil
            der ISCOs als auch von ICI sind, sich dafür entscheiden können, zu
            Kinderarbeit nur einmal Bericht zu erstatten. Die Mitglieder müssen
            sowohl im ICI-Tool als auch im ISCO-Tool angeben, dass sie damit
            einverstanden sind, dass ihre Daten an die ISCOs weitergegeben
            werden. Sie müssen dann nicht mehr im ISCO-Tool berichten. Wenn
            Mitglieder ihre Daten nicht über ICI an die ISCOs weitergeben
            möchten, müssen sie zu den acht Datenpunkten erneut über das
            ISCO-Tool berichten.
          </div>
          <img
            src="/images/definition-content/data-transfer-cli.jpg"
            width="90%"
          />
        </Fragment>
      ),
    },
    {
      i: "Evidence of impact of system to prevent and address child labour",
      t: "Nachweis der Wirkung des Systems zur Verhinderung und Bekämpfung von Kinderarbeit",
      d: "Als Nachweis könnte bspw. eine belastbare Wirkungsstudie angegeben werden, in der die Wirkung in diesem Zusammenhang im Vergleich zu einer Kontrollgruppe nachgewiesen wird (z. B. durch eine randomisierte Kontrollstudie (randomized control trial; RCT), eine Differenzanalyse (difference-in-difference analysis), ein Regressionsdiskontinuitätsdesign (regression discontinuity design usw.)",
    },
    {
      i: "Identified in child labour",
      t: "Identifiziert in Kinderarbeit",
      d: "Dies bedeutet, dass ein Kind in Übereinstimmung mit den ILO-Übereinkommen und nationalen Rechtsvorschriften (z. B. Hazardous Child Labour Activity Frameworks) in einer Situation von Kinderarbeit identifiziert wurde. Der entsprechende Indikator zählt die Anzahl der derzeit erfassten Kinder, die jemals in Kinderarbeit identifiziert wurden. Auch wenn das Kind inzwischen nicht mehr arbeitet, sollte es hier gezählt werden.",
    },
    {
      i: "Manufactured",
      t: "Manufactured (hergestellt)",
      d: (
        <Fragment>
          <div>
            Als „hergestellt“ verstehen wir typischerweise die Verarbeitung von
            Halbfertigprodukten oder Schokolade bis hin zu Endprodukten,
            einschließlich Formen, Füllen und Überziehen. Die relevanten
            HS-Codes für hergestellte Produkte sind:
            <ul>
              <li>
                <b>18063100</b> Schokolade und andere kakaohaltige
                Zubereitungen, in Tafeln, Riegeln oder Blöcken von ≤ 2 kg,
                gefüllt.
              </li>
              <li>
                <b>180632</b> Schokolade und andere kakaohaltige Zubereitungen,
                in Tafeln, Riegeln oder Blöcken von ≤ 2 kg (ohne Füllung).
              </li>
              <li>
                <b>180690</b> Schokolade und andere kakaohaltige Zubereitungen,
                in Behältnissen oder unmittelbaren Verpackungen von ≤ 2 kg
                (ausgenommen Tafeln, Riegel, Blöcke und Kakaopulver).
              </li>
            </ul>
          </div>
          <div>
            Hinweis: Falls Sie Endprodukte in einer Fabrik direkt aus Bohnen und
            nicht aus Halbfertigprodukten herstellen, melden Sie Ihre Volumina
            bitte nur hier und nicht in der nächsten Frage. Falls diese Frage
            für Ihr Unternehmen/Ihre Organisation nicht relevant ist, können Sie
            im Tool „n/a“ auswählen.
          </div>
          <div>
            Umrechnung in MT-BE (Metric Tons Bean Equivalent) für Kakao in
            unterschiedlichen Verarbeitungsformen erfolgt nach den
            ICCO-Umrechnungsfaktoren: 1,33 für Kakaobutter (HS-Code 1804), 1,25
            für Kakaomasse/-likör (HS-Code 18031), 1,18 für Kakaopulver und
            Kakaokuchen (HS-Codes 1805, 18032)
          </div>
        </Fragment>
      ),
    },
    {
      i: "Methodology # of farmers for which the LI gap is measured",
      t: "Methodik für Bauern, bei denen die Einkommenslücken zwischen tatsächlichen und existenzsichernden Einkommen (Living Income Gap) gemessen wird",
      d: "Die ISCOs verlangen von den Mitgliedern nicht, die Einkommenslücken zwischen tatsächlichen und existenzsichernden Einkommenjedes einzelnen Bauern in ihrer Lieferkette zu messen, sondern für eine repräsentative Stichprobe ihrer Lieferkette. Die Mitglieder können in einer Folgefrage angeben, wie sie eine repräsentative Stichprobe definieren.",
    },
    {
      i: "Methodology to calculate MT-BE",
      t: "Methodik zur Berechnung von MT-BE",
      d: "Die Umrechnung von Kakao aus verschiedenen Formen in MT-BE erfolgt unter Verwendung der ICCO-Umrechnungsfaktoren: 1,33 für Kakaobutter (1804); 1,25 für Kakaomasse/-likör (18031); und 1,18 für Kakaopulver und Kuchen (1805, 18032). In Bezug auf die MT-BE von Kakao, der in Verbraucherendprodukten enthalten ist, die auf den nationalen Markt in Europa geliefert werden, ist die Berichterstattung durch die Verbrauchermarken zu übernehmen. Von den Einzelhändlern wird erwartet, dass sie für ihre eigenen Labels (Marken) auf die gleiche Weise berichten wie die Verbrauchermarken. Selbstverständlich verlassen sich diese Marken/Händler bei Bedarf auf die entsprechenden Informationen, die sie von ihren Lieferanten erhalten.",
    },
    {
      i: "Multiple-purpose trees",
      t: "Mehrzweckbäume",
      d: "Baumarten, die zusätzlich auf Kakaoanbauflächen gepflanzt werden, vor allem um ökonomischen oder ökologischen Mehrwert zu generieren. Dabei kann es sich um Obstbäume, Ölpalmen, Heilpflanzen, Futtermittelpflanzen und/oder Schattenbäume für die spätere Holzernte handeln.",
    },
    {
      i: "Processed",
      t: "Processed (verarbeitet)",
      d: (
        <Fragment>
          <div>
            Alle Halbfertigprodukte (einschließlich Kakaomasse, -pulver, -butter
            und Kuvertüre), die aus Ihren nationalen Fabriken kommen –
            unabhängig davon, in welcher Form der Kakao eingegangen ist. Die
            relevanten HS-Codes sind:
            <ul>
              <li>
                <b>1801</b> Kakaobohnen, ganz oder gebrochen, roh oder geröstet.
              </li>
              <li>
                <b>1802</b> Kakaoschalen, -hülsen, -häute und andere
                Kakaorückstände.
              </li>
              <li>
                <b>1803</b> Kakaomasse, entfettet oder nicht entfettet.
              </li>
              <li>
                <b>1804</b> Kakaobutter, -fett und -öl.
              </li>
              <li>
                <b>1805</b> Kakaopulver, ohne zugesetzten Zucker oder andere
                Süßstoffe.
              </li>
            </ul>
          </div>
        </Fragment>
      ),
    },
    {
      i: "System to prevent and address child labour",
      t: "System zur Verhinderung und Bekämpfung von Kinderarbeit",
      d: 'Ein "System" ist eine Reihe von Maßnahmen zur Risikobewertung, Prävention und Bekämpfung von Kinderarbeit. Ein Beispiel für eine andere Art von System ist ein umfassender Ansatz zur Gemeindeentwicklung.',
    },
  ],
};

export default definitionContent;
