# Decision Doc

## Brand rules: how I derived them

Three sources, in order of authority:

1. ASCI Code and Drugs & Cosmetics Act — the regulatory floor. No 
cure/treat language for cosmetics, no unsubstantiated efficacy 
percentages, no fairness or skin-lightening claims, no absolute 
guarantees. These rules are non-negotiable and violations create 
real legal exposure.

2. Minimalist's own stated values (beminimalist.co/pages/our-values) — 
their explicit rejection of "natural/clean/chemical-free" positioning. 
Their values page says "everything is a chemical, chemical-free 
products don't exist." This is unusual in skincare and directly 
shapes the scorer: "chemical-free" is a brand violation, not just 
a generic red flag.

3. Minimalist's actual product pages and Meta ads — how they write 
in practice. Ingredient-first naming ("Niacinamide 10% Face Serum"), 
concentration always stated, mechanism before benefit ("promotes 
protein synthesis" not "gives you glowing skin"), clinical study 
references without inline citations in ad copy. I verified these 
patterns across multiple product pages (Niacinamide 10%, Salicylic 
Acid 2%, SPF 50) and their live Meta Ad Library creatives.

Each finding in the scorer output is tagged to its source ([ASCI Code], 
[Brand Values], [Brand Usage]) so a reviewer knows whether a flag is 
regulatory, brand-philosophical, or stylistic.

## What I cut, and why

- AI-generated product imagery: Minimalist's brand is built on 
  ingredient transparency. Fabricating a product image contradicts 
  the brand promise. I use the real Shopify CDN photograph.
- Multiple ad sizes: I support one (1080x1080 Meta feed), the 
  highest-volume social placement. Adding sizes is mechanical, not 
  a judgment call.
- A/B variant generation: Generating multiple options sounds useful 
  but dilutes the scorer's value. One ad, scored thoroughly, is more 
  actionable than five ads scored superficially.
- Meta/Google Ads API integration: out of scope for a prototype. 
  The tool's value is in generation and review, not in publishing.
- Image upload for the scorer: the brief asks for "paste in an 
  arbitrary ad." The scorer evaluates copy against brand rules. 
  Image analysis would require a different evaluation framework 
  (visual brand consistency) that I haven't built rules for.
- Generalized Shopify support: the Generator only accepts 
  beminimalist.co URLs because the brand rules engine is 
  Minimalist-specific. Generating a Minimalist-branded ad for a 
  competitor's product would be a worse outcome than refusing the URL.

## The decision I was least sure about

Whether "clinically proven" should block or pass.

My first-pass scorer rules treated any clinical efficacy claim without 
an inline citation as a policy violation. When I tested this against 
Minimalist's own real product page copy, the scorer blocked their 
actual language: "Pure 10% Niacinamide is clinically proven to promote 
protein synthesis, reduce melanin concentration & improve skin 
complexion in 2 weeks."

This forced a real calibration question: the scorer was too strict, 
but loosening it risks letting fabricated claims through. I resolved 
it by narrowing the rule to distinguish between plausible claims (where 
a real study could exist for this category of product) and implausible 
claims (like "reverse 10 years of aging in one week"). I then validated 
in both directions: the Minimalist-style copy now passes, while 
fabricated claims still block. The editable prompts system lets a brand 
reviewer adjust this threshold without a code change if my calibration 
is wrong.

This is the hardest problem in marketing AI scoring: the line between 
"unsubstantiated" and "normal industry language" is a judgment call, 
not a rule. I'd rather be explicit about where I drew it and make it 
adjustable than hide the uncertainty behind a confident default.