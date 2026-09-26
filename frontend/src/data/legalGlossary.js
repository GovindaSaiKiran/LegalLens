/**
 * Plain-Language Legal Glossary for Everyday Users & Contract Analysis
 * Explains intimidating legal jargon in crystal-clear layman terms with real-world scenarios,
 * risk ratings, tactical pro-tips, and statutory references.
 */

export const legalGlossary = [
  // ==========================================
  // DISPUTE RESOLUTION & COURTS
  // ==========================================
  {
    id: 'arbitration-clause',
    term: "Arbitration Clause",
    category: "Dispute Resolution",
    riskLevel: "high",
    simpleExplanation: "A clause forcing you to resolve legal disputes in a private hearing with a paid arbitrator instead of filing a public lawsuit in a government court.",
    everydayExample: "You sign up for a ride-hailing or fintech app. If the company misplaces your deposit or causes you financial harm, this clause prevents you from taking them to civil court. Instead, you must pay for a private arbitrator in a location chosen by the company.",
    whyItMatters: "Arbitration clauses are frequently designed by large corporations to prevent consumers from banding together in class actions and to keep dispute proceedings confidential.",
    proTip: "Check who pays the arbitrator's hefty hourly fees and whether small claims court is permitted as an exception.",
    redFlags: "Clauses requiring arbitration in a distant state or country, or forcing the consumer to split expensive arbitrator fees upfront.",
    statuteRef: "Arbitration and Conciliation Act, 1996 (India)",
    relatedTerms: ["Class Action Waiver", "Governing Law & Jurisdiction"]
  },
  {
    id: 'class-action-waiver',
    term: "Class Action Waiver",
    category: "Dispute Resolution",
    riskLevel: "high",
    simpleExplanation: "A rule saying you give up the right to join with thousands of other affected customers to sue a company together as a single unified group.",
    everydayExample: "If a telecom operator illegally overcharges 2 million subscribers by ₹50 each, the company makes ₹10 Crore in illegal profit. Because of this waiver, no single user can afford to hire a lawyer for ₹50, and you cannot join forces with other victims.",
    whyItMatters: "Individual claims for small amounts are financially impossible to pursue alone, leaving companies immune from consequences for micro-scale consumer fraud.",
    proTip: "Under Indian Consumer Protection Act 2019, class action complaints before the National Consumer Disputes Redressal Commission (NCDRC) or CCPA cannot easily be waived by standard click-wrap contracts.",
    redFlags: "Mandatory check-boxes that waive collective representative suits before consumer forums.",
    statuteRef: "Consumer Protection Act, 2019 (Section 35(1)(c) - Representative Complaints)",
    relatedTerms: ["Arbitration Clause", "Limitation of Liability"]
  },
  {
    id: 'governing-law-jurisdiction',
    term: "Governing Law & Exclusive Jurisdiction",
    category: "Dispute Resolution",
    riskLevel: "medium",
    simpleExplanation: "The clause specifying which state's or country's legal system controls the contract, and which city's local courts hold the exclusive authority to hear lawsuits.",
    everydayExample: "You live and work in Delhi and rent office software from a firm in Bengaluru. If a dispute happens and the contract says 'Exclusive jurisdiction of courts in Bengaluru', you must travel to Bengaluru and hire local counsel to defend your rights.",
    whyItMatters: "Litigating in a remote or foreign jurisdiction can multiply your legal expenses tenfold and make justice practically unaffordable.",
    proTip: "In consumer contracts in India, you are statutorily entitled to file complaints in the District Consumer Forum where YOU reside or work, regardless of contract clauses.",
    redFlags: "Exclusive jurisdiction fixed in offshore tax havens (e.g., Cayman Islands or Singapore) for ordinary domestic transactions.",
    statuteRef: "Section 28, Indian Contract Act 1872 & Section 34, Consumer Protection Act 2019",
    relatedTerms: ["Arbitration Clause", "Severability"]
  },
  {
    id: 'injunctive-relief',
    term: "Injunctive Relief",
    category: "Dispute Resolution",
    riskLevel: "standard",
    simpleExplanation: "A court order that immediately forces a party to stop doing something (like leaking source code or using a trademark) rather than just paying money later.",
    everydayExample: "If an ex-employee tries to publish proprietary customer databases online, the company immediately asks a judge for an emergency injunction to halt publication within hours before permanent harm occurs.",
    whyItMatters: "Money damages cannot undo leaked trade secrets or reputational damage; injunctions are emergency emergency freeze orders.",
    proTip: "Employment contracts often claim the employer is automatically entitled to an injunction without proving actual irreparable loss.",
    redFlags: "Waivers where you forfeit the right to contest emergency interim orders.",
    statuteRef: "Specific Relief Act, 1963 (Sections 36-42)",
    relatedTerms: ["Non-Disclosure Agreement (NDA)", "Liquidated Damages"]
  },

  // ==========================================
  // CONTRACTS & BOILERPLATE
  // ==========================================
  {
    id: 'indemnity-indemnification',
    term: "Indemnity / Indemnification",
    category: "Liability & Risk",
    riskLevel: "high",
    simpleExplanation: "A legal promise where YOU agree to pay for someone else's financial losses, legal costs, settlement expenses, or court penalties if a third party sues them.",
    everydayExample: "You upload freelance design graphics to a print-on-demand website. If a third party claims the graphics infringed their copyright and sues the website for ₹10 Lakhs, an indemnity clause forces YOU to pay all the website's legal fees and damages.",
    whyItMatters: "Uncapped, one-sided indemnity clauses can expose individuals and small freelancers to catastrophic financial ruin over minor oversights.",
    proTip: "Always negotiate indemnity to be 'mutual', limited to 'direct proven damages', and capped at the total contract fee paid in the past 12 months.",
    redFlags: "Clauses that make you indemnify against 'any and all claims, including reasonable attorney fees' without requiring negligence or willful misconduct.",
    statuteRef: "Sections 124 & 125, Indian Contract Act 1872",
    relatedTerms: ["Limitation of Liability", "Hold Harmless"]
  },
  {
    id: 'limitation-of-liability',
    term: "Limitation of Liability",
    category: "Liability & Risk",
    riskLevel: "high",
    simpleExplanation: "A maximum financial ceiling that caps the amount of money a service provider or vendor will ever pay you if their product causes you harm or data loss.",
    everydayExample: "A cloud accounting platform suffers a glitch and erases your business's entire tax record, causing you ₹5 Lakhs in government penalties. If the contract has a liability cap of 'Total fees paid in the last 1 month (₹999)', you can only recover ₹999.",
    whyItMatters: "Big tech platforms and SaaS vendors almost always limit liability to almost zero while demanding uncapped indemnity from end users.",
    proTip: "Ensure that fundamental breaches (like gross negligence, willful misconduct, and data privacy leaks) are explicitly carved out from liability caps.",
    redFlags: "Total liability capped at trivial amounts (like ₹100 or 'fees paid in the prior month') even for critical mission-critical business services.",
    statuteRef: "Section 73, Indian Contract Act 1872",
    relatedTerms: ["Indemnity / Indemnification", "Consequential Damages"]
  },
  {
    id: 'consequential-damages',
    term: "Consequential / Indirect Damages Waiver",
    category: "Liability & Risk",
    riskLevel: "medium",
    simpleExplanation: "A rule stating that a vendor is not responsible for secondary losses (such as lost profits, lost business opportunities, or reputational damage) resulting from their failure.",
    everydayExample: "If your internet connection goes down during a critical multimillion-dollar online auction, the ISP will only refund you the prorated downtime cost (₹20), not the massive business profit you missed.",
    whyItMatters: "Almost all indirect losses are excluded by standard agreements, meaning you absorb the commercial fallout.",
    proTip: "Understand the difference between direct losses (fixing the broken item) and consequential losses (revenue missed due to the broken item).",
    redFlags: "Clauses that waive indirect damages for the vendor but keep the consumer fully liable for all ripple-effect costs.",
    statuteRef: "Hadley v. Baxendale principle codified under Section 73, Indian Contract Act 1872",
    relatedTerms: ["Limitation of Liability", "Liquidated Damages"]
  },
  {
    id: 'liquidated-damages',
    term: "Liquidated Damages",
    category: "Contracts & Obligations",
    riskLevel: "medium",
    simpleExplanation: "A fixed, pre-agreed financial penalty stated in the contract that one side must automatically pay if they violate a specific clause.",
    everydayExample: "A vendor contract stating: 'If the software is delivered 1 week late, the vendor shall pay liquidated damages of ₹10,000 per day of delay.'",
    whyItMatters: "Liquidated damages save parties from having to prove the exact mathematical loss in court later, as long as the amount represents a reasonable pre-estimate of loss.",
    proTip: "Under Indian law (Section 74 of the Contract Act), courts will NOT enforce extortionate or punitive penalties; they only award reasonable compensation up to the stipulated penalty.",
    redFlags: "Disproportionate penalties aimed at punishing you rather than compensating the other side's real costs.",
    statuteRef: "Section 74, Indian Contract Act 1872",
    relatedTerms: ["Notice Period", "Lock-in Period"]
  },
  {
    id: 'force-majeure',
    term: "Force Majeure",
    category: "Contracts & Obligations",
    riskLevel: "standard",
    simpleExplanation: "An 'Act of God' or unforeseeable catastrophe (e.g., floods, earthquakes, war, pandemic lockdown) that excuses parties from fulfilling contract duties without penalty.",
    everydayExample: "A wedding hall booking where a sudden government pandemic lockdown bans public gatherings. A force majeure clause allows the couple to cancel or postpone without paying total breach penalties.",
    whyItMatters: "Without a clear force majeure clause, you could be held liable for failing to perform duties rendered impossible by natural disasters.",
    proTip: "Check whether epidemics/pandemics and government-mandated supply chain halts are explicitly enumerated in the list of covered events.",
    redFlags: "One-sided force majeure clauses that allow the vendor to stop service without refunding your prepaid balance.",
    statuteRef: "Section 56, Indian Contract Act 1872 (Doctrine of Frustration)",
    relatedTerms: ["Severability", "Entire Agreement"]
  },
  {
    id: 'severability',
    term: "Severability Clause",
    category: "Contracts & Obligations",
    riskLevel: "standard",
    simpleExplanation: "A safety rule stating that if a court discovers one single sentence in the contract is illegal or void, the rest of the contract remains 100% alive and enforceable.",
    everydayExample: "If an employment agreement contains an illegal 3-year non-compete clause, the judge strikes out that single illegal clause, but your salary, confidentiality, and notice period rules remain intact.",
    whyItMatters: "Prevents an entire 50-page complex agreement from collapsing simply because one minor provision was poorly drafted or legally invalid.",
    proTip: "Standard boilerplate in almost all formal agreements; generally safe and advantageous.",
    redFlags: "Rarely problematic; standard legal hygiene.",
    statuteRef: "Blue Pencil Doctrine (Contract Law)",
    relatedTerms: ["Entire Agreement", "Governing Law & Jurisdiction"]
  },
  {
    id: 'entire-agreement-integration',
    term: "Entire Agreement / Integration Clause",
    category: "Contracts & Obligations",
    riskLevel: "medium",
    simpleExplanation: "A clause declaring that the written document is the final, complete deal, and that all prior verbal promises, WhatsApp messages, or sales pitches are legally null and void.",
    everydayExample: "A gym salesperson verbally promises: 'You can freeze your subscription anytime for free.' But the contract contains an Entire Agreement clause and says no freezing is permitted. The written contract wins, and the verbal promise is unenforceable.",
    whyItMatters: "If a verbal assurance made by a broker, landlord, or salesperson is not explicitly written in the contract text, it does NOT exist legally.",
    proTip: "Never rely on 'Don't worry, trust me' assurances. Demand every verbal promise be added directly into the written contract text or an addendum.",
    redFlags: "When a salesperson makes big promises on phone calls but refuses to put those exact clauses into the contract draft.",
    statuteRef: "Sections 91 & 92, Indian Evidence Act 1872 (Parol Evidence Rule)",
    relatedTerms: ["Unilateral Amendment", "Severability"]
  },
  {
    id: 'unilateral-amendment',
    term: "Unilateral Amendment",
    category: "Billing & Subscriptions",
    riskLevel: "high",
    simpleExplanation: "A sneaky clause giving a company the unilateral power to alter terms, prices, privacy policies, or features at any time without asking for your prior affirmative consent.",
    everydayExample: "A cloud storage subscription terms state: 'We reserve the right to modify pricing and storage limits at our sole discretion.' Six months later, they cut your cloud space in half and double the subscription fee.",
    whyItMatters: "You sign up under one set of rules, but the company can silently rewrite the rules against you while claiming your continued logins count as 'agreement'.",
    proTip: "Look for clauses guaranteeing advance written email notice (at least 30 days) and your right to terminate with full pro-rata refund if you disagree with modifications.",
    redFlags: "'We may change these terms without notice at any time; your continued use constitutes binding acceptance.'",
    statuteRef: "Section 2(46), Consumer Protection Act 2019 (Unfair Contract Terms)",
    relatedTerms: ["Automatic Renewal", "Dark Patterns"]
  },

  // ==========================================
  // BILLING & CONSUMER PROTECTION
  // ==========================================
  {
    id: 'automatic-renewal-dark-pattern',
    term: "Automatic Renewal / Recurring Billing",
    category: "Billing & Subscriptions",
    riskLevel: "high",
    simpleExplanation: "A contract rule that automatically charges your debit card, credit card, or UPI mandate at the end of each billing cycle without prompting you.",
    everydayExample: "You sign up for a '7-Day Free Trial' requiring card details. If you do not cancel within 168 hours, you are billed ₹4,999 for a full annual plan with zero refund rights.",
    whyItMatters: "Companies intentionally create convoluted cancellation flows (dark patterns) so users keep paying for months of unused subscriptions.",
    proTip: "Under RBI recurring e-mandate regulations in India, banks are legally required to send an auto-debit pre-notification SMS/email at least 24 hours before charging your card.",
    redFlags: "Services that allow 1-click subscription signups but force you to call a customer service hotline or send physical letters to cancel.",
    statuteRef: "RBI Circular on Processing of e-mandates on cards for recurring transactions & CCPA Guidelines on Dark Patterns 2023",
    relatedTerms: ["Unilateral Amendment", "Cooling-off Period"]
  },
  {
    id: 'cooling-off-period',
    term: "Cooling-off / Cancellation Period",
    category: "Billing & Subscriptions",
    riskLevel: "protective",
    simpleExplanation: "A statutory grace window during which you can cancel a contract, loan, insurance policy, or purchase for a 100% refund with no questions asked.",
    everydayExample: "You purchase a life insurance policy or sign an expensive online degree. Consumer regulations give you a 15-day or 30-day 'free look' period to review the fine print and get a complete refund if not satisfied.",
    whyItMatters: "Protects consumers against high-pressure sales tactics and buyer remorse by allowing a penalty-free exit.",
    proTip: "Always mark the cooling-off deadline on your calendar the instant you sign any high-value recurring contract.",
    redFlags: "Contracts that claim to eliminate your statutory free-look period or impose non-refundable processing surcharges.",
    statuteRef: "IRDAI (Protection of Policyholders' Interests) Regulations & Direct Selling Rules 2021",
    relatedTerms: ["Automatic Renewal", "Dark Patterns"]
  },
  {
    id: 'dark-patterns-deceptive-design',
    term: "Dark Patterns & Deceptive Design",
    category: "Billing & Subscriptions",
    riskLevel: "high",
    simpleExplanation: "User interface tricks designed to manipulate or deceive users into making choices they didn't intend (e.g. hidden charges, pre-ticked checkboxes, false urgency).",
    everydayExample: "An airline booking website pre-ticking a ₹499 travel insurance box, or a shopping app showing a fake countdown timer 'Only 2 items left at this price!' to rush you into buying.",
    whyItMatters: "The Central Consumer Protection Authority (CCPA) in India has explicitly outlawed 13 specified dark patterns as illegal unfair trade practices.",
    proTip: "If you detect pre-ticked checkboxes, disguised ads, or basket sneaking, take a screenshot and report it on the National Consumer Helpline portal (consumerhelpline.gov.in).",
    redFlags: "'Confirmshaming' buttons like 'No thanks, I hate saving money' or hiding cancellation buttons behind 5 different nested sub-menus.",
    statuteRef: "CCPA Guidelines for Prevention and Regulation of Dark Patterns, 2023",
    relatedTerms: ["Automatic Renewal", "Data Principal Rights"]
  },

  // ==========================================
  // EMPLOYMENT & WORKPLACE
  // ==========================================
  {
    id: 'non-compete-clause',
    term: "Non-Compete Clause",
    category: "Employment",
    riskLevel: "high",
    simpleExplanation: "A clause attempting to ban you from working for a rival company, joining a competitor, or starting your own similar business after leaving your job.",
    everydayExample: "An IT employer adds: 'The employee shall not work for any technology company in India for 2 years following resignation.'",
    whyItMatters: "In India, post-employment non-competes are completely VOID and UNENFORCEABLE under Section 27 of the Indian Contract Act, because the constitution protects your freedom of trade and livelihood.",
    proTip: "While companies cannot stop you from taking a new job, they CAN legally enforce strict non-disclosure of confidential source code, trade secrets, and non-solicitation of clients.",
    redFlags: "Employers attempting to withhold your experience letter, relieving letter, or final salary settlements based on void non-compete clauses.",
    statuteRef: "Section 27, Indian Contract Act 1872 & Niranjan Shankar Golikari v. Century Spg. & Mfg. Co.",
    relatedTerms: ["Non-Solicitation Clause", "Non-Disclosure Agreement (NDA)"]
  },
  {
    id: 'non-solicitation-clause',
    term: "Non-Solicitation Clause",
    category: "Employment",
    riskLevel: "medium",
    simpleExplanation: "A rule prohibiting you from poaching former colleagues, hiring teammates, or pitching business to your former employer's clients after you depart.",
    everydayExample: "You leave a digital marketing agency to start your own firm. A non-solicitation clause prevents you from reaching out to the agency's existing client list or recruiting their lead designers for 12 months.",
    whyItMatters: "Unlike non-competes, reasonable non-solicitation clauses are frequently upheld by Indian courts to protect legitimate client goodwill.",
    proTip: "Ensure the restriction only applies to clients you personally managed in the past 12 months, rather than the firm's entire worldwide client database.",
    redFlags: "Indefinite or lifetime non-solicitation clauses that prevent you from ever interacting with industry contacts.",
    statuteRef: "Section 27, Indian Contract Act 1872 (Reasonable Restraint of Trade exceptions)",
    relatedTerms: ["Non-Compete Clause", "Non-Disclosure Agreement (NDA)"]
  },
  {
    id: 'nda-confidentiality',
    term: "Non-Disclosure Agreement (NDA)",
    category: "Employment",
    riskLevel: "medium",
    simpleExplanation: "A legally binding contract where you promise to keep sensitive business ideas, financial numbers, customer lists, or proprietary technology strictly secret.",
    everydayExample: "Before pitching an innovative fintech startup idea to angel investors, both parties sign an NDA so the investors cannot copy the proprietary algorithm without your consent.",
    whyItMatters: "Breaching an NDA can trigger immediate court injunctions and substantial lawsuits for commercial damages.",
    proTip: "Ensure the NDA has clear exclusions for information that is already public, developed independently, or required to be disclosed by a court subpoena.",
    redFlags: "One-sided NDAs where you are bound to total secrecy for 10 years while the other party has zero confidentiality duties.",
    statuteRef: "Indian Contract Act 1872 & Trade Secret Common Law Principles",
    relatedTerms: ["Work Made for Hire", "Injunctive Relief"]
  },
  {
    id: 'notice-period-garden-leave',
    term: "Notice Period & Garden Leave",
    category: "Employment",
    riskLevel: "medium",
    simpleExplanation: "The mandatory advance time frame you must serve after resigning (or during which an employer places you on paid leave without active system access).",
    everydayExample: "A 90-day notice period means you must continue working for 3 months after submitting your resignation letter before you receive your final relieving letter and PF settlement.",
    whyItMatters: "Excessively long notice periods (90+ days) can kill job offers from new prospective employers who require fast joining dates.",
    proTip: "Check your contract for a 'Notice Pay in Lieu' option, where either party can buy out the notice period with equivalent basic salary.",
    redFlags: "Clauses that give the employer the right to fire you with 0 days notice while forcing you to serve 90 days if you resign.",
    statuteRef: "Industrial Disputes Act 1947 & State Shops and Establishments Acts",
    relatedTerms: ["Gratuity", "Non-Compete Clause"]
  },
  {
    id: 'gratuity-mandatory-benefits',
    term: "Gratuity & Statutory Separation Benefits",
    category: "Employment",
    riskLevel: "protective",
    simpleExplanation: "A legally mandatory lump-sum payment rewarded by employers to employees who complete 5 or more continuous years of service in an organization.",
    everydayExample: "After working 5 years at an enterprise, you resign. The company is statutorily required to calculate and pay your gratuity (approximately 15 days of last drawn basic salary for every year worked).",
    whyItMatters: "Gratuity is your statutory right by law; an employer cannot make you waive it in an employment contract or withhold it arbitrarily.",
    proTip: "In case of death or disablement, the 5-year continuous service condition does not apply, and full gratuity must be paid immediately to nominees.",
    redFlags: "Employment offers that deliberately miscalculate Cost-to-Company (CTC) by inflating gratuity or refusing payouts upon resignation.",
    statuteRef: "Payment of Gratuity Act, 1972",
    relatedTerms: ["Notice Period", "Liquidated Damages"]
  },
  {
    id: 'moonlighting-dual-employment',
    term: "Moonlighting / Dual Employment Clause",
    category: "Employment",
    riskLevel: "medium",
    simpleExplanation: "A workplace contract clause banning employees from taking secondary jobs, freelancing gigs, or running side businesses outside regular working hours.",
    everydayExample: "A full-time software engineer builds a mobile game on weekends. If their employment contract contains an absolute exclusivity clause, the company could claim a breach and terminate employment.",
    whyItMatters: "Employers want full focus and want to prevent IP leakage; however, side gigs and open-source contributions can be caught in overly broad language.",
    proTip: "Seek explicit written carve-outs for non-competing personal side-projects, open-source development, and passive investments.",
    redFlags: "Clauses claiming the company owns any code or creative work you write on your personal computer outside office hours.",
    statuteRef: "Factories Act, 1948 (Section 60) & Model Standing Orders",
    relatedTerms: ["Work Made for Hire", "Non-Compete Clause"]
  },

  // ==========================================
  // RENTAL & REAL ESTATE
  // ==========================================
  {
    id: 'quiet-enjoyment-tenancy',
    term: "Quiet Enjoyment",
    category: "Rental & Tenancy",
    riskLevel: "protective",
    simpleExplanation: "Your fundamental legal right as a tenant to live in your rented flat peacefully without unlawful landlord intrusion, harassment, or power disconnection.",
    everydayExample: "A landlord cannot unlock your flat unannounced at midnight, install cameras in private areas, or shut off water and electricity supplies because of a minor argument over maintenance fees.",
    whyItMatters: "Guarantees privacy, dignity, and possession during your active lease period as long as you pay rent.",
    proTip: "Under the Model Tenancy Act, landlords must give at least 24 hours prior written or electronic notice before entering the premises for inspections or repairs.",
    redFlags: "Tenancy agreements that reserve unrestricted rights for the owner or broker to enter the apartment at any hour without prior notice.",
    statuteRef: "Section 108(q), Transfer of Property Act 1882 & Model Tenancy Act 2021",
    relatedTerms: ["Lock-in Period", "Security Deposit Deduction"]
  },
  {
    id: 'lock-in-period-lease',
    term: "Lock-in Period",
    category: "Rental & Tenancy",
    riskLevel: "high",
    simpleExplanation: "A mandatory initial timeframe during which neither the landlord nor the tenant is allowed to terminate the lease without paying heavy financial penalties.",
    everydayExample: "An 11-month rental lease with a 6-month lock-in. If you get transferred to another city after 2 months, the landlord can legally claim the rent for the remaining 4 months of the lock-in period.",
    whyItMatters: "Can trap tenants into paying thousands of rupees even if the property has severe undisclosed structural defects or water shortages.",
    proTip: "Always negotiate a bilateral 'Emergency Relocation' or 'Habitability' exception allowing early exit with 30 days notice if severe uninhabitable conditions occur.",
    redFlags: "One-sided lock-ins where the tenant is locked in for 12 months but the owner can evict with 1 month notice.",
    statuteRef: "Model Tenancy Act 2021 & Indian Contract Act 1872",
    relatedTerms: ["Quiet Enjoyment", "Security Deposit Deduction"]
  },
  {
    id: 'security-deposit-deduction',
    term: "Security Deposit Deduction & Forfeiture",
    category: "Rental & Tenancy",
    riskLevel: "high",
    simpleExplanation: "Rules specifying what costs a landlord can deduct from your refundable deposit (like painting, minor repairs) before returning the balance upon move-out.",
    everydayExample: "You pay a ₹1 Lakh security deposit. Upon moving out, the landlord deducts ₹40,000 for full house repainting and minor scuffs, claiming it as 'damage' instead of ordinary wear and tear.",
    whyItMatters: "Unfair deposit deductions are the single most common real estate dispute faced by tenants across metropolitan cities.",
    proTip: "Always record a detailed 4K move-in video walkthrough showing all existing scratches, tiles, and fixtures on day 1 and email it to the landlord as an official baseline record.",
    redFlags: "Agreements stating that 100% of painting costs will be deducted from the tenant regardless of tenancy duration or natural wear-and-tear.",
    statuteRef: "Model Tenancy Act, 2021 (Caps residential security deposits at maximum 2 months' rent)",
    relatedTerms: ["Lock-in Period", "Quiet Enjoyment"]
  },
  {
    id: 'sub-letting-clause',
    term: "Sub-letting Clause",
    category: "Rental & Tenancy",
    riskLevel: "medium",
    simpleExplanation: "A rule prohibiting tenants from renting out a bedroom or the entire apartment to third parties (like Airbnb guests or flatmates) without express written permission.",
    everydayExample: "You rent a 3BHK flat and rent out the spare bedroom on a short-term homestay platform to earn extra cash. If your lease bans sub-letting, the landlord can immediately terminate your lease and forfeit your deposit.",
    whyItMatters: "Unauthorized sub-tenancy is considered an immediate breach of tenancy and standard grounds for immediate eviction under tenancy laws.",
    proTip: "If you plan to have a co-tenant or roommate share rent, have their name explicitly added as a co-signatory on the main rental agreement.",
    redFlags: "Clauses that classify occasional visiting family members or friends as unauthorized sub-tenants.",
    statuteRef: "Transfer of Property Act, 1882 & State Rent Control Acts",
    relatedTerms: ["Quiet Enjoyment", "Lock-in Period"]
  },

  // ==========================================
  // PRIVACY, AI & DATA PROTECTION
  // ==========================================
  {
    id: 'data-principal-rights',
    term: "Data Principal",
    category: "Privacy & Cyber",
    riskLevel: "protective",
    simpleExplanation: "The human being to whom the personal data relates (under India's DPDP Act 2023, YOU are the Data Principal with statutory privacy rights).",
    everydayExample: "When you download a food delivery app and provide your name, live location, phone number, and diet preferences, you are the Data Principal holding legal rights over that personal information.",
    whyItMatters: "Grants you statutory legal rights to access summary of your data, correct errors, withdraw consent, and demand permanent erasure of your records.",
    proTip: "You can officially exercise your statutory right to nominate a representative who can manage your digital data in the event of death or incapacity.",
    redFlags: "Platforms that bury consent inside pre-checked terms without providing itemized, clear notice in simple plain language.",
    statuteRef: "Digital Personal Data Protection Act, 2023 (Section 2(j) & Section 11)",
    relatedTerms: ["Data Fiduciary", "Right to Erasure / Forgotten"]
  },
  {
    id: 'data-fiduciary',
    term: "Data Fiduciary / Controller",
    category: "Privacy & Cyber",
    riskLevel: "standard",
    simpleExplanation: "The company, organization, or person that determines the purpose and means of processing your personal data and bears legal responsibility for keeping it safe.",
    everydayExample: "Your bank, your healthcare app, or an e-commerce platform is the Data Fiduciary. If their cloud database gets hacked due to poor security, they are legally liable.",
    whyItMatters: "Under India's DPDP Act 2023, Data Fiduciaries face severe statutory penalties up to ₹250 Crore for failing to maintain reasonable security safeguards.",
    proTip: "Check the privacy policy to identify the designated Data Protection Officer (DPO) and the grievance redressal mechanism before sharing sensitive medical or biometric data.",
    redFlags: "Companies operating without a named Grievance Officer or registered physical address in India.",
    statuteRef: "Digital Personal Data Protection Act, 2023 (Section 2(i) & Section 8)",
    relatedTerms: ["Data Principal", "Data Breach Notification"]
  },
  {
    id: 'right-to-erasure-forgotten',
    term: "Right to Erasure / Right to be Forgotten",
    category: "Privacy & Cyber",
    riskLevel: "protective",
    simpleExplanation: "Your legal entitlement to demand that a company delete your personal data, chat history, and account records once you stop using their service.",
    everydayExample: "You delete an old dating app or fintech account. Under data protection law, you have the right to demand they completely purge your photos, identity documents, and phone numbers from their servers.",
    whyItMatters: "Prevents abandoned online accounts from remaining sitting ducks in corporate data leaks years after you stopped using the platform.",
    proTip: "Companies may retain certain transaction records only where required by specific tax or anti-money-laundering laws (e.g. 5-7 years for banking records).",
    redFlags: "Apps that allow you to 'deactivate' your profile but explicitly refuse to permanently delete stored biometric or behavioral logs.",
    statuteRef: "Section 12(3), DPDP Act 2023 & Puttaswamy Supreme Court Judgment",
    relatedTerms: ["Data Principal", "Consent Withdrawal"]
  },
  {
    id: 'data-breach-notification',
    term: "Data Breach Notification",
    category: "Privacy & Cyber",
    riskLevel: "protective",
    simpleExplanation: "A mandatory statutory requirement for companies to notify both government authorities and affected individual users when their personal data has been leaked or hacked.",
    everydayExample: "If a hospital database gets breached by ransomware, the hospital must immediately notify the Indian Computer Emergency Response Team (CERT-In) and the Data Protection Board within mandated timeframes.",
    whyItMatters: "Fast notifications allow users to change passwords, freeze compromised bank cards, and monitor credit reports before cybercriminals strike.",
    proTip: "CERT-In directions require cybersecurity incidents to be reported within 6 hours of discovery.",
    redFlags: "Privacy policies that claim the company has zero obligation to inform users if their credentials or data are compromised in an external hack.",
    statuteRef: "Section 8(6), DPDP Act 2023 & CERT-In Directions under IT Act 2000",
    relatedTerms: ["Data Fiduciary", "Data Principal"]
  },

  // ==========================================
  // INTELLECTUAL PROPERTY & CREATIVE RIGHTS
  // ==========================================
  {
    id: 'work-made-for-hire-ip',
    term: "Work Made for Hire / IP Assignment",
    category: "Intellectual Property",
    riskLevel: "high",
    simpleExplanation: "A rule stating that any source code, designs, artwork, or writing created by you as an employee or contractor belongs 100% to the client/employer from moment of creation.",
    everydayExample: "You design a logo or develop backend code for a freelance client. Once paid under an IP Assignment clause, the client owns full global copyright, and you cannot resell or license the same code to anyone else.",
    whyItMatters: "Freelancers must ensure copyright assignment only transfers AFTER the client has paid 100% of the invoice amount.",
    proTip: "Add a conditional clause: 'All IP rights shall transfer strictly upon full receipt of final payment; until then, client receives only a temporary revocable trial license.'",
    redFlags: "Clauses that claim ownership over your pre-existing code libraries, open-source tools, or work you did before joining the company.",
    statuteRef: "Section 17, Indian Copyright Act 1957",
    relatedTerms: ["Perpetual & Irrevocable License", "Non-Disclosure Agreement (NDA)"]
  },
  {
    id: 'perpetual-irrevocable-license',
    term: "Perpetual & Irrevocable License",
    category: "Intellectual Property",
    riskLevel: "high",
    simpleExplanation: "A grant of permission allowing a platform or company to use, reproduce, modify, and monetize your content forever, without any ability for you to ever cancel the permission.",
    everydayExample: "You upload photos or videos to a social media app. The fine print grants the platform a 'worldwide, perpetual, royalty-free, irrevocable license to use, sub-license, and train AI models on your uploaded media.'",
    whyItMatters: "Even if you delete your social media account, the company retains permanent legal rights to use your likeness, voice, or content in commercial advertisements or AI datasets.",
    proTip: "Review social media and generative AI platforms' terms carefully to understand whether your personal artwork or face is being harvested for generative model training.",
    redFlags: "Clauses granting commercial sub-licensing rights to third-party ad networks without paying you royalties.",
    statuteRef: "Sections 18 & 19, Indian Copyright Act 1957",
    relatedTerms: ["Work Made for Hire", "Dark Patterns"]
  },
  {
    id: 'fair-use-fair-dealing',
    term: "Fair Dealing / Fair Use",
    category: "Intellectual Property",
    riskLevel: "protective",
    simpleExplanation: "A legal exception allowing you to use copyrighted material (quotes, video snippets, book excerpts) without permission for review, criticism, news reporting, or education.",
    everydayExample: "A YouTuber creates a video reviewing and critiquing a newly released Bollywood movie, playing 10-second clips to analyze the cinematography. This is protected under Fair Dealing.",
    whyItMatters: "Protects free speech, journalistic reporting, education, and creative parody from copyright takedown abuse.",
    proTip: "Under Indian copyright law, Fair Dealing specifically covers private research, criticism/review, and reporting of current events (Section 52). Always give clear attribution.",
    redFlags: "Using whole songs or entire chapters for commercial resale and trying to claim 'fair use'.",
    statuteRef: "Section 52, Indian Copyright Act 1957",
    relatedTerms: ["Work Made for Hire", "Perpetual & Irrevocable License"]
  },

  // ==========================================
  // GENERAL LEGAL CONCEPTS & SAFETY
  // ==========================================
  {
    id: 'caveat-emptor',
    term: "Caveat Emptor (Buyer Beware)",
    category: "Consumer Rights",
    riskLevel: "medium",
    simpleExplanation: "A ancient legal principle meaning the buyer is responsible for inspecting the quality and suitability of goods before buying, rather than blaming the seller later.",
    everydayExample: "You buy a used motorcycle from an individual seller without having a mechanic inspect the engine. If the engine breaks down 3 days later, the rule of Caveat Emptor generally places the loss on you.",
    whyItMatters: "While modern Consumer Protection laws create strong statutory warranties for new consumer goods, peer-to-peer sales and 'As-Is' transactions still rely on Caveat Emptor.",
    proTip: "For high-value purchases (used cars, pre-owned real estate), always obtain independent certified technical inspections and title search reports before signing.",
    redFlags: "Sellers refusing to allow professional pre-purchase inspections or title deed verifications.",
    statuteRef: "Section 16, Sale of Goods Act 1930",
    relatedTerms: ["As-Is Warranty Disclaimer", "Cooling-off Period"]
  },
  {
    id: 'as-is-warranty-disclaimer',
    term: "As-Is / Where-Is Warranty Disclaimer",
    category: "Consumer Rights",
    riskLevel: "high",
    simpleExplanation: "A contract clause stating that a product or service is sold in whatever condition it currently exists, with zero guarantees that it is defect-free, reliable, or fit for purpose.",
    everydayExample: "You buy software or refurbished hardware with a clause stating: 'Provided AS-IS with all faults; vendor disclaims all implied warranties of merchantability and fitness for a particular purpose.'",
    whyItMatters: "Completely strips away the implied guarantees of quality that normal consumer goods are expected to provide.",
    proTip: "Under the Consumer Protection Act 2019, manufacturers cannot contract out of product liability for defective goods that cause personal injury or property damage.",
    redFlags: "Brand new consumer products sold with complete 'as-is' disclaimers to evade return and warranty obligations.",
    statuteRef: "Consumer Protection Act, 2019 (Chapter VI - Product Liability)",
    relatedTerms: ["Caveat Emptor", "Limitation of Liability"]
  },
  {
    id: 'power-of-attorney',
    term: "Power of Attorney (PoA)",
    category: "Contracts & Obligations",
    riskLevel: "high",
    simpleExplanation: "A formal legal document giving another person (your attorney-in-fact) the legal authority to sign contracts, manage bank accounts, or buy/sell property on your behalf.",
    everydayExample: "An NRI living abroad gives a Special Power of Attorney to their brother in Mumbai to sign the sale deed and register a flat with the sub-registrar office.",
    whyItMatters: "A 'General PoA' gives sweeping, almost unlimited power over your assets; an unscrupulous holder could sell your property or drain accounts.",
    proTip: "Always use a tightly scoped 'Special Power of Attorney' (limited to one specific task and one specific date) rather than an open-ended General PoA.",
    redFlags: "Real estate brokers or loan agents asking you to sign broad irrevocable General Powers of Attorney as part of routine loan processing.",
    statuteRef: "Powers of Attorney Act, 1882",
    relatedTerms: ["Governing Law & Jurisdiction", "Entire Agreement"]
  },
  {
    id: 'estoppel-and-waiver',
    term: "Estoppel & Waiver",
    category: "Contracts & Obligations",
    riskLevel: "medium",
    simpleExplanation: "A legal doctrine preventing a person from going back on their word or past conduct if the other party reasonably relied on it to their detriment.",
    everydayExample: "A landlord routinely accepts rent on the 10th of every month for 3 years without complaint. The landlord cannot suddenly claim the tenant breached the lease for paying on the 10th instead of the 1st without prior warning.",
    whyItMatters: "Prevents unfair surprises and bad-faith traps where one side acts relaxed and then weaponizes strict legal technicalities later.",
    proTip: "Contracts often include a 'No Waiver' clause stating that failing to enforce a right once does NOT waive the right to enforce it in the future.",
    redFlags: "Relying on informal relaxed practices without confirming them in written email communication.",
    statuteRef: "Section 115, Indian Evidence Act 1872",
    relatedTerms: ["Entire Agreement", "Liquidated Damages"]
  },
  {
    id: 'specific-performance',
    term: "Specific Performance",
    category: "Dispute Resolution",
    riskLevel: "standard",
    simpleExplanation: "A court order compelling a party to actually perform and complete the exact unique promise they made in the contract, rather than just paying monetary compensation.",
    everydayExample: "You sign an agreement to purchase a unique heritage property and pay the advance token. If the seller changes their mind to get a higher price, a court can order Specific Performance forcing the seller to register the property to you.",
    whyItMatters: "Essential for rare or unique assets (like real estate, heirloom art, or specialized patents) where monetary damages cannot replace the actual subject matter.",
    proTip: "Following the 2018 amendment to the Specific Relief Act, specific performance is now a mandatory standard remedy rather than discretionary.",
    redFlags: "Contracts containing explicit waivers of your right to seek specific performance for unique property transactions.",
    statuteRef: "Specific Relief (Amendment) Act, 2018 (Section 10)",
    relatedTerms: ["Injunctive Relief", "Liquidated Damages"]
  }
];

export const glossaryCategories = [
  'all',
  'Dispute Resolution',
  'Liability & Risk',
  'Contracts & Obligations',
  'Billing & Subscriptions',
  'Employment',
  'Rental & Tenancy',
  'Privacy & Cyber',
  'Intellectual Property',
  'Consumer Rights'
];

export const riskLevelMetadata = {
  high: {
    label: 'High Risk Trap',
    color: 'bg-neo-coralLight text-black border-black',
    badge: 'bg-neo-coral text-black font-black',
    icon: '🚨',
    description: 'Clauses commonly designed to limit your rights, impose unfair financial burdens, or trap you.'
  },
  medium: {
    label: 'Moderate Caution',
    color: 'bg-neo-amberLight text-black border-black',
    badge: 'bg-neo-amber text-black font-black',
    icon: '⚠️',
    description: 'Important legal clauses that require careful review and negotiation before signing.'
  },
  standard: {
    label: 'Standard Clause',
    color: 'bg-neo-blueLight text-black border-black',
    badge: 'bg-neo-blue text-white font-black',
    icon: 'ℹ️',
    description: 'Routine legal boilerplate found in most modern contracts and formal agreements.'
  },
  protective: {
    label: 'Your Protective Right',
    color: 'bg-neo-greenLight text-black border-black',
    badge: 'bg-neo-green text-black font-black',
    icon: '🛡️',
    description: 'Legal rights, statutory protections, and safeguards that work in your favor as a consumer/citizen.'
  }
};
